# Vercel Environment Variables Checklist

## 🔍 Step-by-Step Verification

Since you mentioned you already added the environment variables, let's verify they're set correctly:

---

## Step 1: Verify Variables Are Actually Set

1. Go to: https://vercel.com/tituskekana03-9253s-projects/pamlee-kitchen
2. Click **Settings** (top navigation)
3. Click **Environment Variables** (left sidebar)
4. You should see these 4 variables:

### Required Variables:

| Variable Name | Value Starts With | Environments |
|---------------|-------------------|--------------|
| `MONGO_URI` | `mongodb+srv://admin:` | Production, Preview, Development |
| `JWT_SECRET` | `supersecret123` | Production, Preview, Development |
| `JWT_EXPIRES_IN` | `365d` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production only |

**Check each one:**
- ✅ Variable name is EXACT (case-sensitive)
- ✅ Value is complete (no truncation)
- ✅ Correct environments are checked
- ✅ Shows "Saved" status

---

## Step 2: Check If Redeployment Happened

After adding variables, Vercel should automatically redeploy:

1. Go to **Deployments** tab
2. Check the latest deployment
3. Look at the timestamp - should be AFTER you added variables
4. Status should be **Ready** (green checkmark)

**If deployment is old:**
- Variables were added but deployment didn't trigger
- You need to manually redeploy

**To manually redeploy:**
1. Click on latest deployment
2. Click **⋯** (three dots menu)
3. Click **Redeploy**
4. Wait 2-3 minutes

---

## Step 3: Check Deployment Logs

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **View Function Logs** or **Runtime Logs**
4. Look for these messages:

**Good signs:**
```
✅ MongoDB connected successfully
🔌 Connecting to MongoDB...
✅ Seeded products
✅ Admin user created
```

**Bad signs:**
```
❌ MONGO_URI is not defined
❌ MongoDB connection error
❌ Operation buffering timed out
```

---

## Step 4: Test Your Deployment

### Option A: Use the Diagnostic Page

1. Go to your deployed app URL
2. Add `/test-deployment.html` to the end
3. Example: `https://pamlee-kitchen-xyz.vercel.app/test-deployment.html`
4. Page will auto-run tests
5. Check results:
   - ✅ All green = Everything works
   - ❌ Any red = Something wrong

### Option B: Test API Health Manually

1. Open this URL in your browser:
   ```
   https://your-app-url.vercel.app/api/health
   ```

2. You should see:
   ```json
   {
     "success": true,
     "database": "MongoDB",
     "connected": true,
     "mongoUri": "Set"
   }
   ```

3. If you see `"connected": false` or `"mongoUri": "Not Set"`:
   - Variables aren't working
   - Need to check Steps 1-2 again

---

## Step 5: Test Admin Login

1. Go to your app: `https://your-app-url.vercel.app`
2. Click **Sign In**
3. Try admin login:
   - Email: `admin@pamlee.co.za`
   - Password: `admin123`

**Expected results:**
- ✅ Login succeeds → Redirects to admin dashboard
- ❌ "Invalid credentials" → Database not connected
- ❌ "Timeout" error → Database not connected

---

## Common Issues & Fixes

### Issue 1: Variables Set But Not Working

**Possible causes:**
1. Variables added AFTER deployment
2. Deployment didn't auto-trigger
3. Wrong environment selected

**Fix:**
1. Verify variables are set for **Production** environment
2. Manually redeploy (Step 2 above)
3. Wait 2-3 minutes
4. Test again

### Issue 2: "mongoUri: Not Set" in Health Check

**This means:**
- Variable name is wrong (typo)
- Variable not saved properly
- Wrong environment

**Fix:**
1. Go back to Environment Variables
2. Check variable name is exactly: `MONGO_URI` (not `MONGODB_URI`)
3. Delete and re-add if needed
4. Make sure to click **Save**
5. Redeploy

### Issue 3: "connected: false" in Health Check

**This means:**
- MONGO_URI is set but value is wrong
- MongoDB Atlas cluster is paused
- IP whitelist issue

**Fix:**
1. Check MONGO_URI value is complete:
   ```
   mongodb+srv://admin:RdLOQWtS5cgkJ9xc@cluster0.6yc6g8u.mongodb.net/pamlee?retryWrites=true&w=majority
   ```
