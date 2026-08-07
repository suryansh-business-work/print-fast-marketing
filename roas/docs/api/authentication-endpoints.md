# Authentication Endpoints

Base path: `/api/v1/auth`

---

## POST /auth/login

Log in with email and password. Creates a server-side session.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Validation (Zod):**
- `email` — required, valid email
- `password` — required, string

**Success (200):**
```json
{
  "success": true,
  "data": {
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin_user"
  },
  "message": "Login successful"
}
```

**Errors:**
- `400` — Validation error
- `401` — Invalid credentials

---

## POST /auth/signup

Create a new account and auto-login. Public endpoint.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "vendor_user"
}
```

**Validation (Zod):**
- `email` — required, valid email, unique
- `password` — required, min 8 chars, uppercase + lowercase + number + special char
- `confirmPassword` — must match password
- `firstName` — required, max 50 chars
- `lastName` — required, max 50 chars
- `role` — required, one of `admin_user` or `vendor_user`

**Business Rules:**
- `role: vendor_user` — always allowed
- `role: admin_user` — only when `ALLOW_ADMIN_SIGNUP=true` on server, else 403
- `role: god_user` — always rejected with 403
- On success: user is created, session is started, cookie is set
- `createdBy` is set to `null` (self-signup)

**Success (201):**
```json
{
  "success": true,
  "data": {
    "userId": "64f1a2b3c4d5e6f7a8b9c0d3",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "vendor_user"
  },
  "message": "Account created successfully"
}
```

**Errors:**
- `400` — Validation error
- `403` — Admin signup disabled / God User role not allowed
- `409` — Email already exists

---

## POST /auth/logout

Destroy session and clear cookie.

**Auth Required:** Yes

**Success (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## GET /auth/me

Get current user from session. Used to restore auth state on app load.

**Auth Required:** Yes

**Success (200):**
```json
{
  "success": true,
  "data": {
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "admin_user"
  }
}
```

**Errors:**
- `401` — No valid session

---

## POST /auth/change-password

Change password for the authenticated user.

**Auth Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456!",
  "confirmNewPassword": "newSecurePassword456!"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors:**
- `400` — Validation error (weak password, mismatch)
- `401` — Current password incorrect

---

## GET /config/public

> Base path: `/api/v1/config` (not `/auth`)

Get public server feature flags. No auth required.

**Auth Required:** No

**Success (200):**
```json
{
  "success": true,
  "data": {
    "allowAdminSignup": false
  }
}
```

**Notes:**
- Used by the signup page to determine available role options
- Returns only public, non-sensitive configuration
