/**
 * Main Application Layout
 */

import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingBag,
  Zap,
  Activity,
  ExternalLink
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTopsortContext } from '@/context/TopsortContext';
import { Cart } from '@/components/Cart';

const navItems = [
  { to: '/', label: 'Getting Started', icon: Zap },
  { to: '/catalog', label: 'Product Catalog', icon: ShoppingBag },
  { to: '/dashboard', label: 'Integration Dashboard', icon: LayoutDashboard },
];

export function Layout() {
  const { status, isInitialized } = useTopsortContext();

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Notice Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-1.5 px-4 text-sm">
        <span className="font-medium">Demo Mode</span>
        <span className="mx-2">•</span>
        <span className="opacity-90">API calls are simulated client-side. In production, auctions run server-side with secure API keys.</span>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                T
              </div>
              <span className="font-semibold text-lg">Topsort Integration Demo</span>
            </a>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Status indicator & Cart */}
          <div className="flex items-center gap-4">
            {isInitialized && (
              <div className="flex items-center gap-2 text-sm">
                <Activity className={cn(
                  "h-4 w-4",
                  status.apiHealth === 'healthy' && "text-green-500",
                  status.apiHealth === 'degraded' && "text-yellow-500",
                  status.apiHealth === 'down' && "text-red-500"
                )} />
                <span className="text-muted-foreground">API:</span>
                <Badge variant={
                  status.apiHealth === 'healthy' ? 'default' :
                  status.apiHealth === 'degraded' ? 'secondary' : 'destructive'
                }>
                  {status.apiHealth}
                </Badge>
              </div>
            )}
            <a
              href="https://docs.topsort.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Docs
              <ExternalLink className="h-3 w-3" />
            </a>
            <Cart />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-auto">
        <div className="container flex items-center justify-between text-sm text-muted-foreground">
          <p>Topsort Integration Demo — Built for demonstration purposes</p>
          <p>Powered by Topsort Retail Media Infrastructure</p>
        </div>
      </footer>
    </div>
  );
}
