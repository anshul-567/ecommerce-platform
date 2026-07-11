-- Run this against your EXISTING database to add 10 more products
-- without touching your users, orders, or cart data.
--
-- From your project root folder, run:
--   psql -U postgres -d ecommerce_db -f backend\add_more_products.sql
--
-- (On Mac/Linux use forward slashes: backend/add_more_products.sql)

INSERT INTO products (name, description, price, category, image_url, stock) VALUES
('Smart Watch', 'Fitness tracking smartwatch with heart-rate monitor and 7-day battery.', 129.99, 'Electronics', 'https://picsum.photos/seed/smartwatch/400/400', 20),
('Wireless Mouse', 'Ergonomic wireless mouse with silent clicks and adjustable DPI.', 24.99, 'Electronics', 'https://picsum.photos/seed/mouse/400/400', 50),
('Leather Wallet', 'Slim genuine leather bifold wallet with RFID protection.', 34.99, 'Accessories', 'https://picsum.photos/seed/wallet/400/400', 45),
('Ceramic Coffee Mug Set', 'Set of 4 handcrafted ceramic mugs, 12oz each, dishwasher safe.', 29.99, 'Home & Kitchen', 'https://picsum.photos/seed/mugset/400/400', 30),
('Denim Jacket', 'Classic fit denim jacket, washed cotton, unisex sizing.', 64.99, 'Clothing', 'https://picsum.photos/seed/jacket/400/400', 22),
('Cotton T-Shirt', 'Soft 100% organic cotton crew-neck tee, available in multiple colors.', 17.99, 'Clothing', 'https://picsum.photos/seed/tshirt/400/400', 80),
('Adjustable Dumbbell Set', 'Space-saving dumbbells, adjustable from 5-25 lbs per hand.', 149.99, 'Sports', 'https://picsum.photos/seed/dumbbells/400/400', 12),
('Desk Lamp', 'LED desk lamp with 3 brightness levels and USB charging port.', 32.99, 'Home & Kitchen', 'https://picsum.photos/seed/desklamp/400/400', 38),
('Bluetooth Speaker', 'Portable waterproof speaker with 12-hour battery life.', 49.99, 'Electronics', 'https://picsum.photos/seed/speaker/400/400', 27),
('Sunglasses', 'Polarized UV400 sunglasses with lightweight aluminum frame.', 39.99, 'Accessories', 'https://picsum.photos/seed/sunglasses/400/400', 55);
