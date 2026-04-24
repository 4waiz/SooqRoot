import { CalendarClock, PackageCheck, Truck, QrCode } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';
import { generateHarvestInstructions } from '../../lib/ai';

export function HarvestInstructions({ farmId }: { farmId: string }) {
  const { t, language } = useTranslation();
  const { demands, allocations, farms, buyers } = useApp();

  const instructions = allocations
    .flatMap((a) => {
      const d = demands.find((x) => x.id === a.demandId);
      if (!d) return [];
      return generateHarvestInstructions(a, d, farms, buyers);
    })
    .filter((hi) => hi.farmId === farmId);

  return (
    <Card>
      <CardTitle>{t('farmer_harvest_title')}</CardTitle>
      {instructions.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={32} />}
          title={t('farmer_harvest_empty')}
        />
      ) : (
        <div className="mt-4 grid md:grid-cols-2 gap-3">
          {instructions.map((h) => (
            <div
              key={h.batchId}
              className="rounded-2xl border border-charcoal-100 dark:border-charcoal-700 p-4 bg-gradient-to-br from-white to-brand-50/50 dark:from-charcoal-800 dark:to-charcoal-900 hover:shadow-soft transition"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div>
                  <div className="flex items-center gap-1 text-xs font-semibold uppercase text-brand-700 dark:text-brand-300">
                    <QrCode size={12} />
                    {h.batchId}
                  </div>
                  <div className="mt-1 text-lg font-bold text-charcoal-900 dark:text-white">
                    {t('harvest_prepare')} {h.qty}
                    {t(`unit_${h.unit}` as any)}{' '}
                    {language === 'ar' ? h.productAr : h.product}
                  </div>
                </div>
                <Badge tone="emerald">{t('grade_A')}</Badge>
              </div>
              <dl className="mt-3 text-sm grid grid-cols-2 gap-2">
                <Row
                  icon={<PackageCheck size={14} />}
                  label={t('col_packaging')}
                  value={language === 'ar' ? h.packagingAr : h.packaging}
                />
                <Row
                  icon={<CalendarClock size={14} />}
                  label={t('harvest_harvestDay')}
                  value={language === 'ar' ? h.harvestDayAr : h.harvestDay}
                />
                <Row
                  icon={<Truck size={14} />}
                  label={t('harvest_pickup')}
                  value={language === 'ar' ? h.pickupTimeAr : h.pickupTime}
                />
                <Row
                  icon={<PackageCheck size={14} />}
                  label={t('harvest_buyer')}
                  value={language === 'ar' ? h.buyerNameAr : h.buyerName}
                />
              </dl>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-xs font-semibold uppercase text-charcoal-500 dark:text-charcoal-300">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-charcoal-800 dark:text-white text-sm">{value}</dd>
    </div>
  );
}
