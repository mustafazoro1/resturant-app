# RFC - Real Farmers Chicken

A full-featured restaurant ordering mobile app (React Native / Expo) modeled after KFC but branded as RFC — Real Farmers Chicken. Green and red theme with Pakistani branch locations.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo mobile app
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (for future backend use)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54 + Expo Router (file-based routing)
- State: React Context + AsyncStorage (cart, branch, orders)
- Styling: React Native StyleSheet + expo-linear-gradient
- Icons: @expo/vector-icons (Feather)
- API: Express 5 (backend stub, ready for Firebase integration)
- DB: PostgreSQL + Drizzle ORM (ready for future backend)

## Where things live

- `artifacts/mobile/` — Expo mobile app
- `artifacts/mobile/app/` — Expo Router screens
- `artifacts/mobile/app/(tabs)/` — Tab screens (Home, Menu, Cart, Orders, Profile)
- `artifacts/mobile/contexts/` — CartContext, BranchContext, OrderContext
- `artifacts/mobile/constants/data.ts` — Menu items (35+), branches (11), deals (4)
- `artifacts/mobile/constants/colors.ts` — RFC green/red theme tokens
- `artifacts/mobile/assets/images/` — RFC logo, hero banner, food images
- `artifacts/api-server/` — Express API server (stub, ready for Firebase)
- `lib/api-spec/openapi.yaml` — API contract (health check only currently)

## Architecture decisions

- Frontend-only first build: all state stored in AsyncStorage via React Context. No database needed for MVP.
- KFC-inspired UX: branch selector in header, order type toggle (Dine In / Takeaway / Delivery), deal cards, item detail with quantity selector.
- Order tracking simulation: OrderContext auto-advances order status (received → preparing → ready → delivered) using setTimeout for demo purposes. Replace with Firebase Realtime DB listeners.
- LinearGradient used for category color-coding: each food category has a unique gradient color pair for visual distinction without real food photos.
- Cart badge in tab bar uses tabBarBadge prop (ClassicTabLayout) and NativeTabs for iOS 26+.

## Product

RFC (Real Farmers Chicken) is a KFC-style fast food ordering app featuring:
- **Branch Selection**: 11 branches across Karachi, Lahore, and Islamabad (Naval Colony, Buns Road, DHA, Clifton, etc.)
- **Full Menu**: 35+ items across 7 categories (Deals, Chicken, Burgers, Wraps, Sides, Drinks, Desserts)
- **Order System**: Dine In / Takeaway / Delivery modes, cart management, checkout with payment method selection
- **Order Tracking**: Real-time status progression (Received → Preparing → Ready → Delivered)
- **Green & Red Theme**: RFC's distinctive dark green (#1B5E20) and red (#C8102E) branding

## User preferences

- Green and red theme (primary: #1B5E20, accent: #C8102E)
- KFC-style ordering flow (same system, different RFC branding)
- Pakistani branches: Naval Colony, Buns Road, DHA, Clifton, North Nazimabad, etc.
- Firebase backend planned for future development
- Prices in Pakistani Rupees (Rs.)

## Gotchas

- RFC logo and food images are AI-generated and saved in `assets/images/`. Replace with real brand assets for production.
- Order status progression uses setTimeout (30s, 90s, 60s delays) for demo. Replace with Firebase listeners.
- Firebase auth/DB integration stubbed — the Sign In button shows "Coming Soon" alert. Wire up Firebase SDK when ready.
- Image generation outputs PNG files; update require() paths if file names change.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo-specific patterns
