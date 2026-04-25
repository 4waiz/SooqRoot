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
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/useApp';
import { useTranslation } from '../../i18n/useTranslation';
import { Page, Role } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import {
  clearGroqApiKey,
  getGroqApiKey,
  getGroqModel,
  getStoredGroqApiKey,
  saveGroqApiKey,
} from '../../lib/groq';

const NAV_PAGES: { key: Page; labelKey: Parameters<ReturnType<typeof useTranslation>['t']>[0] }[] = [
  { key: 'impact', labelKey: 'nav_impact' },
  { key: 'business', labelKey: 'nav_business' },
  { key: 'pitch', labelKey: 'nav_pitch' },
];

export function Header() {
  const { theme, toggleTheme, language, setLanguage, role, setRole, page, setPage, resetDemo } =
    useApp();
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [storedKey, setStoredKey] = useState(() => getStoredGroqApiKey());
  const [keyDraft, setKeyDraft] = useState(() => getStoredGroqApiKey());
  const groqReady = Boolean(getGroqApiKey());
  const hasEnvKey = Boolean(import.meta.env.VITE_GROQ_API_KEY);
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



        <nav className="hidden lg:flex items-center gap-1.5 ms-6 px-1.5 py-1 rounded-2xl border border-white/30 dark:border-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-md shadow-sm">
          {NAV_PAGES.map((n) => (
            <button
              key={n.key}
              onClick={() => setPage(n.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 border ${
                page === n.key
                  ? 'bg-white/70 dark:bg-white/15 border-white/60 dark:border-white/20 text-brand-700 dark:text-brand-200 shadow-[0_0_12px_rgba(34,197,94,0.15)] dark:shadow-[0_0_12px_rgba(34,197,94,0.25)] backdrop-blur-lg'
                  : 'bg-transparent border-transparent text-charcoal-600 dark:text-charcoal-300 hover:bg-white/50 dark:hover:bg-white/10 hover:border-white/40 dark:hover:border-white/15 hover:shadow-sm'
              }`}
            >
              {t(n.labelKey)}
            </button>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          {/* Role selector */}
          <div className="hidden md:flex items-center gap-2 mr-6">
            <RoleTab
              active={role === 'buyer'}
              onClick={() => setRole('buyer')}
              icon={<ShoppingBasket size={18} />}
              label={t('role_buyer')}
            />
            <RoleTab
              active={role === 'farmer'}
              onClick={() => setRole('farmer')}
              icon={<Tractor size={18} />}
              label={t('role_farmer')}
            />
            <RoleTab
              active={role === 'operator'}
              onClick={() => setRole('operator')}
              icon={<Settings2 size={18} />}
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
            className={`sr-btn-ghost !px-3 !py-2 ${groqReady ? 'text-brand-700 dark:text-brand-200' : ''}`}
            onClick={() => {
              setKeyDraft(getStoredGroqApiKey());
              setAiOpen(true);
            }}
            title={language === 'ar' ? 'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Groq AI' : 'Groq AI settings'}
          >
            <KeyRound size={16} />
            <span className="hidden md:inline text-sm font-semibold">
              {groqReady ? 'Groq' : 'AI'}
            </span>
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
                icon={<ShoppingBasket size={18} />}
                label={t('role_buyer')}
              />
              <RoleTab
                active={role === 'farmer'}
                onClick={() => {
                  setRole('farmer');
                  setMenuOpen(false);
                }}
                icon={<Tractor size={18} />}
                label={t('role_farmer')}
              />
              <RoleTab
                active={role === 'operator'}
                onClick={() => {
                  setRole('operator');
                  setMenuOpen(false);
                }}
                icon={<Settings2 size={18} />}
                label={t('role_operator')}
              />
            </div>
          </div>
        </div>
      ) : null}

      <Modal
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        title={language === 'ar' ? 'Ø¥Ø¹Ø¯Ø§Ø¯Ø§Øª Groq AI' : 'Groq AI settings'}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                clearGroqApiKey();
                setStoredKey('');
                setKeyDraft('');
              }}
            >
              {language === 'ar' ? 'Ù…Ø³Ø­' : 'Clear'}
            </Button>
            <Button
              onClick={() => {
                saveGroqApiKey(keyDraft);
                setStoredKey(keyDraft.trim());
                setAiOpen(false);
              }}
              icon={<KeyRound size={16} />}
            >
              {language === 'ar' ? 'Ø­ÙØ¸ Ø§Ù„Ù…ÙØªØ§Ø­' : 'Save key'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            type="password"
            label={language === 'ar' ? 'Groq API key' : 'Groq API key'}
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder="gsk_..."
            autoComplete="off"
          />
          <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-900/20 p-3 text-sm text-charcoal-700 dark:text-charcoal-100">
            {language === 'ar'
              ? 'Ù„Ù„Ø¯ÙŠÙ…Ùˆ ÙÙ‚Ø·: Ø§Ù„Ù…ÙØªØ§Ø­ Ø§Ù„Ù…Ø­ÙÙˆØ¸ ÙÙŠ Ø§Ù„Ù…ØªØµÙØ­ ÙŠÙƒÙˆÙ† Ù…Ø±Ø¦ÙŠØ§Ù‹ Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø§Ù„Ø¬Ù‡Ø§Ø². Ù„Ù„Ø¥Ù†ØªØ§Ø¬ Ø§Ø³ØªØ®Ø¯Ù… Backend proxy.'
              : 'Demo only: a key saved in the browser is visible to this device user. For production, use a backend proxy.'}
          </div>
          <div className="text-xs text-charcoal-500 dark:text-charcoal-300 space-y-1">
            <div>
              {language === 'ar' ? 'Ø§Ù„Ø­Ø§Ù„Ø©' : 'Status'}:{' '}
              <span className="font-semibold">
                {groqReady
                  ? language === 'ar'
                    ? 'Groq Ù…ÙØ¹Ù‘Ù„'
                    : 'Groq enabled'
                  : language === 'ar'
                  ? 'Ø§Ù„ÙˆØ¶Ø¹ Ø§Ù„Ù…Ø­Ù„ÙŠ'
                  : 'Local fallback mode'}
              </span>
            </div>
            <div>
              {language === 'ar' ? 'Ø§Ù„Ù…ÙˆØ¯ÙŠÙ„' : 'Model'}: {getGroqModel()}
            </div>
            {hasEnvKey ? (
              <div>
                {language === 'ar'
                  ? 'ÙŠÙˆØ¬Ø¯ Ù…ÙØªØ§Ø­ VITE_GROQ_API_KEY ÙÙŠ Ø§Ù„Ø¨ÙŠØ¦Ø©.'
                  : 'VITE_GROQ_API_KEY is configured in the environment.'}
              </div>
            ) : null}
            {storedKey ? (
              <div>
                {language === 'ar'
                  ? 'ÙŠÙˆØ¬Ø¯ Ù…ÙØªØ§Ø­ Ù…Ø­ÙÙˆØ¸ ÙÙŠ Ø§Ù„Ù…ØªØµÙØ­.'
                  : 'A browser-saved key is present.'}
              </div>
            ) : null}
          </div>
        </div>
      </Modal>
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
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
        active
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20 scale-105'
          : 'bg-white dark:bg-charcoal-800 text-charcoal-600 dark:text-charcoal-300 border-2 border-charcoal-100 dark:border-charcoal-700 hover:border-brand-200 dark:hover:border-brand-900/50 hover:bg-brand-50 dark:hover:bg-brand-900/10'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
