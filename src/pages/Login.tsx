import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Leaf,
  Lock,
  Network,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useStore, DEMO_CREDENTIALS } from '../state/AppStore';
import { Button } from '../components/ui';
import { asset } from '../lib/assets';

const PILLARS = [
  {
    icon: Network,
    title: 'Demand → Commitment',
    body: 'Commercial buyer demand becomes pre-harvest commitments across a network of UAE farms.',
  },
  {
    icon: Leaf,
    title: 'Harvest → Fulfilment',
    body: 'Coordinated harvest windows, consolidated collection and cold-chain tracked delivery.',
  },
  {
    icon: ShieldCheck,
    title: 'Proof',
    body: 'Auditable batch passports and a measured local procurement index for every buyer.',
  },
];

export function Login() {
  const { session, signIn } = useStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/dashboard" replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Brief delay so the loading state is visible — this is a demo sign-in,
    // there is no authentication service behind it.
    window.setTimeout(() => {
      const result = signIn(username, password);
      setLoading(false);
      if (result.ok) navigate('/dashboard', { replace: true });
      else setError(result.error ?? 'Sign-in failed.');
    }, 550);
  };

  const fillDemo = () => {
    setUsername(DEMO_CREDENTIALS.username);
    setPassword(DEMO_CREDENTIALS.password);
    setError(null);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* ---------------- Brand panel ---------------- */}
      <section className="relative hidden overflow-hidden bg-brand-gradient p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <FieldGraphic />

        <div className="relative">
          <img
            src={asset('lightlogo.png')}
            alt="SooqRoot"
            className="h-9 w-auto"
            onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
          />
        </div>

        <div className="relative max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-2xs font-semibold backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-200" />
            The Procurement Operating System for UAE Local Food
          </div>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight xl:text-[2.75rem]">
            One Order.
            <br />
            Many Farms.
            <br />
            <span className="text-brand-200">Confirmed Before Harvest.</span>
          </h1>
          <p className="mt-5 text-[0.95rem] leading-relaxed text-white/80">
            SooqRoot converts commercial buyer demand into pre-harvest commitments across UAE farms,
            intelligently coordinates fulfilment, and gives buyers auditable proof of local sourcing.
          </p>

          <div className="mt-9 space-y-4">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="flex gap-3.5">
                  <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur">
                    <Icon size={17} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{p.title}</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-white/70">{p.body}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2 text-2xs text-white/60">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 size={13} /> 2nd Place — Universities Hackathon: Farm to Market
          </span>
          <span>Al Ain · Abu Dhabi · Dubai</span>
        </div>
      </section>

      {/* ---------------- Form panel ---------------- */}
      <section className="sr-field-texture flex items-center justify-center bg-canvas px-5 py-10 dark:bg-charcoal-950 sm:px-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <img
              src={asset('darklogo.png')}
              alt="SooqRoot"
              className="mx-auto h-9 w-auto dark:hidden"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
            <p className="mt-4 text-center text-xs font-semibold uppercase tracking-widest text-brand-600">
              One Order. Many Farms. Confirmed Before Harvest.
            </p>
          </div>

          <div className="mt-8 lg:mt-0">
            <h2 className="sr-h1">Sign in</h2>
            <p className="sr-sub mt-1.5">
              Access the SooqRoot procurement control tower.
            </p>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="sr-label">
                Username
              </label>
              <div className="relative">
                <User
                  size={15}
                  className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-charcoal-400"
                />
                <input
                  id="username"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError(null);
                  }}
                  placeholder="Awaiz"
                  className={`sr-input ps-10 ${error ? 'border-rose-300 focus:ring-rose-300' : 'focus:ring-brand-300'}`}
                  aria-invalid={Boolean(error)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-label">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-charcoal-400"
                />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  placeholder="••••"
                  className={`sr-input px-10 ${error ? 'border-rose-300 focus:ring-rose-300' : 'focus:ring-brand-300'}`}
                  aria-invalid={Boolean(error)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-charcoal-400 transition hover:bg-charcoal-100 hover:text-charcoal-700 dark:hover:bg-charcoal-800"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-900/40 dark:text-rose-200"
              >
                <Info size={14} className="mt-0.5 shrink-0" />
                {error}
              </div>
            ) : null}

            <Button type="submit" size="lg" loading={loading} className="w-full" trailing={<ArrowRight size={16} />}>
              {loading ? 'Signing in' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-sand-200 bg-sand-50 p-4 dark:border-sand-600 dark:bg-sand-600/15">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-2xs font-bold uppercase tracking-widest text-sand-600 dark:text-sand-200">
                  Demo access
                </div>
                <p className="mt-1 text-xs text-charcoal-600 dark:text-charcoal-300">
                  Username <span className="font-mono font-semibold">Awaiz</span> · Password{' '}
                  <span className="font-mono font-semibold">123</span>
                </p>
              </div>
              <button
                type="button"
                onClick={fillDemo}
                className="shrink-0 rounded-lg border border-sand-300 bg-white px-2.5 py-1.5 text-2xs font-semibold text-sand-600 transition hover:bg-sand-50 dark:border-sand-600 dark:bg-charcoal-900 dark:text-sand-200"
              >
                Fill
              </button>
            </div>
            <p className="mt-3 border-t border-sand-200 pt-2.5 text-[11px] leading-relaxed text-charcoal-500 dark:border-sand-600/50 dark:text-charcoal-400">
              This is a demonstration sign-in, not a secure authentication service. The session is
              held in this browser tab only and every figure in the product is illustrative demo data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Subtle agricultural field / network graphic behind the brand panel. */
function FieldGraphic() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <pattern id="rows" width="34" height="34" patternTransform="rotate(24)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="34" stroke="white" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="600" height="800" fill="url(#rows)" />
      <g stroke="white" strokeWidth="1.5" fill="none" opacity="0.85">
        <path d="M110 250 C 210 190, 300 300, 420 220" strokeDasharray="6 8" />
        <path d="M120 420 C 240 400, 320 520, 450 460" strokeDasharray="6 8" />
        <path d="M90 600 C 220 560, 340 640, 470 580" strokeDasharray="6 8" />
        <path d="M110 250 C 150 380, 130 500, 90 600" />
        <path d="M420 220 C 460 330, 470 470, 470 580" />
      </g>
      <g fill="white">
        {[
          [110, 250],
          [420, 220],
          [120, 420],
          [450, 460],
          [90, 600],
          [470, 580],
          [270, 340],
          [300, 530],
        ].map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r="14" opacity="0.2" />
            <circle cx={cx} cy={cy} r="5" />
          </g>
        ))}
      </g>
    </svg>
  );
}
