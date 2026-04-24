import { useMemo } from 'react';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';
import { Card, CardTitle, CardSub } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { EmptyState } from '../ui/EmptyState';
import { DemandInput } from './DemandInput';
import { StructuredDemandTable } from './StructuredDemandTable';
import { OrderStatusTracker } from './OrderStatusTracker';
import { BuyerMetrics } from './BuyerMetrics';
import { SpecCards } from './SpecCards';
import { computeBuyerMetrics } from '../../lib/allocation';
import { ClipboardList, ShoppingBasket, Building2 } from 'lucide-react';
import { Select } from '../ui/Input';

export function BuyerDashboard() {
  const { t, language } = useTranslation();
  const { buyers, activeBuyerId, setActiveBuyerId, demands, allocations, farms } = useApp();
  const activeBuyer = buyers.find((b) => b.id === activeBuyerId) || buyers[0];

  const buyerDemands = useMemo(
    () => demands.filter((d) => d.buyerId === activeBuyer.id),
    [demands, activeBuyer.id]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
            <ShoppingBasket size={14} />
            {t('role_buyer')}
          </div>
          <h2 className="section-title">{t('buyer_title')}</h2>
          <p className="section-subtitle">
            {language === 'ar' ? activeBuyer.nameAr : activeBuyer.name} ·{' '}
            {language === 'ar' ? activeBuyer.typeAr : activeBuyer.type}
          </p>
        </div>

        <div className="min-w-[220px]">
          <Select
            value={activeBuyerId}
            onChange={(e) => setActiveBuyerId(e.target.value)}
            label={t('col_buyer')}
          >
            {buyers.map((b) => (
              <option key={b.id} value={b.id}>
                {language === 'ar' ? b.nameAr : b.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <DemandInput />

      <section>
        <div className="flex items-center gap-2 mb-3">
          <ClipboardList size={18} className="text-brand-600" />
          <h3 className="text-lg font-semibold text-charcoal-900 dark:text-white">
            {t('buyer_orders_title')}
          </h3>
        </div>
        {buyerDemands.length === 0 ? (
          <Card>
            <EmptyState
              icon={<ClipboardList size={36} />}
              title={t('buyer_noOrders')}
              hint={t('buyer_demandInput_hint')}
            />
          </Card>
        ) : (
          <div className="space-y-4">
            {buyerDemands.map((demand) => {
              const allocation = allocations.find((a) => a.demandId === demand.id);
              const metrics = computeBuyerMetrics(demand, allocation, farms);
              return (
                <Card key={demand.id}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Building2 size={16} className="text-brand-600" />
                        <CardTitle>
                          {language === 'ar' ? activeBuyer.nameAr : activeBuyer.name}
                        </CardTitle>
                        <Badge tone={allocation ? 'emerald' : 'amber'}>
                          {allocation ? t('operator_allocatedLabel') : t('operator_notAllocated')}
                        </Badge>
                      </div>
                      <CardSub>
                        {new Date(demand.createdAt).toLocaleString(
                          language === 'ar' ? 'ar-AE' : 'en-AE'
                        )}
                      </CardSub>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-bold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-300 mb-2">
                      {t('buyer_orderStatus')}
                    </div>
                    <OrderStatusTracker status={demand.status} />
                  </div>

                  <div className="mt-5">
                    <BuyerMetrics {...metrics} />
                  </div>

                  {demand.aiInterpretation ? (
                    <div className="mt-5 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/40 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-200 mb-1">
                        {t('buyer_interpretation')} · {t('buyer_confidence')}{' '}
                        {Math.round((demand.aiConfidence || 0) * 100)}%
                      </div>
                      <p className="text-sm text-charcoal-800 dark:text-charcoal-100">
                        {language === 'ar' ? demand.aiInterpretationAr : demand.aiInterpretation}
                      </p>
                    </div>
                  ) : null}

                  <div className="mt-5">
                    <div className="text-xs font-bold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-300 mb-2">
                      {t('buyer_structuredTitle')}
                    </div>
                    <StructuredDemandTable lines={demand.lines} />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <SpecCards />
    </div>
  );
}
