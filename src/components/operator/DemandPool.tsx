import { useState } from 'react';
import {
  ClipboardList,
  Play,
  ChevronDown,
  ChevronUp,
  Truck,
  Building2,
  Wand2,
  Replace,
  ShieldAlert,
  QrCode,
} from 'lucide-react';
import { Card, CardTitle, CardSub } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { FulfillmentRiskCard } from './FulfillmentRiskCard';
import { BatchPassportModal } from './BatchPassportModal';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';
import { runAllocationWithAI } from '../../lib/allocation';
import { Allocation, AllocationLine, AllocationPart, Demand } from '../../types';
import { dictionaries } from '../../i18n/translations';

export function DemandPool() {
  const { t, language } = useTranslation();
  const { demands, allocations, farms, buyers, setAllocation, updateDemand, advanceStatus } =
    useApp();

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [allocating, setAllocating] = useState<Record<string, boolean>>({});
  const [passportOpen, setPassportOpen] = useState<{
    demand: Demand;
    line: AllocationLine;
    part: AllocationPart;
  } | null>(null);

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const handleAllocate = async (demand: Demand) => {
    setAllocating((p) => ({ ...p, [demand.id]: true }));
    try {
      const result = await runAllocationWithAI(demand, farms, buyers);
      setAllocation(result);
      if (demand.status === 'Request' || demand.status === 'Structured') {
        updateDemand(demand.id, { status: 'Allocated' });
      }
      setExpanded((p) => ({ ...p, [demand.id]: true }));
    } finally {
      setAllocating((p) => ({ ...p, [demand.id]: false }));
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2">
        <ClipboardList size={18} className="text-brand-600" />
        <CardTitle>{t('operator_demandPool')}</CardTitle>
      </div>
      <CardSub>
        {language === 'ar'
          ? 'طلبات المشترين في انتظار التخصيص عبر المزارع.'
          : 'Buyer orders waiting for allocation across farms.'}
      </CardSub>

      <div className="mt-4 space-y-3">
        {demands.length === 0 ? (
          <div className="rounded-xl border border-dashed border-charcoal-200 dark:border-charcoal-700 p-6 text-center text-sm text-charcoal-500">
            {t('empty_default')}
          </div>
        ) : (
          demands.map((demand) => {
            const buyer = buyers.find((b) => b.id === demand.buyerId);
            if (!buyer) return null;
            const a = allocations.find((x) => x.demandId === demand.id);
            const isOpen = expanded[demand.id];
            const statusKey = `status_${demand.status}` as keyof typeof dictionaries.en;
            return (
              <div
                key={demand.id}
                className="rounded-2xl border border-charcoal-100 dark:border-charcoal-700 overflow-hidden bg-white dark:bg-charcoal-800"
              >
                <div className="p-4 flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200 flex items-center justify-center">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-charcoal-900 dark:text-white">
                          {language === 'ar' ? buyer.nameAr : buyer.name}
                        </div>
                        <Badge tone={a ? 'emerald' : 'amber'}>{t(statusKey)}</Badge>
                      </div>
                      <div className="text-xs text-charcoal-400">
                        {new Date(demand.createdAt).toLocaleString(
                          language === 'ar' ? 'ar-AE' : 'en-AE'
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {demand.lines.map((l) => (
                          <Badge key={l.id} tone="charcoal">
                            {language === 'ar' ? l.productAr : l.product} · {l.qty}
                            {t(`unit_${l.unit}` as any)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggle(demand.id)}
                      icon={isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    >
                      {isOpen
                        ? language === 'ar'
                          ? 'طيّ'
                          : 'Collapse'
                        : language === 'ar'
                        ? 'توسيع'
                        : 'Expand'}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAllocate(demand)}
                      disabled={Boolean(allocating[demand.id])}
                      icon={<Play size={14} />}
                    >
                      {allocating[demand.id]
                        ? language === 'ar'
                          ? 'AI...'
                          : 'AI...'
                        : a
                        ? t('operator_rerun')
                        : t('operator_runAllocation')}
                    </Button>
                    {a ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => advanceStatus(demand.id)}
                        icon={<Truck size={14} />}
                      >
                        {t('operator_advanceStatus')}
                      </Button>
                    ) : null}
                  </div>
                </div>

                {isOpen ? (
                  <div className="border-t border-charcoal-100 dark:border-charcoal-700 p-4 space-y-4">
                    {a ? (
                      <>
                        <FulfillmentRiskCard risk={a.risk} />
                        <AllocationResults
                          allocation={a}
                          demand={demand}
                          onPassport={(line, part) =>
                            setPassportOpen({ demand, line, part })
                          }
                        />
                      </>
                    ) : (
                      <div className="text-sm text-charcoal-500 dark:text-charcoal-300">
                        {t('operator_notAllocated')}. {t('operator_runAllocation')}.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      <BatchPassportModal
        open={Boolean(passportOpen)}
        onClose={() => setPassportOpen(null)}
        part={passportOpen?.part || null}
        product={passportOpen?.line.product || ''}
        productAr={passportOpen?.line.productAr || ''}
        unit={passportOpen?.line.unit || 'kg'}
        demand={passportOpen?.demand || null}
        farm={
          passportOpen
            ? farms.find((f) => f.id === passportOpen.part.farmId) || null
            : null
        }
        buyer={
          passportOpen
            ? buyers.find((b) => b.id === passportOpen.demand.buyerId) || null
            : null
        }
      />
    </Card>
  );
}

function AllocationResults({
  allocation,
  demand,
  onPassport,
}: {
  allocation: Allocation;
  demand: Demand;
  onPassport: (line: AllocationLine, part: AllocationPart) => void;
}) {
  const { t, language } = useTranslation();
  const { farms } = useApp();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
        <Wand2 size={14} />
        {t('operator_allocationResult')}
      </div>

      {allocation.lines.map((line) => {
        const fillPct = Math.round((line.filledQty / Math.max(line.requestedQty, 1)) * 100);
        return (
          <div
            key={line.demandLineId}
            className="rounded-xl border border-charcoal-100 dark:border-charcoal-700 p-3"
          >
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="font-semibold text-charcoal-900 dark:text-white">
                {language === 'ar' ? line.productAr : line.product} · {line.requestedQty}
                {t(`unit_${line.unit}` as any)}
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={fillPct === 100 ? 'emerald' : fillPct > 0 ? 'amber' : 'rose'}>
                  {fillPct}%
                </Badge>
                {line.shortfall > 0 ? (
                  <Badge tone="rose" icon={<ShieldAlert size={12} />}>
                    {t('operator_shortfall')}: {line.shortfall}
                    {t(`unit_${line.unit}` as any)}
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="mt-2 h-2 w-full rounded-full bg-charcoal-100 dark:bg-charcoal-700 overflow-hidden">
              <div
                className="h-full bg-brand-gradient"
                style={{ width: `${fillPct}%` }}
              />
            </div>

            <div className="mt-3 space-y-2">
              {line.parts.map((part) => {
                const farm = farms.find((f) => f.id === part.farmId);
                if (!farm) return null;
                return (
                  <div
                    key={part.batchId}
                    className="flex items-center justify-between gap-2 flex-wrap rounded-lg bg-charcoal-50 dark:bg-charcoal-900/40 px-3 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge tone="brand">
                        {language === 'ar' ? farm.nameAr : farm.name}
                      </Badge>
                      <span className="text-charcoal-700 dark:text-charcoal-200 font-semibold">
                        {part.qty}
                        {t(`unit_${line.unit}` as any)}
                      </span>
                      <Badge tone={part.confidence === 'Confirmed' ? 'emerald' : 'amber'}>
                        {t(`confidence_${part.confidence}` as any)}
                      </Badge>
                      <span className="text-xs text-charcoal-400">{farm.distanceKm}km</span>
                      <span className="text-xs font-mono text-charcoal-500">{part.batchId}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onPassport(line, part)}
                      icon={<QrCode size={14} />}
                    >
                      {t('operator_openPassport')}
                    </Button>
                  </div>
                );
              })}
            </div>

            {line.shortfall > 0 ? (
              <div className="mt-3 grid md:grid-cols-2 gap-3">
                {line.backupFarmIds.length > 0 ? (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 p-3 text-sm">
                    <div className="text-xs font-bold uppercase text-amber-700 dark:text-amber-200 mb-1">
                      {t('operator_backups')}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {line.backupFarmIds.map((bid) => {
                        const f = farms.find((x) => x.id === bid);
                        if (!f) return null;
                        return (
                          <Badge key={bid} tone="amber">
                            {language === 'ar' ? f.nameAr : f.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="rounded-lg bg-sand-100 dark:bg-sand-500/20 border border-sand-200 dark:border-sand-500/30 p-3 text-sm">
                  <div className="flex items-center gap-1 text-xs font-bold uppercase text-sand-500 dark:text-sand-200 mb-1">
                    <Replace size={12} />
                    {t('operator_substitutes')}
                  </div>
                  {line.substitutes.length === 0 ? (
                    <div className="text-charcoal-500 dark:text-charcoal-300">
                      {t('operator_noSubstitutes')}
                    </div>
                  ) : (
                    <ul className="space-y-1.5">
                      {line.substitutes.map((sub) => (
                        <li key={sub.product}>
                          <div className="flex items-center gap-2">
                            <Badge tone="brand">
                              {language === 'ar' ? sub.productAr : sub.product}
                            </Badge>
                            <span className="font-semibold text-charcoal-800 dark:text-charcoal-100">
                              {sub.availableQty} {t(`unit_${line.unit}` as any)}
                            </span>
                          </div>
                          <div className="text-xs text-charcoal-500 dark:text-charcoal-300 mt-0.5">
                            {language === 'ar' ? sub.reasonAr : sub.reason}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
