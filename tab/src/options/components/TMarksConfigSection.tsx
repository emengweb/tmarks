import { t } from '@/lib/i18n';
import { TMARKS_URLS } from '@/lib/constants/urls';
import type { FormDataSetter } from '@/types/form';

interface TMarksConfigSectionProps {
  formData: {
    bookmarkApiUrl: string;
    bookmarkApiKey: string;
  };
  setFormData: FormDataSetter;
}

export function TMarksConfigSection({ formData, setFormData }: TMarksConfigSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-[color:var(--tab-options-card-border)] bg-[color:var(--tab-options-card-bg)] shadow-sm backdrop-blur transition-shadow hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--tab-options-modal-topbar-from)] via-[var(--tab-options-modal-topbar-via)] to-[var(--tab-options-modal-topbar-to)]" />

      <div className="p-6 pt-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--tab-options-title)]">{t('options_sync_title')}</h2>
            <p className="mt-2 text-sm text-[var(--tab-options-text)]">
              {t('options_sync_desc')}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[color:var(--tab-popup-badge-amber-bg)] text-xs font-medium text-[var(--tab-popup-badge-amber-text)]">
            {t('options_recommended')}
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-3">
            {t('options_server_address')}
          </label>
          <input
            type="url"
            value={formData.bookmarkApiUrl}
            onChange={(e) => setFormData({ ...formData, bookmarkApiUrl: e.target.value })}
            placeholder={TMARKS_URLS.DEFAULT_BASE_URL}
            className="w-full px-3 py-2 border border-[var(--tab-options-button-border)] rounded-lg bg-[var(--tab-options-card-bg)] text-[var(--tab-options-title)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)]"
          />
          <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">
            <span className="font-medium">{t('options_tmarks_official')}</span>
            <code className="ml-1 px-1.5 py-0.5 bg-[var(--tab-options-pill-bg)] rounded">{TMARKS_URLS.DEFAULT_BASE_URL}</code>
          </p>
          <div className="mt-2 p-3 bg-[var(--tab-message-info-bg)] rounded-lg">
            <p className="text-xs text-[var(--tab-message-info-icon)] mb-2">
              <span className="font-semibold text-[var(--tab-options-title)]">{t('options_tmarks_info_title')}</span>
            </p>
            <ul className="text-xs text-[var(--tab-message-info-icon)] space-y-1">
              <li>• {t('options_tmarks_info_1')}</li>
              <li>• {t('options_tmarks_info_2')}</li>
              <li>• {t('options_tmarks_info_3')}</li>
              <li>• {t('options_tmarks_info_4')}<code className="px-1 bg-[var(--tab-options-pill-bg)] rounded">https://tmarks.669696.xyz</code></li>
              <li>• QQ 交流群：<code className="px-1 bg-[var(--tab-options-pill-bg)] rounded">1090555987</code></li>
            </ul>
          </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--tab-options-text)] mb-3">
            {t('options_api_key')}
          </label>
          <input
            type="password"
            value={formData.bookmarkApiKey}
            onChange={(e) => setFormData({ ...formData, bookmarkApiKey: e.target.value })}
            placeholder={t('options_api_key_placeholder')}
            className="w-full px-3 py-2 border border-[var(--tab-options-button-border)] rounded-lg bg-[var(--tab-options-card-bg)] text-[var(--tab-options-title)] focus:outline-none focus:ring-2 focus:ring-[var(--tab-options-button-primary-bg)]"
          />
          <p className="mt-2 text-xs text-[var(--tab-options-text-muted)]">
            {t('options_api_key_hint')}
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
