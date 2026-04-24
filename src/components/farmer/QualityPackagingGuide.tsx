import { Carrot, Fish, Droplets, Check } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { useTranslation } from '../../i18n/useTranslation';

export function QualityPackagingGuide() {
  const { t } = useTranslation();
  const sections = [
    {
      title: t('quality_veg_title'),
      items: t('quality_veg_items').split('|'),
      icon: <Carrot size={18} />,
      tone: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
    },
    {
      title: t('quality_fish_title'),
      items: t('quality_fish_items').split('|'),
      icon: <Fish size={18} />,
      tone: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
    },
    {
      title: t('quality_honey_title'),
      items: t('quality_honey_items').split('|'),
      icon: <Droplets size={18} />,
      tone: 'bg-sand-100 text-sand-500 dark:bg-sand-500/20 dark:text-sand-200',
    },
  ];
  return (
    <Card>
      <CardTitle>{t('farmer_quality_title')}</CardTitle>
      <div className="mt-4 grid md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <div
            key={s.title}
            className="rounded-2xl border border-charcoal-100 dark:border-charcoal-700 p-4"
          >
            <div className="flex items-center gap-2">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl ${s.tone}`}>
                {s.icon}
              </div>
              <div className="font-semibold text-charcoal-900 dark:text-white">{s.title}</div>
            </div>
            <ul className="mt-3 space-y-2">
              {s.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-charcoal-700 dark:text-charcoal-200"
                >
                  <span className="mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-600 text-white">
                    <Check size={12} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Card>
  );
}
