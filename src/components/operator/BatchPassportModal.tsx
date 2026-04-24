import { Modal } from '../ui/Modal';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useTranslation } from '../../i18n/useTranslation';
import { AllocationPart, Buyer, Demand, Farm } from '../../types';
import { dictionaries } from '../../i18n/translations';

interface Props {
  open: boolean;
  onClose: () => void;
  part: AllocationPart | null;
  product: string;
  productAr: string;
  unit: 'kg' | 'boxes' | 'jars';
  demand: Demand | null;
  farm: Farm | null;
  buyer: Buyer | null;
}

export function BatchPassportModal({
  open,
  onClose,
  part,
  product,
  productAr,
  unit,
  demand,
  farm,
  buyer,
}: Props) {
  const { t, language } = useTranslation();
  if (!part || !demand || !farm || !buyer) return null;
  const statusKey = `status_${demand.status}` as keyof typeof dictionaries.en;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('passport_title')}
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          {t('passport_close')}
        </Button>
      }
    >
      <div className="grid md:grid-cols-[auto,1fr] gap-6 items-start">
        <div className="flex flex-col items-center gap-2">
          <QrSvg seed={part.batchId} />
          <div className="text-xs font-semibold text-charcoal-600 dark:text-charcoal-300">
            {t('passport_scan')}
          </div>
          <Badge tone="emerald">{t('passport_originUAE')}</Badge>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Field label={t('passport_batchId')} value={part.batchId} mono />
          <Field
            label={t('passport_status')}
            value={<Badge tone="brand">{t(statusKey)}</Badge>}
          />
          <Field
            label={t('passport_farm')}
            value={language === 'ar' ? farm.nameAr : farm.name}
          />
          <Field
            label={t('passport_buyer')}
            value={language === 'ar' ? buyer.nameAr : buyer.name}
          />
          <Field
            label={t('passport_product')}
            value={`${language === 'ar' ? productAr : product} · ${part.qty}${t(`unit_${unit}` as any)}`}
          />
          <Field
            label={t('passport_grade')}
            value={<Badge tone="emerald">{t('grade_A')}</Badge>}
          />
          <Field
            label={t('passport_packaging')}
            value={
              (language === 'ar'
                ? farm.supplies.find((s) => s.product === product)?.packagingAr
                : farm.supplies.find((s) => s.product === product)?.packaging) || '—'
            }
          />
          <Field
            label={t('passport_harvestDate')}
            value={farm.supplies.find((s) => s.product === product)?.harvestDate || '—'}
          />
        </dl>
      </div>
      <div className="mt-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/40 p-3 text-xs text-charcoal-700 dark:text-charcoal-200">
        <span className="font-semibold">{t('passport_note')}: </span>
        {t('passport_noteText')}
      </div>
    </Modal>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-300">
        {label}
      </dt>
      <dd className={`mt-0.5 text-charcoal-800 dark:text-white ${mono ? 'font-mono' : ''}`}>
        {value}
      </dd>
    </div>
  );
}

// Deterministic QR-like SVG generated from the batch id. Looks plausible; not scannable — labeled as demo passport.
function QrSvg({ seed }: { seed: string }) {
  const size = 19;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  let h = hash || 1;
  for (let i = 0; i < size * size; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 1) === 1);
  }
  // Force corner finders
  const finders = [
    [0, 0],
    [0, size - 7],
    [size - 7, 0],
  ];
  const setCell = (r: number, c: number, v: boolean) => {
    cells[r * size + c] = v;
  };
  for (const [fr, fc] of finders) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const edge =
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        setCell(fr + r, fc + c, edge);
      }
    }
  }
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={140}
      height={140}
      className="rounded-xl bg-white p-1 shadow-soft"
    >
      {cells.map((on, i) =>
        on ? (
          <rect
            key={i}
            x={i % size}
            y={Math.floor(i / size)}
            width={1}
            height={1}
            fill="#1a1c1e"
          />
        ) : null
      )}
    </svg>
  );
}
