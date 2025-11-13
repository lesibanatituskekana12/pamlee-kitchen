# 🚀 Deploy to Vercel NOW - Quick Guide

Your code is **ready and pushed to GitHub**! Choose one of these methods:

---

## ⚡ Method 1: Vercel Dashboard (5 minutes - EASIEST)

### Step 1: Open Vercel
👉 **[Click here to open Vercel](https://vercel.com/new)**

### Step 2: Import Your Repository
1. Sign in with GitHub
2. Click **"Import Git Repository"**
3. Find **"pamlee-kitchen"** in the list
4. Click **"Import"**

### Step 3: Configure (Keep defaults, just add env vars)
**Framework Preset:** Other (auto-detected)

**Environment Variables** - Click "Add" for each:

```
JWT_SECRET = pamlee_secret_key_2025_production_secure
JWT_EXPIRES_IN = 365d
NODE_ENV = production
```

### Step 4: Deploy
Click **"Deploy"** button

⏱️ Wait 2-3 minutes...

### Step 5: Done! 🎉
You'll get a URL like: `https://pamlee-kitchen-xxxxx.vercel.app`

---

## 💻 Method 2: From Your Local Machine

### Prerequisites
- Git installed
- Node.js installed
- Your GitHub repo cloned locally

### Steps:

```bash
# 1. Navigate to your project
cd pamlee-kitchen

# 2. Pull latest changes
git pull origin main

# 3. Install Vercel CLI
npm install -g vercel

# 4. Login to Vercel
vercel login
# (Opens browser for authentication)

# 5. Deploy to production
vercel --prod

# 6. Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Select your account)
# - Link to existing project? No
# - Project name? pamlee-kitchen
# - Directory? ./
# - Override settings? No

# 7. Add environment variables when prompted:
# JWT_SECRET = pamlee_secret_key_2025_production_secure
# JWT_EXPIRES_IN = 365d
# NODE_ENV = production
```

---

## 🔑 Environment Variables Explained

### JWT_SECRET
**What it is:** Secret key for encrypting user authentication tokens

**Value to use:**
```
pamlee_secret_key_2025_production_secure
```

**Or generate a secure one:**
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use any random string (32+ characters)
```

### JWT_EXPIRES_IN
**What it is:** How long users stay logged in

**Value to use:**
```
365d
```
(365 days = 1 year)

### NODE_ENV
**What it is:** Tells the app it's in production mode

**Value to use:**
```
production
```

---

## ✅ After Deployment - Test These

Once deployed, test your site:

### 1. Homepage
`https://your-site.vercel.app/`
- Should load without errors
- Menu, gallery, contact links work

### 2. Menu Page
`https://your-site.vercel.app/menu.html`
- Products display
- Can add to cart
- Cart icon shows count

### 3. Checkout with Card
- Add items to cart
- Click checkout
- Select "Card" payment
- Enter test card: `4532 1488 0343 6467`
- Expiry: `12/25`
- CVV: `123`
- Name: `Test User`
- Should validate and accept

### 4. Admin Dashboard
`https://your-site.vercel.app/admin.html`
- Login: `admin@pamlee.co.za`
- Password: `admin123`
- Dashboard loads
- Orders display
- Can update order status

### 5. API Endpoints
`https://your-site.vercel.app/api/products`
- Should return JSON with products

---

## 🐛 Troubleshooting

### Issue: "Application Error"
**Solution:** Check Vercel deployment logs
1. Go to Vercel Dashboard
2. Click on your project
3. Click "Deployments"
4. Click latest deployment
5. Click "View Function Logs"

### Issue: Environment variables not working
**Solution:** 
1. Go to Project Settings → Environment Variables
2. Make sure all 3 variables are added
3. Redeploy: Deployments → Click "..." → Redeploy

### Issue: Old code showing
**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or open in incognito/private mode

### Issue: Database is empty
**Expected:** SQLite resets on each deployment
**Solution:** For production, migrate to Vercel Postgres or external database

---

## 📊 What's Included in This Deployment

✅ **Card Payment Validation**
- Luhn algorithm validation
- Card type detection (Visa, Mastercard, Amex, Discover)
- Real-time validation feedback
- Expiry date and CVV validation

✅ **Admin Dashboard**
- Fixed all function errors
- Real-time order updates
- Order status management
- Order details modal

✅ **Real-time System**
- Live order updates
- Cross-tab synchronization
- Polling every 5 seconds

✅ **Error Handling**
- Graceful error messages
- Console logging for debugging
- Fallback mechanisms

✅ **Performance**
- Cache busting (v=3)
- Optimized loading
- Static file serving

---

## 🎯 Quick Deployment Checklist

Before deploying, verify:
- ✅ Code pushed to GitHub (DONE ✓)
- ✅ vercel.json exists (DONE ✓)
- ✅ All JavaScript files valid (DONE ✓)
- ✅ Environment variables ready (DONE ✓)
- ✅ Documentation complete (DONE ✓)

**You're ready to deploy! Choose Method 1 or 2 above.**

---

## 🆘 Need Help?

**Vercel Documentation:** https://vercel.com/docs
**Vercel Support:** https://vercel.com/support

**Your GitHub Repo:** https://github.com/lesibanatituskekana12/pamlee-kitchen

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Live production website
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments on git push
- ✅ Free hosting (Hobby plan)

**Deployment Time:** ~3 minutes
**Cost:** FREE (Vercel Hobby plan)

---

**Last Updated:** November 13, 2025
**Status:** READY TO DEPLOY 🚀
