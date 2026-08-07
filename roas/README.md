# ROAS PrintFast

A Return on Ad Spend (ROAS) management application built on the MERN stack with TypeScript.

## Tech Stack

- **Frontend:** React 18+ with TypeScript, Material-UI (MUI), Vite
- **Backend:** Node.js, Express.js with TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Express-session with connect-mongo (session-based)
- **Validation:** Zod (backend), Yup + Formik (frontend)

## Project Structure

```
roas-printfast/
├── client/                # React frontend (Vite + TypeScript)
├── server/                # Express backend (TypeScript)
├── docs/                  # Project documentation
│   ├── requirements/      # Business requirements & user roles
│   ├── setup/             # Development setup guides
│   ├── architecture/      # Architecture decisions & design
│   ├── api/               # API endpoint specifications
│   └── database/          # Database schema documentation
├── .github/               # GitHub config & copilot instructions
├── .env.example           # Environment variable template
└── README.md              # This file
```

## User Roles

| Role         | Description                                           |
| ------------ | ----------------------------------------------------- |
| **God User** | Super admin with full system access (seed only)       |
| **Admin**    | Organization management, created by God User or signup (when enabled) |
| **Vendor**   | Limited vendor operations, created by God/Admin or self-signup |

See [docs/requirements/user-roles.md](docs/requirements/user-roles.md) for the full permissions matrix.

## Authentication

- **Login:** Email + password → server-side session
- **Signup:** Public page for Vendor (always) and Admin (when `ALLOW_ADMIN_SIGNUP=true`)
- **God User:** Created via seed script only — no signup or UI creation

## Dashboard

After login, users see a **left sidebar navigation** dashboard with role-based menu items:
- Dashboard, Users, Vendors, Reports, Profile, Settings

## Quick Start

ROAS lives inside the **PrintFast monorepo** and is managed with pnpm from the
repo root. See the [root README](../README.md) for the full workspace layout.

### Prerequisites

- Node.js >= 20.x
- pnpm >= 10.x
- MongoDB >= 6.x (Atlas connection string, or a local server)

### 1. Install

From the repo root — one install covers every app:

```bash
pnpm install
```

### 2. Configure environment

There is a **single `.env` at the repo root** for the whole monorepo; the
server walks up to find it and the client reads it via Vite's `envDir`.

```bash
cp .env.example .env
```

Fill in at least `MONGODB_URI`, `SESSION_SECRET` and `JWT_SECRET`.
See [docs/setup/environment-variables.md](docs/setup/environment-variables.md).

### 3. Seed the God User

```bash
pnpm --filter roas-printfast-server seed:god-user
```

### 4. Start development

```bash
pnpm dev:roas             # both, from the repo root
# or individually
pnpm dev:roas:server      # :9003
pnpm dev:roas:client      # :9002
```

- **Frontend:** http://localhost:9002
- **Backend API:** http://localhost:9003/api/v1

The Vite dev server proxies `/api` to the backend, so the two work together
without CORS configuration locally.

### 5. Optional: enable admin signup

In the root `.env`, set:

```
ALLOW_ADMIN_SIGNUP=true
```

Restart the server. The signup page will now show the Admin role option.

## Scripts

Run any package script from the repo root with `pnpm --filter <package> <script>`.

### Server (`roas-printfast-server`)

| Script            | Description                        |
| ----------------- | ---------------------------------- |
| `dev`             | Start development server (nodemon) |
| `build`           | Compile TypeScript                 |
| `start`           | Run the compiled server            |
| `type-check`      | Run TypeScript compiler checks     |
| `lint`            | Run ESLint                         |
| `format`          | Run Prettier                       |
| `seed:god-user`   | Create the initial God User        |

### Client (`roas-printfast-client`)

| Script       | Description                    |
| ------------ | ------------------------------ |
| `dev`        | Start Vite dev server (:9002)  |
| `build`      | Build for production           |
| `preview`    | Preview the production build   |
| `type-check` | Run TypeScript compiler checks |
| `lint`       | Run ESLint                     |
| `format`     | Run Prettier                   |

## Deployment

Handled by the monorepo pipeline — see [deploy/README.md](../deploy/README.md).
The client is served at `roas.print-fast.com` and the API at
`roas-server.print-fast.com`.

## Documentation

- [Local Development Setup](docs/setup/local-development.md)
- [Environment Variables](docs/setup/environment-variables.md)
- [User Roles & Permissions](docs/requirements/user-roles.md)
- [Architecture Overview](docs/architecture/overview.md)
- [API Documentation](docs/api/README.md)
- [Database Schema](docs/database/schema.md)

## License

Private — All rights reserved.


GOD/ADMIN
1. Can create multiple admin accounts
2. god and admin user can create multiple vendors
3. god nav menu - dashboard, Vendors(CRUD vendors), 
    business address, email, phone, on vendor create send login credentials, edit vendor, send credentials, view password 
4. For GOD Create admin user similar to vendor but admin user
5. hide users and vendors for users other than god and admin



For vendor user - 
1. Dashboard - total no of campaigns, clients, postcards, product services
2. ROAS Dashboard - 
7. Current campaings - 
3. Product & Services - name, description and images
4. Postcard - name, description and images
5. Clients - name, email, label, Category, tag
6. Campaigns - name, description, start and end date, 
    For each week there should be select client - in pop - 
7. Integrations - Job, Invoice, User lists
    two tables for Job and invoice at our side for job and invoice


1. Dynamic table for react and mongodb with common reusable components
Search, sort, filter, pagination middleware.
2. For Diff user diff things.
3. For God and admin - admin cannot see admin list.
4. Vendors.
5. Integration - with common data format for ServiceTitan and Jobber
