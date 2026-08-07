# Authentication & Authorization

## Overview

Session-based authentication with `express-session` and `connect-mongo`. Sessions are stored in MongoDB, session IDs sent to the client as httpOnly cookies.

## Login Flow

```
Client                        Server                        MongoDB
  │                              │                              │
  │  POST /api/v1/auth/login     │                              │
  │  { email, password }         │                              │
  │─────────────────────────────►│                              │
  │                              │  Find user by email          │
  │                              │─────────────────────────────►│
  │                              │◄─────────────────────────────│
  │                              │  bcrypt.compare(password)    │
  │                              │  Create session              │
  │                              │  Save to MongoDB             │
  │                              │─────────────────────────────►│
  │  Set-Cookie: connect.sid     │                              │
  │  { user data }               │                              │
  │◄─────────────────────────────│                              │
  │                              │                              │
  │  Redirect to /dashboard      │                              │
```

## Signup Flow

```
Client                        Server                        MongoDB
  │                              │                              │
  │  GET /api/v1/config/public   │                              │
  │─────────────────────────────►│                              │
  │  { allowAdminSignup: bool }  │                              │
  │◄─────────────────────────────│                              │
  │                              │                              │
  │  POST /api/v1/auth/signup    │                              │
  │  { email, password,          │                              │
  │    firstName, lastName,      │                              │
  │    role }                    │                              │
  │─────────────────────────────►│                              │
  │                              │  Validate with Zod           │
  │                              │  If role=admin_user:         │
  │                              │    Check ALLOW_ADMIN_SIGNUP  │
  │                              │    If false → 403            │
  │                              │  If role=god_user → 403      │
  │                              │  Check email uniqueness      │
  │                              │  Hash password (bcrypt 12)   │
  │                              │  Create user                 │
  │                              │─────────────────────────────►│
  │                              │  Create session              │
  │                              │─────────────────────────────►│
  │  Set-Cookie: connect.sid     │                              │
  │  { user data }               │                              │
  │◄─────────────────────────────│                              │
  │                              │                              │
  │  Redirect to /dashboard      │                              │
```

## Logout Flow

```
POST /api/v1/auth/logout
→ req.session.destroy()
→ Remove session from MongoDB
→ Clear cookie
→ Client redirects to /login
```

## Session Check

```
GET /api/v1/auth/me
```

Returns `req.session.user` if valid session exists, or `401` otherwise. Called by frontend on app mount to restore auth state.

## Session Configuration

```typescript
// server/src/config/session.ts
const sessionConfig: session.SessionOptions = {
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.mongodbUri,
    collectionName: 'sessions',
    ttl: config.sessionMaxAge / 1000,
  }),
  cookie: {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: config.nodeEnv === 'production' ? 'strict' : 'lax',
    maxAge: config.sessionMaxAge,
  },
};
```

## Feature Flag: `ALLOW_ADMIN_SIGNUP`

- Defined in `server/.env` as `ALLOW_ADMIN_SIGNUP=true|false`
- Read via `config.ts` (never direct `process.env`)
- Exposed to frontend via `GET /api/v1/config/public` (no auth required)
- Signup endpoint checks this flag before allowing `role: admin_user`
- Default: `false` (admin signup disabled)

## Authorization (RBAC)

### Role Enum

```typescript
enum UserRole {
  GOD_USER = 'god_user',
  ADMIN_USER = 'admin_user',
  VENDOR_USER = 'vendor_user',
}
```

### Auth Middleware

```typescript
export const requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};
```

### Role Middleware

```typescript
export const requireRole = (...roles: UserRole[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Route Examples

```typescript
// Public routes
router.post('/auth/login', validateRequest(loginSchema), authController.login);
router.post('/auth/signup', validateRequest(signupSchema), authController.signup);
router.get('/config/public', configController.getPublicConfig);

// Protected — any authenticated user
router.get('/auth/me', requireAuth, authController.me);
router.post('/auth/logout', requireAuth, authController.logout);

// Protected — God User only
router.post('/users/admin', requireAuth, requireRole(UserRole.GOD_USER), userController.createAdmin);

// Protected — God User + Admin
router.post('/users/vendor', requireAuth, requireRole(UserRole.GOD_USER, UserRole.ADMIN_USER), userController.createVendor);
```

## Frontend Integration

### Axios

```typescript
const api = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
});
```

### AuthContext

Provides:
- `user` — current user or null
- `login(email, password)` — calls login API, updates state
- `signup(data)` — calls signup API, updates state
- `logout()` — calls logout API, clears state
- `isAuthenticated` — boolean
- `hasRole(role)` — check user's role

On mount: calls `GET /api/v1/auth/me` to restore session.

## Security

- Cookies: `httpOnly` (XSS protection), `secure` in production (HTTPS), `sameSite: strict` (CSRF)
- Rate limiting on `/auth/login` and `/auth/signup`
- Generic "Invalid credentials" on failed login (no enumeration)
- Sessions in MongoDB with TTL auto-cleanup
- Feature flag checked server-side — client exposure is informational only
