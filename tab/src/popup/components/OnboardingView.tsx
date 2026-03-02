/**
 * 引导视图组件（未配置状态）
 */

import { t } from '@/lib/i18n';

interface OnboardingViewProps {
  onOpenOptions: () => void;
}

export function OnboardingView({ onOpenOptions }: OnboardingViewProps) {
  return (
    <div className="relative h-[80vh] min-h-[580px] w-[380px] overflow-hidden rounded-2xl bg-[var(--tab-popup-onboarding-bg)] text-[var(--tab-popup-primary-text)] shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tab-popup-onboarding-radial-top),transparent_70%)] opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_var(--tab-popup-onboarding-radial-bottom),transparent_65%)] opacity-80" />
      <div className="absolute inset-0 bg-[color:var(--tab-popup-onboarding-overlay)] backdrop-blur-2xl" />
      <div className="relative flex h-full flex-col">
        <header className="px-6 pt-8 pb-6">
          <div className="rounded-3xl border border-[color:var(--tab-popup-onboarding-card-border)] bg-[color:var(--tab-popup-onboarding-card-bg)] p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--tab-popup-primary-from)] to-[var(--tab-popup-primary-via)] shadow-lg">
                <svg className="h-6 w-6 text-[var(--tab-popup-primary-text)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--tab-popup-onboarding-label)]">Onboarding</p>
                <h1 className="text-2xl font-semibold">{t('popup_welcome')}</h1>
                <p className="text-sm text-[color:var(--tab-popup-onboarding-desc)]">{t('popup_welcome_desc')}</p>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 space-y-5 overflow-y-auto px-6 pb-6">
          <section className="rounded-3xl border border-[color:var(--tab-popup-onboarding-card-border)] bg-[color:var(--tab-popup-onboarding-subtle-bg)] p-5 backdrop-blur-xl">
            <h2 className="text-sm font-semibold">{t('popup_required_info')}</h2>
            <p className="mt-1 text-xs text-[color:var(--tab-popup-onboarding-label)]">{t('popup_required_info_desc')}</p>
            <ol className="mt-4 space-y-3 text-xs">
              {[t('popup_config_ai_key'), t('popup_config_site_url'), t('popup_config_site_key')].map((item, idx) => (
                <li key={idx} className="flex gap-3 rounded-2xl border border-[color:var(--tab-popup-onboarding-subtle-border)] bg-[color:var(--tab-popup-onboarding-subtle-bg)] p-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-xl bg-[color:var(--tab-popup-onboarding-tip-bg)] text-[11px] font-semibold">{idx + 1}</span>
                  <div><p className="font-semibold">{item}</p></div>
                </li>
              ))}
            </ol>
          </section>
        </main>
        <footer className="px-6 pb-6">
          <button onClick={onOpenOptions} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[var(--tab-popup-primary-from)] via-[var(--tab-popup-primary-via)] to-[var(--tab-popup-primary-to)] px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:shadow-xl active:scale-95">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            {t('popup_go_settings')}
          </button>
        </footer>
      </div>
    </div>
  );
}
