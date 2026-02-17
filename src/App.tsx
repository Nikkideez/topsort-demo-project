import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TopsortProvider } from '@/context/TopsortContext';
import { CartProvider } from '@/context/CartContext';
import { Layout } from '@/components/Layout';
import { OnboardingPage } from '@/pages/Onboarding';
import { CatalogPage } from '@/pages/Catalog';
import { ProductDetailPage } from '@/pages/ProductDetail';
import { DashboardPage } from '@/pages/Dashboard';
import { enableMockServer } from '@/mock/mock-server';

// Enable mock server for demo
enableMockServer();

function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <TopsortProvider>
          <CartProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<OnboardingPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Route>
            </Routes>
          </CartProvider>
        </TopsortProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
}

export default App;
