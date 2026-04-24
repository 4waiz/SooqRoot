import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Allocation,
  Demand,
  Farm,
  FarmSupply,
  Language,
  OrderStatus,
  Page,
  Role,
  Theme,
} from '../types';
import { SEED_BUYERS, SEED_DEMANDS, SEED_FARMS } from '../data/seed';
import { loadItem, saveItem, clearAll } from '../lib/storage';

export interface AppState {
  language: Language;
  setLanguage: (l: Language) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  role: Role;
  setRole: (r: Role) => void;
  page: Page;
  setPage: (p: Page) => void;
  farms: Farm[];
  setFarms: React.Dispatch<React.SetStateAction<Farm[]>>;
  addFarmSupply: (farmId: string, supply: FarmSupply) => void;
  buyers: typeof SEED_BUYERS;
  activeBuyerId: string;
  setActiveBuyerId: (id: string) => void;
  activeFarmId: string;
  setActiveFarmId: (id: string) => void;
  demands: Demand[];
  addDemand: (d: Demand) => void;
  updateDemand: (id: string, patch: Partial<Demand>) => void;
  advanceStatus: (id: string) => void;
  allocations: Allocation[];
  setAllocation: (a: Allocation) => void;
  removeAllocation: (demandId: string) => void;
  resetDemo: () => void;
}

export const AppContext = createContext<AppState | null>(null);

const NEXT_STATUS: Record<OrderStatus, OrderStatus> = {
  Request: 'Structured',
  Structured: 'Allocated',
  Allocated: 'HarvestInstructed',
  HarvestInstructed: 'Packed',
  Packed: 'PickedUp',
  PickedUp: 'Delivered',
  Delivered: 'Delivered',
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => loadItem<Language>('language', 'ar'));
  const [theme, setThemeState] = useState<Theme>(() => loadItem<Theme>('theme', 'light'));
  const [role, setRoleState] = useState<Role>(() => loadItem<Role>('role', 'landing'));
  const [page, setPageState] = useState<Page>(() => loadItem<Page>('page', 'landing'));
  const [farms, setFarms] = useState<Farm[]>(() => loadItem<Farm[]>('farms', SEED_FARMS));
  const [demands, setDemands] = useState<Demand[]>(() => loadItem<Demand[]>('demands', SEED_DEMANDS));
  const [allocations, setAllocations] = useState<Allocation[]>(() =>
    loadItem<Allocation[]>('allocations', [])
  );
  const [activeBuyerId, setActiveBuyerIdState] = useState<string>(() =>
    loadItem<string>('activeBuyer', SEED_BUYERS[0].id)
  );
  const [activeFarmId, setActiveFarmIdState] = useState<string>(() =>
    loadItem<string>('activeFarm', SEED_FARMS[0].id)
  );

  useEffect(() => saveItem('language', language), [language]);
  useEffect(() => saveItem('theme', theme), [theme]);
  useEffect(() => saveItem('role', role), [role]);
  useEffect(() => saveItem('page', page), [page]);
  useEffect(() => saveItem('farms', farms), [farms]);
  useEffect(() => saveItem('demands', demands), [demands]);
  useEffect(() => saveItem('allocations', allocations), [allocations]);
  useEffect(() => saveItem('activeBuyer', activeBuyerId), [activeBuyerId]);
  useEffect(() => saveItem('activeFarm', activeFarmId), [activeFarmId]);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setLanguage = useCallback((l: Language) => setLanguageState(l), []);
  const setTheme = useCallback((t: Theme) => setThemeState(t), []);
  const toggleTheme = useCallback(
    () => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light')),
    []
  );
  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    if (r === 'buyer') setPageState('buyer');
    else if (r === 'farmer') setPageState('farmer');
    else if (r === 'operator') setPageState('operator');
    else setPageState('landing');
  }, []);
  const setPage = useCallback((p: Page) => setPageState(p), []);
  const setActiveBuyerId = useCallback((id: string) => setActiveBuyerIdState(id), []);
  const setActiveFarmId = useCallback((id: string) => setActiveFarmIdState(id), []);

  const addDemand = useCallback((d: Demand) => setDemands((prev) => [d, ...prev]), []);
  const updateDemand = useCallback(
    (id: string, patch: Partial<Demand>) =>
      setDemands((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d))),
    []
  );
  const advanceStatus = useCallback((id: string) => {
    setDemands((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: NEXT_STATUS[d.status] } : d))
    );
  }, []);

  const addFarmSupply = useCallback((farmId: string, supply: FarmSupply) => {
    setFarms((prev) =>
      prev.map((f) =>
        f.id === farmId ? { ...f, supplies: [...f.supplies, supply] } : f
      )
    );
  }, []);

  const setAllocation = useCallback((a: Allocation) => {
    setAllocations((prev) => {
      const withoutSame = prev.filter((p) => p.demandId !== a.demandId);
      return [a, ...withoutSame];
    });
  }, []);
  const removeAllocation = useCallback((demandId: string) => {
    setAllocations((prev) => prev.filter((a) => a.demandId !== demandId));
  }, []);

  const resetDemo = useCallback(() => {
    clearAll();
    setFarms(SEED_FARMS);
    setDemands(SEED_DEMANDS);
    setAllocations([]);
    setActiveBuyerIdState(SEED_BUYERS[0].id);
    setActiveFarmIdState(SEED_FARMS[0].id);
  }, []);

  const value: AppState = useMemo(
    () => ({
      language,
      setLanguage,
      theme,
      setTheme,
      toggleTheme,
      role,
      setRole,
      page,
      setPage,
      farms,
      setFarms,
      addFarmSupply,
      buyers: SEED_BUYERS,
      activeBuyerId,
      setActiveBuyerId,
      activeFarmId,
      setActiveFarmId,
      demands,
      addDemand,
      updateDemand,
      advanceStatus,
      allocations,
      setAllocation,
      removeAllocation,
      resetDemo,
    }),
    [
      language,
      setLanguage,
      theme,
      setTheme,
      toggleTheme,
      role,
      setRole,
      page,
      setPage,
      farms,
      addFarmSupply,
      activeBuyerId,
      setActiveBuyerId,
      activeFarmId,
      setActiveFarmId,
      demands,
      addDemand,
      updateDemand,
      advanceStatus,
      allocations,
      setAllocation,
      removeAllocation,
      resetDemo,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
