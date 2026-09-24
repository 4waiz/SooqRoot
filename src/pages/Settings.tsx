import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  Info,
  LogOut,
  Monitor,
  Moon,
  PanelLeftClose,
  RotateCcw,
  ShieldAlert,
  Sun,
  User,
} from 'lucide-react';
import { useStore } from '../state/AppStore';
import type { ThemePreference } from '../types';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  DataRow,
  Modal,
  PageHeader,
  Segmented,
} from '../components/ui';
import { formatDate, formatTime } from '../lib/metrics';

export function Settings() {
  const {
    session,
    signOut,
    theme,
    themePreference,
    setThemePreference,
    sidebarCollapsed,
    toggleSidebar,
    resetDemoData,
    orders,
    demands,
    farms,
    exceptions,
  } = useStore();
  const navigate = useNavigate();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="System"
        title="Settings"
        subtitle="Profile, appearance and demo data controls for this environment."
        actions={
          <Badge tone="sand" icon={<Info size={12} />}>
            Demonstration environment
          </Badge>
        }
      />

      {resetDone ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700 dark:border-brand-800 dark:bg-brand-900 dark:text-brand-100 animate-in">
          <RotateCcw size={16} />
          Demo data restored to its opening state.
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---------------- Profile ---------------- */}
        <Card>
          <CardHeader title="Profile" subtitle="The signed-in demo account" icon={<User size={16} />} />
          <div className="mt-4 flex items-center gap-4">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-bold text-white">
              AA
            </span>
            <div>
              <div className="text-base font-bold text-charcoal-900 dark:text-white">
                {session?.displayName}
              </div>
              <div className="text-xs text-charcoal-500 dark:text-charcoal-400">{session?.role}</div>
            </div>
          </div>
          <div className="mt-4">
            <DataRow label="Username" value={<span className="font-mono">{session?.username}</span>} />
            <DataRow
              label="Session started"
              value={
                session
                  ? `${formatDate(session.loggedInAt, 'long')} · ${formatTime(session.loggedInAt)}`
                  : ', '
              }
            />
            <DataRow label="Session scope" value="This browser tab only" />
            <DataRow label="Environment" value="Demonstration build" />
          </div>
          <Button
            variant="secondary"
            className="mt-4 w-full"
            icon={<LogOut size={15} />}
            onClick={() => {
              signOut();
              navigate('/login', { replace: true });
            }}
          >
            Sign out
          </Button>
        </Card>

        {/* ---------------- Appearance ---------------- */}
        <Card>
          <CardHeader title="Appearance" subtitle="How the interface renders" icon={<Monitor size={16} />} />
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-100">Theme</div>
                <div className="mt-0.5 text-2xs text-charcoal-400">
                  Light is recommended for projection and live presentation.
                  {themePreference === 'system' ? ` Following your device, currently ${theme}.` : ''}
                </div>
              </div>
              <Segmented
                value={themePreference}
                onChange={(t) => setThemePreference(t as ThemePreference)}
                options={[
                  { value: 'light', label: 'Light', icon: <Sun size={12} /> },
                  { value: 'dark', label: 'Dark', icon: <Moon size={12} /> },
                  { value: 'system', label: 'System', icon: <Monitor size={12} /> },
                ]}
              />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-charcoal-100 pt-4 dark:border-charcoal-800">
              <div>
                <div className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-100">
                  Sidebar
                </div>
                <div className="mt-0.5 text-2xs text-charcoal-400">
                  Collapse to icons for more canvas on smaller screens.
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<PanelLeftClose size={13} />}
                onClick={toggleSidebar}
              >
                {sidebarCollapsed ? 'Expand' : 'Collapse'}
              </Button>
            </div>

            <div className="rounded-xl bg-canvas-soft p-3.5 text-2xs leading-relaxed text-charcoal-500 dark:bg-charcoal-950 dark:text-charcoal-400">
              Press <kbd className="rounded border border-charcoal-200 bg-white px-1 py-0.5 font-mono text-[10px] dark:border-charcoal-700 dark:bg-charcoal-900">Ctrl</kbd>{' '}
              +{' '}
              <kbd className="rounded border border-charcoal-200 bg-white px-1 py-0.5 font-mono text-[10px] dark:border-charcoal-700 dark:bg-charcoal-900">K</kbd>{' '}
              anywhere to search orders, farms and buyers.
            </div>
          </div>
        </Card>
      </div>

      {/* ---------------- Demo data ---------------- */}
      <Card>
        <CardHeader
          title="Demo data"
          subtitle="This environment has no database. Everything below is an illustrative dataset held in the browser."
          icon={<Database size={16} />}
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Count label="Farms" value={farms.length} />
          <Count label="Orders" value={orders.length} />
          <Count label="Demand records" value={demands.length} />
          <Count label="Exceptions" value={exceptions.length} />
        </div>

        <div className="mt-4 rounded-xl border border-sand-200 bg-sand-50 p-4 dark:border-sand-600 dark:bg-sand-600/10">
          <div className="flex items-start gap-3">
            <ShieldAlert size={18} className="mt-0.5 shrink-0 text-sand-600 dark:text-sand-300" />
            <div>
              <div className="text-xs font-bold text-charcoal-800 dark:text-charcoal-100">
                Nothing here is live commercial data
              </div>
              <p className="mt-1 text-2xs leading-relaxed text-charcoal-600 dark:text-charcoal-300">
                Farms, buyers, volumes, prices and impact figures are illustrative and were authored
                for demonstration. Sign-in is a demo gate, not a secure authentication service. State
                persists to this browser&rsquo;s local storage so a demo survives a page refresh, it
                is never sent anywhere.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-charcoal-100 pt-4 dark:border-charcoal-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-xs font-semibold text-charcoal-800 dark:text-charcoal-100">
              Reset demo data
            </div>
            <div className="mt-0.5 text-2xs text-charcoal-400">
              Restores farms, orders, demand, exceptions and activity to their opening state.
            </div>
          </div>
          <Button variant="danger" icon={<RotateCcw size={15} />} onClick={() => setConfirmReset(true)}>
            Reset demo data
          </Button>
        </div>
      </Card>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        subtitle="This cannot be undone."
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<RotateCcw size={15} />}
              onClick={() => {
                resetDemoData();
                setConfirmReset(false);
                setResetDone(true);
                window.setTimeout(() => setResetDone(false), 4000);
              }}
            >
              Reset everything
            </Button>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-charcoal-600 dark:text-charcoal-300">
          Anything created during this session, new demand records, issued commitment packs, resolved
          exceptions, sent Copilot messages, will be discarded and the dataset returned to its
          opening state. Your sign-in stays active.
        </p>
      </Modal>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-canvas-soft p-3.5 dark:bg-charcoal-950">
      <div className="text-2xs uppercase tracking-wider text-charcoal-400">{label}</div>
      <div className="sr-num mt-1 text-xl">{value}</div>
    </div>
  );
}
