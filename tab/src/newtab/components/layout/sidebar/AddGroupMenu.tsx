/**
 * 添加分组菜单组件
 */

import { X } from 'lucide-react';
import { GROUP_ICONS } from '../../../constants/index';
import { getIconComponent } from './iconUtils';
import { t } from '@/lib/i18n';

interface AddGroupMenuProps {
  newGroupName: string;
  selectedIcon: string;
  onNameChange: (name: string) => void;
  onIconChange: (icon: string) => void;
  onAdd: () => void;
  onClose: () => void;
}

export function AddGroupMenu({
  newGroupName,
  selectedIcon,
  onNameChange,
  onIconChange,
  onAdd,
  onClose,
}: AddGroupMenuProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div className="absolute left-full top-0 ml-2 w-56 p-3 rounded-xl glass-modal border border-white/10 shadow-2xl z-50 animate-scaleIn">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">{t('sidebar_new_group')}</span>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-3 h-3 text-white/60" />
          </button>
        </div>

        <input
          type="text"
          value={newGroupName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('sidebar_group_name')}
          aria-label={t('sidebar_group_name')}
          className="w-full bg-white/10 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-white/20 focus:border-blue-500/50 placeholder:text-white/40"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        />

        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {GROUP_ICONS.map((iconName) => {
            const Icon = getIconComponent(iconName);
            return (
              <button
                key={iconName}
                onClick={() => onIconChange(iconName)}
                className={`p-1.5 rounded-lg transition-all ${
                  selectedIcon === iconName
                    ? 'bg-blue-500/30 text-blue-400 ring-1 ring-blue-500/50'
                    : 'text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                <Icon className="w-4 h-4 mx-auto" />
              </button>
            );
          })}
        </div>

        <button
          onClick={onAdd}
          disabled={!newGroupName.trim()}
          className="w-full py-1.5 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t('btn_create')}
        </button>
      </div>
    </>
  );
}
