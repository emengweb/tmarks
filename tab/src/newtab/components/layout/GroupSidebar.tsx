/**
 * 左侧分组侧边栏组件（协调器）
 */

import { Plus, X, Home, BookMarked, Settings, Edit2 } from 'lucide-react';
import { useNewtabStore } from '../../hooks';
import { ConfirmModal } from '../ui/ConfirmModal';
import { AddGroupMenu } from './sidebar/AddGroupMenu';
import { EditGroupModal } from './sidebar/EditGroupModal';
import { useGroupSidebarState } from './sidebar/useGroupSidebarState';
import { getIconComponent } from './sidebar/iconUtils';
import { t } from '@/lib/i18n';

interface GroupSidebarProps {
  onOpenSettings?: () => void;
}

export function GroupSidebar({ onOpenSettings }: GroupSidebarProps) {
  const { groups, activeView, activeGroupId, setActiveView, setActiveGroup, addGroup, updateGroup, removeGroup, items } =
    useNewtabStore();
  
  const state = useGroupSidebarState();

  // 左侧只显示前 10 个分组
  const leftGroups = groups.slice(0, 10);

  const handleAddGroup = () => {
    if (state.newGroupName.trim()) {
      addGroup(state.newGroupName.trim(), state.selectedIcon);
      state.setNewGroupName('');
      state.setSelectedIcon('Folder');
      state.setShowAddMenu(false);
    }
  };

  const handleEditGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      state.setEditGroupId(groupId);
      state.setEditGroupName(group.name);
      state.setEditGroupIcon(group.icon);
    }
  };

  const handleUpdateGroup = () => {
    if (state.editGroupId && state.editGroupName.trim()) {
      updateGroup(state.editGroupId, {
        name: state.editGroupName.trim(),
        icon: state.editGroupIcon,
      });
      state.setEditGroupId(null);
      state.setEditGroupName('');
      state.setEditGroupIcon('Folder');
    }
  };

  const handleRemoveGroup = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    e.preventDefault();
    state.setDeleteGroupId(groupId);
  };

  const confirmRemoveGroup = () => {
    if (state.deleteGroupId) {
      removeGroup(state.deleteGroupId);
      state.setDeleteGroupId(null);
    }
  };

  return (
    <div className="fixed left-3 top-1/2 -translate-y-1/2 z-20 glass rounded-2xl p-2 animate-fadeIn flex flex-col gap-1">
      {/* 首页按钮 */}
      <div
        className="relative"
        onMouseEnter={() => state.setHoveredGroup('home')}
        onMouseLeave={() => state.setHoveredGroup(null)}
      >
        <button
          onClick={() => setActiveView('home')}
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
            activeView === 'home'
              ? 'bg-white/20 text-white'
              : 'text-white/50 hover:text-white/80 hover:bg-white/10'
          }`}
          title="首页"
        >
          <Home className="w-4 h-4" />
        </button>
        {state.hoveredGroup === 'home' && (
          <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap z-50">
            首页
          </div>
        )}
      </div>

      {/* 分隔线 */}
      {leftGroups.length > 0 && <div className="w-6 h-px bg-white/20 mx-auto my-1" />}

      {/* 分组列表 - 最多显示 10 个 */}
      {leftGroups.map((group) => {
        const IconComponent = getIconComponent(group.icon);
        return (
          <div
            key={group.id}
            className="relative"
            onMouseEnter={() => state.setHoveredGroup(group.id)}
            onMouseLeave={() => state.setHoveredGroup(null)}
          >
            <button
              onClick={() => setActiveGroup(group.id)}
              onDoubleClick={() => handleEditGroup(group.id)}
              onContextMenu={(e) => {
                e.preventDefault();
                state.setHoveredGroup(group.id);
              }}
              data-group-id={group.id}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                activeView === 'group' && activeGroupId === group.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/10'
              }`}
              title={`${group.name}\n双击编辑 | 右键菜单`}
            >
              <IconComponent className="w-4 h-4" />
            </button>
            {state.hoveredGroup === group.id && (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap z-50 flex items-center gap-2">
                {group.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditGroup(group.id);
                  }}
                  className="p-0.5 hover:bg-white/10 rounded"
                  title={t('sidebar_edit_group')}
                >
                  <Edit2 className="w-3 h-3 text-blue-400" />
                </button>
                <button
                  onClick={(e) => handleRemoveGroup(e, group.id)}
                  className="p-0.5 hover:bg-white/10 rounded"
                  title={t('sidebar_delete_group')}
                >
                  <X className="w-3 h-3 text-red-400" />
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* 分隔线 */}
      <div className="w-6 h-px bg-white/20 mx-auto my-1" />

      {/* 添加分组 - 只有在少于 10 个分组时才显示 */}
      {groups.length < 10 && (
        <div className="relative">
          <button
            onClick={() => state.setShowAddMenu(!state.showAddMenu)}
            onMouseEnter={() => state.setHoveredGroup('add')}
            onMouseLeave={() => state.setHoveredGroup(null)}
            className="relative w-11 h-11 rounded-xl flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/10 transition-all active:scale-90"
            title={t('sidebar_new_group')}
          >
            <Plus className="w-4 h-4" />
            {state.hoveredGroup === 'add' && !state.showAddMenu && (
              <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap z-50">
                {t('sidebar_new_group')}
              </div>
            )}
          </button>

          {state.showAddMenu && (
            <AddGroupMenu
              newGroupName={state.newGroupName}
              selectedIcon={state.selectedIcon}
              onNameChange={state.setNewGroupName}
              onIconChange={state.setSelectedIcon}
              onAdd={handleAddGroup}
              onClose={() => state.setShowAddMenu(false)}
            />
          )}
        </div>
      )}

      {/* 分隔线 */}
      {state.tmarksUrl && <div className="w-6 h-px bg-white/20 mx-auto my-1" />}

      {/* TMarks 入口 */}
      {state.tmarksUrl && (
        <button
          onClick={() => window.open(state.tmarksUrl, '_blank')}
          onMouseEnter={() => state.setHoveredGroup('tmarks')}
          onMouseLeave={() => state.setHoveredGroup(null)}
          className="relative w-11 h-11 rounded-xl flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
          title={t('sidebar_tmarks')}
        >
          <BookMarked className="w-4 h-4" />
          {state.hoveredGroup === 'tmarks' && (
            <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap z-50">
              {t('sidebar_bookmark_manage')}
            </div>
          )}
        </button>
      )}

      {/* 分隔线 */}
      <div className="w-6 h-px bg-white/20 mx-auto my-1" />

      {/* 设置按钮 */}
      <button
        onClick={onOpenSettings}
        onMouseEnter={() => state.setHoveredGroup('settings')}
        onMouseLeave={() => state.setHoveredGroup(null)}
        className="relative w-11 h-11 rounded-xl flex items-center justify-center text-white/50 hover:text-white/80 hover:bg-white/10 transition-all"
        title={t('widget_settings')}
      >
        <Settings className="w-4 h-4" />
        {state.hoveredGroup === 'settings' && (
          <div className="absolute left-full ml-2 px-2 py-1 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap z-50">
            {t('widget_settings')}
          </div>
        )}
      </button>

      {/* 删除分组确认弹窗 */}
      <ConfirmModal
        isOpen={!!state.deleteGroupId}
        title={t('sidebar_delete_group')}
        message={(() => {
          const group = groups.find((g) => g.id === state.deleteGroupId);
          if (!group) return '';
          
          const itemCount = items.filter((item) => item.groupId === state.deleteGroupId).length;
          
          if (group.bookmarkFolderId) {
            // 浏览器同步分组：删除所有书签
            return itemCount > 0
              ? t('sidebar_delete_synced_group_with_items', [group.name, itemCount.toString()])
              : t('sidebar_delete_group_with_content');
          } else {
            // 非同步分组：删除所有项目
            return itemCount > 0
              ? `确定删除分组"${group.name}"吗？该分组下的 ${itemCount} 个项目也会被删除。`
              : `确定删除分组"${group.name}"吗？`;
          }
        })()}
        confirmText={t('ui_delete')}
        cancelText={t('btn_cancel')}
        confirmVariant="danger"
        onConfirm={confirmRemoveGroup}
        onCancel={() => state.setDeleteGroupId(null)}
      />

      {/* 编辑分组弹窗 */}
      {state.editGroupId && (
        <EditGroupModal
          groupName={state.editGroupName}
          groupIcon={state.editGroupIcon}
          onNameChange={state.setEditGroupName}
          onIconChange={state.setEditGroupIcon}
          onSave={handleUpdateGroup}
          onCancel={() => state.setEditGroupId(null)}
        />
      )}
    </div>
  );
}
