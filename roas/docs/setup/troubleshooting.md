# Troubleshooting

## Common Issues

### MongoDB Connection Failed

**Error:** `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
1. Ensure MongoDB is running: `mongod --dbpath /path/to/data`
2. Verify `MONGODB_URI` in `server/.env`
3. For Atlas: check IP whitelist and connection string

### Session Not Persisting

**Symptoms:** User logged out on every request or page refresh.

**Checklist:**
1. `SESSION_SECRET` is set in `server/.env`
2. `withCredentials: true` in axios client config
3. CORS origin matches frontend URL exactly
4. In dev, `sameSite` should be `lax` (not `strict`) for cross-port requests

### CORS Errors

**Error:** `Access to XMLHttpRequest... has been blocked by CORS policy`

**Solution:**
1. `CORS_ORIGIN` in `server/.env` matches your frontend URL
2. CORS middleware is configured before routes
3. Credentials enabled in CORS config

### Port Already in Use

```bash
lsof -i :5000
kill -9 <PID>
```

### TypeScript Build Errors

1. Run `npm run type-check` to see all errors
2. Check `tsconfig.json` has `strict: true`
3. Install missing types: `npm install @types/<package>`

### God User Seed Fails

1. MongoDB not running
2. Missing `GOD_USER_EMAIL` or `GOD_USER_PASSWORD` in `.env`
3. God User already exists (duplicate email)

### Admin Signup Not Working

**Symptom:** Role dropdown on signup page doesn't show "Admin" option.

**Solution:**
1. Set `ALLOW_ADMIN_SIGNUP=true` in `server/.env`
2. Restart the server
3. Verify: `curl http://localhost:5000/api/v1/config/public` should return `{ "allowAdminSignup": true }`

### Sidebar Menu Items Missing

**Symptom:** Expected menu items not visible in the left sidebar.

**Explanation:** Menu items are filtered by the user's role. Vendor users only see Dashboard, Reports, and Profile. Check [user-roles.md](../requirements/user-roles.md) for the visibility matrix.

### Frontend Not Connecting to Backend

1. Backend is running on expected port
2. `VITE_API_BASE_URL` in `client/.env` matches backend URL
3. No proxy misconfiguration in Vite config
