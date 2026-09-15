import { Product } from '../types';

/**
 * Demo product catalogue.
 * refPrice is an indicative AED/unit figure used to value demo commitments.
 */
export const PRODUCTS: Product[] = [
  {
    id: 'p-tomato',
    name: 'Tomatoes',
    nameAr: 'طماطم',
    category: 'vegetable',
    unit: 'kg',
    refPrice: 6.4,
    leadDays: 21,
    shelfLifeDays: 10,
    emoji: '🍅',
    color: '#c4452f',
  },
  {
    id: 'p-cucumber',
    name: 'Cucumbers',
    nameAr: 'خيار',
    category: 'vegetable',
    unit: 'kg',
    refPrice: 5.2,
    leadDays: 18,
    shelfLifeDays: 8,
    emoji: '🥒',
    color: '#3c8c61',
  },
  {
    id: 'p-leafy',
    name: 'Leafy Greens',
    nameAr: 'خضار ورقية',
    category: 'leafygreen',
    unit: 'kg',
    refPrice: 11.5,
    leadDays: 14,
    shelfLifeDays: 5,
    emoji: '🥬',
    color: '#5ca87e',
  },
  {
    id: 'p-capsicum',
    name: 'Capsicum',
    nameAr: 'فلفل رومي',
    category: 'vegetable',
    unit: 'kg',
    refPrice: 8.9,
    leadDays: 24,
    shelfLifeDays: 12,
    emoji: '🫑',
    color: '#b07f3e',
  },
  {
    id: 'p-eggplant',
    name: 'Eggplant',
    nameAr: 'باذنجان',
    category: 'vegetable',
    unit: 'kg',
    refPrice: 5.8,
    leadDays: 20,
    shelfLifeDays: 10,
    emoji: '🍆',
    color: '#6b4f8a',
  },
  {
    id: 'p-herbs',
    name: 'Fresh Herbs',
    nameAr: 'أعشاب طازجة',
    category: 'herb',
    unit: 'kg',
    refPrice: 18.0,
    leadDays: 12,
    shelfLifeDays: 5,
    emoji: '🌿',
    color: '#2a714c',
  },
  {
    id: 'p-dates',
    name: 'Dates',
    nameAr: 'تمور',
    category: 'date',
    unit: 'kg',
    refPrice: 26.0,
    leadDays: 30,
    shelfLifeDays: 180,
    emoji: '🌴',
    color: '#8d6430',
  },
  {
    id: 'p-honey',
    name: 'Sidr Honey',
    nameAr: 'عسل السدر',
    category: 'honey',
    unit: 'jars',
    refPrice: 145.0,
    leadDays: 35,
    shelfLifeDays: 365,
    emoji: '🍯',
    color: '#c99c57',
  },
  {
    id: 'p-seabass',
    name: 'Sea Bass',
    nameAr: 'قاروص',
    category: 'fish',
    unit: 'kg',
    refPrice: 38.0,
    leadDays: 7,
    shelfLifeDays: 3,
    emoji: '🐟',
    color: '#2f6f8a',
  },
];

export const PRODUCT_MAP: Record<string, Product> = Object.fromEntries(
  PRODUCTS.map((p) => [p.id, p])
);

export function getProduct(id: string): Product {
  return (
    PRODUCT_MAP[id] ?? {
      id,
      name: 'Unknown product',
      nameAr: '—',
      category: 'vegetable',
      unit: 'kg',
      refPrice: 0,
      leadDays: 0,
      shelfLifeDays: 7,
      emoji: '📦',
      color: '#848a8e',
    }
  );
}
