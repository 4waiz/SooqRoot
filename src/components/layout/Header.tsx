import React, { useState } from 'react';
import {
  Languages,
  Moon,
  Sun,
  Menu,
  ChevronDown,
  ShoppingBasket,
  Tractor,
  Settings2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';
import { Page, Role } from '../../types';
import { Badge } from '../ui/Badge';

const NAV_PAGES: { key: Page; labelKey: Parameters<ReturnType<typeof useTranslation>['t']>[0] }[] = [
  { key: 'landing', labelKey: 'nav_landing' },
  { key: 'buyer', labelKey: 'nav_buyer' },
  { key: 'farmer', labelKey: 'nav_farmer' },
  { key: 'operator', labelKey: 'nav_operator' },
  { key: 'validation', labelKey: 'nav_validation' },
  { key: 'impact', labelKey: 'nav_impact' },
  { key: 'business', labelKey: 'nav_business' },
  { key: 'pitch', labelKey: 'nav_pitch' },
];

export function Header() {
  const { theme, toggleTheme, language, setLanguage, role, setRole, page, setPage, resetDemo } =
    useApp();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  // Logo: dark-text logo on light bg, light-text logo on dark bg.
  const logoSrc = theme === 'dark' ? '/lightlogo.png' : '/darklogo.png';

  const handleReset = () => {
    if (window.confirm(t('resetConfirm'))) resetDemo();
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-charcoal-900/80 border-b border-charcoal-100 dark:border-charcoal-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-3">
        <button
          className="flex items-center gap-2.5 group"
          onClick={() => {
            setRole('landing' as Role);
            setPage('landing');
          }}
        >
          <img
            src={logoSrc}
            alt="SooqRoot"
            className="h-9 md:h-10 w-auto transition-transform group-hover:scale-[1.02]"
          />
        </button>

        <Badge tone="emerald" className="ms-2 hidden md:inline-flex" icon={<Sparkles size={12} />}>
          {t('header_demoActive')}
        </Badge>

        <nav className="hidden lg:flex items-center gap-1 ms-6">
          {NAV_PAGES.map((n) => (
            <button
              key={n.key}
              onClick={() => setPage(n.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                page === n.key
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                  : 'text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
              }`}
            >
              {t(n.labelKey)}
            </button>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          {/* Role selector */}
          <div className="hidden md:flex items-center gap-1 rounded-xl border border-charcoal-200 dark:border-charcoal-700 p-1">
            <RoleTab
              active={role === 'buyer'}
              onClick={() => setRole('buyer')}
              icon={<ShoppingBasket size={14} />}
              label={t('role_buyer')}
            />
            <RoleTab
              active={role === 'farmer'}
              onClick={() => setRole('farmer')}
              icon={<Tractor size={14} />}
              label={t('role_farmer')}
            />
            <RoleTab
              active={role === 'operator'}
              onClick={() => setRole('operator')}
              icon={<Settings2 size={14} />}
              label={t('role_operator')}
            />
          </div>

          <button
            className="sr-btn-ghost !px-3 !py-2"
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            aria-label="Toggle language"
            title="Toggle language"
          >
            <Languages size={16} />
            <span className="text-sm font-semibold">{t('header_langSwitch')}</span>
          </button>

          <button
            className="sr-btn-ghost !px-3 !py-2"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? t('header_lightMode') : t('header_darkMode')}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            className="sr-btn-ghost !px-3 !py-2 hidden md:inline-flex"
            onClick={handleReset}
            title={t('reset')}
          >
            <RotateCcw size={16} />
          </button>

          <button
            className="lg:hidden sr-btn-ghost !px-3 !py-2"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="lg:hidden border-t border-charcoal-100 dark:border-charcoal-800 bg-white dark:bg-charcoal-900">
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-2">
            {NAV_PAGES.map((n) => (
              <button
                key={n.key}
                onClick={() => {
                  setPage(n.key);
                  setMenuOpen(false);
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium text-start transition ${
                  page === n.key
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                    : 'text-charcoal-700 dark:text-charcoal-200 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
                }`}
              >
                {t(n.labelKey)}
              </button>
            ))}
            <div className="col-span-2 flex gap-2 pt-2 border-t border-charcoal-100 dark:border-charcoal-800">
              <RoleTab
                active={role === 'buyer'}
                onClick={() => {
                  setRole('buyer');
                  setMenuOpen(false);
                }}
                icon={<ShoppingBasket size={14} />}
                label={t('role_buyer')}
              />
              <RoleTab
                active={role === 'farmer'}
                onClick={() => {
                  setRole('farmer');
                  setMenuOpen(false);
                }}
                icon={<Tractor size={14} />}
                label={t('role_farmer')}
              />
              <RoleTab
                active={role === 'operator'}
                onClick={() => {
                  setRole('operator');
                  setMenuOpen(false);
                }}
                icon={<Settings2 size={14} />}
                label={t('role_operator')}
              />
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function RoleTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
        active
          ? 'bg-brand-600 text-white shadow-soft'
          : 'text-charcoal-600 dark:text-charcoal-300 hover:bg-charcoal-100 dark:hover:bg-charcoal-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
