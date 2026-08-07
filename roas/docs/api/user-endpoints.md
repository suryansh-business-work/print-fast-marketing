# User Management Endpoints

Base path: `/api/v1/users`

All endpoints require authentication and role-based access.

---

## GET /users

List users with pagination, filtering, searching, and sorting.

**Auth Required:** Yes
**Allowed Roles:** God User, Admin

**Query Parameters:**

| Parameter          | Type    | Default      | Description                      |
| ------------------ | ------- | ------------ | -------------------------------- |
| `page`             | number  | 1            | Page number                      |
| `limit`            | number  | 20           | Items per page (max: 100)        |
| `sort`             | string  | `-createdAt` | Sort field (`-` for desc)        |
| `search`           | string  | —            | Search by name or email          |
| `filter[role]`     | string  | —            | Filter by role                   |
| `filter[isActive]` | boolean | —            | Filter by active status          |

**Business Rules:**
- God User sees all users (admin + vendor)
- Admin sees only Vendor users
- Password field never returned

**Success (200):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

---

## GET /users/:id

Get a single user by ID.

**Auth Required:** Yes
**Allowed Roles:** God User, Admin

**Errors:**
- `403` — Admin trying to view another Admin or God User
- `404` — Not found

---

## POST /users

Create a new user (via admin panel, not signup).

**Auth Required:** Yes
**Allowed Roles:** God User (creates Admin + Vendor), Admin (creates Vendor only)

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "New",
  "lastName": "User",
  "role": "vendor_user"
}
```

**Business Rules:**
- God User can set `role` to `admin_user` or `vendor_user`
- Admin can only set `role` to `vendor_user`
- `createdBy` set to the session user's ID

**Success (201):**
```json
{
  "success": true,
  "data": { ... },
  "message": "User created successfully"
}
```

**Errors:**
- `400` — Validation error
- `403` — Admin trying to create Admin
- `409` — Email exists

---

## PUT /users/:id

Update user details.

**Auth Required:** Yes
**Allowed Roles:** God User (any user), Admin (vendor users only)

**Business Rules:**
- Role cannot be changed via this endpoint
- Password cannot be changed (use change-password)
- Admin cannot edit Admin or God users

**Errors:**
- `403` — Insufficient permissions
- `404` — Not found
- `409` — Email already in use

---

## DELETE /users/:id

Deactivate a user (soft delete).

**Auth Required:** Yes
**Allowed Roles:** God User (any except self), Admin (vendor users only)

**Business Rules:**
- Sets `isActive: false`
- Cannot deactivate yourself
- Destroys all active sessions for the deactivated user

**Errors:**
- `400` — Cannot deactivate yourself
- `403` — Insufficient permissions
- `404` — Not found
