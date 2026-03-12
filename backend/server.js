import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import { Redis } from '@upstash/redis';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Database ──────────────────────────────────────────────────────
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => console.error('[DB] Unexpected pool error:', err));

// ── Redis (optional) ──────────────────────────────────────────────
let redis = null;
if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
  redis = new Redis({
    url:   process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
  });
  console.log('[Redis] Enabled');
} else {
  console.log('[Redis] Disabled — running without cache');
}

/** Safe get: returns null if Redis is unavailable or key is missing */
const cacheGet = async (key) => {
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    // Upstash returns already-parsed objects; guard against stored "undefined"
    return val !== undefined && val !== null ? val : null;
  } catch (e) {
    console.warn('[Redis] get error:', e.message);
    return null;
  }
};

/** Safe set with TTL (seconds); silently skips if Redis is unavailable */
const cacheSet = async (key, value, ttl = 300) => {
  if (!redis || value === undefined) return;
  try {
    await redis.setex(key, ttl, value);
  } catch (e) {
    console.warn('[Redis] setex error:', e.message);
  }
};

/** Safe delete; silently skips if Redis is unavailable */
const cacheDel = async (...keys) => {
  if (!redis) return;
  try {
    await Promise.all(keys.map((k) => redis.del(k)));
  } catch (e) {
    console.warn('[Redis] del error:', e.message);
  }
};

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Auth helpers ──────────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) return res.status(403).json({ error: 'Admin access required' });
  next();
};

// ═══════════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, is_admin',
      [email, hashedPassword, fullName]
    );
    const user  = result.rows[0];
    const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, isAdmin: user.is_admin } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user   = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, isAdmin: user.is_admin } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  PRODUCT ROUTES
// ═══════════════════════════════════════════════════════════════════

app.get('/api/products', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const cacheKey = `products:${category || 'all'}:${featured || 'all'}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    let query  = 'SELECT * FROM products WHERE stock > 0';
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (featured === 'true') {
      query += ' AND featured = true';
    }
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    await cacheSet(cacheKey, result.rows, 300);
    res.json(result.rows);
  } catch (error) {
    console.error('[GET /api/products]', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id }   = req.params;
    const cacheKey = `product:${id}`;

    const cached = await cacheGet(cacheKey);
    if (cached) return res.json(cached);

    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    await cacheSet(cacheKey, result.rows[0], 300);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('[GET /api/products/:id]', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const cached = await cacheGet('categories');
    if (cached) return res.json(cached);

    const result     = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
    const categories = result.rows.map((r) => r.category);

    await cacheSet('categories', categories, 600);
    res.json(categories);
  } catch (error) {
    console.error('[GET /api/categories]', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl, featured } = req.body;
    const result = await pool.query(
      'INSERT INTO products (name, description, price, category, stock, image_url, featured) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, description, price, category, stock, imageUrl, featured ?? false]
    );
    await cacheDel('products:all:all', 'categories');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, imageUrl, featured } = req.body;
    const result = await pool.query(
      `UPDATE products
       SET name=$1, description=$2, price=$3, category=$4, stock=$5,
           image_url=$6, featured=$7, updated_at=CURRENT_TIMESTAMP
       WHERE id=$8 RETURNING *`,
      [name, description, price, category, stock, imageUrl, featured, id]
    );
    await cacheDel(`product:${id}`, 'products:all:all');
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    await cacheDel(`product:${id}`, 'products:all:all');
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  ORDER ROUTES
// ═══════════════════════════════════════════════════════════════════

app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { items, shippingAddress, customerEmail, customerName, userId } = req.body;

    let totalAmount = 0;
    for (const item of items) {
      const { rows } = await client.query(
        'SELECT price, stock FROM products WHERE id = $1',
        [item.productId]
      );
      const product = rows[0];
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
      totalAmount += parseFloat(product.price) * item.quantity;
    }

    const orderResult = await client.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, customer_email, customer_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [userId || null, totalAmount, shippingAddress, customerEmail, customerName]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      const { rows } = await client.query('SELECT price FROM products WHERE id = $1', [item.productId]);
      await client.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.id, item.productId, item.quantity, rows[0].price]
      );
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.productId]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*,
         json_agg(json_build_object(
           'product_id', oi.product_id,
           'quantity',   oi.quantity,
           'price',      oi.price,
           'name',       p.name
         )) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products     p  ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*,
         json_agg(json_build_object(
           'product_id', oi.product_id,
           'quantity',   oi.quantity,
           'price',      oi.price,
           'name',       p.name
         )) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products     p  ON oi.product_id = p.id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;
    const result     = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ═══════════════════════════════════════════════════════════════════
//  ADMIN STATS
// ═══════════════════════════════════════════════════════════════════

app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        (SELECT COUNT(*)                                       FROM orders)                          AS total_orders,
        (SELECT COALESCE(SUM(total_amount), 0)                FROM orders WHERE status != 'cancelled') AS total_revenue,
        (SELECT COUNT(*)                                       FROM products)                        AS total_products,
        (SELECT COUNT(*)                                       FROM users)                           AS total_users
    `);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`[Server] Listening on port ${PORT}`));

// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import pg from 'pg';
// import { Redis } from '@upstash/redis';
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Database connection
// const pool = new pg.Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false }
// });

// // Redis connection
// // Redis connection (optional)
// let redis = null;

// if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
//   redis = new Redis({
//     url: process.env.UPSTASH_REDIS_URL,
//     token: process.env.UPSTASH_REDIS_TOKEN,
//   });
//   console.log('[Redis] Enabled');
// } else {
//   console.log('[Redis] Disabled (missing UPSTASH_REDIS_URL/UPSTASH_REDIS_TOKEN)');
// }

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Auth Middleware
// const authenticateToken = (req, res, next) => {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];
  
//   if (!token) return res.status(401).json({ error: 'Access denied' });
  
//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ error: 'Invalid token' });
//     req.user = user;
//     next();
//   });
// };

// // Admin Middleware
// const requireAdmin = (req, res, next) => {
//   if (!req.user.isAdmin) {
//     return res.status(403).json({ error: 'Admin access required' });
//   }
//   next();
// };

// // ==================== AUTH ROUTES ====================

// // Register
// app.post('/api/auth/register', async (req, res) => {
//   try {
//     const { email, password, fullName } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
    
//     const result = await pool.query(
//       'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name, is_admin',
//       [email, hashedPassword, fullName]
//     );
    
//     const user = result.rows[0];
//     const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET);
    
//     res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, isAdmin: user.is_admin } });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Login
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//     const user = result.rows[0];
    
//     if (!user || !(await bcrypt.compare(password, user.password_hash))) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }
    
//     const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET);
    
//     res.json({ 
//       token, 
//       user: { id: user.id, email: user.email, fullName: user.full_name, isAdmin: user.is_admin } 
//     });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // ==================== PRODUCT ROUTES ====================

// // Get all products with caching
// app.get('/api/products', async (req, res) => {
//   try {
//     const { category, featured } = req.query;
//     const cacheKey = `products:${category || 'all'}:${featured || 'all'}`;
    
//     // Check cache
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       return res.json(cached);
//     }
    
//     let query = 'SELECT * FROM products WHERE stock > 0';
//     const params = [];
    
//     if (category) {
//       params.push(category);
//       query += ` AND category = $${params.length}`;
//     }
    
//     if (featured === 'true') {
//       query += ' AND featured = true';
//     }
    
//     query += ' ORDER BY created_at DESC';
    
//     const result = await pool.query(query, params);
    
//     // Cache for 5 minutes
//     await redis.setex(cacheKey, 300, result.rows);
    
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get single product
// app.get('/api/products/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const cacheKey = `product:${id}`;
    
//     const cached = await redis.get(cacheKey);
//     if (cached) {
//       return res.json(cached);
//     }
    
//     const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
//     if (result.rows.length === 0) {
//       return res.status(404).json({ error: 'Product not found' });
//     }
    
//     await redis.setex(cacheKey, 300, result.rows[0]);
    
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get categories
// app.get('/api/categories', async (req, res) => {
//   try {
//     const cached = await redis.get('categories');
//     if (cached) {
//       return res.json(cached);
//     }
    
//     const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
//     const categories = result.rows.map(row => row.category);
    
//     await redis.setex('categories', 600, categories);
    
//     res.json(categories);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Create product (Admin only)
// app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { name, description, price, category, stock, imageUrl, featured } = req.body;
    
