import { Badge } from '../ui/Badge';
import { DemandLine } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';

export function StructuredDemandTable({ lines }: { lines: DemandLine[] }) {
  const { t, language } = useTranslation();
  return (
    <div className="overflow-x-auto rounded-xl border border-charcoal-100 dark:border-charcoal-700">
      <table className="min-w-full text-sm">
        <thead className="bg-charcoal-50 dark:bg-charcoal-800/60">
          <tr>
            <Th>{t('col_crop')}</Th>
            <Th>{t('col_quantity')}</Th>
            <Th>{t('col_grade')}</Th>
            <Th>{t('col_packaging')}</Th>
            <Th>{t('col_delivery')}</Th>
            <Th>{t('col_pref')}</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-charcoal-100 dark:divide-charcoal-700">
          {lines.map((l) => (
            <tr key={l.id} className="hover:bg-brand-50/40 dark:hover:bg-brand-900/10 transition">
              <Td>
                <span className="font-semibold">
                  {language === 'ar' ? l.productAr : l.product}
                </span>
              </Td>
              <Td>
                {l.qty.toLocaleString()} {t(`unit_${l.unit}` as any)}
              </Td>
              <Td>
                <Badge tone="brand">{t(`grade_${l.grade}` as any)}</Badge>
              </Td>
              <Td>{language === 'ar' ? l.packagingAr : l.packaging}</Td>
              <Td>{language === 'ar' ? l.deliveryWindowAr : l.deliveryWindow}</Td>
              <Td>
                {l.locationPref ? (
                  <Badge tone="sand">
                    {language === 'ar' ? l.locationPrefAr : l.locationPref}
                  </Badge>
                ) : (
                  <span className="text-charcoal-400">—</span>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
