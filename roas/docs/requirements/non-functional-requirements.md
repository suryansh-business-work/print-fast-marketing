# Non-Functional Requirements

## 1. Performance

- API response time: < 500ms for standard CRUD operations
- Page load: < 3 seconds first load, < 1 second subsequent navigations
- Database queries use indexes for frequently accessed fields
- Pagination default: 20 items per page, configurable up to 100

## 2. Security

- Passwords hashed with bcrypt (12 salt rounds minimum)
- Session cookies: `httpOnly`, `secure` (production), `sameSite: strict`
- Input validation on both client (Yup) and server (Zod)
- NoSQL injection prevention via Mongoose schema validation
- CORS restricted to allowed origins via config
- Rate limiting on authentication endpoints (login, signup)
- Helmet.js for HTTP security headers
- No sensitive data in logs or error responses
- Admin signup gated by server-side `ALLOW_ADMIN_SIGNUP` flag — not bypassable from client

## 3. Scalability

- Feature-based code organization for independent feature development
- Sessions stored in MongoDB (not in memory) — supports multiple server instances
- Database schema designed for horizontal scaling (proper indexing, no unbounded arrays)

## 4. Reliability

- Centralized error handling with consistent error response format
- Graceful shutdown for the Express server
- MongoDB connection retry logic on startup
- Structured logging with Winston (levels: error, warn, info, debug)

## 5. Maintainability

- TypeScript strict mode in both client and server
- No `.tsx` file exceeds 200 lines
- All env variables accessed through `config.ts` (no direct `process.env`)
- ESLint + Prettier enforced via Husky pre-commit hooks
- Feature-based backend: controllers, services, models, routes, validators per feature

## 6. Compatibility

- Node.js >= 18.x
- MongoDB >= 6.x
- Modern browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile responsive: iOS Safari, Android Chrome

## 7. Code Quality

- All code in TypeScript (no `.js` files in `src/`)
- Zod validators for all API inputs
- Formik + Yup for all frontend forms
- MUI components only (no custom CSS frameworks)
- No usage of `any`, `unknown` (unless justified), or misuse of `never`
