import {
  AlertTriangle,
  Sparkles,
  Workflow,
  PlayCircle,
  Rocket,
  BadgeDollarSign,
  TrendingUp,
  Trophy,
  Presentation,
  Carrot,
  Fish,
  Droplets,
  MessageCircle,
} from 'lucide-react';
import { Card, CardTitle } from '../ui/Card';
import { useTranslation } from '../../i18n/useTranslation';

export function PitchMode() {
  const { t } = useTranslation();

  const voices = [
    {
      icon: <Carrot size={20} />,
      title: t('validation_veg_title'),
      body: t('validation_veg_body'),
      tone: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200',
    },
    {
      icon: <Fish size={20} />,
      title: t('validation_fish_title'),
      body: t('validation_fish_body'),
      tone: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200',
    },
    {
      icon: <Droplets size={20} />,
      title: t('validation_honey_title'),
      body: t('validation_honey_body'),
      tone: 'bg-sand-100 text-sand-500 dark:bg-sand-500/20 dark:text-sand-200',
    },
  ];

  const sections = [
    { icon: <Sparkles size={18} />, title: t('pitch_solution_title'), body: t('pitch_solution_body'), tone: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200' },
    { icon: <Workflow size={18} />, title: t('pitch_how_title'), body: t('pitch_how_body'), tone: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200' },
    { icon: <PlayCircle size={18} />, title: t('pitch_demo_title'), body: t('pitch_demo_body'), tone: 'bg-sand-100 text-sand-500 dark:bg-sand-500/20 dark:text-sand-200' },
    { icon: <Rocket size={18} />, title: t('pitch_whynow_title'), body: t('pitch_whynow_body'), tone: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200' },
    { icon: <BadgeDollarSign size={18} />, title: t('pitch_model_title'), body: t('pitch_model_body'), tone: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200' },
    { icon: <TrendingUp size={18} />, title: t('pitch_impact_title'), body: t('pitch_impact_body'), tone: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200' },
  ];

  return (
    <div className="space-y-10">
      <div className="rounded-3xl bg-brand-gradient text-white px-6 md:px-12 py-10 md:py-14 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
          <Presentation size={14} />
          {t('pitch_title')}
        </div>
        <h2 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
          {t('appTagline')}
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-white/90">{t('appDescription')}</p>
      </div>

      <section className="space-y-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <AlertTriangle size={14} />
            {t('pitch_problem_title')}
          </div>
          <h3 className="text-2xl font-bold text-charcoal-900 dark:text-white mt-1">
            {t('pitch_problem_body')}
          </h3>
          <p className="text-charcoal-600 dark:text-charcoal-400 mt-2">
            {t('validation_intro')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {voices.map((v) => (
            <Card key={v.title} hover>
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl ${v.tone}`}>
                {v.icon}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-charcoal-900 dark:text-white">
                {v.title}
              </h3>
              <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
                {v.body}
              </p>
            </Card>
          ))}
        </div>

        <Card className="bg-brand-gradient text-white border-transparent">
          <div className="flex items-start gap-3 flex-wrap">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/20 backdrop-blur">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1 min-w-[240px]">
              <div className="text-xs font-bold uppercase tracking-wide text-white/80">
                {t('validation_summary_title')}
              </div>
              <p className="mt-1 text-lg md:text-xl font-semibold leading-relaxed">
                {t('validation_summary')}
              </p>
            </div>
          </div>
        </Card>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Card key={s.title} hover>
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl ${s.tone}`}>
              {s.icon}
            </div>
            <h3 className="mt-3 text-base font-semibold text-charcoal-900 dark:text-white">
              {s.title}
            </h3>
            <p className="mt-2 text-sm text-charcoal-600 dark:text-charcoal-300 leading-relaxed">
              {s.body}
            </p>
          </Card>
        ))}
      </div>

      <Card className="bg-charcoal-900 text-white border-transparent dark:bg-charcoal-900">
        <div className="flex items-start gap-3 flex-wrap">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/15">
            <Trophy size={20} />
          </div>
          <div className="flex-1 min-w-[240px]">
            <div className="text-xs font-bold uppercase tracking-wide text-white/70">
              {t('pitch_final_title')}
            </div>
            <p className="mt-1 text-2xl md:text-3xl font-extrabold leading-tight">
              {t('pitch_final_body')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
