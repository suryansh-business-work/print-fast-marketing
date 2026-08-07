# User Roles & Permissions

## Role Hierarchy

```
God User (Super Admin)
  └── Admin User
        └── Vendor User
```

## Role Definitions

### 1. God User (Super Admin)

The highest-privileged account, created via seed script only. There should be only one (or very few) God Users.

**Capabilities:**
- Full system access with no restrictions
- Create, read, update, deactivate Admin users
- Create, read, update, deactivate Vendor users
- Access all system settings and configurations
- View all data across all vendors

**Restrictions:**
- Cannot be created through the UI or signup — seed script only
- Cannot be deleted (only deactivated)

### 2. Admin User

Created by the God User via the UI, or through **self-signup when `ALLOW_ADMIN_SIGNUP=true`** on the server.

**Capabilities:**
- Create, read, update, deactivate Vendor users
- Manage vendor-related data
- View reports and analytics
- Manage operational settings within their scope

**Restrictions:**
- Cannot create or manage other Admin users
- Cannot access God User settings
- Cannot modify system-wide configurations

**Signup:** Admin self-signup is gated by the server-side flag `ALLOW_ADMIN_SIGNUP`. When `false` (default), only God Users can create Admins. When `true`, Admins can register through the public signup page.

### 3. Vendor User

Has the most limited access, scoped to their own data. Can be created by God/Admin via UI, or through **self-signup** (always available).

**Capabilities:**
- View and manage their own vendor profile
- Access their own reports and analytics
- Perform vendor-specific operations

**Restrictions:**
- Cannot create or manage any users
- Cannot view other vendors' data
- Cannot access admin-level settings or reports

**Signup:** Vendor self-signup is always available on the public signup page.

## Account Creation Methods

| Role         | Seed Script | Created by God User | Created by Admin | Self-Signup                      |
| ------------ | :---------: | :-----------------: | :--------------: | :------------------------------: |
| God User     |     ✅      |         ❌          |        ❌        | ❌                               |
| Admin User   |     ❌      |         ✅          |        ❌        | ✅ (when `ALLOW_ADMIN_SIGNUP=true`) |
| Vendor User  |     ❌      |         ✅          |        ✅        | ✅ (always)                      |

## Permissions Matrix

| Feature / Action              | God User | Admin User | Vendor User |
| ----------------------------- | :------: | :--------: | :---------: |
| **User Management**           |          |            |             |
| Create Admin User             |    ✅    |     ❌     |     ❌      |
| Edit Admin User               |    ✅    |     ❌     |     ❌      |
| Deactivate Admin User         |    ✅    |     ❌     |     ❌      |
| View Admin Users              |    ✅    |     ❌     |     ❌      |
| Create Vendor User            |    ✅    |     ✅     |     ❌      |
| Edit Vendor User              |    ✅    |     ✅     |     ❌      |
| Deactivate Vendor User        |    ✅    |     ✅     |     ❌      |
| View Vendor Users             |    ✅    |     ✅     |     ❌      |
| **Profile**                   |          |            |             |
| View own profile              |    ✅    |     ✅     |     ✅      |
| Edit own profile              |    ✅    |     ✅     |     ✅      |
| Change own password           |    ✅    |     ✅     |     ✅      |
| **System Settings**           |          |            |             |
| Access system configuration   |    ✅    |     ❌     |     ❌      |
| **Data Access**               |          |            |             |
| View all vendors' data        |    ✅    |     ✅     |     ❌      |
| View own vendor data          |    ✅    |     ✅     |     ✅      |
| **Reports & Analytics**       |          |            |             |
| View global reports           |    ✅    |     ✅     |     ❌      |
| View own vendor reports       |    ✅    |     ✅     |     ✅      |

## Role Enum

Used across both frontend and backend:

```typescript
enum UserRole {
  GOD_USER = 'god_user',
  ADMIN_USER = 'admin_user',
  VENDOR_USER = 'vendor_user',
}
```

## Session Data Structure

```typescript
interface SessionUser {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}
```

## Notes

- God User is seeded via `npm run seed:god-user`
- User accounts are soft-deleted (`isActive: false`)
- Role changes require re-login (new session)
- All role-based access is enforced server-side via middleware — never client-side only
