import { Award, Building2, Calendar, Sparkles, Trophy } from 'lucide-react';
import { Badge, Card, CardHeader, PageHeader } from '../components/ui';
import { RECOGNITION } from '../data/analytics';
import { formatDate } from '../lib/metrics';
import { SCENE } from '../data/media';
import { ImagePanel } from '../components/ui/Photo';

const TONE: Record<string, { bg: string; icon: typeof Trophy }> = {
  '2nd Place': { bg: '#c99c57', icon: Trophy },
  'Invited Session': { bg: '#2f6f8a', icon: Building2 },
  Milestone: { bg: '#2a714c', icon: Sparkles },
};

export function Recognition() {
  const sorted = [...RECOGNITION].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Recognition"
        subtitle="Where SooqRoot has been validated, and the milestones behind the product you are looking at."
        actions={
          <Badge tone="sand" icon={<Award size={12} />}>
            {RECOGNITION.length} entries
          </Badge>
        }
      />

      {/* ---------------- Headline award ---------------- */}
      <Card padded={false} className="overflow-hidden">
        <ImagePanel
          src={SCENE.agriNetwork(1600)}
          alt="UAE farm network"
          overlay="left"
          className="p-7 text-white md:p-10"
        >
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13]"
            viewBox="0 0 400 200"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden
          >
            <defs>
              <pattern id="rec-rows" width="18" height="18" patternTransform="rotate(26)" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="0" y2="18" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="400" height="200" fill="url(#rec-rows)" />
          </svg>

          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-2xs font-semibold backdrop-blur">
                <Trophy size={12} /> 2nd Place
              </div>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
                Universities Hackathon: Farm to Market
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                Recognised for turning fragmented smallholder supply into pre-harvest commitments that
                commercial buyers can actually contract against, not another marketplace listing
                produce after it has already been picked.
              </p>
            </div>

            <div className="shrink-0 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <div className="text-2xs uppercase tracking-widest text-white/60">Next</div>
              <div className="mt-1.5 font-display text-lg font-bold">SEE Institute</div>
              <div className="text-sm text-white/80">The Sustainable City, Dubai</div>
              <div className="mt-3 border-t border-white/15 pt-3 text-2xs text-white/70">
                Working session on local food procurement infrastructure and measurable sustainability
                reporting for institutional buyers.
              </div>
            </div>
          </div>
        </ImagePanel>
      </Card>

      {/* ---------------- Timeline ---------------- */}
      <Card>
        <CardHeader title="Timeline" subtitle="Awards, engagements and network milestones" icon={<Calendar size={16} />} />
        <ol className="mt-5 relative space-y-5 border-s border-charcoal-100 ps-6 dark:border-charcoal-800">
          {sorted.map((r) => {
            const tone = TONE[r.award] ?? TONE.Milestone;
            const Icon = tone.icon;
            return (
              <li key={r.id} className="relative">
                <span
                  className="absolute -start-[33px] inline-flex h-6 w-6 items-center justify-center rounded-full text-white"
                  style={{ background: tone.bg }}
                >
                  <Icon size={12} />
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xs font-bold uppercase tracking-wider" style={{ color: tone.bg }}>
                    {r.award}
                  </span>
                  <span className="text-2xs text-charcoal-400">{formatDate(r.date, 'long')}</span>
                </div>
                <h3 className="sr-h3 mt-1">{r.title}</h3>
                <div className="mt-0.5 text-2xs font-semibold text-charcoal-500 dark:text-charcoal-400">
                  {r.org}
                </div>
                <p className="sr-sub mt-1.5 max-w-2xl text-xs">{r.detail}</p>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* ---------------- What it validated ---------------- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Validated
          title="The problem is real"
          body="UAE commercial buyers want local sourcing but cannot contract against supply that only exists after harvest. Farms cannot plant against demand they cannot see."
        />
        <Validated
          title="The mechanism works"
          body="Pre-harvest commitment with concentration limits and backup cover turns twelve small producers into one reliable supplier."
        />
        <Validated
          title="The proof matters"
          body="Institutional buyers with local sourcing commitments need auditable evidence per batch, not annual estimates."
        />
      </div>
    </div>
  );
}

function Validated({ title, body }: { title: string; body: string }) {
  return (
    <Card>
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900 dark:text-brand-200">
        <Sparkles size={16} />
      </div>
      <h3 className="sr-h3 mt-3">{title}</h3>
      <p className="sr-sub mt-1.5 text-xs">{body}</p>
    </Card>
  );
}
