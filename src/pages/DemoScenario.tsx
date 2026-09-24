import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ClipboardList,
  Cpu,
  Gauge,
  Info,
  Leaf,
  MessageSquare,
  PlayCircle,
  ShieldCheck,
  Sprout,
  TriangleAlert,
} from 'lucide-react';
import { useStore } from '../state/AppStore';
import { Badge, Card, CardHeader, PageHeader } from '../components/ui';
import { formatAed } from '../lib/metrics';
import { SCENE } from '../data/media';
import { ImagePanel, Photo } from '../components/ui/Photo';

const STORY = [
  {
    step: '01',
    to: '/dashboard',
    icon: Gauge,
    title: 'Control Tower',
    line: 'Open on the network position: local procurement share, open commitments, match rate, and the two orders that need intervention today.',
    say: '“This is what a procurement lead sees at 8am, one screen, the whole local supply position.”',
  },
  {
    step: '02',
    to: '/demand',
    icon: ClipboardList,
    title: 'Buyer Demand + AI Translator',
    line: 'Paste the buyer’s actual sentence. Watch it become a structured, commitable demand record at 96% confidence.',
    say: '“Buyers don’t write purchase orders. They write sentences. SooqRoot reads the sentence.”',
  },
  {
    step: '03',
    to: '/engine',
    icon: Cpu,
    title: 'Commitment Engine',
    line: 'Run the 10,000 kg tomato order. It splits across five farms at 9,200 kg with 800 kg of backup cover. 100% coverage before anything is harvested.',
    say: '“No single farm carries more than 23% of an order. That is the difference between a marketplace and infrastructure.”',
  },
  {
    step: '04',
    to: '/network',
    icon: Sprout,
    title: 'Supply Digital Twin',
    line: 'Show the network canvas. Where the farms are, what they can actually deliver, and which buyer demand they already carry.',
    say: '“Twelve farms across Al Ain, Al Khazna, Sweihan, Remah and Liwa, publishing forward capacity.”',
  },
  {
    step: '05',
    to: '/exceptions',
    icon: TriangleAlert,
    title: 'Exceptions',
    line: 'The leafy greens shortfall. Show the recommended action and re-run the engine from inside the exception.',
    say: '“The system doesn’t just flag problems. It proposes the fix and lets you execute it.”',
  },
  {
    step: '06',
    to: '/copilot',
    icon: MessageSquare,
    title: 'Farmer Copilot',
    line: 'Show the Arabic commitment message going to Al Ain Farm 018 over WhatsApp, and the farm replying YES.',
    say: '“The farmer never logs into a dashboard. They get a WhatsApp in Arabic and reply with one word.”',
  },
  {
    step: '07',
    to: '/passports',
    icon: ShieldCheck,
    title: 'Batch Passports',
    line: 'Open a passport: farm, harvest date, chain of custody, food miles, CO₂e avoided, verification hash.',
    say: '“This is what the buyer’s sustainability report needs, and it is generated as a by-product of fulfilment.”',
  },
  {
    step: '08',
    to: '/index',
    icon: Leaf,
    title: 'Local Procurement Index',
    line: 'Close on the number that matters to an institutional buyer: 21.7% against a 25% commitment, with the current month running at 26.4%.',
    say: '“Every buyer signing a local sourcing commitment needs this number to be measured, not estimated.”',
  },
];

