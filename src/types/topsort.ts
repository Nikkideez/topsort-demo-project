/**
 * Topsort API Type Definitions
 * Based on Topsort's Auction and Events API
 */

// Auction API Types
export interface AuctionRequest {
  auctions: AuctionSlot[];
}

export interface AuctionSlot {
  type: 'listings' | 'banners';
  slots: number;
  slotId?: string;
  products?: ProductFilter;
  category?: CategoryFilter;
  geoTargeting?: GeoTargeting;
}

export interface ProductFilter {
  ids: string[];
}

export interface CategoryFilter {
  id: string;
}

export interface GeoTargeting {
  location: string;
}

export interface AuctionResponse {
  results: AuctionResult[];
}

export interface AuctionResult {
  resultType: 'listings' | 'banners';
  winners: Winner[];
  error?: AuctionError;
}

export interface Winner {
  rank: number;
  type: 'product' | 'vendor' | 'brand' | 'url';
  id: string;
  resolvedBidId: string;
  winnerPrice: number;
}

export interface AuctionError {
  code: string;
  message: string;
}

// Events API Types - Matches documented Topsort API structure
// Events are sent in separate arrays: { impressions: [...], clicks: [...], purchases: [...] }

export interface Impression {
  resolvedBidId: string;
  id: string;                    // Unique event ID (crypto.randomUUID())
  occurredAt: string;            // ISO timestamp
  opaqueUserId?: string;         // Your user identifier
  placement: {
    path: string;                // e.g., '/search/winter'
  };
}

export interface Click {
  resolvedBidId: string;
  id: string;
  occurredAt: string;
  opaqueUserId?: string;
}

export interface Purchase {
  id: string;
  occurredAt: string;
  opaqueUserId?: string;
  items: PurchaseItem[];
  // resolvedBidId is optional for purchases (can be organic)
  resolvedBidId?: string;
}

export interface PurchaseItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

// Request structure for reportEvent - matches documented API
export interface EventsRequest {
  impressions?: Impression[];
  clicks?: Click[];
  purchases?: Purchase[];
}

// Legacy types kept for backwards compatibility in demo UI
export type EventType = 'impression' | 'click' | 'purchase';

export interface EventResponse {
  id: string;
  status: 'received' | 'processed' | 'failed';
}

// Integration Status Types
export interface IntegrationStatus {
  apiHealth: 'healthy' | 'degraded' | 'down';
  lastAuctionCall: Date | null;
  lastEventSent: Date | null;
  auctionSuccessRate: number;
  eventsSentToday: number;
  errors: ApiError[];
}

export interface ApiError {
  timestamp: Date;
  endpoint: string;
  message: string;
  statusCode?: number;
}

// Product Types (for our mock e-commerce)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  vendor: string;
  rating: number;
  reviewCount: number;
}

export interface SponsoredProduct extends Product {
  isSponsored: true;
  resolvedBidId: string;
  rank: number;
}

export type CatalogProduct = Product | SponsoredProduct;

export function isSponsored(product: CatalogProduct): product is SponsoredProduct {
  return 'isSponsored' in product && product.isSponsored === true;
}
