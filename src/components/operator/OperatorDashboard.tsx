import { Settings2, Play } from 'lucide-react';
import { Button } from '../ui/Button';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';
import { DemandPool } from './DemandPool';
import { SupplyPool } from './SupplyPool';
import { LocalSourcingTracker } from './LocalSourcingTracker';
import { runAllocation } from '../../lib/allocation';

export function OperatorDashboard() {
  const { t } = useTranslation();
  const { demands, farms, buyers, setAllocation } = useApp();

  const runAll = () => {
    for (const d of demands) {
      setAllocation(runAllocation(d, farms, buyers));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
            <Settings2 size={14} />
            {t('role_operator')}
          </div>
          <h2 className="section-title">{t('operator_title')}</h2>
          <p className="section-subtitle">{t('appExplainer')}</p>
        </div>
        <Button onClick={runAll} icon={<Play size={16} />}>
          {t('operator_runAllocation')}
        </Button>
      </div>

      <LocalSourcingTracker />

      <DemandPool />

      <SupplyPool />
    </div>
  );
}
