/**
 * NewTab 文件夹相关处理器
 */

import type { Message, MessageResponse } from '@/types';
import { ensureNewtabRootFolder } from '../services/newtab-folder';
import { importAllBookmarksToNewtab } from '../services/bookmark-collector';
import { logger } from '@/lib/utils/logger';

/**
 * 保存到 NewTab
 */
export async function handleSaveToNewtab(message: Message): Promise<MessageResponse> {
  const payload = message.payload as {
    url: string;
    title?: string;
    parentBookmarkId?: string;
  };
  const url = payload?.url;
  const title = payload?.title || payload?.url || 'Untitled';
  if (!url) {
    throw new Error('Missing url');
  }

  const rootResult = await ensureNewtabRootFolder();
  if (!rootResult) {
    throw new Error('NewTab root folder not found');
  }
  const rootId = rootResult.id;

  const parentId = payload.parentBookmarkId || rootId;

  const created = await chrome.bookmarks.create({ parentId, title, url });
  return {
    success: true,
    data: { id: created.id },
  };
}

/**
 * 导入所有书签到 NewTab
 */
export async function handleImportAllBookmarksToNewtab(): Promise<MessageResponse> {
  const newtabRootResult = await ensureNewtabRootFolder();
  if (!newtabRootResult) {
    throw new Error('NewTab root folder not found');
  }
  const newtabRootId = newtabRootResult.id;

  const importInfo = await importAllBookmarksToNewtab(newtabRootId);

  return {
    success: true,
    data: {
      importFolderId: importInfo.importFolderId,
      folderTitle: importInfo.folderTitle,
      counts: importInfo.counts,
    },
  };
}

/**
 * 导入 URLs 到 NewTab
 */
