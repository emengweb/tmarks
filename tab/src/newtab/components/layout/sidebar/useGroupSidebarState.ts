/**
 * GroupSidebar 状态管理 Hook
 */

import { useState, useEffect } from 'react';
import { StorageService } from '@/lib/utils/storage';
import { getTMarksUrls } from '@/lib/constants/urls';

export function useGroupSidebarState() {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Folder');
  const [tmarksUrl, setTmarksUrl] = useState('');
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [editGroupId, setEditGroupId] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupIcon, setEditGroupIcon] = useState('Folder');

  // 加载用户配置的 TMarks URL
  useEffect(() => {
    const loadTMarksUrl = async () => {
      const config = await StorageService.getTMarksConfig();
      if (config?.bookmarkApiUrl) {
        const baseUrl = config.bookmarkApiUrl.replace(/\/api\/?$/, '');
        setTmarksUrl(baseUrl);
      } else {
        setTmarksUrl(getTMarksUrls().BASE_URL);
      }
    };
    loadTMarksUrl();
  }, []);

  return {
    showAddMenu,
    setShowAddMenu,
    newGroupName,
    setNewGroupName,
    selectedIcon,
    setSelectedIcon,
    tmarksUrl,
    hoveredGroup,
    setHoveredGroup,
    deleteGroupId,
    setDeleteGroupId,
    editGroupId,
    setEditGroupId,
    editGroupName,
    setEditGroupName,
    editGroupIcon,
    setEditGroupIcon,
  };
}
