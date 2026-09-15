import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityEvent,
  Demand,
  DemoSession,
  ExceptionItem,
  Farm,
  Order,
  Theme,
} from '../types';
import { BUYERS } from '../data/buyers';
import { DEMANDS } from '../data/demand';
import { CYCLES, NETWORK_FARMS, ORDERS } from '../data/orders';
import { ACTIVITY, EXCEPTIONS } from '../data/operations';
import { clearAll, clearSession, loadItem, loadSession, saveItem, saveSession } from '../lib/storage';
import { computeMetrics, NetworkMetrics } from '../lib/metrics';

/* ============================================================
   Demo application store.

   There is no database and no backend. State lives in React,
   persists to localStorage where persistence makes the demo
   better, and the session lives in sessionStorage so closing
   the tab signs you out.
   ============================================================ */

export const DEMO_CREDENTIALS = { username: 'Awaiz', password: '123' };

export const DEMO_PROFILE: Omit<DemoSession, 'loggedInAt'> = {
  username: 'Awaiz',
  displayName: 'Awaiz Ahmed',
  role: 'Administrator / Product Demo',
};

interface AppStore {
  /* session */
  session: DemoSession | null;
  signIn: (username: string, password: string) => { ok: boolean; error?: string };
  signOut: () => void;

  /* preferences */
  theme: Theme;
  toggleTheme: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  /* demo data */
  farms: Farm[];
  buyers: typeof BUYERS;
  orders: Order[];
  cycles: typeof CYCLES;
  demands: Demand[];
  exceptions: ExceptionItem[];
  activity: ActivityEvent[];
  metrics: NetworkMetrics;

  /* mutations */
  addDemand: (demand: Demand) => void;
  approveDemand: (demandId: string) => void;
  commitOrder: (orderId: string, allocations: Order['allocations'], committedQty: number) => void;
  advanceOrder: (orderId: string) => void;
  resolveException: (id: string, status: ExceptionItem['status']) => void;
  pushActivity: (event: Omit<ActivityEvent, 'id' | 'at'>) => void;
  resetDemoData: () => void;
}

const Ctx = createContext<AppStore | null>(null);

const NEXT_STATUS: Record<Order['status'], Order['status']> = {
  'Demand received': 'Committed',
  Committed: 'Harvest scheduled',
  'Harvest scheduled': 'In fulfilment',
  'In fulfilment': 'Delivered',
  Delivered: 'Delivered',
  'At risk': 'Committed',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<DemoSession | null>(() => loadSession<DemoSession | null>(null));
  const [theme, setTheme] = useState<Theme>(() => loadItem<Theme>('theme', 'light'));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => loadItem<boolean>('sidebar', false));

  const [orders, setOrders] = useState<Order[]>(() => loadItem<Order[]>('orders', ORDERS));
  const [demands, setDemands] = useState<Demand[]>(() => loadItem<Demand[]>('demands', DEMANDS));
  const [exceptions, setExceptions] = useState<ExceptionItem[]>(() =>
    loadItem<ExceptionItem[]>('exceptions', EXCEPTIONS)
  );
  const [activity, setActivity] = useState<ActivityEvent[]>(() =>
    loadItem<ActivityEvent[]>('activity', ACTIVITY)
  );

  useEffect(() => saveItem('theme', theme), [theme]);
  useEffect(() => saveItem('sidebar', sidebarCollapsed), [sidebarCollapsed]);
  useEffect(() => saveItem('orders', orders), [orders]);
  useEffect(() => saveItem('demands', demands), [demands]);
  useEffect(() => saveItem('exceptions', exceptions), [exceptions]);
  useEffect(() => saveItem('activity', activity), [activity]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const signIn = useCallback((username: string, password: string) => {
    const u = username.trim();
    if (!u || !password) return { ok: false, error: 'Enter your username and password.' };
    if (
      u.toLowerCase() !== DEMO_CREDENTIALS.username.toLowerCase() ||
      password !== DEMO_CREDENTIALS.password
    ) {
      return { ok: false, error: 'Those credentials do not match a demo account.' };
    }
    const next: DemoSession = { ...DEMO_PROFILE, loggedInAt: new Date().toISOString() };
    setSession(next);
    saveSession(next);
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    clearSession();
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

  const pushActivity = useCallback((event: Omit<ActivityEvent, 'id' | 'at'>) => {
    setActivity((prev) => [
      { ...event, id: `act-${Date.now()}`, at: new Date().toISOString() },
      ...prev,
    ]);
  }, []);

  const addDemand = useCallback((demand: Demand) => {
    setDemands((prev) => [demand, ...prev]);
  }, []);

  const approveDemand = useCallback((demandId: string) => {
    setDemands((prev) =>
      prev.map((d) => (d.id === demandId ? { ...d, status: 'approved' as const } : d))
    );
  }, []);

  const commitOrder = useCallback(
    (orderId: string, allocations: Order['allocations'], committedQty: number) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                allocations,
                committedQty,
                status: o.status === 'Demand received' ? 'Committed' : o.status,
                health: committedQty >= o.qty * 0.85 ? 'healthy' : committedQty >= o.qty * 0.65 ? 'attention' : 'risk',
              }
            : o
        )
      );
    },
    []
  );

  const advanceOrder = useCallback((orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const next = NEXT_STATUS[o.status];
        return {
          ...o,
          status: next,
          deliveredQty: next === 'Delivered' ? o.committedQty : o.deliveredQty,
        };
      })
    );
  }, []);

  const resolveException = useCallback((id: string, status: ExceptionItem['status']) => {
    setExceptions((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  const resetDemoData = useCallback(() => {
    clearAll();
    setOrders(ORDERS);
    setDemands(DEMANDS);
    setExceptions(EXCEPTIONS);
    setActivity(ACTIVITY);
    setTheme('light');
    setSidebarCollapsed(false);
  }, []);

  const metrics = useMemo(() => computeMetrics(orders, NETWORK_FARMS), [orders]);

  const value: AppStore = useMemo(
    () => ({
      session,
      signIn,
      signOut,
      theme,
      toggleTheme,
      sidebarCollapsed,
      toggleSidebar,
      farms: NETWORK_FARMS,
      buyers: BUYERS,
      orders,
      cycles: CYCLES,
      demands,
      exceptions,
      activity,
      metrics,
      addDemand,
      approveDemand,
      commitOrder,
      advanceOrder,
      resolveException,
      pushActivity,
      resetDemoData,
    }),
    [
      session,
      signIn,
      signOut,
      theme,
      toggleTheme,
      sidebarCollapsed,
      toggleSidebar,
      orders,
      demands,
      exceptions,
      activity,
      metrics,
      addDemand,
      approveDemand,
      commitOrder,
      advanceOrder,
      resolveException,
      pushActivity,
      resetDemoData,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): AppStore {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside AppProvider');
  return ctx;
}
