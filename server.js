require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/database');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
});

// ============================
// Seed Initial Data
// ============================
async function seedDatabase() {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@pamlee.co.za' });
    if (!adminExists) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await User.create({
        email: 'admin@pamlee.co.za',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin'
      });
      console.log('✅ Admin user created: admin@pamlee.co.za / admin123');
    }

    // Check if products exist
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const products = [
        { id: '1', name: 'Chocolate Cake', description: 'Rich chocolate layers with creamy frosting', category: 'cakes', price: 250, image: '../src/assets/product-cake.jpg', isPopular: true },
        { id: '2', name: 'Assorted Cupcakes', description: '6 piece variety pack with different flavors', category: 'cupcakes', price: 120, image: '../src/assets/product-cupcakes.jpg', isPopular: true },
        { id: '3', name: 'French Pastries', description: 'Buttery, flaky pastries fresh from the oven', category: 'pastries', price: 45, image: '../src/assets/product-pastries.jpg', isPopular: false },
        { id: '4', name: 'Artisan Bread', description: 'Freshly baked sourdough with crispy crust', category: 'bread', price: 35, image: '../src/assets/product-bread.jpg', isPopular: false },
        { id: '5', name: 'Vanilla Cake', description: 'Classic vanilla sponge with buttercream', category: 'cakes', price: 220, image: '../src/assets/product-cake.jpg', isPopular: false },
        { id: '6', name: 'Blueberry Muffins', description: 'Moist muffins packed with fresh blueberries', category: 'muffins', price: 60, image: '../src/assets/product-cupcakes.jpg', isPopular: true },
        { id: '7', name: 'Croissants', description: 'Light and buttery French croissants', category: 'pastries', price: 25, image: '../src/assets/product-pastries.jpg', isPopular: false },
        { id: '8', name: 'Whole Wheat Bread', description: 'Healthy whole wheat loaf', category: 'bread', price: 30, image: '../src/assets/product-bread.jpg', isPopular: false }
      ];
      await Product.insertMany(products);
      console.log('✅ Seeded products');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Seed database on startup
seedDatabase();

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
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      role: 'customer'
    });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      token,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================
// API Routes - Health Check
// ============================
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    database: 'MongoDB'
  });
});

// ============================
// API Routes - Products
// ============================
app.get('/api/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    const products = await Product.find(query);

    res.json({
      success: true,
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        image: p.image,
        isPopular: p.isPopular
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    
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
        isPopular: product.isPopular
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id, name, description, category, price, image, isPopular } = req.body;

    if (!id || !name || !category || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await Product.create({
      id,
      name,
      description: description || '',
      category,
      price,
      image: image || '',
      isPopular: isPopular || false
    });

    res.json({ success: true, message: 'Product created' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, category, price, image, isPopular } = req.body;

    await Product.findOneAndUpdate(
      { id: req.params.id },
      { name, description, category, price, image, isPopular }
    );

    res.json({ success: true, message: 'Product updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================
// API Routes - Orders
// ============================
app.post('/api/orders', async (req, res) => {
  try {
    const { trackerId, userEmail, items, subtotal, deliveryFee, total, paymentMethod, fulfilment, deliveryLocation, deliveryAddress } = req.body;

    if (!trackerId || !userEmail || !items || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const timeline = [{
      date: new Date().toLocaleString(),
      status: 'placed',
      message: 'Order placed successfully.'
    }];

    await Order.create({
      trackerId,
      userEmail,
      items,
      subtotal,
      deliveryFee: deliveryFee || 0,
      total,
      paymentMethod,
      fulfilment,
      deliveryLocation: deliveryLocation || 'N/A',
      deliveryAddress: deliveryAddress || 'N/A',
      timeline
    });

    res.json({ success: true, trackerId, message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    let query = {};

    if (req.user.role !== 'admin') {
      query.userEmail = req.user.email;
    }

    const orders = await Order.find(query).sort({ placedAt: -1 });

    res.json({
      success: true,
      orders: orders.map(o => ({
        id: o._id,
        trackerId: o.trackerId,
        userEmail: o.userEmail,
        items: o.items,
        subtotal: o.subtotal,
        deliveryFee: o.deliveryFee,
        total: o.total,
        paymentMethod: o.paymentMethod,
        fulfilment: o.fulfilment,
        deliveryLocation: o.deliveryLocation,
        deliveryAddress: o.deliveryAddress,
        status: o.status,
        timeline: o.timeline,
        placedAt: o.placedAt,
        updatedAt: o.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:trackerId', async (req, res) => {
  try {
    const order = await Order.findOne({ trackerId: req.params.trackerId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        id: order._id,
        trackerId: order.trackerId,
        userEmail: order.userEmail,
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        paymentMethod: order.paymentMethod,
        fulfilment: order.fulfilment,
        deliveryLocation: order.deliveryLocation,
        deliveryAddress: order.deliveryAddress,
        status: order.status,
        timeline: order.timeline,
        placedAt: order.placedAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:trackerId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findOne({ trackerId: req.params.trackerId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.timeline.push({
      date: new Date().toLocaleString(),
      status: status,
      message: note || `Order status updated to "${status}"`
    });
    order.status = status;

    await order.save();

    res.json({ success: true, message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================
// API Routes - Stats (Admin)
// ============================
app.get('/api/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const pendingOrders = await Order.countDocuments({ status: 'placed' });
    const totalProducts = await Product.countDocuments();

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        totalProducts
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================
// Start Server
// ============================
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   Pam_Lee's Kitchen Backend Server     ║
╠════════════════════════════════════════╣
║  🚀 Server running on port ${PORT}       ║
║  📊 Database: MongoDB                  ║
║  🔐 Admin: admin@pamlee.co.za          ║
║  🔑 Password: admin123                 ║
╚════════════════════════════════════════╝
    `);
  });
}

// Export for Vercel serverless
module.exports = app;
