# ShopEasy — Full-Stack E-Commerce Platform

Tech stack: **React.js, Node.js, Express.js, PostgreSQL, REST APIs**

Features:
- User authentication (register/login) with JWT + bcrypt password hashing
- Product catalog with search & category filtering
- Shopping cart (add/update/remove items, per logged-in user)
- Checkout & order management (order history, order detail)
- Admin dashboard: manage products (CRUD), view all orders, update order status, view quick stats

---

## 1. Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ installed and running locally

## 2. Database setup

Create the database and load the schema (adjust the username if needed):

```bash
createdb ecommerce_db
psql -U postgres -d ecommerce_db -f backend/schema.sql
```

This creates all tables and seeds 6 sample products.

## 3. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env: set DB_PASSWORD to your local PostgreSQL password,
# and set JWT_SECRET to any long random string
npm install
npm run dev
```

The API will run at `http://localhost:5000`. Check it's alive:
```bash
curl http://localhost:5000/api/health
```

## 4. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173`.

## 5. Creating an admin account

There's no public "become admin" button (for security). Instead:

1. Register a normal account in the app (e.g. `you@example.com`).
2. In `psql`, promote it:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
   ```
3. Log out and log back in in the app — you'll now see an **Admin** link in the navbar.

## Project structure

```
ecommerce-platform/
├── backend/
│   ├── routes/          # auth, products, cart, orders, admin
│   ├── middleware/       # JWT auth + admin-role guard
│   ├── db.js             # PostgreSQL connection pool
│   ├── schema.sql        # table definitions + seed data
│   └── server.js         # Express app entry point
└── frontend/
    └── src/
        ├── api/          # axios instance (attaches JWT to requests)
        ├── context/      # AuthContext, CartContext (global state)
        ├── components/   # Navbar, ProductCard, PrivateRoute
        └── pages/        # Home, ProductDetail, Cart, Checkout, Orders, AdminDashboard, Login, Register
```

## API overview

| Method | Endpoint                    | Auth        | Description                    |
|--------|------------------------------|-------------|---------------------------------|
| POST   | /api/auth/register            | —           | Create account                  |
| POST   | /api/auth/login                | —           | Log in, get JWT                 |
| GET    | /api/auth/me                   | user        | Current user profile            |
| GET    | /api/products                   | —           | List products (search/category) |
| GET    | /api/products/:id                | —           | Product detail                  |
| POST   | /api/products                    | admin       | Create product                  |
| PUT    | /api/products/:id                 | admin       | Update product                  |
| DELETE | /api/products/:id                  | admin       | Delete product                  |
| GET    | /api/cart                          | user        | Get my cart                     |
| POST   | /api/cart                           | user        | Add item to cart                |
| PUT    | /api/cart/:cartItemId                 | user        | Update quantity                 |
| DELETE | /api/cart/:cartItemId                  | user        | Remove item                     |
| POST   | /api/orders                             | user        | Place order from cart           |
| GET    | /api/orders                              | user        | My order history                |
| GET    | /api/orders/:id                           | owner/admin | Order detail                    |
| GET    | /api/admin/orders                          | admin       | All orders                      |
| PUT    | /api/admin/orders/:id/status                | admin       | Update order status             |
| GET    | /api/admin/stats                             | admin       | Dashboard stats                 |

## Notes

- Order placement uses a PostgreSQL transaction (`BEGIN`/`COMMIT`/`ROLLBACK`) with row locking (`FOR UPDATE`) so stock is validated and decremented safely.
- Passwords are hashed with bcrypt (10 salt rounds); plain-text passwords are never stored.
- JWTs are stored in `localStorage` on the frontend and attached via an axios request interceptor.
