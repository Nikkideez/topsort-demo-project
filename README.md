# Topsort Integration Demo

A demonstration of Topsort Retail Media API integration for the Software Engineer (Integrations) role.

## Purpose

This project demonstrates practical integration skills with a local simulation of Topsort's Retail Media APIs:

- **Auctions API** - Running sponsored listing auctions with `createAuction()`
- **Events API** - Tracking impressions, clicks, and purchases with `reportEvent()`
- **Attribution** - Linking conversions to ad campaigns via `resolvedBidId`
- **ROAS Calculation** - Measuring return on ad spend using attributed revenue

## Features

- Product catalog with sponsored placements from auction winners
- IAB-compliant viewability tracking (50% visible for 1 second)
- Shopping cart with attribution preservation through checkout
- Real-time analytics dashboard with conversion funnel
- Request inspector showing API payloads
- Error simulation for testing resilience

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Recharts for data visualization
- Mock API server (client-side simulation)

## Getting Started

```bash
npm install
npm run dev
```

## Project Structure

```
src/
├── api/           # Topsort API client
├── components/    # UI components
├── context/       # React context (Topsort, Cart)
├── mock/          # Mock API server
├── pages/         # Page components
└── types/         # TypeScript definitions
```

## API Integration Pattern

```typescript
// Run auction for sponsored placements
const response = await topsort.createAuction({
  auctions: [{ type: 'listings', slots: 3 }]
});

// Track events for attribution
await topsort.reportEvent({
  impressions: [{ resolvedBidId, id, occurredAt, placement: { path } }],
  clicks: [{ resolvedBidId, id, occurredAt }],
  purchases: [{ id, occurredAt, items: [{ productId, quantity, unitPrice }] }]
});
```

## Documentation References

- [Auctions API](https://docs.topsort.com/reference/createauction)
- [Events API](https://docs.topsort.com/reference/reportevent)
- [Sponsored Listings](https://docs.topsort.com/en/api-reference/examples/sponsored-listings/search)
