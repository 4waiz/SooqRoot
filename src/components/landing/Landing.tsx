import { ArrowRight, Sparkles, Network, CalendarClock, Leaf, ShieldCheck, TrendingUp, Globe2 } from 'lucide-react';
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
            icon={<Sparkles size={22} />}
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
            icon={<CalendarClock size={22} />}
            title={t('landing_feature3_title')}
            desc={t('landing_feature3_desc')}
            accent="emerald"
          />
        </div>
      </section>

      {/* Explainer + Imagery showcase */}
      <section className="grid md:grid-cols-5 gap-5 items-stretch">
        <Card className="md:col-span-3">
          <CardTitle>{t('landing_why_title')}</CardTitle>
          <ul className="mt-4 grid sm:grid-cols-2 gap-3">
            {[
              { icon: <CalendarClock size={16} />, text: t('landing_why_item1') },
              { icon: <Leaf size={16} />, text: t('landing_why_item2') },
              { icon: <TrendingUp size={16} />, text: t('landing_why_item3') },
              { icon: <ShieldCheck size={16} />, text: t('landing_why_item4') },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 p-3"
              >
                <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-600 text-white">
                  {item.icon}
                </span>
                <span className="text-sm font-medium text-charcoal-800 dark:text-charcoal-100 leading-relaxed">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
            {t('appExplainer')}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-charcoal-500 dark:text-charcoal-400">
            <span className="inline-flex items-center gap-1">
              <Globe2 size={14} /> UAE · الإمارات
            </span>
            <span>·</span>
            <span>{t('appTaglineAlt')}</span>
          </div>
        </Card>

        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <ShowcaseTile
            src="https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=600&q=80"
            label="Vegetables"
          />
          <ShowcaseTile
            src="https://images.unsplash.com/photo-1498654200943-1088dd4438ae?auto=format&fit=crop&w=600&q=80"
            label="Fish"
          />
          <ShowcaseTile
            src="https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?auto=format&fit=crop&w=600&q=80"
            label="Honey"
          />
          <ShowcaseTile
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80"
            label="Hotels"
          />
        </div>
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

function ShowcaseTile({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl shadow-soft aspect-square group">
      <FallbackImage
        src={src}
        alt={label}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-2 start-2 text-white text-xs font-semibold tracking-wide">
        {label}
      </div>
    </div>
  );
}
