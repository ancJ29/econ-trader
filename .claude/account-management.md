# Account Management System

## Overview
Multi-exchange trading account management with simulated API layer for future backend integration. Supports Binance and Bybit exchanges across spot, futures, and perpetual markets.

## Architecture

### Type System
- **Core Types** (`src/types/account.ts`): TypeScript definitions for trading entities
- **Validation** (`src/lib/schemas/account.ts`): Zod schemas for runtime validation
- **Exchange Support**: Binance (SPOT, USDS-M, COIN-M), Bybit (USDT/USDC Perpetual, Spot)

### Data Flow
```
UI Components → Zustand Store → Service Layer → API Client → In-Memory Storage
                      ↓                              ↓
                 State Management            Validation (Zod)
```

### Layer Responsibilities
1. **Store** (`accountStore.ts`): State management, UI state coordination
2. **Service** (`services/account.ts`): Business logic abstraction, future transformation point
3. **API Client** (`lib/api/account.ts`): HTTP simulation with deterministic delays, TODO markers for backend integration
4. **Storage**: In-memory with lazy initialization, seeded random data generation

## Key Features

### Account Operations
- CRUD operations with optimistic UI updates
- Status toggling (active/inactive)
- Market configuration per account
- Secret key security (never exposed in responses)

### Data Models
- **Balance Information**: Per-market coin balances with order locks
- **Position Tracking**: Long/short positions with PnL, leverage, liquidation prices
- **Order Management**: Open orders, order history with status tracking
- **Transaction History**: Trade, fee, funding records

## Security Considerations
- API keys stored, secret keys optional and hidden
- Deterministic ID generation for testing (`generateStableId`)
- Sanitized responses (secret keys stripped)

## Testing Strategy
- Dummy data with fixed seed for consistency
- 8 pre-configured test accounts
- Simulated API delays (200-500ms)

## Future Integration Points
- Replace in-memory storage with backend API calls
- Remove TODO comments in `accountApi` methods
- Implement real exchange API integrations
- Add WebSocket for real-time updates

## Technical Decisions
- **Zustand over Redux**: Simpler state management for current scope
- **Service Layer Pattern**: Abstraction for future API changes
- **Lazy Loading**: Accounts fetched on-demand
- **Error Boundaries**: Component-level error handling

## Performance Optimizations
- Selective re-renders via Zustand selectors
- Lazy initialization of dummy data
- Optimistic updates for better UX
- Cached account lookups in store

## Component Structure
- **Pages**: `Accounts.tsx` (list view), `AccountDetail.tsx` (detail view)
- **Components**: Modular tables for balances, positions, orders, history
- **Responsive**: Mobile-first with desktop optimizations