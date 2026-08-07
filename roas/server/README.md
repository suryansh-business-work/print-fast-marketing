# ROAS PrintFast — Server

Express.js backend with TypeScript, session-based authentication, and MongoDB.

## Structure

```
server/src/
├── config/         # Environment config, DB connection, session setup
├── features/       # Feature modules
│   ├── auth/       # Login, signup, logout, session
│   ├── users/      # User CRUD (role-based)
│   └── config/     # Public feature flags endpoint
├── middleware/      # Auth, role, validation, error middleware
├── types/          # Enums, interfaces, type augmentations
├── utils/          # Logger, error classes, response helpers
├── scripts/        # Seed scripts (god user)
└── index.ts        # Express app entry point
```

## Feature Module Pattern

| File                        | Purpose                      |
| --------------------------- | ---------------------------- |
| `<feature>.controllers.ts`  | Request handling             |
| `<feature>.services.ts`     | Business logic               |
| `<feature>.models.ts`       | Mongoose schema              |
| `<feature>.routes.ts`       | Express router               |
| `<feature>.validators.ts`   | Zod validation schemas       |

## Key Dependencies

| Package            | Purpose                    |
| ------------------ | -------------------------- |
| `express`          | HTTP framework             |
| `express-session`  | Session management         |
| `connect-mongo`    | MongoDB session store      |
| `mongoose`         | MongoDB ODM                |
| `bcrypt`           | Password hashing           |
| `zod`              | Request validation         |
| `cors`             | CORS                       |
| `helmet`           | Security headers           |
| `winston`          | Logging                    |

## Scripts

```bash
npm run dev            # Start with nodemon
npm run build          # Compile TypeScript
npm run type-check     # Check types
npm run lint           # ESLint
npm run format         # Prettier
npm run seed:god-user  # Create initial God User
```

## Authentication

- `express-session` + `connect-mongo` (sessions in MongoDB)
- httpOnly cookies, secure in production
- Login, signup, logout, session check endpoints
- Signup: vendor always allowed, admin gated by `ALLOW_ADMIN_SIGNUP` flag

## Feature Flags

- `ALLOW_ADMIN_SIGNUP` — controls whether admin self-signup is available
- Exposed via `GET /api/v1/config/public` (no auth)
- Read from `config.ts` (sourced from `.env`)