//     const result = await pool.query(
//       'INSERT INTO products (name, description, price, category, stock, image_url, featured) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
//       [name, description, price, category, stock, imageUrl, featured || false]
//     );
    
//     // Invalidate cache
//     await redis.del('products:all:all');
    
//     res.status(201).json(result.rows[0]);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Update product (Admin only)
// app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, description, price, category, stock, imageUrl, featured } = req.body;
    
//     const result = await pool.query(
//       'UPDATE products SET name = $1, description = $2, price = $3, category = $4, stock = $5, image_url = $6, featured = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *',
//       [name, description, price, category, stock, imageUrl, featured, id]
//     );
    
//     // Invalidate cache
//     await redis.del(`product:${id}`);
//     await redis.del('products:all:all');
    
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // Delete product (Admin only)
// app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     await pool.query('DELETE FROM products WHERE id = $1', [id]);
    
//     await redis.del(`product:${id}`);
//     await redis.del('products:all:all');
    
//     res.json({ message: 'Product deleted successfully' });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // ==================== ORDER ROUTES ====================

// // Create order
// app.post('/api/orders', async (req, res) => {
//   const client = await pool.connect();
  
//   try {
//     await client.query('BEGIN');
    
//     const { items, shippingAddress, customerEmail, customerName, userId } = req.body;
    
//     // Calculate total and verify stock
//     let totalAmount = 0;
//     for (const item of items) {
//       const productResult = await client.query('SELECT price, stock FROM products WHERE id = $1', [item.productId]);
//       const product = productResult.rows[0];
      
//       if (!product || product.stock < item.quantity) {
//         throw new Error(`Insufficient stock for product ${item.productId}`);
//       }
      
//       totalAmount += product.price * item.quantity;
//     }
    
//     // Create order
//     const orderResult = await client.query(
//       'INSERT INTO orders (user_id, total_amount, shipping_address, customer_email, customer_name) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//       [userId || null, totalAmount, shippingAddress, customerEmail, customerName]
//     );
    
//     const order = orderResult.rows[0];
    
//     // Create order items and update stock
//     for (const item of items) {
//       const productResult = await client.query('SELECT price FROM products WHERE id = $1', [item.productId]);
//       const product = productResult.rows[0];
      
//       await client.query(
//         'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
//         [order.id, item.productId, item.quantity, product.price]
//       );
      
//       await client.query(
//         'UPDATE products SET stock = stock - $1 WHERE id = $2',
//         [item.quantity, item.productId]
//       );
//     }
    
//     await client.query('COMMIT');
    
//     res.status(201).json(order);
//   } catch (error) {
//     await client.query('ROLLBACK');
//     res.status(400).json({ error: error.message });
//   } finally {
//     client.release();
//   }
// });

// // Get user orders
// app.get('/api/orders', authenticateToken, async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT o.*, json_agg(json_build_object('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name)) as items
//        FROM orders o
//        LEFT JOIN order_items oi ON o.id = oi.order_id
//        LEFT JOIN products p ON oi.product_id = p.id
//        WHERE o.user_id = $1
//        GROUP BY o.id
//        ORDER BY o.created_at DESC`,
//       [req.user.id]
//     );
    
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Get all orders (Admin only)
// app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT o.*, json_agg(json_build_object('product_id', oi.product_id, 'quantity', oi.quantity, 'price', oi.price, 'name', p.name)) as items
//        FROM orders o
//        LEFT JOIN order_items oi ON o.id = oi.order_id
//        LEFT JOIN products p ON oi.product_id = p.id
//        GROUP BY o.id
//        ORDER BY o.created_at DESC`
//     );
    
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Update order status (Admin only)
// app.patch('/api/orders/:id/status', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
    
//     const result = await pool.query(
//       'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
//       [status, id]
//     );
    
//     res.json(result.rows[0]);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });

// // ==================== STATS (Admin) ====================

// app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
//   try {
//     const stats = await pool.query(`
//       SELECT 
//         (SELECT COUNT(*) FROM orders) as total_orders,
//         (SELECT SUM(total_amount) FROM orders WHERE status != 'cancelled') as total_revenue,
//         (SELECT COUNT(*) FROM products) as total_products,
//         (SELECT COUNT(*) FROM users) as total_users
//     `);
    
//     res.json(stats.rows[0]);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Health check
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });