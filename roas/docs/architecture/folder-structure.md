# Folder Structure

## Project Root

```
roas-printfast/
├── .github/
│   └── copilot-instructions.md
├── .vscode/
│   ├── settings.json
│   └── extensions.json
├── client/                        # React frontend
├── server/                        # Express backend
├── docs/                          # Documentation
├── .env.example
├── .gitignore
├── .eslintrc.json
├── .prettierrc.json
├── package.json                   # Root workspace config
└── README.md
```

## Server Structure

```
server/
├── src/
│   ├── config/
│   │   ├── config.ts              # Centralized env access (incl. allowAdminSignup)
│   │   ├── database.ts            # MongoDB connection
│   │   └── session.ts             # express-session config
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.controllers.ts  # login, signup, logout, me, change-password
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.services.ts
│   │   │   └── auth.validators.ts
│   │   │
│   │   ├── users/
│   │   │   ├── users.controllers.ts
│   │   │   ├── users.models.ts
│   │   │   ├── users.routes.ts
│   │   │   ├── users.services.ts
│   │   │   └── users.validators.ts
│   │   │
│   │   └── config/
│   │       ├── config.controllers.ts  # GET /api/v1/config/public
│   │       └── config.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── types/
│   │   ├── enums.ts
│   │   ├── express.d.ts
│   │   └── common.ts
│   │
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── response.ts
│   │
│   ├── scripts/
│   │   └── seed-god-user.ts
│   │
│   └── index.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

## Client Structure

```
client/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.tsx         # Sidebar + AppBar + content area
│   │   │   ├── Sidebar.tsx        # Left nav with role-based menu
│   │   │   ├── Header.tsx         # AppBar with user info + logout
│   │   │   └── index.ts
│   │   │
│   │   ├── Breadcrumb/
│   │   │   ├── Breadcrumb.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── Table/
│   │       ├── DataTable.tsx
│   │       ├── TablePagination.tsx
│   │       ├── TableFilters.tsx
│   │       └── index.ts
│   │
│   ├── pages/
│   │   ├── Login/
│   │   │   └── Login.tsx
│   │   ├── Signup/
│   │   │   └── Signup.tsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   ├── Users/
│   │   ├── Vendors/
│   │   ├── Reports/
│   │   ├── Settings/
│   │   └── Profile/
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useApi.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   └── config.service.ts
│   │
│   ├── types/
│   │   └── user.types.ts
│   │
│   ├── config/
│   │   └── config.ts
│   │
│   ├── theme/
│   │   └── theme.ts
│   │
│   ├── utils/
│   │   └── helpers.ts
│   │
│   ├── App.tsx                   # Routes: public (/login, /signup) + protected (Layout wrapper)
│   └── main.tsx
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Naming Conventions

| Item               | Convention       | Example                     |
| ------------------ | ---------------- | --------------------------- |
| Feature folder     | kebab-case       | `features/auth/`            |
| TS files (backend) | kebab-case       | `auth.controllers.ts`       |
| React components   | PascalCase       | `Sidebar.tsx`               |
| Component folders  | PascalCase       | `components/Layout/`        |
| Hooks              | camelCase, `use` | `useAuth.ts`                |
| Services           | kebab-case       | `auth.service.ts`           |
| Types/interfaces   | PascalCase       | `IUser`, `UserRole`         |
| Enums              | PascalCase       | `UserRole.GOD_USER`         |
| Constants          | UPPER_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS`        |

## Adding a New Feature

### Backend

1. Create `server/src/features/<feature-name>/`
2. Add: controllers, services, models, routes, validators
3. Register routes in `src/index.ts`

### Frontend

1. Create `client/src/pages/<FeatureName>/`
2. Add components in `client/src/components/<FeatureName>/` if reusable
3. Add service in `client/src/services/<feature>.service.ts`
4. Add types in `client/src/types/<feature>.types.ts`
5. Add route in `App.tsx`
6. Add sidebar menu item in `Sidebar.tsx` (with role guard)
