# Database Schema Documentation

## Collections

| Collection | Description                            | Managed By    |
| ---------- | -------------------------------------- | ------------- |
| `users`    | All user accounts (God, Admin, Vendor) | Mongoose      |
| `sessions` | Server-side session data               | connect-mongo |

## Users Collection

### Schema

```typescript
{
  _id: ObjectId,
  email: String,               // Unique, indexed, required
  password: String,            // Bcrypt hashed, select: false
  firstName: String,           // Required, trimmed, max 50
  lastName: String,            // Required, trimmed, max 50
  role: String,                // Enum: 'god_user' | 'admin_user' | 'vendor_user'
  isActive: Boolean,           // Default: true
  createdBy: ObjectId | null,  // Ref: 'users' (null for God User and self-signup)
  lastLoginAt: Date | null,
  createdAt: Date,             // Mongoose timestamps
  updatedAt: Date,             // Mongoose timestamps
}
```

### Indexes

| Index              | Fields                      | Type     | Purpose                     |
| ------------------ | --------------------------- | -------- | --------------------------- |
| `email_1`          | `{ email: 1 }`             | Unique   | Login lookup, prevent dupes |
| `role_1`           | `{ role: 1 }`              | Regular  | Filter by role              |
| `isActive_1`       | `{ isActive: 1 }`          | Regular  | Filter active/inactive      |
| `role_isActive_1`  | `{ role: 1, isActive: 1 }` | Compound | Combined filter             |

### Sample Document

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "email": "admin@roasprintfast.com",
  "password": "$2b$12$...",
  "firstName": "Super",
  "lastName": "Admin",
  "role": "god_user",
  "isActive": true,
  "createdBy": null,
  "lastLoginAt": "2026-02-14T08:00:00.000Z",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-02-14T08:00:00.000Z"
}
```

## Sessions Collection

Auto-managed by `connect-mongo`. TTL index handles auto-cleanup.

```typescript
{
  _id: String,
  expires: Date,
  session: {
    cookie: { originalMaxAge, expires, httpOnly, secure, sameSite },
    user: { userId, email, role, firstName, lastName }
  }
}
```

## Future Collections

| Collection | Description                  | Status  |
| ---------- | ---------------------------- | ------- |
| `vendors`  | Vendor organization profiles | Planned |
| `campaigns`| ROAS campaign data           | Planned |
| `reports`  | Analytics/reporting data     | Planned |
