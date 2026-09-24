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
  Moon,
  Network,
  ShieldCheck,
  Sun,
  User,
} from 'lucide-react';
import { useStore, DEMO_CREDENTIALS } from '../state/AppStore';
import { Button } from '../components/ui';
import { ImagePanel } from '../components/ui/Photo';
import { asset } from '../lib/assets';
import { SCENE } from '../data/media';

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
  const { session, signIn, theme, toggleTheme } = useStore();
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
    // Brief delay so the loading state is visible - this is a demo sign-in,
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
    <div className="grid min-h-screen min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* ---------------- Brand panel ---------------- */}
      <ImagePanel
        src={SCENE.agriNetwork(1600)}
        alt="UAE farms, greenhouses and a hotel kitchen connected by commitment flows"
        overlay="left"
        priority
        className="hidden lg:block"
      >
        <div className="flex h-full flex-col justify-between p-10 text-white xl:p-14">
          <div>
            <img
              src={asset('lightlogo.png')}
              alt="SooqRoot"
              className="h-9 w-auto"
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
            />
          </div>

          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-2xs font-semibold backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-200" />
              The Procurement Operating System for UAE Local Food
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight drop-shadow-sm xl:text-[2.75rem]">
              One Order.
              <br />
              Many Farms.
              <br />
              <span className="text-brand-200">Confirmed Before Harvest.</span>
            </h1>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-white/85">
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
                      <div className="mt-0.5 text-xs leading-relaxed text-white/75">{p.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-2xs text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={13} /> 2nd Place, Universities Hackathon: Farm to Market
            </span>
            <span>Al Ain · Abu Dhabi · Dubai</span>
          </div>
        </div>
      </ImagePanel>

      {/* ---------------- Form panel ---------------- */}
      <section className="sr-field-texture relative flex items-center justify-center bg-canvas px-5 py-10 dark:bg-charcoal-950 sm:px-10">
        <button
          type="button"
          onClick={toggleTheme}
          className="absolute end-4 top-4 inline-flex items-center gap-2 rounded-full border border-charcoal-200 bg-white px-3 py-1.5 text-2xs font-semibold text-charcoal-600 shadow-card transition hover:border-charcoal-300 hover:text-charcoal-900 dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-300 dark:hover:text-white"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <ImagePanel
              src={SCENE.agriNetwork(900)}
              alt="UAE farms connected to buyers"
              overlay="bottom"
              priority
              className="mb-6 h-40 rounded-2xl shadow-lift"
            >
              <div className="flex h-full flex-col justify-end p-4 text-white">
                <img
                  src={asset('lightlogo.png')}
                  alt="SooqRoot"
                  className="h-7 w-auto self-start"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
                />
                <p className="mt-2 text-2xs font-semibold uppercase tracking-widest text-brand-100">
                  One Order. Many Farms. Confirmed Before Harvest.
                </p>
              </div>
            </ImagePanel>
          </div>

          <div>
            <h2 className="sr-h1">Sign in</h2>
            <p className="sr-sub mt-1.5">Access the SooqRoot procurement control tower.</p>
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
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-charcoal-400 transition hover:bg-charcoal-100 hover:text-charcoal-700 dark:hover:bg-charcoal-800 dark:hover:text-charcoal-200"
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
                className="shrink-0 rounded-lg border border-sand-300 bg-white px-2.5 py-1.5 text-2xs font-semibold text-sand-600 transition hover:bg-sand-50 dark:border-sand-600 dark:bg-charcoal-900 dark:text-sand-200 dark:hover:bg-charcoal-800"
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
