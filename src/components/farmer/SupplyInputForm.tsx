import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { Input, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTranslation } from '../../i18n/useTranslation';
import { useApp } from '../../context/useApp';
import { Confidence, FarmSupply, Grade, ProductCategory } from '../../types';

interface Props {
  farmId: string;
}

const PRODUCT_OPTIONS: {
  product: string;
  productAr: string;
  category: ProductCategory;
  unit: 'kg' | 'boxes' | 'jars';
  packaging: string;
  packagingAr: string;
}[] = [
  { product: 'Tomatoes', productAr: 'طماطم', category: 'vegetable', unit: 'kg', packaging: '5kg boxes', packagingAr: 'صناديق 5 كجم' },
  { product: 'Cucumbers', productAr: 'خيار', category: 'vegetable', unit: 'kg', packaging: '5kg boxes', packagingAr: 'صناديق 5 كجم' },
  { product: 'Carrots', productAr: 'جزر', category: 'vegetable', unit: 'kg', packaging: '5kg boxes', packagingAr: 'صناديق 5 كجم' },
  { product: 'Apples', productAr: 'تفاح', category: 'fruit', unit: 'kg', packaging: '5kg boxes', packagingAr: 'صناديق 5 كجم' },
  { product: 'Bananas', productAr: 'موز', category: 'fruit', unit: 'kg', packaging: '5kg boxes', packagingAr: 'صناديق 5 كجم' },
  { product: 'Lettuce', productAr: 'خس', category: 'leafygreen', unit: 'boxes', packaging: 'standard crates', packagingAr: 'صناديق قياسية' },
  { product: 'Spinach', productAr: 'سبانخ', category: 'leafygreen', unit: 'boxes', packaging: 'standard crates', packagingAr: 'صناديق قياسية' },
  { product: 'Herbs', productAr: 'أعشاب طازجة', category: 'leafygreen', unit: 'boxes', packaging: 'small crates', packagingAr: 'صناديق صغيرة' },
  { product: 'Sea bass', productAr: 'قاروص', category: 'fish', unit: 'kg', packaging: 'iced cooler boxes', packagingAr: 'صناديق مبردة بالثلج' },
  { product: 'Tilapia', productAr: 'بلطي', category: 'fish', unit: 'kg', packaging: 'iced cooler boxes', packagingAr: 'صناديق مبردة بالثلج' },
  { product: 'Sidr Honey', productAr: 'عسل السدر', category: 'honey', unit: 'jars', packaging: '500g labelled jars', packagingAr: 'برطمانات 500 جم مع ملصقات' },
  { product: 'Local Honey', productAr: 'عسل محلي', category: 'honey', unit: 'jars', packaging: '500g labelled jars', packagingAr: 'برطمانات 500 جم مع ملصقات' },
];