export async function handleImportUrlsToNewtab(message: Message): Promise<MessageResponse> {
  const payload = message.payload as {
    bookmarks: Array<{
      url: string;
      title: string;
      description?: string;
      tags?: Array<{ name: string }>;
      folder?: string; // AI 推荐的文件夹
    }>;
    options?: any;
  };

  if (!payload?.bookmarks || payload.bookmarks.length === 0) {
    throw new Error('No bookmarks to import');
  }

  const rootResult = await ensureNewtabRootFolder();
  if (!rootResult) {
    throw new Error('NewTab root folder not found');
  }
  const rootId = rootResult.id;

  // 获取现有的文件夹
  const children = await chrome.bookmarks.getChildren(rootId);
  const existingFolders = new Map<string, string>(); // name -> id
  children.forEach(child => {
    if (!child.url) { // 文件夹没有 url
      existingFolders.set(child.title.toLowerCase(), child.id);
    }
  });

  // 按文件夹分组书签
  const bookmarksByFolder = new Map<string, typeof payload.bookmarks>();
  for (const bookmark of payload.bookmarks) {
    const folderName = bookmark.folder || '未分类';
    if (!bookmarksByFolder.has(folderName)) {
      bookmarksByFolder.set(folderName, []);
    }
    bookmarksByFolder.get(folderName)!.push(bookmark);
  }

  let importedCount = 0;
  const errors: string[] = [];
  const createdFolders: string[] = [];
  const folderPositions = new Map<string, number>(); // 记录文件夹位置

  // 为每个文件夹导入书签
  let folderPosition = 0;
  for (const [folderName, bookmarks] of bookmarksByFolder) {
    try {
      // 查找或创建文件夹
      let folderId = existingFolders.get(folderName.toLowerCase());
      if (!folderId) {
        const newFolder = await chrome.bookmarks.create({
          parentId: rootId,
          title: folderName,
        });
        folderId = newFolder.id;
        existingFolders.set(folderName.toLowerCase(), folderId);
        createdFolders.push(folderName);
        folderPositions.set(folderName, folderPosition++);
      }

      // 导入书签到文件夹
      for (const bookmark of bookmarks) {
        try {
          const created = await chrome.bookmarks.create({
            parentId: folderId,
            title: bookmark.title || bookmark.url,
            url: bookmark.url,
          });
          
          // 记录浏览器书签ID，用于后端同步
          (bookmark as any).browser_bookmark_id = created.id;
          
          importedCount++;
        } catch (error) {
          errors.push(`${bookmark.url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } catch (error) {
      errors.push(`文件夹 "${folderName}": ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // 同步到后端
  let syncStatus = { synced: false, error: null as string | null };
  try {
    const syncResult = await syncToBackend(payload.bookmarks, Array.from(bookmarksByFolder.keys()), folderPositions);
    syncStatus.synced = syncResult.synced;
  } catch (error) {
    logger.error('Failed to sync to backend:', error);
    syncStatus.error = error instanceof Error ? error.message : 'Unknown sync error';
    // 不影响本地导入结果
  }

  return {
    success: true,
    data: {
      importedCount,
      totalCount: payload.bookmarks.length,
      failedCount: errors.length,
      errors: errors.slice(0, 10), // 只返回前 10 个错误
      createdFolders,
      folderCount: bookmarksByFolder.size,
      syncStatus, // 返回同步状态
    },
  };
}

/**
 * 同步到后端（带重试机制）
 */
async function syncToBackend(
  bookmarks: Array<any>,
  folders: string[],
  folderPositions: Map<string, number>,
  maxRetries = 3
) {
  // 获取配置
  const result = await chrome.storage.local.get(['tmarks_api_url', 'tmarks_api_key']);
  const apiUrl = result.tmarks_api_url;
  const apiKey = result.tmarks_api_key;

  if (!apiUrl || !apiKey) {
    logger.log('TMarks API not configured, skipping backend sync');
    return { synced: false, reason: 'not_configured' };
  }

  // 生成设备ID
  let deviceId: string | undefined;
  try {
    const result = await chrome.storage.local.get('device_id');
    deviceId = result.device_id as string | undefined;
  } catch (error) {
    logger.error('Failed to get device_id:', error);
  }
  
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    await chrome.storage.local.set({ device_id: deviceId });
  }

  // 构建同步数据
  const syncData = {
    bookmarks: bookmarks.map(b => ({
      url: b.url,
      title: b.title,
      description: b.description,
      folder: b.folder,
      browser_bookmark_id: b.browser_bookmark_id
    })),
    device_id: deviceId,
    folders: folders.map(name => ({
      id: crypto.randomUUID(),
      name,
      position: folderPositions.get(name) || 0
    }))
  };

  // 重试逻辑
  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.log(`Backend sync attempt ${attempt}/${maxRetries}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
      
      const response = await fetch(`${apiUrl}/api/v1/newtab/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(syncData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // 4xx 错误不重试
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Sync failed: ${response.status} (client error, no retry)`);
        }
        // 5xx 错误重试
        throw new Error(`Sync failed: ${response.status}`);
      }

      const syncResult = await response.json();
      logger.log('Backend sync success:', syncResult);
      return { synced: true, result: syncResult };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.error(`Backend sync attempt ${attempt} failed:`, lastError);
      
      // 如果是客户端错误或最后一次尝试，直接抛出
      if (lastError.message.includes('client error') || attempt === maxRetries) {
        break;
      }
      
      // 等待后重试（指数退避）
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt - 1), 10000)));
    }
  }

  // 所有重试都失败
  throw lastError || new Error('Sync failed after retries');
}


export async function handleGetNewtabFolders(): Promise<MessageResponse> {
  const rootResult = await ensureNewtabRootFolder();
  if (!rootResult) {
    throw new Error('NewTab root folder not found');
  }
  const rootId = rootResult.id;

  const rootFolder = (await chrome.bookmarks.get(rootId))?.[0];
  if (!rootFolder) {
    throw new Error('NewTab root folder not found');
  }

  type FolderNode = {
    id: string;
    title: string;
    parentId: string | null;
    path: string;
  };
  const folders: FolderNode[] = [];

  const queue: Array<{
    node: chrome.bookmarks.BookmarkTreeNode;
    parentId: string | null;
    pathPrefix: string;
  }> = [{ node: rootFolder, parentId: null, pathPrefix: '' }];

  while (queue.length > 0 && folders.length < 200) {
    const { node, parentId, pathPrefix } = queue.shift()!;

    const currentPath = pathPrefix ? `${pathPrefix}/${node.title}` : node.title;
    folders.push({ id: node.id, title: node.title, parentId, path: currentPath });

    const children = await chrome.bookmarks.getChildren(node.id);
    const childFolders = children.filter((c) => !c.url);
    for (const child of childFolders) {
      if (folders.length + queue.length >= 200) break;
      queue.push({ node: child, parentId: node.id, pathPrefix: currentPath });
    }
  }

  return {
    success: true,
    data: { rootId: rootFolder.id, folders },
  };
}
