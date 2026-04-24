import { useApp } from '../../context/useApp';
import { Landing } from '../landing/Landing';
import { BuyerDashboard } from '../buyer/BuyerDashboard';
import { FarmerDashboard } from '../farmer/FarmerDashboard';
import { OperatorDashboard } from '../operator/OperatorDashboard';
import { FieldValidation } from '../fieldvalidation/FieldValidation';
import { ImpactDashboard } from '../impact/ImpactDashboard';
import { BusinessModel } from '../business/BusinessModel';
import { PitchMode } from '../pitch/PitchMode';
import { Header } from './Header';
import { Footer } from './Footer';

export function AppShell() {
  const { page } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
          {page === 'landing' ? <Landing /> : null}
          {page === 'buyer' ? <BuyerDashboard /> : null}
          {page === 'farmer' ? <FarmerDashboard /> : null}
          {page === 'operator' ? <OperatorDashboard /> : null}
          {page === 'validation' ? <FieldValidation /> : null}
          {page === 'impact' ? <ImpactDashboard /> : null}
          {page === 'business' ? <BusinessModel /> : null}
          {page === 'pitch' ? <PitchMode /> : null}
        </div>
      </main>
      <Footer />
    </div>
  );
}
