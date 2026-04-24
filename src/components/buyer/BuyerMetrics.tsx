import { CheckCircle2, AlertTriangle, Truck, Leaf, Factory, Gauge } from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { useTranslation } from '../../i18n/useTranslation';
import { dictionaries } from '../../i18n/translations';

interface Props {
  localPct: number;
  matchedQty: number;
  totalRequested: number;
  shortfallQty: number;
  farmsInvolved: number;
  wasteRiskReducedKg: number;
  status: string;
}

export function BuyerMetrics({
  localPct,
  matchedQty,
  totalRequested,
  shortfallQty,
  farmsInvolved,
  wasteRiskReducedKg,
  status,
}: Props) {
  const { t, language } = useTranslation();
  const statusKey = `status_${status}` as keyof typeof dictionaries.en;
  const matchedPct = totalRequested > 0 ? Math.round((matchedQty / totalRequested) * 100) : 0;
  const shortPct = totalRequested > 0 ? Math.round((shortfallQty / totalRequested) * 100) : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard
        label={t('buyer_metrics_local')}
        value={`${Math.round(localPct * 100)}%`}
        hint={language === 'ar' ? 'مزارع إماراتية' : 'UAE farms'}
        icon={<Leaf size={16} />}
        tone="brand"
      />
      <StatCard
        label={t('buyer_metrics_matched')}
        value={`${matchedPct}%`}
        hint={`${matchedQty} / ${totalRequested}`}
        icon={<CheckCircle2 size={16} />}
        tone="emerald"
      />
      <StatCard
        label={t('buyer_metrics_shortfall')}
        value={`${shortPct}%`}
        hint={`${shortfallQty}`}
        icon={<AlertTriangle size={16} />}
        tone={shortPct > 0 ? 'amber' : 'charcoal'}
      />
      <StatCard
        label={t('buyer_metrics_farms')}
        value={farmsInvolved}
        hint={language === 'ar' ? 'مشاركة في الطلب' : 'in this order'}
        icon={<Factory size={16} />}
        tone="sky"
      />
      <StatCard
        label={t('buyer_metrics_waste')}
        value={`${wasteRiskReducedKg}kg`}
        hint={language === 'ar' ? 'تقدير' : 'estimated'}
        icon={<Gauge size={16} />}
        tone="sand"
      />
      <StatCard
        label={t('buyer_metrics_status')}
        value={<span className="text-lg">{t(statusKey)}</span>}
        icon={<Truck size={16} />}
        tone="brand"
      />
    </div>
  );
}
