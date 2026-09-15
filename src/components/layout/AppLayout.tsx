import React, { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Command,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { useStore } from '../../state/AppStore';
import { NAV, ALL_NAV_ITEMS } from './nav';
import { COPILOT_THREADS } from '../../data/operations';
import { Badge } from '../ui';
import { CommandPalette } from './CommandPalette';
import { asset } from '../../lib/assets';

/* ============================================================
   Authenticated application shell: sidebar + top bar.
   Desktop-first, collapses to an overlay drawer on mobile.
   ============================================================ */

function Logo({ collapsed, dark }: { collapsed?: boolean; dark?: boolean }) {
  if (collapsed) {
    return (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-sm font-bold text-white shadow-soft">
        SR
      </span>
    );
  }
  return (
    <img
      src={asset(dark ? 'lightlogo.png' : 'darklogo.png')}
      alt="SooqRoot"
      className="h-8 w-auto"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = 'none';
      }}
    />
  );
}

export function DemoDataBadge({
  className = '',
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-sand-200 bg-sand-50 font-semibold text-sand-600 dark:border-sand-600 dark:bg-sand-600/20 dark:text-sand-200 ${
        compact ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1 text-2xs'
      } ${className}`}
      title="All figures in this environment are illustrative demo data, not live commercial data."
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sand-400" />
      {compact ? 'Demo' : 'Demo Data'}
    </span>
  );
}

export function AppLayout() {
  const { session, signOut, theme, toggleTheme, sidebarCollapsed, toggleSidebar, metrics, exceptions } =
    useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const openExceptions = exceptions.filter((e) => e.status !== 'resolved').length;
  const unreadCopilot = COPILOT_THREADS.reduce((s, t) => s + t.unread, 0);

  const badges: Record<string, number> = useMemo(
    () => ({
      exceptions: openExceptions,
      atRisk: metrics.atRiskOrders,
      copilot: unreadCopilot,
    }),
    [openExceptions, metrics.atRiskOrders, unreadCopilot]
  );

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const current = ALL_NAV_ITEMS.find(
    (i) => location.pathname === i.to || location.pathname.startsWith(i.to + '/')
  );

  const sidebarWidth = sidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-[248px]';

  const navBody = (
    <nav className="flex-1 overflow-y-auto px-3 pb-6 no-scrollbar">
      {NAV.map((group) => (
        <div key={group.label}>
          {!sidebarCollapsed ? <div className="sr-nav-group">{group.label}</div> : <div className="h-3" />}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const count = item.badgeKey ? badges[item.badgeKey] : 0;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `sr-nav-item ${isActive ? 'sr-nav-item-active' : ''} ${
                      sidebarCollapsed ? 'justify-center px-2' : ''
                    }`
                  }
                >
                  <Icon size={17} className="shrink-0" strokeWidth={2} />
                  {!sidebarCollapsed ? (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {count > 0 ? (
                        <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                          {count}
                        </span>
                      ) : null}
                    </>
                  ) : count > 0 ? (
                    <span className="absolute end-2 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500" />
                  ) : null}
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-canvas dark:bg-charcoal-950">
      {/* ---------- Desktop sidebar ---------- */}
      <aside
        className={`fixed inset-y-0 start-0 z-40 hidden shrink-0 flex-col border-e border-charcoal-100 bg-white transition-[width] duration-300 ease-spring dark:border-charcoal-800 dark:bg-charcoal-900 lg:flex ${sidebarWidth}`}
      >
        <div
          className={`flex h-16 items-center gap-2 border-b border-charcoal-100 px-4 dark:border-charcoal-800 ${
            sidebarCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
            <Logo collapsed={sidebarCollapsed} dark={theme === 'dark'} />
          </Link>
          {!sidebarCollapsed ? (
            <button
              onClick={toggleSidebar}
              className="ms-auto rounded-lg p-1.5 text-charcoal-400 transition hover:bg-charcoal-100 hover:text-charcoal-700 dark:hover:bg-charcoal-800"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          ) : null}
        </div>

        {sidebarCollapsed ? (
          <button
            onClick={toggleSidebar}
            className="mx-auto mt-3 rounded-lg p-1.5 text-charcoal-400 transition hover:bg-charcoal-100 hover:text-charcoal-700 dark:hover:bg-charcoal-800"
            aria-label="Expand sidebar"
          >
            <Menu size={16} />
          </button>
        ) : null}

        {navBody}

        {!sidebarCollapsed ? (
          <div className="border-t border-charcoal-100 p-3 dark:border-charcoal-800">
            <div className="rounded-xl bg-canvas-soft p-3 dark:bg-charcoal-950">
              <DemoDataBadge />
              <p className="mt-2 text-2xs leading-relaxed text-charcoal-400">
                Illustrative dataset for demonstration. No live commercial data.
              </p>
            </div>
          </div>
        ) : null}
      </aside>

      {/* ---------- Mobile drawer ---------- */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-charcoal-950/50 backdrop-blur-sm animate-fade"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 start-0 flex w-[272px] flex-col border-e border-charcoal-100 bg-white shadow-lift dark:border-charcoal-800 dark:bg-charcoal-900 animate-in">
            <div className="flex h-16 items-center justify-between border-b border-charcoal-100 px-4 dark:border-charcoal-800">
              <Logo dark={theme === 'dark'} />
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-charcoal-400 hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            {navBody}
            <div className="border-t border-charcoal-100 p-3 dark:border-charcoal-800">
              <DemoDataBadge />
            </div>
          </aside>
        </div>
      ) : null}

      {/* ---------- Main column ---------- */}
      <div className={`flex min-w-0 flex-1 flex-col ${sidebarCollapsed ? 'lg:ps-[72px]' : 'lg:ps-[248px]'}`}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-charcoal-100 bg-white/85 px-3 backdrop-blur-xl dark:border-charcoal-800 dark:bg-charcoal-900/85 sm:gap-3 sm:px-4 md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="-ms-1 rounded-lg p-2 text-charcoal-500 transition hover:bg-charcoal-100 dark:hover:bg-charcoal-800 lg:hidden"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          <Link to="/dashboard" className="shrink-0 lg:hidden">
            <Logo dark={theme === 'dark'} />
          </Link>

          <div className="hidden min-w-0 md:block">
            <div className="text-2xs font-semibold uppercase tracking-widest text-charcoal-400">
              SooqRoot
            </div>
            <div className="truncate text-sm font-semibold text-charcoal-800 dark:text-charcoal-100">
              {current?.label ?? 'Control Tower'}
            </div>
          </div>

          <button
            onClick={() => setPaletteOpen(true)}
            className="ms-auto flex items-center gap-2 rounded-xl border border-charcoal-200 bg-canvas-soft px-3 py-2 text-xs text-charcoal-400 transition hover:border-charcoal-300 hover:text-charcoal-600 dark:border-charcoal-700 dark:bg-charcoal-950 md:w-64"
          >
            <Search size={14} />
            <span className="hidden flex-1 text-start md:block">Search orders, farms, buyers…</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-charcoal-200 bg-white px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-400 dark:border-charcoal-700 dark:bg-charcoal-900 md:inline-flex">
              <Command size={9} />K
            </kbd>
          </button>

          <DemoDataBadge className="hidden sm:inline-flex" />
          <DemoDataBadge compact className="sm:hidden" />

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-charcoal-500 transition hover:bg-charcoal-100 dark:hover:bg-charcoal-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <div className="flex items-center gap-2.5 border-s border-charcoal-100 ps-2 dark:border-charcoal-800 sm:ps-3">
            <span className="hidden h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-2xs font-bold text-white sm:inline-flex">
              AA
            </span>
            <div className="hidden leading-tight lg:block">
              <div className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-100">
                {session?.displayName}
              </div>
              <div className="text-2xs text-charcoal-400">{session?.role}</div>
            </div>
            <button
              onClick={() => {
                signOut();
                navigate('/login', { replace: true });
              }}
              className="rounded-lg p-2 text-charcoal-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-charcoal-100 px-4 py-5 dark:border-charcoal-800 md:px-6">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-2 text-2xs text-charcoal-400 md:flex-row md:items-center md:justify-between">
            <span>
              SooqRoot — The Procurement Operating System for UAE Local Food · One Order. Many Farms.
              Confirmed Before Harvest.
            </span>
            <span className="flex items-center gap-3">
              <Badge tone="neutral">Demo build</Badge>
              <span>© 2026 SooqRoot</span>
            </span>
          </div>
        </footer>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}
