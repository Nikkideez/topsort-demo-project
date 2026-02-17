/**
 * Mock Topsort API Server
 *
 * Intercepts API calls and returns realistic responses for demo purposes.
 * Includes personalization based on purchase history.
 */

import type {
  AuctionRequest,
  AuctionResponse,
  Winner,
  EventResponse,
} from '../types/topsort';
import { mockProducts } from './products';

// Simulated latency range (ms)
const MIN_LATENCY = 50;
const MAX_LATENCY = 200;

// Store original fetch
const originalFetch = window.fetch;

// Default sponsored products (before any purchases)
const DEFAULT_SPONSORED_IDS = ['prod-002', 'prod-006', 'prod-011'];

// Products available for sponsorship by category
const SPONSORED_BY_CATEGORY: Record<string, string[]> = {
  electronics: ['prod-001', 'prod-002', 'prod-005', 'prod-006', 'prod-009'],
  home: ['prod-010', 'prod-012'],
  lifestyle: ['prod-007'],
  fitness: ['prod-008'],
  food: ['prod-003'],
  furniture: ['prod-004'],
  accessories: ['prod-011'],
};

// Purchase history tracking
interface PurchaseHistory {
  categories: Map<string, number>; // category -> purchase count
  productIds: Set<string>;
}

const purchaseHistory: PurchaseHistory = {
  categories: new Map(),
  productIds: new Set(),
};

// Error simulation
let simulateErrors = false;
let errorRate = 0;

export function setErrorSimulation(enabled: boolean, rate: number = 0.3): void {
  simulateErrors = enabled;
  errorRate = rate;
}

export function getPurchaseHistory(): PurchaseHistory {
  return purchaseHistory;
}

export function clearPurchaseHistory(): void {
  purchaseHistory.categories.clear();
  purchaseHistory.productIds.clear();
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomLatency(): number {
  return MIN_LATENCY + Math.random() * (MAX_LATENCY - MIN_LATENCY);
}

function shouldSimulateError(): boolean {
  return simulateErrors && Math.random() < errorRate;
}

function generateBidId(): string {
  return `bid_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function getPersonalizedSponsoredProducts(slots: number): typeof mockProducts {
  // If no purchase history, return default sponsored products
  if (purchaseHistory.categories.size === 0) {
    return mockProducts.filter(p => DEFAULT_SPONSORED_IDS.includes(p.id)).slice(0, slots);
  }

  // Sort categories by purchase frequency
  const sortedCategories = Array.from(purchaseHistory.categories.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  // Get related categories (for cross-sell)
  const relatedCategories: Record<string, string[]> = {
    electronics: ['accessories', 'home'],
    accessories: ['electronics', 'lifestyle'],
    fitness: ['lifestyle', 'food'],
    home: ['electronics', 'furniture'],
    lifestyle: ['fitness', 'accessories'],
    food: ['lifestyle', 'home'],
    furniture: ['home', 'electronics'],
  };

  // Build candidate pool: prioritize purchased categories + related categories
  const candidateIds: string[] = [];

  // First, add products from purchased categories
  for (const category of sortedCategories) {
    const categoryProducts = SPONSORED_BY_CATEGORY[category] || [];
    // Don't re-advertise products they already bought
    const filtered = categoryProducts.filter(id => !purchaseHistory.productIds.has(id));
    candidateIds.push(...filtered);
  }

  // Then add related category products
  for (const category of sortedCategories) {
    const related = relatedCategories[category] || [];
    for (const relatedCat of related) {
      const categoryProducts = SPONSORED_BY_CATEGORY[relatedCat] || [];
      const filtered = categoryProducts.filter(
        id => !purchaseHistory.productIds.has(id) && !candidateIds.includes(id)
      );
      candidateIds.push(...filtered);
    }
  }

  // If we still need more, add remaining products
  if (candidateIds.length < slots) {
    const remaining = mockProducts
      .filter(p => !purchaseHistory.productIds.has(p.id) && !candidateIds.includes(p.id))
      .map(p => p.id);
    candidateIds.push(...remaining);
  }

  // Get unique product objects
  const uniqueIds = [...new Set(candidateIds)].slice(0, slots);
  return uniqueIds
    .map(id => mockProducts.find(p => p.id === id))
    .filter((p): p is typeof mockProducts[0] => p !== undefined);
}

async function handleAuctionRequest(request: AuctionRequest): Promise<AuctionResponse> {
  await delay(randomLatency());

  if (shouldSimulateError()) {
    throw new Error('Auction service temporarily unavailable');
  }

  const results = request.auctions.map(auction => {
    // Get personalized sponsored products
    const sponsoredProducts = getPersonalizedSponsoredProducts(auction.slots);

    const winners: Winner[] = sponsoredProducts.map((product, index) => ({
      rank: index + 1,
      type: 'product' as const,
      id: product.id,
      resolvedBidId: generateBidId(),
      winnerPrice: Math.random() * 0.5 + 0.1, // $0.10 - $0.60 CPC
    }));

    return {
      resultType: auction.type,
      winners,
    };
  });

  return { results };
}

interface EventsRequestBody {
  impressions?: Array<{ resolvedBidId: string; id: string; occurredAt: string }>;
  clicks?: Array<{ resolvedBidId: string; id: string; occurredAt: string }>;
  purchases?: Array<{ id: string; items?: Array<{ productId: string }> }>;
}

async function handleEventsRequest(body: EventsRequestBody): Promise<EventResponse[]> {
  await delay(randomLatency());

  if (shouldSimulateError()) {
    throw new Error('Events service temporarily unavailable');
  }

  const responses: EventResponse[] = [];

  // Process impressions
  if (body.impressions) {
    for (const impression of body.impressions) {
      responses.push({
        id: impression.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        status: 'received' as const,
      });
    }
  }

  // Process clicks
  if (body.clicks) {
    for (const click of body.clicks) {
      responses.push({
        id: click.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        status: 'received' as const,
      });
    }
  }

  // Process purchases - track for personalization
  if (body.purchases) {
    for (const purchase of body.purchases) {
      if (purchase.items) {
        for (const item of purchase.items) {
          const product = mockProducts.find(p => p.id === item.productId);
          if (product) {
            // Track the category
            const currentCount = purchaseHistory.categories.get(product.category) || 0;
            purchaseHistory.categories.set(product.category, currentCount + 1);
            // Track the product ID
            purchaseHistory.productIds.add(item.productId);
          }
        }
      }
      responses.push({
        id: purchase.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        status: 'received' as const,
      });
    }
  }

  return responses;
}

function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  // Only intercept Topsort API calls
  if (!url.includes('api.topsort.com')) {
    return originalFetch(input, init);
  }

  return (async () => {
    try {
      const body = init?.body ? JSON.parse(init.body as string) : {};

      let responseData: unknown;

      if (url.includes('/auctions')) {
        responseData = await handleAuctionRequest(body);
      } else if (url.includes('/events')) {
        responseData = await handleEventsRequest(body);
      } else {
        throw new Error(`Unknown endpoint: ${url}`);
      }

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Internal error';
      return new Response(JSON.stringify({ message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  })();
}

export function enableMockServer(): void {
  window.fetch = mockFetch;
  console.log('[Topsort Demo] Mock server enabled - API calls will be simulated');
}

export function disableMockServer(): void {
  window.fetch = originalFetch;
  console.log('[Topsort Demo] Mock server disabled - API calls will go to real endpoints');
}
