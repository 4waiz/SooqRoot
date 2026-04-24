import { Leaf, TrendingUp, Factory, CalendarCheck, Gauge } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';
import { computeOperatorMetrics } from '../../lib/allocation';

export function LocalSourcingTracker() {
  const { t, language } = useTranslation();
  const { demands, allocations, farms } = useApp();
  const m = computeOperatorMetrics(demands, allocations, farms);

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Leaf size={18} className="text-brand-600" />
        <CardTitle>{t('operator_localTracker')}</CardTitle>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard
          label={t('operator_localPct')}
          value={`${Math.round(m.localPct * 100)}%`}
          icon={<Leaf size={16} />}
          tone="emerald"
        />
        <StatCard
          label={t('operator_localFarms')}
          value={m.farmsInvolved}
          icon={<Factory size={16} />}
          tone="brand"
        />
        <StatCard
          label={t('operator_matchedBefore')}
          value={`${m.matchedBeforeHarvest}`}
          hint={language === 'ar' ? 'وحدة مُجمّعة' : 'aggregate units'}
          icon={<CalendarCheck size={16} />}
          tone="sky"
        />
        <StatCard
          label={t('operator_wasteRisk')}
          value={`${m.wasteRiskReducedKg}kg`}
          icon={<Gauge size={16} />}
          tone="sand"
        />
        <StatCard
          label={t('operator_fillRate')}
          value={`${Math.round(m.fillRate * 100)}%`}
          icon={<TrendingUp size={16} />}
          tone="brand"
        />
      </div>
    </Card>
  );
}
