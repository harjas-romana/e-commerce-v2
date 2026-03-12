# Premium Store

> Full-stack e-commerce application — React + Express + PostgreSQL

![Live](https://img.shields.io/badge/status-live-16a34a) ![React](https://img.shields.io/badge/React-18-2563eb) ![Express](https://img.shields.io/badge/Express-4-7c3aed) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-0369a1) ![Redis](https://img.shields.io/badge/Redis-Upstash-dc2626)

**Frontend →** https://e-commerce-v2-1.onrender.com  
**Backend API →** https://e-commerce-v2-j5dl.onrender.com

---

## Overview

Premium Store is a production-ready full-stack e-commerce platform. It features a React frontend served via Vite, a Node.js/Express REST API, persistent data in NeonDB (PostgreSQL), optional Redis caching via Upstash, and JWT-based authentication. Both frontend and backend are deployed on Render.

---

## Tech Stack

### Frontend
- **React 18 + Vite** — component-based UI with fast HMR in development
- **React Router v6** — client-side routing with nested layouts
- **Axios** — HTTP client with a shared instance (`src/lib/api.js`) and JWT interceptor
- **DM Sans** — primary typeface loaded via Google Fonts
- **Tailwind CSS** — utility-first styling with custom CSS variables for design tokens
- **Lucide React** — icon library

### Backend
- **Node.js + Express** — REST API on port 3001
- **pg (node-postgres)** — connection pool to NeonDB
- **@upstash/redis** — optional Redis caching layer (gracefully disabled if env vars are absent)
- **bcrypt** — password hashing (10 salt rounds)
- **jsonwebtoken** — stateless JWT authentication

### Infrastructure
- **NeonDB** — serverless PostgreSQL
- **Upstash Redis** — serverless Redis for API response caching (optional)
- **Render** — both frontend (static site) and backend (web service)

---

## Project Structure

```
frontend/
├── src/
│   ├── lib/
│   │   └── api.js              # Axios instance with hardcoded baseURL + JWT interceptor
│   ├── context/
│   │   ├── AuthContext.jsx     # Auth state: login / register / logout
│   │   └── CartContext.jsx     # Cart state: add / remove / update
│   ├── components/
│   │   ├── Header.jsx          # Sticky nav with mobile drawer
│   │   ├── Footer.jsx          # 4-column footer
│   │   ├── ProductCard.jsx     # Card with add-to-cart + checkmark feedback
│   │   └── Layout.jsx          # Shell: Header + <Outlet> + Footer + page-enter animation
│   ├── pages/
│   │   ├── Home.jsx            # Hero, features strip, featured products, CTA banner
│   │   ├── Products.jsx        # Filterable product grid with pill category tabs
│   │   ├── ProductDetail.jsx   # Single product with quantity selector
│   │   ├── Cart.jsx            # Cart with sticky order summary
│   │   ├── Checkout.jsx        # Checkout form with order summary
│   │   ├── Orders.jsx          # Order history with status badges
│   │   ├── Login.jsx           # Two-column auth card
│   │   ├── Register.jsx        # Two-column auth card
│   │   └── AdminDashboard.jsx  # Stats, product CRUD table, order management
│   └── index.css               # Global tokens: DM Sans, CSS variables, grain texture
└── vite.config.js              # Dev proxy: /api -> localhost:3001

backend/
├── server.js                   # Single-file Express app
├── test-api.mjs                # Smoke-test script (30 checks)
└── .env                        # Environment variables
```

---

## Environment Variables

### Backend `.env`

| Variable | Value |
|---|---|
| `DATABASE_URL` | `postgresql://user:pass@host/dbname?sslmode=require` |
| `JWT_SECRET` | any long random string |
| `PORT` | `3001` (optional, defaults to 3001) |
| `UPSTASH_REDIS_URL` | `https://...` (optional) |
| `UPSTASH_REDIS_TOKEN` | your token (optional) |

> Redis is fully optional — if either Upstash variable is absent the server starts normally and skips all caching with no code changes required.

### Frontend

No environment variables needed. The Axios `baseURL` is hardcoded in `src/lib/api.js`. The Vite dev proxy (`vite.config.js`) forwards all `/api/*` requests to `localhost:3001` during local development.

---

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name     TEXT,
  is_admin      BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  price       NUMERIC(10,2) NOT NULL,
  category    TEXT,
  stock       INTEGER DEFAULT 0,
  image_url   TEXT,
  featured    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER REFERENCES users(id),
  total_amount     NUMERIC(10,2),
  status           TEXT DEFAULT 'pending',
  shipping_address TEXT,
  customer_email   TEXT,
  customer_name    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id         SERIAL PRIMARY KEY,
  order_id   INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity   INTEGER,
  price      NUMERIC(10,2)
);
```

---

## API Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register. Body: `{ email, password, fullName }` |
| POST | `/api/auth/login` | Login. Body: `{ email, password }` → `{ token, user }` |

### Products
| Method | Route | Description |
|---|---|---|
| GET | `/api/products` | All in-stock products. Query: `?category=X&featured=true` |
| GET | `/api/products/:id` | Single product |
| GET | `/api/categories` | Distinct category list |
| POST | `/api/products` | Create product *(admin)* |
| PUT | `/api/products/:id` | Update product *(admin)* |
| DELETE | `/api/products/:id` | Delete product *(admin)* |

### Orders
| Method | Route | Description |
|---|---|---|
| POST | `/api/orders` | Place order |
| GET | `/api/orders` | Current user's orders *(auth required)* |
| GET | `/api/admin/orders` | All orders *(admin)* |
| PATCH | `/api/orders/:id/status` | Update status *(admin)*. Body: `{ status }` |

### Admin & Health
| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/stats` | Revenue, orders, products, users *(admin)* |
| GET | `/health` | `{ status: "OK", timestamp }` |

