/**
 * Topsort API Client
 *
 * A TypeScript client for integrating with Topsort's Auction and Events APIs.
 * This demonstrates proper API integration patterns including:
 * - Type-safe request/response handling
 * - Error handling and retry logic
 * - Request/response logging for debugging
 * - Event batching for performance
 */

import type {
  AuctionRequest,
  AuctionResponse,
  EventsRequest,
  EventResponse,
  IntegrationStatus,
  ApiError,
} from '../types/topsort';

export interface TopsortConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  onRequest?: (endpoint: string, data: unknown) => void;
  onResponse?: (endpoint: string, data: unknown, duration: number) => void;
  onError?: (error: ApiError) => void;
}

const DEFAULT_BASE_URL = 'https://api.topsort.com/v2';
const DEFAULT_TIMEOUT = 5000;

export class TopsortClient {
  private config: Required<TopsortConfig>;
  private status: IntegrationStatus;
  private pendingEvents: EventsRequest = {};
  private flushInterval: ReturnType<typeof setInterval> | null = null;

  constructor(config: TopsortConfig) {
    this.config = {
      baseUrl: DEFAULT_BASE_URL,
      timeout: DEFAULT_TIMEOUT,
      onRequest: () => {},
      onResponse: () => {},
      onError: () => {},
      ...config,
    };

    this.status = {
      apiHealth: 'healthy',
      lastAuctionCall: null,
      lastEventSent: null,
      auctionSuccessRate: 100,
      eventsSentToday: 0,
      errors: [],
    };

    // Start event batching (flush every 2 seconds)
    this.startEventBatching();
  }

  /**
   * Create an auction to get sponsored product placements
   * Matches documented API: topsortClient.createAuction()
   */
  async createAuction(request: AuctionRequest): Promise<AuctionResponse> {
    const startTime = Date.now();
    const endpoint = '/auctions';

    this.config.onRequest(endpoint, request);

    try {
      const response = await this.fetch<AuctionResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      this.status.lastAuctionCall = new Date();
      this.updateSuccessRate(true);
      this.config.onResponse(endpoint, response, Date.now() - startTime);

      return response;
    } catch (error) {
      this.updateSuccessRate(false);
      this.handleError(endpoint, error);
      throw error;
    }
  }

  /**
   * Report events to Topsort
   * Matches documented API: topsortClient.reportEvent({ impressions, clicks, purchases })
   */
  reportEvent(events: EventsRequest): void {
    // Merge incoming events with pending events
    if (events.impressions) {
      this.pendingEvents.impressions = [
        ...(this.pendingEvents.impressions || []),
        ...events.impressions,
      ];
    }
    if (events.clicks) {
      this.pendingEvents.clicks = [
        ...(this.pendingEvents.clicks || []),
        ...events.clicks,
      ];
    }
    if (events.purchases) {
      this.pendingEvents.purchases = [
        ...(this.pendingEvents.purchases || []),
        ...events.purchases,
      ];
    }
  }

  /**
   * Immediately flush all queued events
   */
  async flushEvents(): Promise<EventResponse[]> {
    const hasEvents =
      (this.pendingEvents.impressions?.length || 0) > 0 ||
      (this.pendingEvents.clicks?.length || 0) > 0 ||
      (this.pendingEvents.purchases?.length || 0) > 0;

    if (!hasEvents) return [];

    const eventsToSend = { ...this.pendingEvents };
    this.pendingEvents = {};

    const startTime = Date.now();
    const endpoint = '/events';

    this.config.onRequest(endpoint, eventsToSend);

    const eventCount =
      (eventsToSend.impressions?.length || 0) +
      (eventsToSend.clicks?.length || 0) +
      (eventsToSend.purchases?.length || 0);

    try {
      const response = await this.fetch<EventResponse[]>(endpoint, {
        method: 'POST',
        body: JSON.stringify(eventsToSend),
      });

      this.status.lastEventSent = new Date();
      this.status.eventsSentToday += eventCount;
      this.config.onResponse(endpoint, response, Date.now() - startTime);

      return response;
    } catch (error) {
      // Re-queue events on failure
      this.reportEvent(eventsToSend);
      this.handleError(endpoint, error);
      throw error;
    }
  }

  /**
   * Get current integration status
   */
  getStatus(): IntegrationStatus {
    return { ...this.status };
  }

  /**
   * Clear error history
   */
  clearErrors(): void {
    this.status.errors = [];
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  private async fetch<T>(endpoint: string, options: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...options.headers,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private startEventBatching(): void {
    this.flushInterval = setInterval(() => {
      const hasEvents =
        (this.pendingEvents.impressions?.length || 0) > 0 ||
        (this.pendingEvents.clicks?.length || 0) > 0 ||
        (this.pendingEvents.purchases?.length || 0) > 0;

      if (hasEvents) {
        this.flushEvents().catch(() => {
          // Error already handled in flushEvents
        });
      }
    }, 2000);
  }

  private updateSuccessRate(success: boolean): void {
    // Simple moving average over last 10 calls
    const weight = 0.1;
    const newValue = success ? 100 : 0;
    this.status.auctionSuccessRate =
      this.status.auctionSuccessRate * (1 - weight) + newValue * weight;
  }

  private handleError(endpoint: string, error: unknown): void {
    const apiError: ApiError = {
      timestamp: new Date(),
      endpoint,
      message: error instanceof Error ? error.message : 'Unknown error',
    };

    this.status.errors.unshift(apiError);
    this.status.errors = this.status.errors.slice(0, 10); // Keep last 10 errors

    if (this.status.auctionSuccessRate < 50) {
      this.status.apiHealth = 'down';
    } else if (this.status.auctionSuccessRate < 80) {
      this.status.apiHealth = 'degraded';
    }

    this.config.onError(apiError);
  }
}

// Singleton instance for the demo
let clientInstance: TopsortClient | null = null;

export function initializeTopsortClient(config: TopsortConfig): TopsortClient {
  if (clientInstance) {
    clientInstance.destroy();
  }
  clientInstance = new TopsortClient(config);
  return clientInstance;
}

export function getTopsortClient(): TopsortClient {
  if (!clientInstance) {
    throw new Error('Topsort client not initialized. Call initializeTopsortClient first.');
  }
  return clientInstance;
}
