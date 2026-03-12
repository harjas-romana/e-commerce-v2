-- Neon PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    shipping_address TEXT NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cart_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    cart_data JSONB NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Sample Products Data
INSERT INTO products (name, description, price, category, stock, image_url, featured) VALUES
('Premium Wireless Headphones', 'High-quality over-ear headphones with active noise cancellation and 30-hour battery life', 299.99, 'Electronics', 50, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', true),
('Smart Watch Pro', 'Advanced fitness tracking, heart rate monitor, GPS, and smartphone notifications', 399.99, 'Electronics', 30, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', true),
('Minimalist Backpack', 'Sleek design with laptop compartment, water-resistant material, and ergonomic straps', 89.99, 'Accessories', 100, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', false),
('Mechanical Keyboard', 'RGB backlit mechanical gaming keyboard with programmable keys and premium switches', 149.99, 'Electronics', 45, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', true),
('Leather Wallet', 'Genuine leather bifold wallet with RFID protection and multiple card slots', 49.99, 'Accessories', 200, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', false),
('Portable Charger 20000mAh', 'High-capacity power bank with fast charging and dual USB ports', 59.99, 'Electronics', 75, 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', false),
('Sunglasses Classic', 'UV400 protection polarized lenses with durable metal frame', 129.99, 'Accessories', 60, 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500', false),
('Wireless Mouse', 'Ergonomic design with adjustable DPI and rechargeable battery', 39.99, 'Electronics', 120, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', false),
('Stainless Steel Water Bottle', 'Insulated bottle keeps drinks cold for 24h, hot for 12h, leak-proof design', 34.99, 'Accessories', 150, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', false),
('Bluetooth Speaker', 'Portable waterproof speaker with 360-degree sound and 15-hour playtime', 79.99, 'Electronics', 85, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500', true),
('Canvas Tote Bag', 'Eco-friendly heavy-duty canvas bag with reinforced handles', 24.99, 'Accessories', 180, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500', false),
('USB-C Hub Adapter', '7-in-1 multiport adapter with HDMI, USB 3.0, SD card reader, and PD charging', 54.99, 'Electronics', 95, 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500', false);



-- ─────────────────────────────────────────────────────────────────
--  Products — enhanced data, premium descriptions, crisp images
-- ─────────────────────────────────────────────────────────────────

TRUNCATE TABLE products RESTART IDENTITY CASCADE;

INSERT INTO products (name, description, price, category, stock, image_url, featured) VALUES

-- ── Electronics ────────────────────────────────────────────────
('Sony WH-1000XM5 Headphones',
 'Industry-leading noise cancellation with 30-hour battery, ultra-comfortable fit, and crystal-clear call quality. The gold standard in wireless audio.',
 349.99, 'Electronics', 48,
 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85',
 true),

('Apple Watch Ultra 2',
 'Titanium case with the most rugged design ever. Precision dual-frequency GPS, up to 60-hour battery, and an action button built for the most demanding adventures.',
 799.99, 'Electronics', 22,
 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=85',
 true),

('Keychron Q1 Pro Keyboard',
 'Fully assembled wireless mechanical keyboard with QMK/VIA support, double-gasket design, and south-facing RGB. Office-ready, gamer-grade.',
 199.99, 'Electronics', 40,
 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=85',
 true),

('Logitech MX Master 3S Mouse',
 'Whisper-quiet clicks, 8K-DPI sensor, and MagSpeed electromagnetic scroll wheel. Works seamlessly across three computers with a single click.',
 99.99, 'Electronics', 110,
 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=85',
 false),

('Anker 737 Power Bank 24000mAh',
 'Charges a MacBook Pro from 0–100% in under two hours. Bi-directional 140W USB-C, smart display, and aircraft-grade lithium cells.',
 149.99, 'Electronics', 65,
 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=85',
 false),

('Bose SoundLink Max Speaker',
 'Room-filling 360° sound with PartyMode pairing. IP67 waterproof, 20-hour battery, and a fabric-wrapped body that goes everywhere you do.',
 399.99, 'Electronics', 55,
 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=85',
 true),

('LG UltraFine 27" 4K Monitor',
 'Nano IPS panel, 99% DCI-P3, factory-calibrated to ΔE < 1. One Thunderbolt 4 cable delivers power, data, and a flawlessly sharp image.',
 699.99, 'Electronics', 18,
 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=85',
 false),

('Sony ZV-E10 II Camera',
 'APS-C mirrorless camera engineered for creators. 26MP sensor, real-time eye-tracking, and vlog-optimised audio with directional 3-capsule mic.',
 899.99, 'Electronics', 14,
 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=85',
 true),

('Twelve South HiRise 3 Deluxe',
 'Adjustable-height stand crafted from machined aluminium. Raises any laptop to eye level, pairs beautifully with any desk setup.',
 99.99, 'Electronics', 80,
 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=85',
 false),

('CalDigit TS4 Thunderbolt 4 Dock',
 '18 ports. One cable. Powers your MacBook or PC at up to 98W while connecting 4K displays, 10Gb Ethernet, SD cards, and USB-A/C peripherals.',
 349.99, 'Electronics', 30,
 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=85',
 false),

('DJI Neo Drone',
 'Foldable 4K/60fps drone weighing just 135g. Obstacle sensing, 34-min flight time, and one-tap cinematic modes that make every shot look professional.',
 649.99, 'Electronics', 20,
 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=85',
 false),

('Kindle Paperwhite Signature',
 'Wireless charging, auto-adjusting warm light, and 32GB of storage for thousands of books. The finest e-reader ever made, now with a glare-free 7" display.',
 149.99, 'Electronics', 90,
 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=85',
 false),

-- ── Accessories ────────────────────────────────────────────────
('Bellroy Tokyo Totepack',
 'Convertible tote-to-backpack in premium woven nylon. Hidden laptop sleeve fits up to 16", magnetic carry handle, and a lifetime warranty.',
 279.99, 'Accessories', 75,
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85',
 false),

('Cuyana Classic Zip Wallet',
 'Full-grain Italian leather with 8 card slots, a slim bifold silhouette, and RFID-blocking lining. Comes with a monogram option.',
 95.99, 'Accessories', 180,
 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=85',
 false),

('Ray-Ban Wayfarer Classic',
 'Iconic acetate frame with G-15 lenses that filter 85% of visible light. UV400 certified. Worn by icons for over six decades.',
 173.99, 'Accessories', 55,
 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=85',
 true),

('Hydro Flask 32 oz Wide Mouth',
 'TempShield™ double-wall vacuum insulation keeps drinks cold 24 hours, hot 12 hours. Dishwasher-safe, dent-resistant, and Lifetime Warranty.',
 44.99, 'Accessories', 140,
 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=85',
 false),

('Baggu Standard Bag',
 'Made from 40% recycled ripstop nylon, holds 2–3× more than a standard grocery bag. Folds into its own pocket and comes in 50+ prints.',
 12.99, 'Accessories', 220,
 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=85',
 false),

('Herschel Little America Backpack',
 'Signature stripe lining, fleece-lined laptop sleeve for 15", and antique-brass hardware. A timeless silhouette built for city and trail alike.',
 109.99, 'Accessories', 85,
 'https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&q=85',
 false),

('Nomad Base One Max MagSafe',
 'Precision-machined aircraft-grade aluminium charger pad. MagSafe at 15W, AirPods at 5W, Apple Watch Fast Charge — all simultaneously.',
 149.99, 'Accessories', 60,
 'https://images.unsplash.com/photo-1591799265444-d66432b91588?w=800&q=85',
 false),

('Casio G-Shock GA-2100',
 'Carbon Core Guard structure in an ultra-thin 11.8mm case. Shock-resistant, 200m water-resistant, and the closest thing to indestructible on your wrist.',
 99.99, 'Accessories', 70,
 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85',
 true),

('Peak Design Travel Tripod',
 'Folds to the size of a water bottle yet extends to 152cm. 5-leg carbon-fibre design, Arca-Swiss compatible head, and a 9-kg load capacity.',
 599.99, 'Accessories', 25,
 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&q=85',
 false),

('Aesop Resurrection Aromatique',
 'Hand wash infused with mandarin rind, rosemary leaf, and cedar atlas. Formulated without parabens or sulphates. A ritual in every use.',
 39.99, 'Accessories', 200,
 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=85',
 false),

('Stojo Collapsible Cup 16oz',
 'Food-grade silicone cup that collapses to 3cm. Leakproof lid, fits standard cup holders, and replaces 500 disposable cups per year.',
 29.99, 'Accessories', 160,
 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=85',
 false),

('Matador NanoDry Towel',
 'Nano-fibre technology dries twice as fast as microfibre at a fraction of the weight. Rolls to the size of a fist. Built for every adventure.',
 34.99, 'Accessories', 120,
 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85',
 false);




-- Admin user (password: admin123)
INSERT INTO users (email, password_hash, full_name, is_admin) VALUES
('admin@store.com', '$2b$10$rKqM8xQxH9p7mVZ8YvXxYO8yZjL5X5kF5YvXxYO8yZjL5X5kF5YvXx', 'Store Admin', true);


-- Delete old admin if exists
DELETE FROM users WHERE email = 'admin@store.com';

-- Create admin with properly hashed password
-- Password: admin123
UPDATE users SET password_hash = '$2b$10$ZE/Y6CiwQjmsQfkY4uLSS.CMZ0cHVw5najUOfPEodEF0ODZFyES4C' WHERE email = 'admin@store.com';