-- Run this once against your PostgreSQL database to create all tables:
--   psql -U postgres -d ecommerce_db -f schema.sql

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer', -- 'customer' or 'admin'
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100),
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- pending, processing, shipped, delivered, cancelled
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL, -- snapshot in case product changes/deleted later
    price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- Seed a few sample products so the app isn't empty on first run.
-- To get an admin account: register a normal account through the app,
-- then run:  UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
-- (see README for the exact steps).

INSERT INTO products (name, description, price, category, image_url, stock) VALUES
('Wireless Headphones', 'Over-ear Bluetooth headphones with noise cancellation.', 79.99, 'Electronics', 'https://picsum.photos/seed/headphones/400/400', 25),
('Running Shoes', 'Lightweight breathable running shoes for daily training.', 59.99, 'Footwear', 'https://picsum.photos/seed/shoes/400/400', 40),
('Stainless Steel Water Bottle', 'Insulated 750ml bottle, keeps drinks cold for 24h.', 19.99, 'Home & Kitchen', 'https://picsum.photos/seed/bottle/400/400', 100),
('Mechanical Keyboard', 'RGB backlit mechanical keyboard with hot-swappable switches.', 89.99, 'Electronics', 'https://picsum.photos/seed/keyboard/400/400', 15),
('Yoga Mat', 'Non-slip 6mm yoga mat with carry strap.', 24.99, 'Sports', 'https://picsum.photos/seed/yogamat/400/400', 60),
('Backpack', 'Water-resistant 25L backpack with laptop compartment.', 44.99, 'Accessories', 'https://picsum.photos/seed/backpack/400/400', 35);
