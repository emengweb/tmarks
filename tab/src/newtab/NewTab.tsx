/**
 * NewTab 主组件（协调器）
 */

import { useState, useEffect } from 'react';
import { Plus, Edit, FolderPlus } from 'lucide-react';
import { t } from '@/lib/i18n';
import { useNewtabStore, useFaviconCache } from './hooks';
import { useNewtabHandlers } from './hooks/useNewtabHandlers';
import { Clock, Greeting, LunarDate, Poetry } from './components/display';
import { SearchBar, ShortcutContextMenu } from './components/shared';
import { GridContainer } from './components/grid';
import { Wallpaper, DockBar, GroupSidebar, RightSidebar } from './components/layout';
import { SettingsPanel } from './components/SettingsPanel';
import { AddShortcutModal, AddBookmarkFolderModal, BatchEditModal, BatchEditTip } from './components/modals';
import { useBrowserBookmarksSync } from './features/browser-sync';
import { createShortcut, createFolder } from './types/core';
import { getFaviconUrl } from './utils/shortcuts';

export function NewTab() {
  const { settings, isLoading, loadData, updateSettings, groups, activeView, activeGroupId, setActiveGroup, addItem, addHomeItem } = useNewtabStore();
  
  useFaviconCache();
  useBrowserBookmarksSync();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);
  const [showBatchEditTip, setShowBatchEditTip] = useState(false);
  const [batchSelectedIds, setBatchSelectedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handlers = useNewtabHandlers({
    groups,
    activeView,
    activeGroupId,
    setActiveGroup,
    setIsEditing,
    setContextMenu,
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 监听滚轮事件
  useEffect(() => {
    if (!settings.showShortcuts) return;
    
    window.addEventListener('wheel', handlers.handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handlers.handleWheel);
      if (handlers.wheelTimeoutRef.current) clearTimeout(handlers.wheelTimeoutRef.current);
    };
  }, [handlers.handleWheel, settings.showShortcuts, handlers.wheelTimeoutRef]);

  // 监听右键菜单事件
  useEffect(() => {
    window.addEventListener('contextmenu', handlers.handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handlers.handleContextMenu);
    };
  }, [handlers.handleContextMenu]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onPointerDown={handlers.handlePointerDown}
      onPointerMove={handlers.handlePointerMove}
      onPointerUp={handlers.handlePointerUp}
      onPointerLeave={handlers.handlePointerUp}
    >
      {/* 壁纸背景 */}
      <Wallpaper config={settings.wallpaper} onRefresh={handlers.handleWallpaperRefresh} />



      {/* 主内容 - 响应式布局，小屏幕减少顶部间距 */}
      <div className="relative z-10 w-full h-full flex flex-col items-center px-4 pt-[8vh] sm:pt-[12vh] pb-8 overflow-y-auto">
        {/* 问候语 */}
        {settings.showGreeting && (
          <div className="mb-1 animate-fadeIn">
            <Greeting userName={settings.userName} />
          </div>
        )}

        {/* 时钟（包含日期和农历） */}
        {settings.showClock && (
          <div className="mb-3 animate-fadeIn">
            <Clock
              format={settings.clockFormat}
              showDate={settings.showDate}
              showSeconds={settings.showSeconds}
              showLunar={settings.showLunar}
            />
          </div>
        )}

        {/* 独立农历显示（仅当时钟关闭但农历开启时） */}
        {!settings.showClock && settings.showLunar && (
          <div className="mb-3 animate-fadeIn">
            <LunarDate />
          </div>
        )}

        {/* 每日诗词 */}
        {settings.showPoetry && (
          <div className="mb-6 animate-fadeIn">
            <Poetry />
          </div>
        )}

        {/* 搜索框 - 调整层级避免遮挡 */}
        {settings.showSearch && (
          <div className="w-full max-w-2xl mb-6 animate-fadeIn px-4 relative z-20">
            <SearchBar
              engine={settings.searchEngine}
              enableSuggestions={settings.enableSearchSuggestions}
              onEngineChange={(engine) => updateSettings({ searchEngine: engine })}
            />
          </div>
        )}

        {/* 快捷方式网格 + 添加按钮 */}
        {settings.showShortcuts && (
          <div className="w-full max-w-5xl animate-fadeIn px-4 shortcut-area">
            <div className="flex items-start gap-4">
              <GridContainer
                columns={settings.shortcutColumns}
                isBatchMode={showBatchEdit}
                batchSelectedIds={batchSelectedIds}
                onBatchSelectedIdsChange={setBatchSelectedIds}
                isEditing={isEditing}
                onEditingChange={setIsEditing}
              />
            </div>
          </div>
        )}

      </div>

      {/* 左侧分组侧边栏 */}
      <GroupSidebar onOpenSettings={() => setShowSettings(true)} />

      {/* 右侧功能导航栏 - 为未来多功能扩展预留 */}
      <RightSidebar />

      {/* 底部 Dock 栏 - 置顶书签 */}
      {settings.showPinnedBookmarks && <DockBar />}

      {/* 设置面板 - 在顶层渲染避免被父容器限制 */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {/* 添加快捷方式弹窗 */}
      {showAddModal && (
        <AddShortcutModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={(url, title) => {
            if (activeView === 'home') {
              // 首页模式
              const item = createShortcut({
                groupId: '__home__',
                url,
                title,
                favicon: getFaviconUrl(url),
              });
              addHomeItem(item);
            } else {
              // 分组模式
              const item = createShortcut({
                groupId: activeGroupId || groups[0]?.id || '__home__',
                url,
                title,
                favicon: getFaviconUrl(url),
              });
              addItem(item);
            }
          }}
          groupName={
            activeView === 'home'
              ? '首页'
              : activeGroupId
              ? groups.find((g) => g.id === activeGroupId)?.name
              : undefined
          }
        />
      )}

      {/* 批量编辑弹窗 */}
      <BatchEditModal
        isOpen={showBatchEdit}
        onClose={() => {
          setShowBatchEdit(false);
          setBatchSelectedIds(new Set());
        }}
        selectedIds={batchSelectedIds}
        onSelectedIdsChange={setBatchSelectedIds}
      />

      {/* 批量编辑提示 */}
      <BatchEditTip
        isOpen={showBatchEditTip}
        onClose={() => setShowBatchEditTip(false)}
      />

      {/* 添加文件夹弹窗 */}
      <AddBookmarkFolderModal
        isOpen={showAddFolderModal}
        onClose={() => setShowAddFolderModal(false)}
        onSave={(name) => {
          if (activeView === 'home') {
            // 首页模式
            const item = createFolder({
              groupId: '__home__',
              title: name,
            });
            addHomeItem(item);
          } else {
            // 分组模式
            const item = createFolder({
              groupId: activeGroupId || groups[0]?.id || '__home__',
              title: name,
            });
            addItem(item);
          }
        }}
      />

      {/* 右键菜单 */}
      {contextMenu && (
        <ShortcutContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={[
            {
              label: t('newtab_context_add_shortcut'),
              icon: <Plus className="w-4 h-4" />,
              onClick: () => setShowAddModal(true),
            },
            {
              label: t('newtab_context_add_folder'),
              icon: <FolderPlus className="w-4 h-4" />,
              onClick: () => setShowAddFolderModal(true),
            },
            {
              label: t('newtab_context_batch_edit'),
              icon: <Edit className="w-4 h-4" />,
              onClick: () => {
                setBatchSelectedIds(new Set());
                setShowBatchEdit(true);
                setShowBatchEditTip(true);
              },
              divider: true,
            },
          ]}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}
