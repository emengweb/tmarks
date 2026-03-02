/**
 * 操作选项组件
 */

import { t } from '@/lib/i18n';

interface ActionOptionsProps {
  selectedAction: 'snapshot' | 'update-tags' | 'update-description' | null;
  hasNewTags: boolean;
  descriptionInput: string;
  onActionChange: (action: 'snapshot' | 'update-tags' | 'update-description') => void;
  onDescriptionChange: (description: string) => void;
}

export function ActionOptions({
  selectedAction,
  hasNewTags,
  descriptionInput,
  onActionChange,
  onDescriptionChange,
}: ActionOptionsProps) {
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-[var(--tab-text)] mb-3">
        {t('label_select_action')}
      </div>

      {/* Create snapshot */}
      <label
        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
          selectedAction === 'snapshot'
            ? 'border-[color:var(--tab-message-info-icon)] bg-[color:var(--tab-message-info-bg)]'
            : 'border-[color:var(--tab-border)] hover:border-[color:var(--tab-border-strong)]'
        }`}
      >
        <input
          type="radio"
          name="action"
          value="snapshot"
          checked={selectedAction === 'snapshot'}
          onChange={() => onActionChange('snapshot')}
          className="mt-0.5 w-4 h-4 text-[var(--tab-message-info-icon)] focus:ring-[var(--tab-message-info-icon)]"
        />
        <div className="flex-1">
          <div className="text-sm font-medium text-[var(--tab-text)]">
            {t('action_create_snapshot')}
          </div>
          <div className="text-xs text-[var(--tab-text-muted)] mt-1">
            {t('action_create_snapshot_desc')}
          </div>
        </div>
      </label>

      {/* Update tags */}
      {hasNewTags && (
        <label
          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
            selectedAction === 'update-tags'
              ? 'border-[color:var(--tab-message-info-icon)] bg-[color:var(--tab-message-info-bg)]'
              : 'border-[color:var(--tab-border)] hover:border-[color:var(--tab-border-strong)]'
          }`}
        >
          <input
            type="radio"
            name="action"
            value="update-tags"
            checked={selectedAction === 'update-tags'}
            onChange={() => onActionChange('update-tags')}
            className="mt-0.5 w-4 h-4 text-[var(--tab-message-info-icon)] focus:ring-[var(--tab-message-info-icon)]"
          />
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--tab-text)]">
              {t('action_add_tags')}
            </div>
            <div className="text-xs text-[var(--tab-text-muted)] mt-1">
              {t('action_add_tags_desc')}
            </div>
          </div>
        </label>
      )}

      {/* Update description */}
      <label
        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
          selectedAction === 'update-description'
            ? 'border-[color:var(--tab-message-info-icon)] bg-[color:var(--tab-message-info-bg)]'
            : 'border-[color:var(--tab-border)] hover:border-[color:var(--tab-border-strong)]'
        }`}
      >
        <input
          type="radio"
          name="action"
          value="update-description"
          checked={selectedAction === 'update-description'}
          onChange={() => onActionChange('update-description')}
          className="mt-0.5 w-4 h-4 text-[var(--tab-message-info-icon)] focus:ring-[var(--tab-message-info-icon)]"
        />
        <div className="flex-1">
          <div className="text-sm font-medium text-[var(--tab-text)]">
            {t('action_update_desc')}
          </div>
          <div className="text-xs text-[var(--tab-text-muted)] mt-1">
            {t('action_update_desc_desc')}
          </div>
          {selectedAction === 'update-description' && (
            <textarea
              value={descriptionInput}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder={t('placeholder_new_desc')}
              rows={3}
              className="mt-2 w-full rounded-lg border border-[color:var(--tab-border-strong)] bg-[color:var(--tab-surface)] px-3 py-2 text-sm text-[var(--tab-text)] placeholder:text-[var(--tab-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-message-info-icon)] resize-none"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </label>
    </div>
  );
}
