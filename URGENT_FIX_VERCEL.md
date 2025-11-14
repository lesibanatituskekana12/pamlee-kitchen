# 🚨 URGENT: Fix Vercel Deployment Issues

**Current Issues:**
- ❌ Cannot sign in/signup
- ❌ Products not showing
- ❌ Error: "Operation `users.findOne()` buffering timed out"

**Root Cause:** MongoDB environment variables are NOT set in Vercel

---

## ⚡ Quick Fix (5 Minutes)

### Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Click on your project: **pamlee-kitchen**
3. Click **Settings** tab (top navigation)
4. Click **Environment Variables** (left sidebar)

### Step 2: Add Environment Variables

**Add these 4 variables ONE BY ONE:**

#### Variable 1: MONGO_URI
```
Key: MONGO_URI
Value: mongodb+srv://admin:RdLOQWtS5cgkJ9xc@cluster0.6yc6g8u.mongodb.net/pamlee?retryWrites=true&w=majority
Environments: ✅ Production ✅ Preview ✅ Development
```
Click **Save**

#### Variable 2: JWT_SECRET
```
Key: JWT_SECRET
Value: supersecret123
Environments: ✅ Production ✅ Preview ✅ Development
```
Click **Save**

#### Variable 3: JWT_EXPIRES_IN
```
Key: JWT_EXPIRES_IN
Value: 365d
Environments: ✅ Production ✅ Preview ✅ Development
```
Click **Save**

#### Variable 4: NODE_ENV
```
Key: NODE_ENV
Value: production
Environments: ✅ Production only
```
Click **Save**

### Step 3: Redeploy

After adding all 4 variables:

**Option A: Automatic (Recommended)**
- Vercel will automatically redeploy
- Wait 2-3 minutes
- Check your deployment URL

**Option B: Manual**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋯** (three dots menu)
4. Click **Redeploy**
5. Confirm

---

## 🔍 How to Verify It's Fixed

### Test 1: Check Deployment Logs

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **View Function Logs**
4. Look for:
   - ✅ "MongoDB connected successfully"
   - ❌ "MONGO_URI is not defined" (means not fixed yet)

### Test 2: Test Login

1. Go to your deployed app URL
2. Click **Sign In**
3. Try to login with:
   - Email: `admin@pamlee.co.za`
   - Password: `admin123`
4. Should work! ✅

### Test 3: Check Products

1. Go to **Menu** page
2. Should see 8 products ✅
3. Check browser console (F12)
4. Should see: "✅ API client loaded successfully"

---

## 📋 Detailed Instructions with Screenshots

### Finding Environment Variables Section

1. **Login to Vercel**
   - Go to https://vercel.com
   - Click **Login** (top right)
   - Use your GitHub account

2. **Select Your Project**
   - You'll see your dashboard
   - Find **pamlee-kitchen** project
   - Click on it

3. **Go to Settings**
   - Top navigation bar
   - Click **Settings** tab
   - You'll see project settings

4. **Find Environment Variables**
   - Left sidebar menu
   - Click **Environment Variables**
   - You'll see a form to add variables

### Adding Each Variable

**For each variable:**

1. **Key Field**
   - Type the variable name exactly (e.g., `MONGO_URI`)
   - Case-sensitive!

2. **Value Field**
   - Paste the value
   - For MONGO_URI, paste the entire connection string
   - Don't add quotes or spaces

3. **Environments**
   - Check the boxes for which environments
   - For most variables: check all 3
   - For NODE_ENV: only Production

4. **Click Save**
   - Button at bottom of form
   - Variable will be added to list

5. **Repeat**
   - Add next variable
   - Do all 4 variables

---

## ⚠️ Common Mistakes

### Mistake 1: Wrong Variable Names
❌ `MONGODB_URI` (wrong)  
✅ `MONGO_URI` (correct)

❌ `jwt_secret` (wrong)  
✅ `JWT_SECRET` (correct)

### Mistake 2: Extra Spaces
❌ `MONGO_URI = mongodb+srv://...` (has spaces)  
✅ `MONGO_URI=mongodb+srv://...` (no spaces)

### Mistake 3: Missing Environments
❌ Only checked Production  
✅ Check Production, Preview, AND Development

### Mistake 4: Not Saving
❌ Added variable but didn't click Save  
✅ Click Save after each variable

---

## 🔧 Alternative: Using Vercel CLI

If you prefer command line:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Add environment variables
vercel env add MONGO_URI production
# Paste: mongodb+srv://admin:RdLOQWtS5cgkJ9xc@cluster0.6yc6g8u.mongodb.net/pamlee?retryWrites=true&w=majority

vercel env add JWT_SECRET production
# Paste: supersecret123

vercel env add JWT_EXPIRES_IN production
# Paste: 365d

vercel env add NODE_ENV production
# Paste: production

