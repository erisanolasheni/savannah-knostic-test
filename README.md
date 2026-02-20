# Tiny Inventory

A small, full-stack inventory management system built with minimal overhead and strong architectural typing.

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

## API Sketch

* `GET /stores` - Fetch all stores.
* `GET /stores/:id` - Fetch single store details.
* `POST /stores` - Create a new store.
* `GET /products` - Fetch all products with filtering (`storeId`, `category`, `minPrice`, `maxPrice`, `minStock`) and pagination.
* `GET /stores/:id/products` - Fetch products for a specific store.
* `GET /stores/:id/inventory-value` - **(Non-trivial)** Aggregates total items and computes total monetary stock value.
* `GET /products/:id` - Fetch a specific product.
* `POST /products` - Create a new product.
* `PATCH /products/:id` - Partial update for a specific product.

## Decisions & Trade-offs

This project was built with a strong focus on **clarity, correctness, and simple yet robust architecture**. 

### 1. Persistence & Data Modeling
* **Choice**: File-based SQLite via **Prisma ORM**.
* **Reasoning**: It entirely removes external infrastructure dependencies while accurately representing relational data (Store ↔ Product). Using Prisma guarantees a strongly-typed API against SQL structures. (Note: Kept at Prisma v6 to maintain seamless `docker compose` startup without complex caching constraints).
* **Trade-off**: SQLite limits concurrent high-volume writes, but for a simple inventory demo, its zero-config startup far outweighs the need for Postgres scaling.

### 2. Backend & API Semantics
* **Choice**: **Node.js + Fastify** with **Zod** validation.
* **Reasoning**: Fastify natively offers massive routing performance and isolated scoping. By validating request schemas directly via Zod, we eliminate fragile `try...catch` boilerplate.
* **Production-Ready Semantics**: Errors are caught globally and serialized into an explicit contract (e.g., `{ error: 'VALIDATION_ERROR', details: [...] }`). Pagination utilizes standard `skip`/`take` limits avoiding query overloads.

### 3. Frontend & UX Basics
* **Choice**: **React + Vite** with **React Query** and **Tailwind CSS**.
* **Reasoning**: React Query handles all async orchestration elegantly. The UI addresses critical UX metrics:
  - Global loading spinners and error states are handled safely.
  - Empty states (when filters return no matches) provide clear feedback.
  - Filtering operates dynamically across both Store and Category metrics alongside robust offset pagination.

### 4. Developer Experience (DX)
* **Choice**: Dockerized local environment with an auto-seeding script (`prisma/seed.ts`).
* **Reasoning**: Reviewers and engineers need to run systems without fighting environment variables. A single `docker compose up --build` ensures migrations sync and seed data immediately populates, delivering a working app in seconds.

## Testing Approach

* **Backend**: Unit/Integration tests utilize `supertest` in conjunction with `vitest`. Instead of purely unit testing functions, we mock complete network cycles against the Fastify instance in memory. This validates real routing bindings, schema validation, and SQL integration collectively.
* **Frontend**: Utilized `@testing-library/react` integrated with `jsdom`. The test suite currently verifies core component rendering, Provider context bindings, and initial loading cascades without relying on brittle E2E overhead for the assignment bounds. 

## Production Readiness

To ensure the system represents production-grade architecture (despite being a small assignment), several specific defenses and standardizations were utilized:

1. **Centralized Error Handling**: Rather than scattering generic error responses inside route handlers, validation errors from Zod and internal exceptions are piped through a globally registered Fastify error boundary (`server.setErrorHandler`). This guarantees the frontend always receives mathematically consistent REST error shapes.
2. **Schema-Driven Boundaries**: Every incoming write payload (`POST /products`, `PATCH`) and query parameter mapping (`productFilterSchema`) passes through explicit Zod typings. Type coercions (string to number, etc.) execute concurrently and automatically deny dirty inputs with `400 Bad Request`.
3. **Database Guardrails**: Model deletes cascade naturally (e.g., deleting a Store handles orphaned children). Relationships in Prisma enforce relational integrity. Indexes (`@@index`) were intentionally placed on `storeId` and `category` fields where read-heavy filtering executes.
4. **Resilient Frontend Fetching**: React Query implicitly manages polling hooks, retry waterfalls on network failure, and window-focus cache invalidations—making the data fetching logic massively resilient without engineering heavy websockets or local storage replicas.

## If I Had More Time

* Add a unified Monorepo framework (e.g., Turborepo) to directly share backend Zod schemas with frontend React Query payloads for end-to-end type safety.
* Apply a genuine Optimistic Update pattern in `React Query` on the `PATCH /products/:id` call to create instant zero-latency feedback on stock updates.
* Transition from Offset-based pagination to Keyset/Cursor-based pagination to ensure robust query performance if the product catalog scaled beyond millions of rows.
