# WorkHub: Architecture

> **Status:** Draft. Expand as decisions are made. Record major decisions as short ADRs in `docs/adr/`.

## Overview

Multi-tenant B2B SaaS where companies (tenants) manage departments, employees, roles, leave, and announcements. The core goals are **database-enforced tenant isolation** and **resource-scoped RBAC**.

## Stack

| Layer | Choice |
|---|---|
| API | Node.js, Express, TypeScript (ES modules) |
| Frontend | React (Vite) |
| Database | PostgreSQL on Neon (pooled connection in serverless contexts) |
| ORM | Drizzle (raw SQL only for RLS policies and admin analytics) |
| Jobs | BullMQ + Redis |
| Auth | JWT, tenant-scoped |
| Infra | Docker (multi-stage), docker-compose, GitHub Actions CI |
| Deploy | Render or Vercel (app) + Neon (DB) |

## Repo Layout

```
workhub/
  apps/
    api/          # Express API + worker
    web/          # React frontend
  packages/
    shared/       # zod schemas and types shared by api and web
  docs/
    architecture.md
    adr/
  .github/workflows/
```

## Backend Structure

Modular monolith using feature folders (vertical slices), not layers.

```
apps/api/src/
  modules/    # auth, tenants, departments, employees, leave, announcements, audit
  shared/     # db, middleware, jobs
  app.ts      # Express app setup
  server.ts   # HTTP entry point
  worker.ts   # BullMQ worker entry point
```

## Multi-Tenancy

- Shared database; every tenant-scoped table has a `tenant_id`.
- Postgres Row-Level Security is enabled on every tenant-scoped table.
- The app connects as a limited role (not the table owner); migrations use a separate role; tables use `FORCE ROW LEVEL SECURITY`.
- Tenant is resolved once per request in middleware and set as transaction-local Postgres context (`set_config('app.tenant_id', ..., true)`).
- All DB access goes through a `withTenant(tenantId, fn)` helper.

## Auth and RBAC

- JWT access tokens carry the tenant claim.
- Roles: Owner, Admin, Manager, Employee.
- Permissions are resource-scoped (for example, a Manager approves leave only for their own department).
- Invite-based onboarding with expiring, single-use tokens.

## Background Jobs

- BullMQ + Redis, run by a separate worker process (`worker.ts`).
- Jobs: leave-balance recalculation and monthly summary report.
- Nothing heavy is computed inside a request.

## Data Conventions

- Postgres: `snake_case`. JS/TS: `camelCase`. Classes and React components: `PascalCase`.
- Employees are archived, never hard-deleted.
- Audit log is append-only.

## Deployment

- Local: `docker compose up` runs app, worker, Postgres, and Redis.
- CI: lint, typecheck, test, build, deploy.
- `/health` endpoint for liveness checks.

## Open Questions

- Fixed four roles, or a per-tenant configurable `roles` table?
- Tenant resolution for v1: subdomain or JWT claim only?
- WorkHub