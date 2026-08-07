# Architecture Overview

## System Architecture

```
┌─────────────────────┐        ┌─────────────────────────┐        ┌──────────────┐
│                     │  HTTP  │                         │        │              │
│   React Client      │◄──────►│   Express Server        │◄──────►│   MongoDB    │
│   (Vite + MUI)      │  API   │   (TypeScript)          │        │              │
│                     │        │                         │        │  - Users     │
│   Port: 5173        │        │   Port: 5000            │        │  - Sessions  │
│                     │        │   /api/v1/*             │        │  - Data      │
└─────────────────────┘        └─────────────────────────┘        └──────────────┘
         │                                │
         │ Session Cookie                 │ connect-mongo
         │ (httpOnly)                     │ (session store)
         └────────────────────────────────┘
```

## Authentication Flow

1. **Login:** Client sends email/password → Server validates → Creates session → Returns cookie
2. **Signup:** Client sends signup data + role → Server checks flag (admin) → Creates user + session → Returns cookie
3. **Authenticated Requests:** Browser sends cookie automatically → Server reads session → Attaches user to `req.session`
4. **Authorization:** Role middleware checks `req.session.user.role` against allowed roles
5. **Logout:** Server destroys session → Cookie cleared

## Request Lifecycle

```
Client Request
  → CORS Middleware
  → Helmet (Security Headers)
  → Body Parser
  → Session Middleware (express-session + connect-mongo)
  → Route Matching
    → Validation Middleware (Zod)
    → Auth Middleware (session check) — skipped for public routes
    → Role Middleware (RBAC) — for protected routes
    → Controller
      → Service (business logic)
        → Model (database operations)
      ← Response
  → Error Middleware (centralized error handler)
```

## Frontend Layout

```
┌───────────────────────────────────────────────────┐
│  AppBar (Header)                    [User] [Logout]│
├──────────┬────────────────────────────────────────┤
│          │  Breadcrumb: Home > Users              │
│ Sidebar  │                                        │
│          │  ┌──────────────────────────────────┐  │
│ Dashboard│  │                                  │  │
│ Users    │  │         Page Content             │  │
│ Vendors  │  │                                  │  │
│ Reports  │  │                                  │  │
│ Profile  │  │                                  │  │
│ Settings │  │                                  │  │
│          │  └──────────────────────────────────┘  │
└──────────┴────────────────────────────────────────┘
```

## Tech Stack Summary

| Layer         | Technology                                    |
| ------------- | --------------------------------------------- |
| Frontend      | React 18+, TypeScript, Vite, MUI              |
| Forms         | Formik + Yup                                  |
| HTTP Client   | Axios (withCredentials for cookies)            |
| Backend       | Express.js, TypeScript                        |
| Validation    | Zod                                           |
| Auth          | express-session + connect-mongo + bcrypt       |
| Database      | MongoDB + Mongoose                            |
| Logging       | Winston                                       |
| Security      | Helmet, CORS, rate limiting                   |
| Code Quality  | ESLint, Prettier, Husky                       |

## Key Architectural Decisions

1. **Session-based auth over JWT** — Simpler model, server-side state, easy invalidation
2. **Feature-based backend** — Each feature self-contained with controllers, services, models, routes, validators
3. **Monorepo** — Client and server in one repository
4. **MUI only** — No mixing of CSS frameworks; consistent design system
5. **Zod (server) + Yup (client)** — Type-safe validation on both ends
6. **Config.ts pattern** — All env variables centralized, no direct `process.env`
7. **Server-side feature flags** — `ALLOW_ADMIN_SIGNUP` controls admin registration, exposed via public config endpoint
8. **Left sidebar navigation** — Persistent MUI Drawer with role-based menu filtering

## Related Documents

- [Authentication & Authorization](authentication.md)
- [Database Design](database-design.md)
- [Folder Structure](folder-structure.md)
