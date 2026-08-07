# Database Design

## Overview

MongoDB with Mongoose ODM. This document covers schema design, the User model, sessions, and indexing.

## Design Principles

1. **Reference over embedding** for independently queried entities (Users, Vendors)
2. **Embedding** for data always accessed together with bounded size
3. **Soft deletes** — `isActive: false` instead of hard deletes
4. **Timestamps** — all models include `createdAt` and `updatedAt` via Mongoose
5. **Indexing** — indexes on fields used in queries, filters, and sorting

## User Schema

```typescript
interface IUser {
  email: string;
  password: string;        // bcrypt hashed
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdBy?: ObjectId;    // Ref to creator (null for God User and self-signup)
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Indexes

| Field     | Type    | Purpose                           |
| --------- | ------- | --------------------------------- |
| `email`   | Unique  | Login lookup, duplicate prevention |
| `role`    | Regular | Filtering users by role           |
| `isActive`| Regular | Filtering active/inactive users   |
| `role` + `isActive` | Compound | Combined role + active filter |

### Password Handling

- Hashed with bcrypt (12 salt rounds) in `pre('save')` middleware
- Password field excluded from queries by default (`select: false`)

### `createdBy` Field

- For God User: `null` (created by seed script)
- For users created via UI by God/Admin: set to the creator's userId
- For self-signup users: `null` (self-registered)

## Sessions Collection

Auto-managed by `connect-mongo`:

```typescript
{
  _id: String,          // Session ID
  expires: Date,        // TTL auto-cleanup
  session: {
    cookie: { ... },
    user: {
      userId: String,
      email: String,
      role: String,
      firstName: String,
      lastName: String,
    }
  }
}
```

## Future Collections

| Collection   | Description                  | Status  |
| ------------ | ---------------------------- | ------- |
| `vendors`    | Vendor organization profiles | Planned |
| `campaigns`  | ROAS campaign data           | Planned |
| `reports`    | Analytics/reporting data     | Planned |

## Schema Validation Rules

1. Required fields use `required: true`
2. Strings: `trim: true`, `maxlength` defined
3. Emails: regex validator
4. Enums: Mongoose `enum` with TypeScript enum values
5. References: `mongoose.Schema.Types.ObjectId` with `ref`

## Migration Strategy

1. Add new fields with defaults for backward compatibility
2. Migration scripts in `server/src/scripts/`
3. `schemaVersion` field for breaking changes if needed
