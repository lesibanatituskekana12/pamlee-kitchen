require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Initialize SQLite database
const db = new Database('pamlee.db');
db.pragma('journal_mode = WAL');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// ============================
// Database Schema
// ============================
function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'customer',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      image TEXT,
      is_popular INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracker_id TEXT UNIQUE NOT NULL,
      user_email TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      delivery_fee REAL DEFAULT 0,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL,
      fulfilment TEXT NOT NULL,
      delivery_location TEXT,
      delivery_address TEXT,
      status TEXT DEFAULT 'placed',
      timeline TEXT,
      placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Add new columns if they don't exist (for existing databases)
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN delivery_location TEXT`);
  } catch (e) { /* Column already exists */ }
  
  try {
    db.exec(`ALTER TABLE orders ADD COLUMN delivery_address TEXT`);
  } catch (e) { /* Column already exists */ }

  // Seed initial products if empty
  const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (productCount.count === 0) {
    seedProducts();
  }

  // Create admin user if not exists
  const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@pamlee.co.za');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(
      'admin@pamlee.co.za',
      hashedPassword,
      'Admin',
      'admin'
    );
    console.log('✅ Admin user created: admin@pamlee.co.za / admin123');
  }
}

function seedProducts() {
  const products = [
    { id: '1', name: 'Chocolate Cake', description: 'Rich chocolate layers with creamy frosting', category: 'cakes', price: 250, image: '../src/assets/product-cake.jpg', is_popular: 1 },
    { id: '2', name: 'Assorted Cupcakes', description: '6 piece variety pack with different flavors', category: 'cupcakes', price: 120, image: '../src/assets/product-cupcakes.jpg', is_popular: 1 },
    { id: '3', name: 'French Pastries', description: 'Buttery, flaky pastries fresh from the oven', category: 'pastries', price: 45, image: '../src/assets/product-pastries.jpg', is_popular: 0 },
    { id: '4', name: 'Artisan Bread', description: 'Freshly baked sourdough with crispy crust', category: 'bread', price: 35, image: '../src/assets/product-bread.jpg', is_popular: 0 },
    { id: '5', name: 'Vanilla Cake', description: 'Classic vanilla sponge with buttercream', category: 'cakes', price: 220, image: '../src/assets/product-cake.jpg', is_popular: 0 },
    { id: '6', name: 'Blueberry Muffins', description: 'Moist muffins packed with fresh blueberries', category: 'muffins', price: 60, image: '../src/assets/product-cupcakes.jpg', is_popular: 1 },
    { id: '7', name: 'Croissants', description: 'Light and buttery French croissants', category: 'pastries', price: 25, image: '../src/assets/product-pastries.jpg', is_popular: 0 },
    { id: '8', name: 'Whole Wheat Bread', description: 'Healthy whole wheat loaf', category: 'bread', price: 30, image: '../src/assets/product-bread.jpg', is_popular: 0 }
  ];

  const insert = db.prepare('INSERT INTO products (id, name, description, category, price, image, is_popular) VALUES (?, ?, ?, ?, ?, ?, ?)');
  products.forEach(p => insert.run(p.id, p.name, p.description, p.category, p.price, p.image, p.is_popular));
  console.log('✅ Seeded products');
}

// ============================
// Auth Middleware
// ============================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ============================
// API Routes - Auth
// ============================
app.post('/api/auth/signup', (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)').run(
      email,
      hashedPassword,
      name || email.split('@')[0]
    );

    const token = jwt.sign({ id: result.lastInsertRowid, email, role: 'customer' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      token,
      user: { id: result.lastInsertRowid, email, name: name || email.split('@')[0], role: 'customer' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(req.user.id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================
// API Routes - Products
// ============================
app.get('/api/products', (req, res) => {
  try {
    const { category } = req.query;
    let products;

    if (category && category !== 'all') {
      products = db.prepare('SELECT * FROM products WHERE category = ?').all(category);
    } else {
      products = db.prepare('SELECT * FROM products').all();
    }

    res.json({
      success: true,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        image: p.image,
        isPopular: p.is_popular === 1
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        image: product.image,
        isPopular: product.is_popular === 1
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id, name, description, category, price, image, isPopular } = req.body;

    if (!id || !name || !category || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    db.prepare('INSERT INTO products (id, name, description, category, price, image, is_popular) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      id,
      name,
      description || '',
      category,
      price,
      image || '',
      isPopular ? 1 : 0
    );

    res.json({ success: true, message: 'Product created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, description, category, price, image, isPopular } = req.body;

    db.prepare('UPDATE products SET name = ?, description = ?, category = ?, price = ?, image = ?, is_popular = ? WHERE id = ?').run(
      name,
      description,
      category,
      price,
      image,
      isPopular ? 1 : 0,
      req.params.id
    );

    res.json({ success: true, message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================
// API Routes - Orders
// ============================
app.post('/api/orders', (req, res) => {
  try {
    const { trackerId, userEmail, items, subtotal, deliveryFee, total, paymentMethod, fulfilment, deliveryLocation, deliveryAddress } = req.body;

    if (!trackerId || !userEmail || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const timeline = JSON.stringify([{
      date: new Date().toLocaleString(),
      status: 'placed',
      message: 'Order placed successfully.'
    }]);

    db.prepare(`
      INSERT INTO orders (tracker_id, user_email, items, subtotal, delivery_fee, total, payment_method, fulfilment, delivery_location, delivery_address, timeline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      trackerId,
      userEmail,
      JSON.stringify(items),
      subtotal,
      deliveryFee || 0,
      total,
      paymentMethod,
      fulfilment,
      deliveryLocation || 'N/A',
      deliveryAddress || 'N/A',
      timeline
    );

    res.json({ success: true, trackerId, message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    let orders;

    if (req.user.role === 'admin') {
      orders = db.prepare('SELECT * FROM orders ORDER BY placed_at DESC').all();
    } else {
      orders = db.prepare('SELECT * FROM orders WHERE user_email = ? ORDER BY placed_at DESC').all(req.user.email);
    }

    res.json({
      success: true,
      orders: orders.map(o => ({
        id: o.id,
        trackerId: o.tracker_id,
        userEmail: o.user_email,
        items: JSON.parse(o.items),
        subtotal: o.subtotal,
        deliveryFee: o.delivery_fee,
        total: o.total,
        paymentMethod: o.payment_method,
        fulfilment: o.fulfilment,
        deliveryLocation: o.delivery_location,
        deliveryAddress: o.delivery_address,
        status: o.status,
        timeline: JSON.parse(o.timeline || '[]'),
        placedAt: o.placed_at,
        updatedAt: o.updated_at
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:trackerId', (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE tracker_id = ?').get(req.params.trackerId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        trackerId: order.tracker_id,
        userEmail: order.user_email,
        items: JSON.parse(order.items),
        subtotal: order.subtotal,
        deliveryFee: order.delivery_fee,
        total: order.total,
        paymentMethod: order.payment_method,
        fulfilment: order.fulfilment,
        deliveryLocation: order.delivery_location,
        deliveryAddress: order.delivery_address,
        status: order.status,
        timeline: JSON.parse(order.timeline || '[]'),
        placedAt: order.placed_at,
        updatedAt: order.updated_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:trackerId', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status, note } = req.body;

    const order = db.prepare('SELECT * FROM orders WHERE tracker_id = ?').get(req.params.trackerId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const timeline = JSON.parse(order.timeline || '[]');
    timeline.push({
      date: new Date().toLocaleString(),
      status: status,
      message: note || `Order status updated to "${status}"`
    });

    db.prepare('UPDATE orders SET status = ?, timeline = ?, updated_at = CURRENT_TIMESTAMP WHERE tracker_id = ?').run(
      status,
      JSON.stringify(timeline),
      req.params.trackerId
    );

    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================
// API Routes - Stats (Admin)
// ============================
app.get('/api/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const totalOrders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const totalRevenue = db.prepare('SELECT SUM(total) as sum FROM orders').get().sum || 0;
    const pendingOrders = db.prepare('SELECT COUNT(*) as count FROM orders WHERE status = "placed"').get().count;
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        totalProducts
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================
// Initialize and Start Server
// ============================
initDatabase();

// Start server (only if not in Vercel serverless environment)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   Pam_Lee's Kitchen Backend Server     ║
╠════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}       ║
║  📊 Database: pamlee.db                ║
║  🔐 Admin: admin@pamlee.co.za          ║
║  🔑 Password: admin123                 ║
╚════════════════════════════════════════╝
    `);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    db.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  });
}

// Export for Vercel serverless
module.exports = app;
