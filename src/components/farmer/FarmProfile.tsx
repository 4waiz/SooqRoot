import { MapPin, Leaf, Boxes, Gauge } from 'lucide-react';
import { Farm } from '../../types';
import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FallbackImage } from '../ui/FallbackImage';
import { useTranslation } from '../../i18n/useTranslation';
import { dictionaries } from '../../i18n/translations';

export function FarmProfile({ farm }: { farm: Farm }) {
  const { t, language } = useTranslation();
  const totalUnits = farm.supplies.reduce((s, x) => s + x.qty, 0);
  const confidenceKey = `confidence_${farm.confidenceLevel}` as keyof typeof dictionaries.en;

  return (
    <Card padded={false} className="overflow-hidden">
      <div className="relative h-44 md:h-56">
        <FallbackImage
          src={farm.photo}
          alt={farm.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-3 start-4 right-4 flex items-end justify-between text-white flex-wrap gap-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide opacity-80">
              {t('farmer_profile_title')}
            </div>
            <div className="text-xl md:text-2xl font-bold">
              {language === 'ar' ? farm.nameAr : farm.name}
            </div>
            <div className="text-sm opacity-90 flex items-center gap-1">
              <MapPin size={14} /> {language === 'ar' ? farm.locationAr : farm.location} · {farm.distanceKm}km
            </div>
          </div>
          <Badge tone="emerald">{t(confidenceKey)}</Badge>
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MiniStat icon={<Boxes size={14} />} label={t('farmer_profile_capacity')} value={`${totalUnits}`} hint={language === 'ar' ? 'وحدات' : 'units'} />
          <MiniStat
            icon={<Leaf size={14} />}
            label={language === 'ar' ? 'المنتجات' : 'Products'}
            value={`${new Set(farm.supplies.map((s) => s.product)).size}`}
          />
          <MiniStat
            icon={<Gauge size={14} />}
            label={t('confidence_Confirmed')}
            value={`${farm.supplies.filter((s) => s.confidence === 'Confirmed').length}`}
          />
          <MiniStat
            icon={<Gauge size={14} />}
            label={t('confidence_Probable')}
            value={`${farm.supplies.filter((s) => s.confidence === 'Probable').length}`}
          />
        </div>

        <div className="mt-4">
          <div className="text-xs font-bold uppercase tracking-wide text-charcoal-500 dark:text-charcoal-300 mb-2">
            {t('farmer_profile_window')}
          </div>
          <div className="flex flex-wrap gap-2">
            {farm.supplies.map((s, i) => (
              <Badge key={i} tone={s.confidence === 'Confirmed' ? 'emerald' : 'amber'}>
                {language === 'ar' ? s.productAr : s.product} · {s.qty}
                {t(`unit_${s.unit}` as any)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function MiniStat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-charcoal-50 dark:bg-charcoal-900/40 p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-charcoal-500 dark:text-charcoal-300">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-charcoal-900 dark:text-white">{value}</div>
      {hint ? <div className="text-xs text-charcoal-400">{hint}</div> : null}
    </div>
  );
}
