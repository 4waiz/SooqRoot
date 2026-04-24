import { Factory } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';

export function SupplyPool() {
  const { t, language } = useTranslation();
  const { farms } = useApp();

  return (
    <Card>
      <div className="flex items-center gap-2">
        <Factory size={18} className="text-brand-600" />
        <CardTitle>{t('operator_supplyPool')}</CardTitle>
      </div>
      <div className="mt-4 overflow-x-auto rounded-xl border border-charcoal-100 dark:border-charcoal-700">
        <table className="min-w-full text-sm">
          <thead className="bg-charcoal-50 dark:bg-charcoal-800/60">
            <tr>
              <Th>{t('col_farm')}</Th>
              <Th>{t('col_crop')}</Th>
              <Th>{t('col_available')}</Th>
              <Th>{t('col_grade')}</Th>
              <Th>{t('col_confidence')}</Th>
              <Th>{t('col_distance')}</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-700">
            {farms.flatMap((f) =>
              f.supplies.map((s, i) => (
                <tr
                  key={`${f.id}-${s.product}-${i}`}
                  className="hover:bg-brand-50/40 dark:hover:bg-brand-900/10 transition"
                >
                  <Td>
                    <div className="font-semibold">{language === 'ar' ? f.nameAr : f.name}</div>
                    <div className="text-xs text-charcoal-400">
                      {language === 'ar' ? f.locationAr : f.location}
                    </div>
                  </Td>
                  <Td>{language === 'ar' ? s.productAr : s.product}</Td>
                  <Td>
                    {s.qty}
                    {t(`unit_${s.unit}` as any)}
                  </Td>
                  <Td>
                    <Badge tone="brand">{t(`grade_${s.grade}` as any)}</Badge>
                  </Td>
                  <Td>
                    <Badge tone={s.confidence === 'Confirmed' ? 'emerald' : 'amber'}>
                      {t(`confidence_${s.confidence}` as any)}
                    </Badge>
                  </Td>
                  <Td>{f.distanceKm} km</Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="text-start px-4 py-3 text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-300">
    {children}
  </th>
);
const Td = ({ children }: { children: React.ReactNode }) => (
  <td className="px-4 py-3 text-charcoal-800 dark:text-charcoal-100">{children}</td>
);
