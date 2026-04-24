import { useContext } from 'react';
import { AppContext, AppState } from './AppContext';

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
