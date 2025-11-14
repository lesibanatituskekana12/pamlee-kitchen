# MongoDB Migration & Deployment Guide

## ✅ Changes Made

### 1. Migrated from SQLite to MongoDB
- Removed `better-sqlite3` dependency (incompatible with Vercel serverless)
- Added `mongoose` for MongoDB connection
- Created Mongoose models for User, Product, and Order

### 2. New File Structure
```
/models
  ├── User.js       - User schema and model
  ├── Product.js    - Product schema and model
  └── Order.js      - Order schema and model

/config
  └── database.js   - MongoDB connection handler
```

### 3. Updated server.js
- All routes now use MongoDB/Mongoose
- Async/await pattern throughout
- Proper error handling
- Auto-seeding of admin user and products

## 🚀 Deployment to Vercel

### Step 1: Set Environment Variables in Vercel

Go to your Vercel project settings and add these environment variables:

```bash
MONGO_URI=mongodb+srv://admin:RdLOQWtS5cgkJ9xc@cluster0.6yc6g8u.mongodb.net/pamlee?retryWrites=true&w=majority
JWT_SECRET=supersecret123
JWT_EXPIRES_IN=365d
```

**Important:** In production, use a stronger JWT_SECRET!

### Step 2: Deploy

```bash
# Option 1: Push to GitHub (if connected to Vercel)
git add .
git commit -m "Migrate to MongoDB for Vercel compatibility"
git push origin main

# Option 2: Deploy directly with Vercel CLI
vercel --prod
```

### Step 3: Verify Deployment

1. Check the deployment logs in Vercel dashboard
2. Visit your site and test:
   - Sign up: Create a new account
   - Login: Use admin@pamlee.co.za / admin123
   - Browse products
   - Place an order
   - Access admin dashboard

## 🔧 Local Development

### Start the server:
```bash
npm start
```

### Test endpoints:
```bash
# Health check
curl http://localhost:3000/api/health

# Get products
curl http://localhost:3000/api/products

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pamlee.co.za","password":"admin123"}'
```

## 📊 Database Schema

### Users Collection
- email (unique, required)
- password (hashed, required)
- name (required)
- role (customer/admin)
- timestamps

### Products Collection
- id (unique string ID)
- name, description, category
- price, image
- isPopular (boolean)
- timestamps

### Orders Collection
- trackerId (unique)
- userEmail
- items (array of products)
- subtotal, deliveryFee, total
- paymentMethod, fulfilment
- deliveryLocation, deliveryAddress
- status, timeline
- placedAt, timestamps

## ✅ Features Working

- ✅ User signup/login
- ✅ JWT authentication
- ✅ Product browsing
- ✅ Order placement
- ✅ Order tracking
- ✅ Admin dashboard
- ✅ Product management (admin)
- ✅ Order management (admin)
- ✅ Statistics (admin)

## 🔐 Default Admin Credentials

```
Email: admin@pamlee.co.za
Password: admin123
```

**Change this in production!**

## 📝 Notes

- MongoDB connection is established on first request (serverless optimization)
- Database is auto-seeded with admin user and sample products
- All passwords are hashed with bcrypt
- JWT tokens expire after 365 days (configurable)
