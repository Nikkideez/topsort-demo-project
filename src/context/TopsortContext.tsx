/**
 * Topsort Context Provider
 * Manages global state for Topsort integration with analytics
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { TopsortClient, initializeTopsortClient } from '@/api/topsort-client';
import type {
  AuctionRequest,
  AuctionResponse,
  IntegrationStatus,
  ApiError,
} from '@/types/topsort';

export interface ApiLog {
  id: string;
  timestamp: Date;
  type: 'request' | 'response' | 'error';
  endpoint: string;
  data: unknown;
  duration?: number;
}

// Analytics data for funnel and charts
export interface AnalyticsData {
  impressions: number;
  viewableImpressions: number;
  clicks: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  adSpend: number;
  // Separate tracking for attribution analysis
  attributedPurchases: number;  // Purchases from sponsored products
  organicPurchases: number;     // Purchases from non-sponsored products
  attributedRevenue: number;
  organicRevenue: number;
  // Time series data for charts
  eventTimeline: Array<{
    timestamp: Date;
    type: 'impression' | 'viewability' | 'click' | 'addToCart' | 'purchase';
    productId?: string;
    value?: number;
    isAttributed?: boolean;  // Was this from a sponsored product?
  }>;
}

interface TopsortContextValue {
  // State
  isInitialized: boolean;
  status: IntegrationStatus;
  apiLogs: ApiLog[];
  analytics: AnalyticsData;

  // Actions
  initialize: (apiKey: string) => void;
  runAuction: (request: AuctionRequest) => Promise<AuctionResponse>;
  trackImpression: (resolvedBidId: string, page: string, location: string) => void;
  trackViewability: (resolvedBidId: string, viewable: boolean, percentVisible: number, timeInViewMs: number) => void;
  trackClick: (resolvedBidId: string) => void;
  trackAddToCart: (productId: string, quantity: number, unitPrice: number, resolvedBidId?: string) => void;
  trackPurchase: (productId: string, quantity: number, unitPrice: number, resolvedBidId?: string) => void;
  clearLogs: () => void;
  clearAnalytics: () => void;
  setErrorSimulation: (enabled: boolean) => void;
}

const initialAnalytics: AnalyticsData = {
  impressions: 0,
  viewableImpressions: 0,
  clicks: 0,
  addToCarts: 0,
  purchases: 0,
  revenue: 0,
  adSpend: 0,
  attributedPurchases: 0,
  organicPurchases: 0,
  attributedRevenue: 0,
  organicRevenue: 0,
  eventTimeline: [],
};

const TopsortContext = createContext<TopsortContextValue | null>(null);

export function TopsortProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<IntegrationStatus>({
    apiHealth: 'healthy',
    lastAuctionCall: null,
    lastEventSent: null,
    auctionSuccessRate: 100,
    eventsSentToday: 0,
    errors: [],
  });
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics);
  const clientRef = useRef<TopsortClient | null>(null);

  const addLog = useCallback((log: Omit<ApiLog, 'id' | 'timestamp'>) => {
    setApiLogs(prev => [{
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date(),
    }, ...prev].slice(0, 100));
  }, []);

  const addTimelineEvent = useCallback((
    type: AnalyticsData['eventTimeline'][0]['type'],
    productId?: string,
    value?: number
  ) => {
    setAnalytics(prev => ({
      ...prev,
      eventTimeline: [...prev.eventTimeline, {
        timestamp: new Date(),
        type,
        productId,
        value,
      }].slice(-100), // Keep last 100 events
    }));
  }, []);

  const initialize = useCallback((apiKey: string) => {
    clientRef.current = initializeTopsortClient({
      apiKey,
      onRequest: (endpoint, data) => {
        addLog({ type: 'request', endpoint, data });
      },
      onResponse: (endpoint, data, duration) => {
        addLog({ type: 'response', endpoint, data, duration });
      },
      onError: (error: ApiError) => {
        addLog({ type: 'error', endpoint: error.endpoint, data: error });
      },
    });
    setIsInitialized(true);
  }, [addLog]);

  // Uses createAuction internally (matches documented API)
  const runAuction = useCallback(async (request: AuctionRequest): Promise<AuctionResponse> => {
    if (!clientRef.current) throw new Error('Client not initialized');
    const response = await clientRef.current.createAuction(request);

    // Track ad spend from auction (sum of winner prices)
    const totalSpend = response.results.reduce((sum, result) => {
      return sum + result.winners.reduce((winnerSum, winner) => winnerSum + winner.winnerPrice, 0);
    }, 0);

    setAnalytics(prev => ({
      ...prev,
      adSpend: prev.adSpend + totalSpend,
    }));

    setStatus(clientRef.current.getStatus());
    return response;
  }, []);

  // Uses reportEvent with documented structure: { impressions: [...] }
  const trackImpression = useCallback((resolvedBidId: string, page: string, location: string) => {
    if (!clientRef.current) return;
    clientRef.current.reportEvent({
      impressions: [{
        resolvedBidId,
        id: crypto.randomUUID(),
        occurredAt: new Date().toISOString(),
        placement: { path: `/${page}/${location}` },
      }],
    });
    setAnalytics(prev => ({
      ...prev,
      impressions: prev.impressions + 1,
    }));
    addTimelineEvent('impression');
    setStatus(clientRef.current.getStatus());
  }, [addTimelineEvent]);

  // Viewability is tracked locally (not part of documented Topsort API)
  // In production, this might be sent as a custom event or impression metadata
  const trackViewability = useCallback((
    _resolvedBidId: string,
    viewable: boolean,
    _percentVisible: number,
    _timeInViewMs: number
  ) => {
    if (!clientRef.current) return;
    // Note: Viewability tracking is demo-only, not in documented API
    if (viewable) {
      setAnalytics(prev => ({
        ...prev,
        viewableImpressions: prev.viewableImpressions + 1,
      }));
      addTimelineEvent('viewability');
    }
    setStatus(clientRef.current.getStatus());
  }, [addTimelineEvent]);

  // Uses reportEvent with documented structure: { clicks: [...] }
  const trackClick = useCallback((resolvedBidId: string) => {
    if (!clientRef.current) return;
    clientRef.current.reportEvent({
      clicks: [{
        resolvedBidId,
        id: crypto.randomUUID(),
        occurredAt: new Date().toISOString(),
      }],
    });
    setAnalytics(prev => ({
      ...prev,
      clicks: prev.clicks + 1,
    }));
    addTimelineEvent('click');
    setStatus(clientRef.current.getStatus());
  }, [addTimelineEvent]);

  // Add to cart is tracked as a click event (per Topsort docs)
  // "Click tracking fires on product clicks, including 'Add to Cart' if applicable"
  const trackAddToCart = useCallback((
    productId: string,
    quantity: number,
    unitPrice: number,
    resolvedBidId?: string
  ) => {
    if (!clientRef.current) return;

    // Only send click event if it's a sponsored product (has resolvedBidId)
    if (resolvedBidId) {
      clientRef.current.reportEvent({
        clicks: [{
          resolvedBidId,
          id: crypto.randomUUID(),
          occurredAt: new Date().toISOString(),
        }],
      });
    }

    setAnalytics(prev => ({
      ...prev,
      addToCarts: prev.addToCarts + 1,
    }));
    addTimelineEvent('addToCart', productId, unitPrice * quantity);
    setStatus(clientRef.current.getStatus());
  }, [addTimelineEvent]);

  // Uses reportEvent with documented structure: { purchases: [...] }
  const trackPurchase = useCallback((
    productId: string,
    quantity: number,
    unitPrice: number,
    resolvedBidId?: string
  ) => {
    if (!clientRef.current) return;
    const revenue = unitPrice * quantity;
    const isAttributed = !!resolvedBidId;

    clientRef.current.reportEvent({
      purchases: [{
        id: crypto.randomUUID(),
        occurredAt: new Date().toISOString(),
        items: [{ productId, quantity, unitPrice }],
        ...(resolvedBidId ? { resolvedBidId } : {}),
      }],
    });
    setAnalytics(prev => ({
      ...prev,
      purchases: prev.purchases + 1,
      revenue: prev.revenue + revenue,
      // Track attributed vs organic separately
      attributedPurchases: prev.attributedPurchases + (isAttributed ? 1 : 0),
      organicPurchases: prev.organicPurchases + (isAttributed ? 0 : 1),
      attributedRevenue: prev.attributedRevenue + (isAttributed ? revenue : 0),
      organicRevenue: prev.organicRevenue + (isAttributed ? 0 : revenue),
    }));
    addTimelineEvent('purchase', productId, revenue);
    setStatus(clientRef.current.getStatus());
  }, [addTimelineEvent]);

  const clearLogs = useCallback(() => {
    setApiLogs([]);
  }, []);

  const clearAnalytics = useCallback(() => {
    setAnalytics(initialAnalytics);
  }, []);

  const setErrorSimulation = useCallback((enabled: boolean) => {
    import('@/mock/mock-server').then(({ setErrorSimulation: setErr }) => {
      setErr(enabled, 0.3);
    });
  }, []);

  // Poll status periodically
  useEffect(() => {
    if (!isInitialized || !clientRef.current) return;

    const interval = setInterval(() => {
      if (clientRef.current) {
        setStatus(clientRef.current.getStatus());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isInitialized]);

  return (
    <TopsortContext.Provider value={{
      isInitialized,
      status,
      apiLogs,
      analytics,
      initialize,
      runAuction,
      trackImpression,
      trackViewability,
      trackClick,
      trackAddToCart,
      trackPurchase,
      clearLogs,
      clearAnalytics,
      setErrorSimulation,
    }}>
      {children}
    </TopsortContext.Provider>
  );
}

export function useTopsortContext() {
  const context = useContext(TopsortContext);
  if (!context) {
    throw new Error('useTopsortContext must be used within a TopsortProvider');
  }
  return context;
}
