# Environment Variables

All environment variables are accessed through `config.ts` — **never use `process.env` directly** in the codebase.

## Server Variables

| Variable              | Required | Default                          | Description                              |
| --------------------- | :------: | -------------------------------- | ---------------------------------------- |
| `NODE_ENV`            |    No    | `development`                    | Environment: `development`, `production` |
| `PORT`                |    No    | `5000`                           | Server port                              |
| `MONGODB_URI`         |   Yes    | —                                | MongoDB connection string                |
| `SESSION_SECRET`      |   Yes    | —                                | Secret key for session encryption        |
| `SESSION_MAX_AGE`     |    No    | `86400000` (24h)                 | Session duration in milliseconds         |
| `CORS_ORIGIN`         |    No    | `http://localhost:5173`          | Allowed CORS origin                      |
| `ALLOW_ADMIN_SIGNUP`  |    No    | `false`                          | Enable admin self-signup (`true`/`false`) |

### God User Seed Variables

| Variable               | Required | Description                          |
| ---------------------- | :------: | ------------------------------------ |
| `GOD_USER_EMAIL`       |   Yes*   | Email for initial God User account   |
| `GOD_USER_PASSWORD`    |   Yes*   | Password for initial God User        |
| `GOD_USER_FIRST_NAME`  |    No    | God User first name (default: Super) |
| `GOD_USER_LAST_NAME`   |    No    | God User last name (default: Admin)  |

\* Only required when running `npm run seed:god-user`.

## Client Variables

| Variable              | Required | Default                          | Description                    |
| --------------------- | :------: | -------------------------------- | ------------------------------ |
| `VITE_API_BASE_URL`   |   Yes    | —                                | Backend API base URL           |

> **Note:** Vite requires client-side env vars to be prefixed with `VITE_`.

## Security Notes

- **Never commit `.env` files** — they are in `.gitignore`
- Use strong, unique values for `SESSION_SECRET` (minimum 32 characters)
- Change `GOD_USER_PASSWORD` after first login
- In production, set `NODE_ENV=production` to enable secure cookies
- Set `ALLOW_ADMIN_SIGNUP=true` only in environments where admin self-registration is intended
