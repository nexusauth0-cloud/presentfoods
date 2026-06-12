# Present Foods 🍛

A full-stack food ordering platform with role-based routing, real order management, and a warm Nigerian-inspired UI.

**Live Demo:** [https://presentfoods.vercel.app](https://presentfoods.vercel.app)

---

## Features

### Guest Landing Page
- Hero section with AI-powered food suggestion modal, tagline, and CTA
- Dynamic featured meals section pulling from live database
- Category showcase, How It Works guide, and footer with contact info ("Kwara, Nigeria")

### User Dashboard
- **Browse meals** — search, filter by category, view meal cards with prices/discounts/ratings
- **Cart** — two-step checkout: review items → confirm delivery address; pay-on-delivery only
- **Orders** — list all orders with real-time status badges; cancel pending orders
- **Favorites** — save and manage favorite meals
- **Address book** — full CRUD with default address selection
- **Profile** — edit name and phone number
- **Notifications** — in-app notifications for order placement, cancellation, and status updates
- **Wallet** — "Coming Soon" with pay-on-delivery note (no online payments)

### Admin Panel
- **Manage Meals** — table with add/edit/delete; image upload via file picker or URL; fields for name, description, price, category, discount, new badge
- **Manage Orders** — view all orders system-wide; update status through pending → confirmed → preparing → out_for_delivery → delivered; users notified automatically on each status change
- **Users** — list all users; promote/demote admin roles

### Auth & Security
- JWT-based authentication with bcrypt password hashing
- Role-based middleware (`user` / `admin`) on both frontend and backend
- Admin registration via `ADMIN_CODE` environment variable
- Rate limiting on auth endpoints (20 requests per 15 minutes)
- CORS configured via `ALLOWED_ORIGINS` env var
- JSON catch-all for unknown API routes

### Notifications
- Welcome notification on signup
- "Order Placed" notification with item summary for the customer
- "admin_order" notification for all admin users when a new order is placed
- "Order Updated" notification when admin changes order status
- "Order Cancelled" notification when user cancels
- Unread count badge on dashboard sidebar bell icon

### UI/UX
- Warm color palette (orange primary, amber secondary) — rounded buttons, Poppins/Inter fonts
- Responsive: sidebar starts collapsed (icons-only) on desktop, overlay drawer + bottom nav on mobile
- Cart badge and notification badge displayed on sidebar and mobile bottom nav
- Back-button logout confirmation (`window.confirm` on `popstate`)
- First-visit permission prompt for geolocation and browser notifications
- ServerWakeup splash screen for Render cold-start (pings `/api/health`, shows "Waking up..." after 2s)
- ErrorBoundary wrapping entire app with refresh fallback

---

## Tech Stack

| Layer      | Technology                                                           |
| ---------- | -------------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7         |
| Backend    | Node.js, Express, better-sqlite3, JWT (jsonwebtoken), bcryptjs       |
| Database   | SQLite (single `data.db` file, auto-seeded with 12 Nigerian meals)   |
| Auth       | JWT tokens stored in localStorage, bcrypt password hashing           |
| Uploads    | Multer (local filesystem via `/uploads` static route)                |
| Deploy     | Vercel (frontend), Render (backend)                                  |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Clone & Install

```bash
git clone https://github.com/nexusauth0-cloud/presentfoods.git
cd presentfoods

# Backend
cd backend
cp .env.example .env    # then edit as needed
npm install
node src/index.js       # starts on :5000

# Frontend (new terminal)
cd frontend
cp .env.example .env    # set VITE_API_URL
npm install
npx vite                # starts on :5173
```

### 2. Environment Variables

**Backend (`backend/.env`)**

| Variable          | Required | Default                        | Description                                   |
| ----------------- | -------- | ------------------------------ | --------------------------------------------- |
| `PORT`            | No       | `5000`                         | Server port                                   |
| `JWT_SECRET`      | Yes      | (auto-generated if missing)    | JWT signing secret                            |
| `ADMIN_CODE`      | No       | `admin123`                     | Code users enter at signup to become admin     |
| `ALLOWED_ORIGINS` | No       | `http://localhost:5173`        | Comma-separated CORS origins                  |
| `ADMIN_PHONE`     | No       | —                              | Comma-separated admin phone numbers (unused)  |

**Frontend (`frontend/.env`)**

| Variable        | Required | Default | Description               |
| --------------- | -------- | ------- | ------------------------- |
| `VITE_API_URL`  | Yes      | —       | Backend URL (e.g. `http://localhost:5000`) |

### 3. Database

SQLite file (`backend/data.db`) is created automatically on first run. 12 Nigerian meals are seeded into an empty table. Delete `data.db` to reset.

---

## Project Structure

```
presentfoods/
├── backend/
│   ├── src/
│   │   ├── index.js              # Express app entry, routes, middleware
│   │   ├── db.js                 # SQLite schema + seed data
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verification + role fetch
│   │   │   └── admin.js          # Admin role check (wraps auth)
│   │   └── routes/
│   │       ├── auth.js           # signup, login, me, profile
│   │       ├── meals.js          # public GET meals list/detail
│   │       ├── orders.js         # user CRUD + cancel
│   │       ├── favorites.js      # user favorites CRUD
│   │       ├── addresses.js      # user addresses CRUD
│   │       ├── notifications.js  # list, read, read-all, unread-count
│   │       ├── wallet.js         # balance + history (no payments)
│   │       └── admin.js          # admin: meals CRUD, orders mgmt, users mgmt
│   ├── uploads/                  # uploaded meal images
│   ├── package.json
│   └── render.yaml               # Render service config
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx               # Routes, ServerWakeup, ErrorBoundary
│   │   ├── api/
│   │   │   └── client.ts         # Fetch wrapper with JWT + upload support
│   │   ├── context/
│   │   │   ├── AuthContext.tsx    # Auth state, login/logout/signup
│   │   │   └── CartContext.tsx    # Cart state (frontend-only)
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx        # Dashboard layout (sidebar + bottom nav)
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── MobileBottomNav.tsx
│   │   │   │   └── PublicLayout.tsx  # Landing page layout
│   │   │   ├── landing/          # HeroSection, CategoriesSection, etc.
│   │   │   ├── ServerWakeup.tsx  # Cold-start splash
│   │   │   ├── PermissionPrompt.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── pages/
│   │       ├── Landing.tsx
│   │       ├── Login.tsx
│   │       ├── Dashboard*.tsx    # Home, Browse, Cart, Orders, etc.
│   │       └── Admin*.tsx        # AdminMeals, AdminOrders, AdminUsers
│   ├── vercel.json               # SPA rewrites
│   └── package.json
└── README.md
```

---

## API Endpoints

### Public
| Method | Endpoint              | Description      |
| ------ | --------------------- | ---------------- |
| GET    | `/api/health`         | Health check     |
| GET    | `/api/meals`          | List meals       |
| GET    | `/api/meals/:id`      | Get meal detail  |
| GET    | `/api/meals/categories` | List categories |

### Auth
| Method | Endpoint                | Description            |
| ------ | ----------------------- | ---------------------- |
| POST   | `/api/auth/signup`      | Register (admin code optional) |
| POST   | `/api/auth/login`       | Login                  |
| GET    | `/api/auth/me`          | Current user profile   |
| PUT    | `/api/auth/profile`     | Update name/phone      |

### Orders (authenticated)
| Method | Endpoint                     | Description           |
| ------ | ---------------------------- | --------------------- |
| GET    | `/api/orders`                | User's orders         |
| GET    | `/api/orders/:id`            | Order detail          |
| POST   | `/api/orders`                | Place order           |
| PATCH  | `/api/orders/:id/cancel`     | Cancel (pending only) |

### Notifications (authenticated)
| Method | Endpoint                         | Description         |
| ------ | -------------------------------- | ------------------- |
| GET    | `/api/notifications`             | List notifications  |
| GET    | `/api/notifications/unread-count` | Unread count        |
| PUT    | `/api/notifications/read-all`    | Mark all read       |
| PUT    | `/api/notifications/:id/read`    | Mark single read    |

### Favorites, Addresses, Wallet (authenticated)
| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| GET    | `/api/favorites`          | List favorites           |
| POST   | `/api/favorites/:mealId`  | Add to favorites         |
| DELETE | `/api/favorites/:mealId`  | Remove from favorites    |
| GET    | `/api/addresses`          | List addresses           |
| POST   | `/api/addresses`          | Create address           |
| PUT    | `/api/addresses/:id`      | Update address           |
| DELETE | `/api/addresses/:id`      | Delete address           |
| GET    | `/api/wallet`             | Wallet info (static)     |

### Admin (admin only)
| Method | Endpoint                         | Description          |
| ------ | -------------------------------- | -------------------- |
| POST   | `/api/admin/meals`               | Create meal (multipart) |
| PUT    | `/api/admin/meals/:id`           | Update meal (multipart) |
| DELETE | `/api/admin/meals/:id`           | Delete meal          |
| GET    | `/api/admin/orders`              | List all orders      |
| PUT    | `/api/admin/orders/:id/status`   | Update order status  |
| GET    | `/api/admin/users`               | List all users       |
| PUT    | `/api/admin/users/:id/role`      | Change user role     |

---

## Deployment

### Frontend (Vercel)
1. Push to GitHub
2. Import repo into Vercel
3. Set `VITE_API_URL` to your Render backend URL
4. Vercel auto-deploys on push

### Backend (Render)
1. Create a Web Service from the `backend/` directory
2. Set build command: `npm install`
3. Set start command: `node src/index.js`
4. Set required environment variables
5. Render auto-deploys on push

### Preventing Cold Starts
Create a free cron-job at [cron-job.org](https://cron-job.org) that pings `https://your-app.onrender.com/api/health` every 10 minutes.

---

## Key Design Decisions

- **No mock data** — all data is SQLite-backed; meals are seeded on first launch
- **Pay on delivery** — no online payment integration; wallet module shows "Coming Soon"
- **In-app only notifications** — admins receive order alerts via the bell icon, not WhatsApp
- **Frontend-only cart** — cart is managed via React Context; items are sent as JSON when the order is placed
- **Admin notifications** — on new order, ALL admin users receive a notification (type `admin_order`)
- **Permission prompts** — location and notification permissions are requested on first visit, tracked in localStorage, and shown on both public and dashboard layouts
- **Image uploads** — stored on the server's local filesystem and served via `/uploads` static route; for production with persistence, migrate to Cloudinary/S3

---

## Future Improvements

- Image upload migration to Cloudinary or S3 for persistence across server restarts
- Email notifications via SMTP (password reset, order confirmations)
- Online payment integration (Paystack, Flutterwave)
- Real-time order updates via WebSocket or Server-Sent Events
- Password reset flow with email verification
- Order rating and review system
- Multi-language support
- Dark mode

---

Built with ❤️ for Nigerian food lovers.
