/**
 * 右侧分组导航栏 - 显示更多分组（左侧最多10个，右侧最多10个）
 */

import { useState } from 'react';
import {
  Home,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Wrench,
  Code,
  Music,
  Film,
  ShoppingCart,
  Heart,
  Star,
  Bookmark,
  Folder,
  Globe,
  Zap,
  X,
  Edit2,
} from 'lucide-react';
import { useNewtabStore } from '../../hooks';
import { ConfirmModal } from '../ui/ConfirmModal';
import { t } from '@/lib/i18n';

// 图标映射
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Briefcase,
  GraduationCap,
  Gamepad2,
  Wrench,
  Code,
  Music,
  Film,
  ShoppingCart,
  Heart,
  Star,
  Bookmark,
  Folder,
  Globe,
  Zap,
};

function getIconComponent(iconName: string) {
  return ICON_MAP[iconName] || Folder;
}

export function RightSidebar() {
  const { groups, activeGroupId, setActiveGroup, updateGroup, removeGroup, items } =
    useNewtabStore();
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupIcon, setEditGroupIcon] = useState('Folder');

  // 右侧显示第 11-20 个分组
  const rightGroups = groups.slice(10, 20);

  // 如果没有超过 10 个分组，不显示右侧导航栏
  if (rightGroups.length === 0) {
    return null;
  }

  const handleEditGroup = (groupId: string) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setEditGroupId(groupId);
      setEditGroupName(group.name);
      setEditGroupIcon(group.icon);
    }
  };

  const handleUpdateGroup = () => {
    if (editGroupId && editGroupName.trim()) {
      updateGroup(editGroupId, {
        name: editGroupName.trim(),
        icon: editGroupIcon,
      });
      setEditGroupId(null);
      setEditGroupName('');
      setEditGroupIcon('Folder');
    }
  };

  const handleRemoveGroup = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteGroupId(groupId);
  };

  const confirmRemoveGroup = () => {
    if (deleteGroupId) {
      removeGroup(deleteGroupId);
      setDeleteGroupId(null);
    }
  };

  return (
    <>
      <div className="fixed right-3 top-1/2 -translate-y-1/2 z-20 glass rounded-2xl p-2 animate-fadeIn flex flex-col gap-1">
        {rightGroups.map((group) => {
          const IconComponent = getIconComponent(group.icon);
          return (
            <div
              key={group.id}
              className="relative"
              onMouseEnter={() => setHoveredGroup(group.id)}
              onMouseLeave={() => setHoveredGroup(null)}
            >
              <button
                onClick={() => setActiveGroup(group.id)}
                onDoubleClick={() => handleEditGroup(group.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setHoveredGroup(group.id);
                }}
                data-group-id={group.id}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-90 ${
                  activeGroupId === group.id
                    ? 'bg-white/20 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/10'
                }`}
                title={`${group.name}\n双击编辑 | 右键菜单`}
              >
                <IconComponent className="w-4 h-4" />
              </button>
              {hoveredGroup === group.id && (
                <div className="absolute right-full mr-2 px-2 py-1 rounded-lg bg-black/80 text-white text-xs whitespace-nowrap z-50 flex items-center gap-2">
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
      </div>

      {/* 删除分组确认弹窗 */}
      <ConfirmModal
        isOpen={!!deleteGroupId}
        title={t('sidebar_delete_group')}
        message={(() => {
          const group = groups.find((g) => g.id === deleteGroupId);
          if (!group) return '';
          
          const itemCount = items.filter((item) => item.groupId === deleteGroupId).length;
          
          if (group.bookmarkFolderId) {
            return itemCount > 0
              ? t('sidebar_delete_synced_group_with_items', [group.name, itemCount.toString()])
              : t('sidebar_delete_group_with_content');
          } else {
            return itemCount > 0
              ? t('sidebar_delete_group_move_items', [group.name, itemCount.toString()])
              : t('sidebar_delete_group_move_home');
          }
        })()}
        confirmText={t('ui_delete')}
        cancelText={t('btn_cancel')}
        confirmVariant="danger"
        onConfirm={confirmRemoveGroup}
        onCancel={() => setDeleteGroupId(null)}
      />

      {/* 编辑分组弹窗 */}
      {editGroupId && (
        <>
          <div
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            onClick={() => setEditGroupId(null)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-80 p-4 rounded-xl glass-modal border border-white/10 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-medium text-white">{t('sidebar_edit_group')}</span>
              <button
                onClick={() => setEditGroupId(null)}
                className="p-1 rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <input
              type="text"
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              placeholder={t('sidebar_group_name')}
              aria-label={t('sidebar_group_name')}
              className="w-full bg-white/10 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-white/20 focus:border-blue-500/50 placeholder:text-white/40"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateGroup()}
            />

            <div className="grid grid-cols-5 gap-2 mb-4">
              {Object.keys(ICON_MAP).map((iconName) => {
                const Icon = getIconComponent(iconName);
                return (
                  <button
                    key={iconName}
                    onClick={() => setEditGroupIcon(iconName)}
                    className={`p-2 rounded-lg transition-all ${
                      editGroupIcon === iconName
                        ? 'bg-blue-500/30 text-blue-400 ring-1 ring-blue-500/50'
                        : 'text-white/50 hover:bg-white/10 hover:text-white/80'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto" />
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEditGroupId(null)}
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
              >
                {t('btn_cancel')}
              </button>
              <button
                onClick={handleUpdateGroup}
                disabled={!editGroupName.trim()}
                className="flex-1 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('btn_save')}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