# Also add to preview and development
vercel env add MONGO_URI preview
vercel env add MONGO_URI development
vercel env add JWT_SECRET preview
vercel env add JWT_SECRET development
vercel env add JWT_EXPIRES_IN preview
vercel env add JWT_EXPIRES_IN development

# Redeploy
vercel --prod
```

---

## 🎯 What These Variables Do

### MONGO_URI
- **Purpose:** Connection string to MongoDB database
- **Without it:** App can't connect to database
- **Result:** Login fails, no products, timeout errors

### JWT_SECRET
- **Purpose:** Secret key to sign authentication tokens
- **Without it:** Uses fallback (insecure)
- **Result:** Tokens might not work correctly

### JWT_EXPIRES_IN
- **Purpose:** How long tokens are valid
- **Without it:** Uses default (7 days)
- **Result:** Users logged out after 7 days

### NODE_ENV
- **Purpose:** Tells app it's in production
- **Without it:** Uses development mode
- **Result:** Less optimized, more logging

---

## 🐛 Troubleshooting

### Issue: "MONGO_URI is not defined"

**Solution:**
1. Check variable name is exactly `MONGO_URI`
2. Check it's saved in Vercel
3. Check it's enabled for Production
4. Redeploy after adding

### Issue: Still getting timeout errors

**Possible causes:**
1. MongoDB Atlas IP whitelist
   - Go to MongoDB Atlas
   - Network Access
   - Add IP: `0.0.0.0/0` (allow all)

2. Wrong connection string
   - Check for typos
   - Ensure password is correct
   - Test connection string locally

3. MongoDB cluster paused
   - Go to MongoDB Atlas
   - Check cluster status
   - Resume if paused

### Issue: Products still not showing

**Check:**
1. Environment variables are set ✅
2. Deployment succeeded ✅
3. Check browser console for errors
4. Try hard refresh (Ctrl+Shift+R)
5. Clear browser cache

### Issue: Login works but products don't

**This means:**
- MongoDB connection works ✅
- Products might not be seeded
- Check deployment logs
- Products should seed automatically on first run

---

## 📊 Expected Behavior After Fix

### ✅ Login Page
- Admin login works
- Customer signup works
- No timeout errors
- Redirects to dashboard

### ✅ Menu Page
- Shows 8 products
- Products load from database
- Add to cart works
- Console shows: "✅ API client loaded successfully"

### ✅ Admin Dashboard
- Shows all orders
- Can update order status
- Statistics display correctly
- Real-time updates work

### ✅ Customer Dashboard
- Shows user's orders
- Order tracking works
- Status updates in real-time

---

## 🚀 After Variables Are Set

### Automatic Actions:
1. Vercel detects new variables
2. Triggers automatic redeployment
3. Builds with new environment
4. Deploys to production
5. App connects to MongoDB
6. Seeds admin user and products
7. Everything works! ✅

### Timeline:
- **Adding variables:** 2-3 minutes
- **Redeployment:** 2-3 minutes
- **Total:** ~5 minutes

---

## 📞 Still Having Issues?

### Check Deployment Logs:

1. Go to Vercel Dashboard
2. Click **Deployments**
3. Click latest deployment
4. Click **View Function Logs**
5. Look for errors

### Common Log Messages:

**Good:**
```
✅ MongoDB connected successfully
✅ Seeded products
✅ Admin user created
```

**Bad:**
```
❌ MONGO_URI is not defined
❌ MongoDB connection error
❌ Operation buffering timed out
```

### Get Help:

1. **Check logs first** - tells you what's wrong
2. **Verify all 4 variables** - must be exact
3. **Check MongoDB Atlas** - cluster must be running
4. **Try redeployment** - sometimes fixes issues
5. **Clear cache** - browser and Vercel

---

## ✅ Checklist

Before asking for help, verify:

- [ ] All 4 environment variables added
- [ ] Variable names are exact (case-sensitive)
- [ ] Values have no extra spaces
- [ ] All environments checked (Production, Preview, Development)
- [ ] Clicked Save for each variable
- [ ] Redeployment triggered
- [ ] Waited 5 minutes for deployment
- [ ] Checked deployment logs
- [ ] Tried hard refresh in browser
- [ ] MongoDB Atlas cluster is running
- [ ] IP whitelist includes 0.0.0.0/0

---

## 🎉 Success Indicators

You'll know it's fixed when:

1. ✅ Login page works (no timeout)
2. ✅ Menu shows 8 products
3. ✅ Can add items to cart
4. ✅ Cart badge shows count
5. ✅ Admin dashboard loads
6. ✅ No console errors
7. ✅ Deployment logs show "MongoDB connected"

---

**Last Updated:** 2025-11-14  
**Priority:** 🚨 URGENT  
**Time to Fix:** 5 minutes  
**Difficulty:** Easy (just add variables)

**Remember:** The app code is perfect. It just needs the environment variables to connect to MongoDB!
