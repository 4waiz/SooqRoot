import {
  Briefcase,
  Users,
  Sparkles,
  Handshake,
  Share2,
  BadgeDollarSign,
  Settings2,
  Heart,
  Leaf,
} from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { useTranslation } from '../../i18n/useTranslation';

export function BusinessModel() {
  const { t } = useTranslation();
  const tiles = [
    { icon: <Users size={18} />, title: t('business_segments'), body: t('business_segments_body'), tone: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200' },
    { icon: <Sparkles size={18} />, title: t('business_vp'), body: t('business_vp_body'), tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' },
    { icon: <Handshake size={18} />, title: t('business_partners'), body: t('business_partners_body'), tone: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200' },
    { icon: <Share2 size={18} />, title: t('business_channels'), body: t('business_channels_body'), tone: 'bg-sand-100 text-sand-500 dark:bg-sand-500/20 dark:text-sand-200' },
    { icon: <BadgeDollarSign size={18} />, title: t('business_revenue'), body: t('business_revenue_body'), tone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200' },
    { icon: <Settings2 size={18} />, title: t('business_costs'), body: t('business_costs_body'), tone: 'bg-charcoal-100 text-charcoal-700 dark:bg-charcoal-700 dark:text-charcoal-100' },
    { icon: <Heart size={18} />, title: t('business_social'), body: t('business_social_body'), tone: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200' },
    { icon: <Leaf size={18} />, title: t('business_env'), body: t('business_env_body'), tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' },
  ];
  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
          <Briefcase size={14} />
          {t('nav_business')}
        </div>
        <h2 className="section-title">{t('business_title')}</h2>
        <p className="section-subtitle max-w-3xl">{t('business_bmc')}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((x) => (
          <Card key={x.title} hover>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl ${x.tone}`}>
              {x.icon}
            </div>
            <h3 className="mt-3 text-base font-semibold text-charcoal-900 dark:text-white">
              {x.title}
            </h3>
            <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
              {x.body}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