> Protected routes require `Authorization: Bearer <token>`. Admin routes additionally require `is_admin = true` in the database.

---

## Local Development

### Prerequisites
- Node.js 18+
- A NeonDB (or any PostgreSQL) database with the schema above applied
- (Optional) Upstash Redis account

### Backend
```bash
cd backend
npm install
# Create .env with DATABASE_URL and JWT_SECRET
node server.js
# Server runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Vite runs on http://localhost:5173
# /api/* is proxied to localhost:3001 automatically
```

### Smoke tests
```bash
cd backend
node test-api.mjs                                                    # local
API_URL=https://e-commerce-v2-j5dl.onrender.com node test-api.mjs   # production
```
All 30 checks should pass. Exits with code `1` on failure (CI-compatible).

---

## Deployment

### Backend — Render Web Service
1. Connect GitHub repo → Root directory: `backend`
2. Build: `npm install` | Start: `node server.js`
3. Add env vars: `DATABASE_URL`, `JWT_SECRET` (and optionally `UPSTASH_REDIS_URL` + `UPSTASH_REDIS_TOKEN`)

### Frontend — Render Static Site
1. Root directory: `frontend` | Build: `npm run build` | Publish: `dist`
2. Add rewrite rule: `/*` → `/index.html` (status 200) for React Router

### CORS
The backend allowlist in `server.js` permits:
```
https://e-commerce-v2-1.onrender.com   (production frontend)
http://localhost:5173                   (Vite dev server)
http://localhost:4173                   (Vite preview)
```
If you rename your frontend, add the new origin to the `cors({ origin: [...] })` array and redeploy the backend.

---

## Features

### Customer
- Browse, filter by category, and view product details
- Persistent shopping cart (React context, survives navigation)
- Guest and authenticated checkout
- Order history with live status badges
- JWT authentication with auto-token injection on every API request

### Admin
- Dashboard overview — revenue, orders, products, users
- Full product CRUD with image URL and featured toggle
- Order management — view all orders, update status inline
- All admin routes return `403` for non-admin users

### Technical
- Optional Redis caching (5-min TTL on products, 10-min on categories)
- Transactional order creation — stock check, insert, and decrement in one PostgreSQL transaction
- Page-enter animations on every route change
- Responsive — mobile drawer nav, fluid type scale, auto-fill grids

---

## Making a User Admin

Run this in your NeonDB SQL editor after the user has registered:

```sql
UPDATE users SET is_admin = true WHERE email = 'your@email.com';
```

---

*Built with React, Express, NeonDB, and Upstash Redis. Deployed on Render.*
