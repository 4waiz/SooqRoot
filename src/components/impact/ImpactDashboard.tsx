import React, { useRef, useState, useEffect } from 'react';
import {
  Users,
  Building2,
  PackageCheck,
  TrendingUp,
  Leaf,
  ShieldAlert,
  Gauge,
  BadgeDollarSign,
  Target,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardTitle } from '../ui/Card';
import { StatCard } from '../ui/StatCard';
import { useTranslation } from '../../i18n/useTranslation';
import { IMPACT_STATS } from '../../data/seed';

const MATCH_TREND = [
  { week: 'W1', matched: 620, shortfall: 120 },
  { week: 'W2', matched: 790, shortfall: 90 },
  { week: 'W3', matched: 880, shortfall: 60 },
  { week: 'W4', matched: 960, shortfall: 40 },
  { week: 'W5', matched: 1000, shortfall: 30 },
];

const CATEGORY_MIX = [
  { name: 'Vegetables', value: 2900 },
  { name: 'Leafy Greens', value: 700 },
  { name: 'Fish', value: 420 },
  { name: 'Honey', value: 230 },
];
const PIE_COLORS = ['#3c8c61', '#8dc6a4', '#5b8eb3', '#c99c57'];

const FARM_MIX = [
  { name: 'Al Akhdar', matched: 820 },
  { name: 'Desert Leaf', matched: 540 },
  { name: 'Oasis Fresh', matched: 710 },
  { name: 'Agri Oceanic', matched: 420 },
  { name: 'Al Waha', matched: 230 },
];

export function ImpactDashboard() {
  const { t, language } = useTranslation();
  const s = IMPACT_STATS;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, clientWidth } = scrollRef.current;
    // On mobile, each card is roughly 85% width.
    const cardWidth = scrollRef.current.children[0]?.clientWidth || clientWidth;
    const index = Math.round(scrollLeft / cardWidth);
    if (index !== activeIndex) setActiveIndex(index);
  };

  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      scrollEl.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollEl.removeEventListener('scroll', handleScroll);
    }
  }, [activeIndex]);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300 flex items-center gap-1.5">
          <BarChart3 size={14} />
          {t('nav_impact')}
        </div>
        <h2 className="section-title">{t('impact_title')}</h2>
        <p className="section-subtitle">{t('impact_subtitle')}</p>
      </div>

      {/* Metric Cards Carousel / Grid */}
      <div className="relative group/carousel">
        <div 
          ref={scrollRef}
          className="flex lg:grid lg:grid-cols-5 gap-4 overflow-x-auto lg:overflow-x-visible snap-x snap-mandatory no-scrollbar pb-6 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0"
        >
          {/* Operational Scale */}
          <div className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center lg:snap-align-none">
            <StatCard label={t('impact_farms')} value={s.farmsOnboarded} icon={<Users size={18} />} tone="brand" />
          </div>
          <div className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center lg:snap-align-none">
            <StatCard label={t('impact_buyers')} value={s.buyers} icon={<Building2 size={18} />} tone="sky" />
          </div>
          <div className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center lg:snap-align-none">
            <StatCard label={t('impact_matched')} value={`${s.produceMatchedKg.toLocaleString()}kg`} icon={<PackageCheck size={18} />} tone="emerald" />
          </div>

          {/* Waste Reduction */}
          <div className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center lg:snap-align-none">
            <StatCard label={t('impact_waste')} value={`${s.wasteRiskReducedKg}kg`} icon={<Gauge size={18} />} tone="sand" />
          </div>
          <div className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center lg:snap-align-none">
            <StatCard label={t('impact_prevented')} value={s.shortfallsPrevented} icon={<ShieldAlert size={18} />} tone="amber" />
          </div>

          {/* Buyer Value */}
          <div className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center lg:snap-align-none">
            <StatCard label={t('impact_fillRate')} value={`${Math.round(s.fillRate * 100)}%`} icon={<TrendingUp size={18} />} tone="brand" />
          </div>
          <div className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center lg:snap-align-none">
            <StatCard label={t('impact_local')} value={`${Math.round(s.localSourcing * 100)}%`} icon={<Leaf size={18} />} tone="emerald" />
          </div>
          <div className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center lg:snap-align-none">
            <StatCard label={t('impact_confidence')} value={`${Math.round(s.avgFulfillmentConfidence * 100)}%`} icon={<Target size={18} />} tone="brand" />
          </div>

          {/* Revenue */}
          <div className="min-w-[85%] sm:min-w-[45%] lg:min-w-0 snap-center lg:snap-align-none">
            <StatCard label={t('impact_value')} value={s.orderValueAED.toLocaleString()} icon={<BadgeDollarSign size={18} />} tone="brand" />
          </div>
        </div>

        {/* Pagination Dots (Mobile/Tablet only) */}
        <div className="flex lg:hidden justify-center gap-1.5 mt-2 mb-4">
          {[...Array(9)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-brand-600 w-4' : 'bg-charcoal-200 dark:bg-charcoal-700'}`}
            />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <CardTitle>
            {language === 'ar' ? 'نمو المُطابقات عبر الأسابيع' : 'Weekly matching growth'}
          </CardTitle>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MATCH_TREND}>
                <defs>
                  <linearGradient id="matched" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3c8c61" stopOpacity={0.7} />
                    <stop offset="100%" stopColor="#3c8c61" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e5e6" />
                <XAxis dataKey="week" stroke="#70757a" />
                <YAxis stroke="#70757a" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="matched"
                  stroke="#2a714c"
                  fill="url(#matched)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="shortfall"
                  stroke="#c99c57"
                  fill="#c99c57"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle>
            {language === 'ar' ? 'توزيع المنتجات المطابقة' : 'Matched produce mix'}
          </CardTitle>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={CATEGORY_MIX}
                  dataKey="value"
                  innerRadius={52}
                  outerRadius={88}
                  paddingAngle={3}
                >
                  {CATEGORY_MIX.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {CATEGORY_MIX.map((c, i) => (
              <div key={c.name} className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: PIE_COLORS[i] }}
                />
                {c.name} — {c.value}kg
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>
            {language === 'ar' ? 'مساهمة المزارع في التنفيذ' : 'Farm contribution to fulfillment'}
          </CardTitle>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FARM_MIX}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e5e6" />
                <XAxis dataKey="name" stroke="#70757a" />
                <YAxis stroke="#70757a" />
                <Tooltip />
                <Legend />
                <Bar dataKey="matched" fill="#3c8c61" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
