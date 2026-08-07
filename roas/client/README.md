# ROAS PrintFast — Client

React frontend with TypeScript, Vite, and Material-UI (MUI).

## Structure

```
client/src/
├── components/     # Shared (Layout, Breadcrumb, Table)
│   ├── Layout/     # Sidebar + Header + content wrapper
│   ├── Breadcrumb/
│   └── Table/
├── pages/          # Page components
│   ├── Login/      # Public login page
│   ├── Signup/     # Public signup page (role-gated)
│   ├── Dashboard/  # Landing page after login
│   ├── Users/      # User management (God/Admin)
│   ├── Vendors/    # Vendor management
│   ├── Reports/    # Reports & analytics
│   ├── Settings/   # System settings (God only)
│   └── Profile/    # User profile & change password
├── contexts/       # AuthContext
├── hooks/          # useAuth, useApi
├── services/       # API layer (axios)
├── types/          # TypeScript interfaces & enums
├── config/         # Client config
├── theme/          # MUI theme
├── utils/          # Helpers
├── App.tsx         # Routes
└── main.tsx        # Entry point
```

## Key Dependencies

| Package              | Purpose                |
| -------------------- | ---------------------- |
| `react`              | UI library             |
| `react-router-dom`   | Routing                |
| `@mui/material`      | Component library      |
| `@mui/icons-material`| Icons                  |
| `axios`              | HTTP client            |
| `formik`             | Form management        |
| `yup`                | Form validation        |

## Scripts

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run type-check   # TypeScript checks
npm run lint         # ESLint
npm run format       # Prettier
```

## Layout

After login, all pages use a **left sidebar navigation** layout:
- **Persistent MUI Drawer** on desktop (~240px)
- **Temporary Drawer** on mobile (hamburger toggle)
- **AppBar** with user name, role badge, logout
- Menu items filtered by user role

## Pages

| Page      | Route        | Auth | Roles               |
| --------- | ------------ | :--: | -------------------- |
| Login     | `/login`     |  No  | Public               |
| Signup    | `/signup`    |  No  | Public               |
| Dashboard | `/dashboard` | Yes  | All                  |
| Users     | `/users`     | Yes  | God User, Admin      |
| Vendors   | `/vendors`   | Yes  | God User, Admin      |
| Reports   | `/reports`   | Yes  | All (scoped)         |
| Profile   | `/profile`   | Yes  | All                  |
| Settings  | `/settings`  | Yes  | God User only        |

## Signup

- Vendor signup: always available
- Admin signup: only when server `ALLOW_ADMIN_SIGNUP=true`
- Signup page fetches `GET /api/v1/config/public` to determine available roles

## UI Standards

- No `.tsx` file exceeds 200 lines
- MUI components only (no SCSS)
- Formik + Yup for all forms
- Breadcrumbs on all pages
- Fully responsive
- Tables: server-side pagination, filtering, sorting, search
- MUI Grid uses `size` attribute
