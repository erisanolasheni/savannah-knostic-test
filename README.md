# Tiny Inventory

A small, full-stack inventory management system built with minimal overhead and strong architectural typing. The frontend UI uses [shadcn/ui](https://ui.shadcn.com) components (Button, Card, Input, Label, Select, Table, Badge, Progress, Chart, AlertDialog, Skeleton, Sonner) added via the official CLI; see `web/components.json` and `web/src/components/ui/`. Dashboard charts use shadcn Chart (Recharts) and Progress; search inputs use a leading icon where appropriate; redundant section labels are omitted in favor of aria-labels and placeholders.

## Run Instructions

Start the full stack with a single command:

```bash
docker compose up --build
```

This will:
1. Boot the backend server at `http://localhost:3000` (auto-runs migrations and seeds the SQLite DB).
2. Boot the frontend application at `http://localhost:5173`.

> To run tests:
> - Backend: `cd server && npm run test`
> - Frontend: `cd web && npm install && npx vitest run`

## How to interact with the system

After `docker compose up --build`, open **http://localhost:5173** in your browser.

- **Dashboard** — Totals (stores, products, stock, value), inventory value by store, and by category; includes a simple bar chart.
- **Products** — List all products with filters (store, category), search, and sort. Use “Add Product” to create; “Manage” to view or edit a product (including quantity; “Out of stock” and “Low stock” badges appear where relevant). Footer shows total units and value for the current page.
- **Stores** — List stores; add, view, edit, or delete. On a store detail page you see its inventory value and a link to “View products in this store” for a filtered product list with search and sort.

All list views use URL query params for filters and pagination, so you can bookmark or share links. The API at **http://localhost:3000** is REST; use the endpoints below for direct integration.

## API Sketch (5–10 lines)

* **Stores:** `GET/POST /stores`, `GET/PATCH/DELETE /stores/:id`; `GET /stores/:id/products` (paginated, filterable, search `q`, `sortBy`/`sortOrder`); `GET /stores/:id/inventory-value` (total items + value, single query).
* **Products:** `GET /products` (filters: storeId, category, price, stock; search `q` on name/category; `sortBy`/`sortOrder`; pagination), `GET/POST /products`, `GET/PATCH/DELETE /products/:id`.
* **Dashboard:** `GET /api/dashboard` — global and per-store inventory value, per-category (efficient aggregation).
* **Ops:** `GET /health` (liveness + DB), `GET /metrics` (Prometheus), `GET /api/metrics` (JSON).

## Decisions & Trade-offs

This project was built with a strong focus on **clarity, correctness, and simple yet robust architecture**. 

### 1. Persistence & Data Modeling
* **Choice**: File-based SQLite via **Prisma ORM**.
* **Reasoning**: It entirely removes external infrastructure dependencies while accurately representing relational data (Store ↔ Product). Using Prisma guarantees a strongly-typed API against SQL structures. (Note: Kept at Prisma v6 to maintain seamless `docker compose` startup without complex caching constraints).
* **Trade-off**: SQLite limits concurrent high-volume writes, but for a simple inventory demo, its zero-config startup far outweighs the need for Postgres scaling.

### 2. Backend & API Semantics
* **Choice**: **Node.js + Fastify** with **Zod** validation. Routes live in `server/src/routes/` and delegate to **services** (`server/src/services/`); route handlers only validate input and send responses—no direct DB or business logic in routes.
* **Reasoning**: Fastify natively offers massive routing performance and isolated scoping. By validating request schemas directly via Zod, we eliminate fragile `try...catch` boilerplate.
* **Production-Ready Semantics**: Errors are caught globally and serialized into an explicit contract (e.g., `{ error: 'VALIDATION_ERROR', details: [...] }`). Pagination utilizes standard `skip`/`take` limits avoiding query overloads.

### 3. Frontend & UX Basics
* **Choice**: **React + Vite** with **React Query** and **Tailwind CSS**. Reusable UI lives in `web/src/components/` (Layout, DataTable, forms, etc.); pages compose these and stay thin.
* **Reasoning**: React Query handles all async orchestration elegantly. The UI addresses critical UX metrics:
  - Global loading spinners and error states are handled safely.
  - Empty states (when filters return no matches) provide clear feedback.
  - Filtering operates dynamically across both Store and Category metrics alongside robust offset pagination.
  - **Stores** and **Products** each have full CRUD in the UI (list, add, view, edit, delete). Browser tab titles update per page.

### 4. Developer Experience (DX) & Docker
* **Choice**: Dockerized local environment with an **idempotent** seed script (`prisma/seed.ts`). Seed uses `upsert` on a deterministic `seedKey` so re-running (e.g. on every container start) does not duplicate data.
* **Reasoning**: Reviewers and engineers need to run systems without fighting environment variables. A single `docker compose up --build` ensures migrations sync and seed data populates; healthchecks and `depends_on: service_healthy` ensure the web app starts after the API is ready.
* **Docker practices**: `.dockerignore` in server and web reduces build context (excludes `node_modules`, tests, logs, `.git`). Server image uses `npm ci` for reproducible installs and copies only `src` and `prisma` after install. Web uses a multi-stage build (builder stage for `npm ci` + `npm run build`, final stage only `dist`); final image runs as non-root user and uses `npx serve` so no global install is required.

### 5. Query Efficiency & Non-Trivial Aggregation
* **Choice**: Per-store inventory value is a **single raw SQL query** (JOIN stores + products, GROUP BY, SUM). Dashboard aggregation uses three parallel raw queries (global stats, by store, by category) with no N+1. Store products list uses two round-trips (store existence + count/list in parallel).
* **Trade-off**: Documented in code and README so reviewers see proof of efficient, complex querying.

### 6. Project Structure & Module System
* **Choice**: Server and web use **ESM** (`import`/`export`). Entry point uses a dual check (`require.main === module` when available, or `process.argv[1]` path) so the same file works when run directly or imported by tests. Shared `errors.ts`, `lib/productFilters.ts`, and global error handler keep routes thin.

## Testing Approach

* **Backend**: Run with `cd server && npm run test` (Vitest). Integration tests use `supertest` against the Fastify instance and real SQLite. Coverage includes: CRUD (stores, products), validation (400), not-found (404), BadRequest (invalid storeId), PATCH/DELETE, inventory-value aggregation, health, dashboard, and metrics.
* **Frontend**: `@testing-library/react` with `jsdom`. The suite verifies core component rendering, Provider context, and loading cascades. 

## Production Readiness

To ensure the system represents production-grade architecture (despite being a small assignment), several specific defenses and standardizations were utilized:

1. **Centralized Error Handling**: Rather than scattering generic error responses inside route handlers, validation errors from Zod and internal exceptions are piped through a globally registered Fastify error boundary (`server.setErrorHandler`). This guarantees the frontend always receives mathematically consistent REST error shapes.
2. **Schema-Driven Boundaries**: Every incoming write payload (`POST /products`, `PATCH`) and query parameter mapping (`productFilterSchema`) passes through explicit Zod typings. Type coercions (string to number, etc.) execute concurrently and automatically deny dirty inputs with `400 Bad Request`.
3. **Database Guardrails**: Model deletes cascade naturally (e.g., deleting a Store handles orphaned children). Relationships in Prisma enforce relational integrity. Indexes (`@@index`) were intentionally placed on `storeId` and `category` fields where read-heavy filtering executes.
4. **Resilient Frontend Fetching**: React Query implicitly manages polling hooks, retry waterfalls on network failure, and window-focus cache invalidations—making the data fetching logic massively resilient without engineering heavy websockets or local storage replicas.
5. **Observability**: `GET /health` checks DB connectivity (used by Docker healthcheck). `GET /metrics` exposes Prometheus-style request count and average duration; `GET /api/metrics` returns JSON. The UI **Dashboard** tab shows total inventory value, by store and by category.

## If I Had More Time

* Add a unified Monorepo framework (e.g., Turborepo) to directly share backend Zod schemas with frontend React Query payloads for end-to-end type safety.
* Apply a genuine Optimistic Update pattern in `React Query` on the `PATCH /products/:id` call to create instant zero-latency feedback on stock updates.
* Transition from Offset-based pagination to Keyset/Cursor-based pagination to ensure robust query performance if the product catalog scaled beyond millions of rows.
* Grafana dashboard scraping `/metrics`; OpenTelemetry for distributed tracing.
