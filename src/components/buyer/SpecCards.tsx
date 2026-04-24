import { Fish, Leaf, Carrot, Droplets } from 'lucide-react';
import { Card, CardTitle, CardSub } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useTranslation } from '../../i18n/useTranslation';

interface Spec {
  product: string;
  productAr: string;
  grade: string;
  sizeColor: string;
  sizeColorAr: string;
  packaging: string;
  packagingAr: string;
  handling: string;
  handlingAr: string;
  substitutes: string[];
  substitutesAr: string[];
  icon: React.ReactNode;
}

const SPECS: Spec[] = [
  {
    product: 'Tomatoes',
    productAr: 'طماطم',
    grade: 'Grade A',
    sizeColor: 'Size M, deep red, firm skin',
    sizeColorAr: 'حجم متوسط، أحمر غامق، قشرة صلبة',
    packaging: '5kg boxes, labelled',
    packagingAr: 'صناديق 5 كجم موسومة',
    handling: 'Keep shaded, avoid bruising, pick 48h before delivery',
    handlingAr: 'احفظها في الظل وتجنب الرضوض والقطف قبل التسليم بـ 48 ساعة',
    substitutes: ['Cherry tomatoes', 'Plum tomatoes'],
    substitutesAr: ['طماطم كرزية', 'طماطم برقوقية'],
    icon: <Carrot size={18} />,
  },
  {
    product: 'Cucumbers',
    productAr: 'خيار',
    grade: 'Grade A',
    sizeColor: 'Length 15-20cm, bright green',
    sizeColorAr: 'طول 15-20 سم، أخضر زاهٍ',
    packaging: '5kg boxes',
    packagingAr: 'صناديق 5 كجم',
    handling: 'Cool storage, humidity 90%',
    handlingAr: 'تخزين بارد برطوبة 90%',
    substitutes: ['Mini cucumbers', 'Persian cucumbers'],
    substitutesAr: ['خيار صغير', 'خيار فارسي'],
    icon: <Leaf size={18} />,
  },
  {
    product: 'Lettuce',
    productAr: 'خس',
    grade: 'Grade A',
    sizeColor: 'Full head, crisp, no wilt',
    sizeColorAr: 'رأس كامل، مقرمش، بدون ذبول',
    packaging: 'Standard crates, ventilated',
    packagingAr: 'صناديق قياسية بفتحات تهوية',
    handling: 'Keep at 4°C, deliver within 24h',
    handlingAr: 'حفظ على 4°م وتسليم خلال 24 ساعة',
    substitutes: ['Mixed salad leaves', 'Spinach', 'Local leafy greens'],
    substitutesAr: ['خلطة أوراق سلطة', 'سبانخ', 'أوراق خضراء محلية'],
    icon: <Leaf size={18} />,
  },
  {
    product: 'Sea bass',
    productAr: 'قاروص',
    grade: 'Grade A',
    sizeColor: 'Whole, fresh, clear eyes, firm flesh',
    sizeColorAr: 'كامل، طازج، عيون صافية، لحم متماسك',
    packaging: 'Iced cooler boxes',
    packagingAr: 'صناديق مبردة بالثلج',
    handling: 'Cold chain 0-4°C, deliver in 12h',
    handlingAr: 'سلسلة تبريد 0-4°م والتسليم خلال 12 ساعة',
    substitutes: ['Tilapia'],
    substitutesAr: ['بلطي'],
    icon: <Fish size={18} />,
  },
  {
    product: 'Local Honey',
    productAr: 'عسل محلي',
    grade: 'Grade A',
    sizeColor: 'Authentic local origin, amber color',
    sizeColorAr: 'منشأ محلي أصيل، لون كهرماني',
    packaging: '500g labelled jars with batch ID',
    packagingAr: 'برطمانات 500 جم موسومة بمعرّف الدفعة',
    handling: 'Sealed, dry storage, include authenticity note',
    handlingAr: 'مختومة، تخزين جاف، مع شهادة أصالة',
    substitutes: ['Sidr Honey'],
    substitutesAr: ['عسل السدر'],
    icon: <Droplets size={18} />,
  },
];

export function SpecCards() {
  const { t, language } = useTranslation();
  return (
    <Card>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <CardTitle>{t('buyer_specCards_title')}</CardTitle>
          <CardSub>{t('buyer_specCards_hint')}</CardSub>
        </div>
      </div>
      <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SPECS.map((s) => (
          <div
            key={s.product}
            className="rounded-2xl border border-charcoal-100 dark:border-charcoal-700 p-4 hover:shadow-soft transition"
          >
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
                {s.icon}
              </div>
              <div>
                <div className="font-semibold text-charcoal-900 dark:text-white">
                  {language === 'ar' ? s.productAr : s.product}
                </div>
                <Badge tone="emerald">{s.grade}</Badge>
              </div>
            </div>
            <dl className="mt-3 space-y-2 text-sm">
              <Row label={t('col_packaging')} value={language === 'ar' ? s.packagingAr : s.packaging} />
              <Row
                label={language === 'ar' ? 'حجم / لون' : 'Size / color'}
                value={language === 'ar' ? s.sizeColorAr : s.sizeColor}
              />
              <Row
                label={t('buyer_handling')}
                value={language === 'ar' ? s.handlingAr : s.handling}
              />
              <div>
                <dt className="text-xs font-semibold uppercase text-charcoal-500 dark:text-charcoal-300">
                  {t('buyer_substitutes')}
                </dt>
                <dd className="mt-1 flex flex-wrap gap-1">
                  {(language === 'ar' ? s.substitutesAr : s.substitutes).map((sub) => (
                    <Badge key={sub} tone="sand">
                      {sub}
                    </Badge>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-charcoal-500 dark:text-charcoal-300">
        {label}
      </dt>
      <dd className="text-charcoal-800 dark:text-charcoal-100">{value}</dd>
    </div>
  );
}
