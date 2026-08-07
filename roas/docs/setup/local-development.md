# Local Development Setup

## Prerequisites

| Tool      | Version  | Installation                        |
| --------- | -------- | ----------------------------------- |
| Node.js   | >= 18.x  | https://nodejs.org or `nvm install 18` |
| MongoDB   | >= 6.x   | https://www.mongodb.com/docs/manual/installation/ or MongoDB Atlas |
| npm       | >= 9.x   | Bundled with Node.js                |

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repo-url>
cd roas-printfast
```

### 2. Install Dependencies

```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

```bash
# From project root
cp .env.example server/.env
cp .env.example client/.env
```

Edit `server/.env`:
- Set `MONGODB_URI` to your local MongoDB connection string
- Set `SESSION_SECRET` to a strong random string
- Set `GOD_USER_EMAIL` and `GOD_USER_PASSWORD` for initial seed

Edit `client/.env`:
- Set `VITE_API_BASE_URL` to `http://localhost:5000/api/v1`

See [environment-variables.md](environment-variables.md) for full details.

### 4. Start MongoDB

**Local MongoDB:**
```bash
mongod --dbpath /path/to/your/data
```

**MongoDB Atlas:** Ensure your IP is whitelisted and connection string is in `.env`.

### 5. Seed the God User

```bash
cd server
npm run seed:god-user
```

This creates the initial super admin account using the credentials from `.env`. You will use this account to create all other admin and vendor users.

### 6. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

### 7. Verify Setup

1. Open http://localhost:5173 in your browser
2. Log in with the God User credentials from `.env`
3. You should see the admin dashboard

## Build & Type Check

Run these before pushing code:

```bash
# Server
cd server
npm run build
npm run type-check
npm run lint

# Client
cd client
npm run build
npm run type-check
npm run lint
```

## Common Commands

| Command               | Location | Description                   |
| --------------------- | -------- | ----------------------------- |
| `npm run dev`         | server/  | Start backend dev server      |
| `npm run dev`         | client/  | Start frontend dev server     |
| `npm run build`       | both     | Production build              |
| `npm run type-check`  | both     | TypeScript type checking      |
| `npm run lint`        | both     | Run ESLint                    |
| `npm run format`      | both     | Run Prettier                  |
| `npm run seed:god-user` | server/ | Create initial God User     |
