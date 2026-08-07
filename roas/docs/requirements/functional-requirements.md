# Functional Requirements

## 1. Authentication

### 1.1 Login
- Users log in with email and password at `/login`
- On success, a server-side session is created, session cookie sent to client
- Failed login returns a generic error (no user enumeration)
- After login, redirect to `/dashboard`
- Login page has a link to the signup page

### 1.2 Signup
- Public signup page at `/signup` for Admin and Vendor users
- **Vendor signup**: always available
- **Admin signup**: only available when server flag `ALLOW_ADMIN_SIGNUP=true`
- Signup page calls `GET /api/v1/config/public` on mount to determine available roles
- Form fields: email, password, confirm password, first name, last name, role (dropdown)
- On success, session is auto-created (user is logged in), redirect to `/dashboard`
- God User cannot be created via signup (always rejected by server)
- Signup page has a link back to the login page

### 1.3 Logout
- Destroys server-side session, clears session cookie
- Redirects to `/login`

### 1.4 Session Management
- Sessions stored in MongoDB via `connect-mongo`
- Configurable expiry (default: 24 hours)
- Expired sessions auto-cleaned by MongoDB TTL index
- On app load, frontend calls `GET /api/v1/auth/me` to restore session

## 2. Dashboard & Navigation

### 2.1 Layout
- After login, all authenticated pages use a **left sidebar navigation layout**
- **Persistent MUI Drawer** (~240px) on desktop — always visible
- **Temporary Drawer** on mobile — toggled by hamburger icon in AppBar
- **Collapsible** on tablet — icon-only mode
- **AppBar** (top): app title, logged-in user name + role badge, logout button

### 2.2 Sidebar Menu

| Menu Item   | Icon              | Route        | Visible To                |
| ----------- | ----------------- | ------------ | ------------------------- |
| Dashboard   | DashboardIcon     | `/dashboard` | All roles                 |
| Users       | PeopleIcon        | `/users`     | God User, Admin           |
| Vendors     | StoreIcon         | `/vendors`   | God User, Admin           |
| Reports     | AssessmentIcon    | `/reports`   | All roles (scoped data)   |
| Profile     | PersonIcon        | `/profile`   | All roles                 |
| Settings    | SettingsIcon      | `/settings`  | God User only             |

- Active route is highlighted in the sidebar
- Menu items are filtered based on the user's role
- Clicking a menu item navigates to the corresponding route

### 2.3 Dashboard Page
- Landing page after login (`/dashboard`)
- Shows role-appropriate summary cards and quick stats
- God User / Admin: overview of users, vendors, key metrics
- Vendor: own vendor metrics and quick links

## 3. User Management

### 3.1 User CRUD
- **Create:** God User creates Admin/Vendor; Admin creates Vendor
- **Read:** List users with pagination, filtering by role, search by name/email, sorting
- **Update:** Edit profile fields; role cannot be self-changed
- **Deactivate:** Soft delete (`isActive: false`), does not remove data

### 3.2 User List Page (`/users`)
- Table with: name, email, role, status (active/inactive), created date
- Server-side pagination, filtering, sorting, search
- Create User button opens form (role options depend on the creator's role)
- Edit and deactivate actions per row

## 4. Vendor Management

> _To be defined — placeholder for vendor-specific feature requirements._

## 5. Reports & Analytics

> _To be defined — placeholder for ROAS reporting requirements._

## 6. Settings

> _God User only. To be defined — placeholder for system configuration._

## 7. Profile

- All users can view and edit their own profile
- Change password form (current password + new password + confirm)

## 8. Common UI Requirements

### 8.1 Tables
- All tables support: server-side pagination, column sorting, search (debounced), filtering
- Consistent table component used across all list pages

### 8.2 Navigation
- Breadcrumb navigation on all pages
- Role-based menu visibility in sidebar

### 8.3 Responsive Design
- All pages fully responsive (mobile, tablet, desktop)
- MUI breakpoints used consistently
- Sidebar adapts: persistent → collapsible → temporary

### 8.4 Forms
- All forms built with Formik + Yup validation
- Consistent error message display
- Loading states during submission

### 8.5 Route Protection
- Protected routes redirect to `/login` if no session
- Role-gated routes redirect to `/dashboard` if insufficient permissions
- Public routes (`/login`, `/signup`) redirect to `/dashboard` if already logged in


### Send mail to god user after updating its password 

### Campaign add/detail


### Grid/accordion

### service titan integration first check