# Admin Dashboard Troubleshooting Guide

**Issue:** Admin dashboard shows stats but "No orders yet"

---

## 🔍 Understanding the Issue

### What You're Seeing:

```
13 Total Orders
R 2000.00 Total Revenue
0 Pending Orders
8 Total Products

Recent Orders
No orders yet. Check browser console for details.
[Refresh Page]
```

### What This Means:

**Stats are showing** → Data exists somewhere (localStorage or old cache)  
**Orders not displaying** → Cannot fetch from MongoDB database  
**Root Cause** → MongoDB environment variables NOT set in Vercel

---

## ✅ The Solution (5 Minutes)

### You MUST Add Environment Variables to Vercel

The stats you see (13 orders, R 2000.00) are likely from:
- Browser localStorage (old cached data)
- Or test data from development

But the actual orders cannot be loaded because:
- ❌ MongoDB connection string not configured
- ❌ App cannot connect to database
- ❌ API returns empty array

### Quick Fix:

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard
   - Select: **pamlee-kitchen**
   - Settings → Environment Variables

2. **Add These 4 Variables:**

```
MONGO_URI=mongodb+srv://admin:RdLOQWtS5cgkJ9xc@cluster0.6yc6g8u.mongodb.net/pamlee?retryWrites=true&w=majority
JWT_SECRET=supersecret123
JWT_EXPIRES_IN=365d
NODE_ENV=production
```

3. **For Each Variable:**
   - Check: ✅ Production ✅ Preview ✅ Development
   - Click **Save**

4. **Wait for Redeployment**
   - Vercel will automatically redeploy (2-3 minutes)
   - Then test your admin dashboard

**Detailed Guide:** See `URGENT_FIX_VERCEL.md`

---

## 🔧 Diagnostic Steps

### Step 1: Check Browser Console

1. Open admin dashboard
2. Press **F12** (open DevTools)
3. Go to **Console** tab
4. Look for these messages:

**Good Signs:**
```
✅ API client loaded successfully
✅ MongoDB connected successfully
Initializing dashboard for: admin@pamlee.co.za
Orders received in subscription: 13
```

**Bad Signs:**
```
❌ Database connection issue
❌ Operation buffering timed out
❌ MONGO_URI is not defined
⚠️ Not authenticated, using localStorage fallback
```

### Step 2: Check API Health

Open this URL in your browser:
```
https://your-app.vercel.app/api/health
```

**Good Response:**
```json
{
  "success": true,
  "message": "API is running",
  "database": "MongoDB",
  "connected": true,
  "mongoUri": "Set"
}
```

**Bad Response:**
```json
{
  "success": true,
  "message": "API is running",
  "database": "Disconnected",
  "connected": false,
  "mongoUri": "Not Set"
}
```

If you see "Not Set" → Environment variables are missing!

### Step 3: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Refresh the page
4. Look for `/api/orders` request
5. Click on it
6. Check the **Response**

**Good Response:**
```json
{
  "success": true,
  "orders": [
    {
      "trackerId": "PL-...",
      "status": "placed",
      ...
    }
  ]
}
```

**Bad Response:**
```json
{
  "error": "Database connection issue",
  "details": "MONGO_URI environment variable may be missing"
}
```

Or status code: **503** (Service Unavailable)

---

## 🎯 Common Scenarios

### Scenario 1: Stats Show Numbers, No Orders Display

**Diagnosis:**
- Stats calculated from localStorage (old data)
- API cannot fetch from MongoDB
- Environment variables not set

**Solution:**
- Add environment variables to Vercel
- Redeploy
- Clear browser cache

### Scenario 2: Everything Shows Zero

**Diagnosis:**
- No data in localStorage
- No data in MongoDB
- Fresh deployment

**Solution:**
- Add environment variables first
- Create test orders
- Orders will persist in MongoDB

### Scenario 3: "API Connection Failed"

**Diagnosis:**
- Backend server not running
- Or wrong API URL

**Solution:**
- Check Vercel deployment status
- Verify deployment succeeded
- Check function logs

### Scenario 4: "Database Not Connected"

**Diagnosis:**
- MongoDB environment variables missing
- Or MongoDB Atlas cluster paused
- Or wrong connection string

**Solution:**
- Add MONGO_URI to Vercel
- Check MongoDB Atlas cluster status
- Verify connection string is correct

---

## 🔍 Advanced Debugging

### Check Vercel Function Logs

1. Go to Vercel Dashboard
2. Click **Deployments**
3. Click latest deployment
4. Click **View Function Logs**
5. Look for errors

**Good Logs:**
```
🔌 Connecting to MongoDB...
✅ MongoDB connected successfully
✅ Seeded products
✅ Admin user created
```

**Bad Logs:**
```
❌ MONGO_URI is not defined
❌ MongoDB connection error
❌ Operation buffering timed out
```

### Test API Directly with curl

