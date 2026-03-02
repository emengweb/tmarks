/**
 * 书签数据转换
 */

import type { Item } from '../../types/core';
import type { ToGridItemsOptions } from './types';
import { isFolder } from './api';

/** 生成 Item ID */
export function toGridId(bookmarkId: string): string {
  return `bb-${bookmarkId}`;
}

/** 从 Item ID 提取书签 ID */
export function fromGridId(gridId: string): string | null {
  return gridId.startsWith('bb-') ? gridId.slice(3) : null;
}

/** 检查是否为浏览器书签关联的 Item */
export function isBrowserBookmarkItem(item: Item): boolean {
  return !!item.browserBookmarkId;
}

/**
 * 将书签节点数组转换为 Item 数组
 */
export function toGridItems(
  nodes: chrome.bookmarks.BookmarkTreeNode[],
  opts: ToGridItemsOptions
): Item[] {
  const items: Item[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (isFolder(node)) {
      const folderItem: Item = {
        id: toGridId(node.id),
        type: 'folder',
        groupId: opts.groupId,
        parentId: opts.parentGridId,
        position: i,
        browserBookmarkId: node.id,
        data: {
          type: 'folder',
          title: node.title,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      items.push(folderItem);

      const children = node.children || [];
      if (children.length > 0) {
        items.push(...toGridItems(children, { groupId: opts.groupId, parentGridId: folderItem.id }));
      }
    } else {
      items.push({
        id: toGridId(node.id),
        type: 'shortcut',
        groupId: opts.groupId,
        parentId: opts.parentGridId,
        position: i,
        browserBookmarkId: node.id,
        data: {
          type: 'shortcut',
          url: node.url || '',
          title: node.title || node.url || '',
          clickCount: 0,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  }

  return items;
}
