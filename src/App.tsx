import { HashRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AppProvider, useStore } from './state/AppStore';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { ControlTower } from './pages/ControlTower';
import { BuyerDemand } from './pages/BuyerDemand';
import { ProcurementCycles } from './pages/ProcurementCycles';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { CommitmentEngine } from './pages/CommitmentEngine';
import { Farms } from './pages/Farms';
import { FarmDetail } from './pages/FarmDetail';
import { SupplyTwin } from './pages/SupplyTwin';
import { HarvestCalendar } from './pages/HarvestCalendar';
import { Exceptions } from './pages/Exceptions';
import { Fulfilment } from './pages/Fulfilment';
import { QualityCheck } from './pages/QualityCheck';
import { BatchPassports } from './pages/BatchPassports';
import { LocalProcurementIndex } from './pages/LocalProcurementIndex';
import { Analytics } from './pages/Analytics';
import { SustainabilityImpact } from './pages/SustainabilityImpact';
import { FarmerCopilot } from './pages/FarmerCopilot';
import { DemoScenario } from './pages/DemoScenario';
import { Recognition } from './pages/Recognition';
import { Settings } from './pages/Settings';

function RequireSession() {
  const { session } = useStore();
  if (!session) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireSession />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<ControlTower />} />
              <Route path="/demand" element={<BuyerDemand />} />
              <Route path="/cycles" element={<ProcurementCycles />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:orderId" element={<OrderDetail />} />
              <Route path="/engine" element={<CommitmentEngine />} />
              <Route path="/farms" element={<Farms />} />
              <Route path="/farms/:farmId" element={<FarmDetail />} />
              <Route path="/network" element={<SupplyTwin />} />
              <Route path="/harvest" element={<HarvestCalendar />} />
              <Route path="/exceptions" element={<Exceptions />} />
              <Route path="/fulfilment" element={<Fulfilment />} />
              <Route path="/quality" element={<QualityCheck />} />
              <Route path="/passports" element={<BatchPassports />} />
              <Route path="/index" element={<LocalProcurementIndex />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/impact" element={<SustainabilityImpact />} />
              <Route path="/copilot" element={<FarmerCopilot />} />
              <Route path="/scenario" element={<DemoScenario />} />
              <Route path="/recognition" element={<Recognition />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
