import { Leaf } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="border-t border-charcoal-100 dark:border-charcoal-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-charcoal-500 dark:text-charcoal-300">
          <Leaf size={16} className="text-brand-500" />
          <span>{t('footer_rights')}</span>
        </div>
        <div className="text-xs text-charcoal-400 dark:text-charcoal-500">
          {t('appTagline')}
        </div>
      </div>
    </footer>
  );
}
