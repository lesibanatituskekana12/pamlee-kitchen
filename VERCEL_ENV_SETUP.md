# Vercel Environment Variables Setup Guide

## ❌ Current Issue
Vercel deployment is failing because environment variables are not configured in the Vercel dashboard.

**Error:** `Environment Variable "MONGO_URI" references Secret "mongo_uri", which does not exist.`

## ✅ Solution

You need to add the environment variables directly in the Vercel dashboard. Follow these steps:

### Step 1: Access Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **pamlee-kitchen**
3. Click on **Settings** tab
4. Click on **Environment Variables** in the left sidebar

### Step 2: Add Environment Variables

Add the following environment variables one by one:

#### 1. MONGO_URI
- **Key:** `MONGO_URI`
- **Value:** `mongodb+srv://admin:RdLOQWtS5cgkJ9xc@cluster0.6yc6g8u.mongodb.net/pamlee?retryWrites=true&w=majority`
- **Environment:** Select all (Production, Preview, Development)
- Click **Save**

#### 2. JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** `supersecret123`
- **Environment:** Select all (Production, Preview, Development)
- Click **Save**

#### 3. JWT_EXPIRES_IN
- **Key:** `JWT_EXPIRES_IN`
- **Value:** `365d`
- **Environment:** Select all (Production, Preview, Development)
- Click **Save**

#### 4. NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Production only
- Click **Save**

### Step 3: Redeploy

After adding all environment variables:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **⋯** (three dots) menu
4. Click **Redeploy**
5. Confirm the redeployment

**OR** simply push a new commit to trigger automatic deployment:

```bash
git commit --allow-empty -m "Trigger Vercel redeployment"
git push origin main
```

## 📋 Environment Variables Summary

| Variable | Value | Purpose |
|----------|-------|---------|
| `MONGO_URI` | `mongodb+srv://admin:...` | MongoDB Atlas connection string |
| `JWT_SECRET` | `supersecret123` | Secret key for JWT token signing |
| `JWT_EXPIRES_IN` | `365d` | JWT token expiration time |
| `NODE_ENV` | `production` | Node environment |

## 🔐 Security Notes

### Current Setup (Development)
The current `.env` file contains development credentials. For production, you should:

1. **Create a new MongoDB user** with limited permissions
2. **Use a strong JWT secret** (generate with: `openssl rand -base64 32`)
3. **Restrict MongoDB IP whitelist** to Vercel's IP ranges
4. **Enable MongoDB audit logs**

### Recommended Production Values

```env
# Generate a new strong JWT secret
JWT_SECRET=<generate-with-openssl-rand-base64-32>

# Use a dedicated production MongoDB database
MONGO_URI=mongodb+srv://<prod-user>:<prod-password>@cluster0.6yc6g8u.mongodb.net/pamlee-prod?retryWrites=true&w=majority

# Keep token expiration
JWT_EXPIRES_IN=365d

# Set production environment
NODE_ENV=production
```

## 🚀 Alternative: Using Vercel CLI

You can also set environment variables using the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Add environment variables
vercel env add MONGO_URI production
# Paste the MongoDB URI when prompted

vercel env add JWT_SECRET production
# Paste the JWT secret when prompted

vercel env add JWT_EXPIRES_IN production
# Enter: 365d

vercel env add NODE_ENV production
# Enter: production

# Deploy
vercel --prod
```

## 📝 Verification Steps

After deployment succeeds:

1. **Check API Health**
   ```bash
   curl https://your-vercel-url.vercel.app/api/health
   ```
   Should return:
   ```json
   {
     "success": true,
     "message": "API is running",
     "timestamp": "...",
     "database": "MongoDB"
   }
   ```

2. **Test Authentication**
   ```bash
   curl -X POST https://your-vercel-url.vercel.app/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@pamlee.co.za","password":"admin123"}'
   ```

3. **Test Products**
   ```bash
   curl https://your-vercel-url.vercel.app/api/products
   ```

## 🔧 Troubleshooting

### Issue: "Cannot connect to MongoDB"
- Check if MongoDB Atlas IP whitelist includes `0.0.0.0/0` (allow all)
- Verify the MONGO_URI is correct
- Check MongoDB Atlas cluster status

### Issue: "Invalid token"
- Ensure JWT_SECRET is the same across all environments
- Check if token has expired
- Verify JWT_SECRET is set in Vercel

### Issue: "Module not found"
- Ensure all dependencies are in `package.json`
- Check if `node_modules` is in `.vercelignore`
- Verify build settings in Vercel

## 📚 Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [MongoDB Atlas IP Whitelist](https://docs.atlas.mongodb.com/security/ip-access-list/)
- [Vercel Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

## ✅ Quick Setup Checklist

- [ ] Access Vercel Dashboard
- [ ] Navigate to Project Settings → Environment Variables
- [ ] Add `MONGO_URI` (all environments)
- [ ] Add `JWT_SECRET` (all environments)
- [ ] Add `JWT_EXPIRES_IN` (all environments)
- [ ] Add `NODE_ENV` (production only)
- [ ] Save all variables
- [ ] Trigger redeployment
- [ ] Verify deployment success
- [ ] Test API endpoints
- [ ] Test authentication
- [ ] Test order creation

---

**Note:** After setting up environment variables, the deployment should succeed automatically. The application will be fully functional with MongoDB backend integration.