2. Go to MongoDB Atlas
3. Check cluster is running (not paused)
4. Network Access → IP Whitelist → Add `0.0.0.0/0`

### Issue 4: Admin Dashboard Shows Stats But No Orders

**This means:**
- Stats from localStorage (old cached data)
- API cannot fetch from MongoDB
- Database connection issue

**Fix:**
1. Follow Steps 1-3 above
2. Verify MongoDB is connected
3. Clear browser cache
4. Refresh admin dashboard

---

## Quick Verification Commands

If you have Vercel CLI installed:

```bash
# List environment variables
vercel env ls

# Should show:
# MONGO_URI (Production, Preview, Development)
# JWT_SECRET (Production, Preview, Development)
# JWT_EXPIRES_IN (Production, Preview, Development)
# NODE_ENV (Production)

# If any are missing, add them:
vercel env add MONGO_URI production
vercel env add MONGO_URI preview
vercel env add MONGO_URI development
# (paste the value when prompted)

# Then redeploy
vercel --prod
```

---

## What Should Work After Fix

### ✅ Homepage
- Products load from database
- Add to cart works
- Cart badge shows count

### ✅ Menu Page
- 8 products display
- Category filtering works
- Add to cart works

### ✅ Login Page
- Admin login works (no timeout)
- Customer signup works
- Redirects correctly

### ✅ Admin Dashboard
- Shows list of orders (not "No orders yet")
- Stats are accurate
- Can update order status
- Real-time updates work

### ✅ Customer Dashboard
- Shows user's orders
- Order tracking works
- Status updates in real-time

---

## Still Not Working?

### Double-Check These:

1. **Variable Names** (must be exact):
   - ✅ `MONGO_URI` (not `MONGODB_URI`, not `MONGOURL`)
   - ✅ `JWT_SECRET` (not `JWT_KEY`, not `SECRET`)
   - ✅ `JWT_EXPIRES_IN` (not `JWT_EXPIRY`)
   - ✅ `NODE_ENV` (not `ENVIRONMENT`)

2. **Variable Values** (must be complete):
   - MONGO_URI: Full connection string (starts with `mongodb+srv://`)
   - JWT_SECRET: `supersecret123`
   - JWT_EXPIRES_IN: `365d`
   - NODE_ENV: `production`

3. **Environments** (must be checked):
   - MONGO_URI: ✅ Production ✅ Preview ✅ Development
   - JWT_SECRET: ✅ Production ✅ Preview ✅ Development
   - JWT_EXPIRES_IN: ✅ Production ✅ Preview ✅ Development
   - NODE_ENV: ✅ Production only

4. **Deployment** (must be recent):
   - Check timestamp is AFTER adding variables
   - Status is "Ready" (green)
   - No build errors

---

## Need More Help?

### Share These Details:

1. **Health Check Response:**
   - Go to: `https://your-app-url.vercel.app/api/health`
   - Copy the JSON response
   - Share it

2. **Deployment Logs:**
   - Go to: Deployments → Latest → View Function Logs
   - Look for MongoDB-related messages
   - Share any errors

3. **Environment Variables Screenshot:**
   - Go to: Settings → Environment Variables
   - Take screenshot (hide sensitive values)
   - Verify all 4 are there

4. **Test Results:**
   - Go to: `https://your-app-url.vercel.app/test-deployment.html`
   - Run tests
   - Share which tests failed

---

## Summary

### If you already added variables:

1. ✅ Verify they're actually saved
2. ✅ Check deployment happened AFTER adding them
3. ✅ Test with `/api/health` endpoint
4. ✅ If still not working, manually redeploy
5. ✅ Use `/test-deployment.html` to diagnose

### Most common issue:

**Variables added but deployment didn't trigger**
- Solution: Manually redeploy from Deployments tab

### Second most common:

**Variable name typo**
- Solution: Check exact spelling (case-sensitive)

---

**Your Deployment:** https://vercel.com/tituskekana03-9253s-projects/pamlee-kitchen

**Next Step:** Follow Step 1 above to verify variables are actually set correctly.
