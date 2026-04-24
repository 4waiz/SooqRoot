import { Tractor } from 'lucide-react';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';
import { Select } from '../ui/Input';
import { FarmProfile } from './FarmProfile';
import { SupplyInputForm } from './SupplyInputForm';
import { FarmerCopilot } from './FarmerCopilot';
import { HarvestInstructions } from './HarvestInstructions';
import { QualityPackagingGuide } from './QualityPackagingGuide';

export function FarmerDashboard() {
  const { t, language } = useTranslation();
  const { farms, activeFarmId, setActiveFarmId } = useApp();
  const farm = farms.find((f) => f.id === activeFarmId) || farms[0];

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
            <Tractor size={14} />
            {t('role_farmer')}
          </div>
          <h2 className="section-title">{t('farmer_title')}</h2>
          <p className="section-subtitle">
            {language === 'ar' ? farm.nameAr : farm.name} ·{' '}
            {language === 'ar' ? farm.locationAr : farm.location}
          </p>
        </div>
        <div className="min-w-[240px]">
          <Select
            value={activeFarmId}
            onChange={(e) => setActiveFarmId(e.target.value)}
            label={t('farmer_selectFarm')}
          >
            {farms.map((f) => (
              <option key={f.id} value={f.id}>
                {language === 'ar' ? f.nameAr : f.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <FarmProfile farm={farm} />

      <div className="grid lg:grid-cols-2 gap-6">
        <SupplyInputForm farmId={farm.id} />
        <FarmerCopilot farm={farm} />
      </div>

      <HarvestInstructions farmId={farm.id} />

      <QualityPackagingGuide />
    </div>
  );
}