export function DemoScenario() {
  const { metrics, farms, orders, resetDemoData } = useStore();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Demo Scenario"
        subtitle="An eight-step run through the product, in the order that tells the strongest story. Every screen is live. Nothing here is a slide."
        actions={
          <>
            <Badge tone="sand" icon={<Info size={12} />}>
              Illustrative demo data
            </Badge>
            <Link to="/dashboard" className="sr-btn-primary">
              <PlayCircle size={15} /> Start the run
            </Link>
          </>
        }
      />

      {/* ---------------- The narrative ---------------- */}
      <ImagePanel
        src={SCENE.agriNetwork(1600)}
        alt="UAE farms connected to buyers"
        overlay="left"
        className="rounded-2xl text-white shadow-card"
      >
        <div className="p-6 md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-2xs font-semibold backdrop-blur">
            The SooqRoot story
          </div>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">
            One Order. Many Farms. Confirmed Before Harvest.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/80">
            SooqRoot converts commercial buyer demand into pre-harvest commitments across UAE farms,
            intelligently coordinates fulfilment, and gives buyers auditable proof of local sourcing.
          </p>

          <div className="mt-7 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {['Buyer demand', 'SooqRoot', 'Farm network', 'Pre-harvest commitment', 'Fulfilment', 'Proof'].map(
              (s, i) => (
                <div
                  key={s}
                  className="rounded-xl border border-white/15 bg-white/10 p-3 backdrop-blur"
                >
                  <div className="font-mono text-2xs text-white/55">{String(i + 1).padStart(2, '0')}</div>
                  <div className="mt-1 text-xs font-bold">{s}</div>
                </div>
              )
            )}
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-white/20 shadow-lift">
            <Photo
              src={SCENE.dashboardMockup(1600)}
              alt="SooqRoot Control Tower on a laptop"
              className="aspect-[16/9] w-full"
            />
          </div>
        </div>
      </ImagePanel>

      {/* ---------------- Numbers to know ---------------- */}
      <Card>
        <CardHeader title="Numbers to have ready" subtitle="The figures most likely to be asked about" icon={<Gauge size={16} />} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Fact label="Farm network" value={`${farms.length} producers`} note="Al Ain, Al Khazna, Sweihan, Remah, Liwa, Al Wagan" />
          <Fact label="Open commitments" value={formatAed(metrics.openCommitmentsAed, { compact: true })} note="pre-harvest, current cycle" />
          <Fact label="Pre-harvest match rate" value={`${metrics.preHarvestMatchPct}%`} note="of requested volume already committed" />
          <Fact label="Expected fill rate" value={`${metrics.expectedFillPct}%`} note="committed volume delivered in full" />
          <Fact label="Local procurement index" value={`${metrics.lpiCurrent}%`} note={`against a ${metrics.lpiTarget}% target, ${metrics.lpiGap}pp gap`} />
          <Fact label="Current month" value={`${metrics.localProcurementPct}%`} note="running above target" />
          <Fact label="Order book" value={`${orders.length} orders`} note={`${metrics.atRiskOrders} flagged at risk`} />
          <Fact label="Concentration limit" value="23%" note="maximum share of one order per farm" />
        </div>
      </Card>

      {/* ---------------- Run sheet ---------------- */}
      <div className="space-y-3">
        {STORY.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.step} className="group">
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="flex shrink-0 items-center gap-3">
                  <span className="font-display text-2xl font-bold tracking-tight text-charcoal-200 dark:text-charcoal-700">
                    {s.step}
                  </span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900 dark:text-brand-200">
                    <Icon size={18} />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="sr-h3">{s.title}</h3>
                  <p className="sr-sub mt-1 text-xs">{s.line}</p>
                  <blockquote className="mt-3 border-s-2 border-brand-300 ps-3 text-xs italic leading-relaxed text-charcoal-600 dark:border-brand-700 dark:text-charcoal-300">
                    {s.say}
                  </blockquote>
                </div>

                <Link to={s.to} className="sr-btn-secondary shrink-0 text-xs">
                  Open <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ---------------- Reset ---------------- */}
      <Card className="border-sand-200 bg-sand-50 dark:border-sand-600 dark:bg-sand-600/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="sr-h3">Reset before the next run</h3>
            <p className="sr-sub mt-1 text-xs">
              Clears anything created during a demo, new demand records, issued commitments, resolved
              exceptions, and restores the dataset to its opening state.
            </p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data to its opening state?')) resetDemoData();
            }}
            className="sr-btn-secondary shrink-0 text-xs"
          >
            Reset demo data
          </button>
        </div>
      </Card>
    </div>
  );
}

function Fact({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-charcoal-100 p-3.5 dark:border-charcoal-800">
      <div className="text-2xs uppercase tracking-wider text-charcoal-400">{label}</div>
      <div className="sr-num mt-1 text-lg">{value}</div>
      <div className="mt-1 text-2xs leading-relaxed text-charcoal-400">{note}</div>
    </div>
  );
}