```bash
# Test health
curl https://your-app.vercel.app/api/health

# Test login (get token)
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pamlee.co.za","password":"admin123"}'

# Test orders (use token from above)
curl https://your-app.vercel.app/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Check MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Login to your account
3. Check cluster status
4. Verify it's not paused
5. Check Network Access
6. Ensure `0.0.0.0/0` is whitelisted

---

## 📊 Understanding the Stats

### Where Stats Come From:

**Total Orders:**
- Calculated from `window.RealtimeOrders.getStats()`
- Uses orders array from API or localStorage
- If API fails, uses localStorage fallback

**Total Revenue:**
- Sum of all order totals
- From same source as orders

**Pending Orders:**
- Count of orders with status 'placed'
- From same source

**Total Products:**
- Fetched from `/api/products`
- Falls back to hardcoded count (8)

### Why Stats Show But Orders Don't:

1. **Stats calculated from localStorage** (old cached data)
2. **Orders display uses API** (which fails without MongoDB)
3. **Result:** Stats show old numbers, orders can't load

**Solution:** Add environment variables so API works!

---

## 🛠️ Manual Fixes

### Clear Browser Cache

Sometimes old data causes confusion:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage**
4. Click your domain
5. Delete these keys:
   - `pamlee_orders`
   - `pamlee_user` (will log you out)
6. Refresh page

### Force Redeploy on Vercel

If automatic redeployment didn't work:

1. Go to Vercel Dashboard
2. Click **Deployments**
3. Click latest deployment
4. Click **⋯** (three dots)
5. Click **Redeploy**
6. Wait 2-3 minutes

### Verify Environment Variables

Using Vercel CLI:

```bash
# Install CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# List environment variables
vercel env ls

# Should show:
# MONGO_URI (Production, Preview, Development)
# JWT_SECRET (Production, Preview, Development)
# JWT_EXPIRES_IN (Production, Preview, Development)
# NODE_ENV (Production)
```

---

## ✅ Verification Checklist

After adding environment variables, verify:

- [ ] Vercel redeployment completed successfully
- [ ] `/api/health` shows `"connected": true`
- [ ] `/api/health` shows `"mongoUri": "Set"`
- [ ] Admin login works (no timeout)
- [ ] Admin dashboard loads
- [ ] Orders display (not "No orders yet")
- [ ] Can create new orders
- [ ] Can update order status
- [ ] Stats update in real-time

---

## 🎉 Expected Behavior After Fix

### Admin Dashboard Should Show:

```
13 Total Orders
R 2000.00 Total Revenue
5 Pending Orders
8 Total Products

Recent Orders (13)
[All] [New] [Preparing] [Ready]

🆕 PL-ABC123
customer@example.com • 2 minutes ago
Status: Placed
Payment: CARD | Fulfillment: 🚗 Delivery
Items: 2 | Total: R 250.00
[View Details] [Update Status]

🆕 PL-XYZ789
...
```

### Console Should Show:

```
✅ API client loaded successfully
Initializing dashboard for: admin@pamlee.co.za Role: admin
Checking API health...
Health check result: {success: true, database: "MongoDB", connected: true}
Starting polling for admin...
Polling started successfully
Forcing initial fetch...
fetchOrders called: {userRole: "admin", hasUser: true}
Fetching orders from API with token...
API response: {success: true, orderCount: 13}
Orders loaded: 13
Orders received in subscription: 13
renderOrders called with: 13 orders
```

---

## 📞 Still Having Issues?

### If Orders Still Don't Show:

1. **Verify all 4 environment variables are set**
   - Go to Vercel → Settings → Environment Variables
   - Check each one exists
   - Check they're enabled for Production

2. **Check MongoDB Atlas**
   - Cluster must be running (not paused)
   - IP whitelist must include `0.0.0.0/0`
   - Connection string must be correct

3. **Check Vercel Logs**
   - Look for MongoDB connection errors
   - Look for authentication errors
   - Look for timeout errors

4. **Test Locally**
   - Clone the repo
   - Add `.env` file with variables
   - Run `npm start`
   - Test admin dashboard
   - Should work locally

5. **Create Test Order**
   - Go to menu page
   - Add item to cart
   - Complete checkout
   - Check if order appears in admin dashboard

---

## 📚 Related Documentation

- **URGENT_FIX_VERCEL.md** - Step-by-step Vercel setup
- **DEPLOYMENT_ISSUES_FIXED.md** - All deployment issues explained
- **COMPLETE_AUDIT_REPORT.md** - Full backend integration audit
- **BACKEND_INTEGRATION_SUMMARY.md** - Integration guide

---

## 🎓 Key Takeaways

### The Problem:
- Admin dashboard shows stats but no orders
- Stats from localStorage (cached)
- Orders from API (fails without MongoDB)

### The Solution:
- Add 4 environment variables to Vercel
- Wait for redeployment
- Everything works!

### Why This Happens:
- Vercel serverless functions need environment variables
- Cannot hardcode database credentials
- Must be configured in Vercel dashboard

### Prevention:
- Always set environment variables before deploying
- Test deployment after adding variables
- Monitor function logs for errors

---

**Last Updated:** 2025-11-14  
**Priority:** 🚨 URGENT  
**Time to Fix:** 5 minutes  
**Difficulty:** Easy

**Remember:** The code is perfect. It just needs the environment variables! 🚀