export function SupplyInputForm({ farmId }: Props) {
  const { t, language } = useTranslation();
  const { addFarmSupply } = useApp();
  const [productIdx, setProductIdx] = useState('0');
  const [customProduct, setCustomProduct] = useState('');
  const [customUnit, setCustomUnit] = useState<'kg' | 'boxes' | 'jars'>('kg');
  const [customPackaging, setCustomPackaging] = useState('5kg boxes');
  const [qty, setQty] = useState('100');
  const [grade, setGrade] = useState<Grade>('A');
  const [confidence, setConfidence] = useState<Confidence>('Confirmed');
  const [harvest, setHarvest] = useState('Mon evening');
  const [notes, setNotes] = useState('');
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const handleSubmit = () => {
    const isCustom = productIdx === 'custom';
    const picked = isCustom ? null : PRODUCT_OPTIONS[Number(productIdx)];
    const productName = isCustom ? titleCaseProduct(customProduct) : picked?.product || '';
    const qtyNum = Math.max(0, parseFloat(qty) || 0);
    if (!productName) return;
    if (!qtyNum) return;
    const supply: FarmSupply = {
      product: productName,
      productAr: isCustom ? productName : picked?.productAr || productName,
      category: isCustom ? 'other' : picked?.category || 'other',
      qty: qtyNum,
      unit: isCustom ? customUnit : picked?.unit || 'kg',
      grade,
      confidence,
      packaging: isCustom ? customPackaging : picked?.packaging || '5kg boxes',
      packagingAr: isCustom ? customPackaging : picked?.packagingAr || 'صناديق 5 كجم',
      harvestDate: harvest,
    };
    addFarmSupply(farmId, supply);
    setJustAdded(`${productName} · ${qtyNum}`);
    setTimeout(() => setJustAdded(null), 2400);
    setQty('100');
    setNotes('');
  };

  const selectedOption = productIdx === 'custom' ? null : PRODUCT_OPTIONS[Number(productIdx)];

  return (
    <Card>
      <CardTitle>{t('farmer_supply_title')}</CardTitle>
      <div className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        <Select
          label={t('farmer_supply_product')}
          value={productIdx}
          onChange={(e) => setProductIdx(e.target.value)}
        >
          {PRODUCT_OPTIONS.map((p, i) => (
            <option key={p.product} value={i}>
              {language === 'ar' ? p.productAr : p.product}
            </option>
          ))}
          <option value="custom">{language === 'ar' ? 'منتج آخر' : 'Custom product'}</option>
        </Select>
        {productIdx === 'custom' ? (
          <Input
            label={language === 'ar' ? 'اسم المنتج' : 'Product name'}
            value={customProduct}
            onChange={(e) => setCustomProduct(e.target.value)}
            placeholder={language === 'ar' ? 'مثال: مانجو' : 'Example: Mangoes'}
          />
        ) : null}
        <Input
          label={t('farmer_supply_qty')}
          type="number"
          min={0.01}
          step="0.01"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        {productIdx === 'custom' ? (
          <Select
            label={language === 'ar' ? 'الوحدة' : 'Unit'}
            value={customUnit}
            onChange={(e) => setCustomUnit(e.target.value as 'kg' | 'boxes' | 'jars')}
          >
            <option value="kg">{t('unit_kg' as any)}</option>
            <option value="boxes">{t('unit_boxes' as any)}</option>
            <option value="jars">{t('unit_jars' as any)}</option>
          </Select>
        ) : null}
        <Input
          label={t('farmer_supply_harvest')}
          value={harvest}
          onChange={(e) => setHarvest(e.target.value)}
        />
        <Select
          label={t('farmer_supply_grade')}
          value={grade}
          onChange={(e) => setGrade(e.target.value as Grade)}
        >
          <option value="A">{t('grade_A')}</option>
          <option value="B">{t('grade_B')}</option>
        </Select>
        <Select
          label={t('farmer_supply_confidence')}
          value={confidence}
          onChange={(e) => setConfidence(e.target.value as Confidence)}
        >
          <option value="Confirmed">{t('confidence_Confirmed')}</option>
          <option value="Probable">{t('confidence_Probable')}</option>
          <option value="Stretch">{t('confidence_Stretch')}</option>
        </Select>
        <Input
          label={t('farmer_supply_packaging')}
          value={
            productIdx === 'custom'
              ? customPackaging
              : language === 'ar'
                ? selectedOption?.packagingAr
                : selectedOption?.packaging
          }
          onChange={(e) => setCustomPackaging(e.target.value)}
          disabled={productIdx !== 'custom'}
        />
        <div className="md:col-span-2 lg:col-span-3">
          <Input
            label={t('farmer_supply_notes')}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <Button onClick={handleSubmit} icon={<Plus size={16} />}>
          {t('farmer_supply_submit')}
        </Button>
        {justAdded ? <Badge tone="emerald">{t('farmer_supply_added')} · {justAdded}</Badge> : null}
      </div>
    </Card>
  );
}

function titleCaseProduct(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

