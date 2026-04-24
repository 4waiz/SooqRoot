import React from 'react';
import { ArrowRight, Sparkles, Network, CalendarClock, Leaf, ShieldCheck, TrendingUp, Globe2, ShoppingBasket, ClipboardList, Sprout, Truck } from 'lucide-react';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';
import { Card, CardTitle } from '../ui/Card';
import { FallbackImage } from '../ui/FallbackImage';

export function Landing() {
  const { t, isRtl } = useTranslation();
  const { setRole, setPage } = useApp();

  const go = (r: 'buyer' | 'farmer' | 'operator') => {
    setRole(r);
  };

  return (
    <div className="space-y-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white shadow-soft">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <FallbackImage
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1800&q=80"
            alt=""
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        <div className="relative px-6 md:px-12 py-14 md:py-20 max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold">
            <Sparkles size={14} />
            {t('landing_heroEyebrow')}
          </div>
          <h1 className="mt-5 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            {t('appTagline')}
          </h1>
          <p className="mt-3 text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
            {t('landing_heroSubtitle')}
          </p>
          <p className="mt-3 text-base text-white/80 max-w-2xl leading-relaxed">
            {t('appDescription')}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => go('buyer')}
              className="sr-btn bg-white text-brand-700 hover:bg-sand-50 shadow-soft"
            >
              {t('landing_cta_buyer')}
              <ArrowRight size={16} className={isRtl ? 'flip-on-rtl' : ''} />
            </button>
            <button
              onClick={() => go('farmer')}
              className="sr-btn bg-brand-700 text-white hover:bg-brand-800 border border-white/20"
            >
              {t('landing_cta_farmer')}
              <ArrowRight size={16} className={isRtl ? 'flip-on-rtl' : ''} />
            </button>
            <button
              onClick={() => go('operator')}
              className="sr-btn bg-charcoal-900/50 text-white hover:bg-charcoal-900/70 border border-white/20 backdrop-blur"
            >
              {t('landing_cta_operator')}
              <ArrowRight size={16} className={isRtl ? 'flip-on-rtl' : ''} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section>
        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard
            icon={<ShoppingBasket size={22} />}
            title={t('landing_feature1_title')}
            desc={t('landing_feature1_desc')}
            accent="brand"
          />
          <FeatureCard
            icon={<Network size={22} />}
            title={t('landing_feature2_title')}
            desc={t('landing_feature2_desc')}
            accent="sand"
          />
          <FeatureCard
            icon={<ShieldCheck size={22} />}
            title={t('landing_feature3_title')}
            desc={t('landing_feature3_desc')}
            accent="emerald"
          />
        </div>
      </section>

      {/* Horizontal flow: How SooqRoot Works */}
      <section>
        <Card className="bg-brand-50/40 dark:bg-brand-900/10 border-brand-100/50 dark:border-brand-800/50 p-8">
          <div className="mb-10 text-center">
             <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-900/40 text-[10px] font-bold uppercase tracking-widest text-brand-700 dark:text-brand-300">
               {t('landing_flow_title')}
             </span>
          </div>
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-10 sm:gap-4">
            {/* Desktop Connector Line */}
            <div className={`absolute top-8 ${isRtl ? 'right-[10%] left-[10%]' : 'left-[10%] right-[10%]'} h-[2px] bg-gradient-to-r from-brand-100 via-brand-200 to-brand-100 dark:from-brand-900/20 dark:via-brand-800/40 dark:to-brand-900/20 hidden sm:block`} />
            
            {[
              { step: t('landing_flow_step1'), desc: t('landing_flow_step1_desc'), icon: <ClipboardList size={26} /> },
              { step: t('landing_flow_step2'), desc: t('landing_flow_step2_desc'), icon: <Network size={26} /> },
              { step: t('landing_flow_step3'), desc: t('landing_flow_step3_desc'), icon: <Sprout size={26} /> },
              { step: t('landing_flow_step4'), desc: t('landing_flow_step4_desc'), icon: <Truck size={26} /> },
            ].map((item, i, arr) => (
              <React.Fragment key={i}>
                <div className="relative flex flex-col items-center text-center gap-4 min-w-0 flex-1 group">
                  <div className="w-16 h-16 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-white dark:border-charcoal-800 shadow-soft text-brand-600 dark:text-brand-400 flex items-center justify-center z-10 transition-transform group-hover:scale-105">
                    {item.icon}
                  </div>
                  <div className="space-y-1.5 z-10 px-2">
                    <h3 className="text-base font-extrabold text-charcoal-900 dark:text-white leading-tight">
                      {item.step}
                    </h3>
                    <p className="text-[11px] font-medium text-charcoal-500 dark:text-charcoal-400 leading-relaxed max-w-[140px] mx-auto">
                      {item.desc}
                    </p>
                  </div>
                </div>
                {/* Arrow (Mobile only) */}
                {i < arr.length - 1 && (
                  <div className="sm:hidden flex items-center justify-center -my-4 z-0">
                     <ArrowRight size={20} className={`text-brand-200 dark:text-brand-800 ${isRtl ? 'rotate-[-90deg]' : 'rotate-90'}`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </Card>
      </section>

      {/* What Changes With SooqRoot */}
      <section>
        <Card className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <CardTitle>{t('landing_why_title')}</CardTitle>
              <p className="mt-2 text-sm md:text-base font-bold text-brand-600 dark:text-brand-400">
                {t('landing_why_anchor')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-charcoal-500 dark:text-charcoal-400">
              <span className="inline-flex items-center gap-1">
                <Globe2 size={14} /> UAE · الإمارات
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="font-medium text-charcoal-700 dark:text-charcoal-200">{t('appTaglineAlt')}</span>
            </div>
          </div>

          <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <CalendarClock size={18} />, text: t('landing_why_item1') },
              { icon: <Sprout size={18} />, text: t('landing_why_item2') },
              { icon: <Network size={18} />, text: t('landing_why_item3') },
              { icon: <ShieldCheck size={18} />, text: t('landing_why_item4') },
            ].map((item, i) => (
              <li
                key={i}
                className="flex flex-col gap-3 rounded-2xl border border-charcoal-100 dark:border-charcoal-800 bg-white/50 dark:bg-charcoal-900/50 p-5 transition-all hover:shadow-md hover:border-brand-200 dark:hover:border-brand-900/40"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-600 text-white shadow-soft">
                  {item.icon}
                </div>
                <span className="text-sm font-bold text-charcoal-900 dark:text-white leading-snug">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent: 'brand' | 'sand' | 'emerald';
}) {
  const accentCls =
    accent === 'brand'
      ? 'bg-brand-600 text-white'
      : accent === 'sand'
      ? 'bg-sand-400 text-charcoal-800'
      : 'bg-emerald-600 text-white';
  return (
    <Card hover>
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl ${accentCls}`}>
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-charcoal-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-300 leading-relaxed">{desc}</p>
    </Card>
  );
}
