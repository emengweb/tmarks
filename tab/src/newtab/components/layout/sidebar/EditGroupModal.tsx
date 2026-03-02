/**
 * 编辑分组弹窗组件
 */

import { X } from 'lucide-react';
import { GROUP_ICONS } from '../../../constants/index';
import { getIconComponent } from './iconUtils';
import { t } from '@/lib/i18n';

interface EditGroupModalProps {
  groupName: string;
  groupIcon: string;
  onNameChange: (name: string) => void;
  onIconChange: (icon: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditGroupModal({
  groupName,
  groupIcon,
  onNameChange,
  onIconChange,
  onSave,
  onCancel,
}: EditGroupModalProps) {
  return (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-80 p-4 rounded-xl glass-modal border border-white/10 shadow-2xl animate-scaleIn">
        <div className="flex items-center justify-between mb-3">
          <span className="text-base font-medium text-white">{t('sidebar_edit_group')}</span>
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4 text-white/60" />
          </button>
        </div>

        <input
          type="text"
          value={groupName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('sidebar_group_name')}
          aria-label={t('sidebar_group_name')}
          className="w-full bg-white/10 text-white text-sm rounded-lg px-3 py-2 mb-3 outline-none border border-white/20 focus:border-blue-500/50 placeholder:text-white/40"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
        />

        <div className="grid grid-cols-5 gap-2 mb-4">
          {GROUP_ICONS.map((iconName) => {
            const Icon = getIconComponent(iconName);
            return (
              <button
                key={iconName}
                onClick={() => onIconChange(iconName)}
                className={`p-2 rounded-lg transition-all ${
                  groupIcon === iconName
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
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          >
            {t('btn_cancel')}
          </button>
          <button
            onClick={onSave}
            disabled={!groupName.trim()}
            className="flex-1 py-2 rounded-lg bg-blue-500/80 hover:bg-blue-500 text-white text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('btn_save')}
          </button>
        </div>
      </div>
    </>
  );
}
