import { Carrot, Fish, Droplets, Ear, LightbulbIcon, MessageCircle } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { useTranslation } from '../../i18n/useTranslation';

export function FieldValidation() {
  const { t } = useTranslation();
  const voices = [
    {
      icon: <Carrot size={20} />,
      title: t('validation_veg_title'),
      body: t('validation_veg_body'),
      tone: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
    },
    {
      icon: <Fish size={20} />,
      title: t('validation_fish_title'),
      body: t('validation_fish_body'),
      tone: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
    },
    {
      icon: <Droplets size={20} />,
      title: t('validation_honey_title'),
      body: t('validation_honey_body'),
      tone: 'bg-sand-100 text-sand-500 dark:bg-sand-500/20 dark:text-sand-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
          <Ear size={14} />
          {t('nav_validation')}
        </div>
        <h2 className="section-title">{t('validation_title')}</h2>
        <p className="section-subtitle max-w-3xl">{t('validation_intro')}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {voices.map((v) => (
          <Card key={v.title} hover>
            <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl ${v.tone}`}>
              {v.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-charcoal-900 dark:text-white">
              {v.title}
            </h3>
            <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
              {v.body}
            </p>
          </Card>
        ))}
      </div>

      <Card className="bg-brand-gradient text-white border-transparent">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/20 backdrop-blur">
            <MessageCircle size={20} />
          </div>
          <div className="flex-1 min-w-[240px]">
            <div className="text-xs font-bold uppercase tracking-wide text-white/80">
              {t('validation_summary_title')}
            </div>
            <p className="mt-1 text-lg md:text-xl font-semibold leading-relaxed">
              {t('validation_summary')}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start gap-3 flex-wrap">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
            <LightbulbIcon size={20} />
          </div>
          <div className="flex-1 min-w-[240px]">
            <CardTitle>{t('validation_connect_title')}</CardTitle>
            <p className="mt-2 text-sm text-charcoal-700 dark:text-charcoal-200 leading-relaxed">
              {t('validation_connect')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
