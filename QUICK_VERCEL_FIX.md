# 🚀 Quick Fix for Vercel Deployment

## The Problem
Vercel deployment is failing because environment variables are not set.

## The Solution (5 Minutes)

### Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your project: **pamlee-kitchen**
3. Click: **Settings** → **Environment Variables**

### Add These 4 Variables

Copy and paste these exactly:

#### Variable 1
```
Key: MONGO_URI
Value: mongodb+srv://admin:RdLOQWtS5cgkJ9xc@cluster0.6yc6g8u.mongodb.net/pamlee?retryWrites=true&w=majority
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 2
```
Key: JWT_SECRET
Value: supersecret123
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 3
```
Key: JWT_EXPIRES_IN
Value: 365d
Environments: ✅ Production ✅ Preview ✅ Development
```

#### Variable 4
```
Key: NODE_ENV
Value: production
Environments: ✅ Production only
```

### Redeploy
After adding all variables, the deployment will automatically retry and succeed!

**OR** trigger manually:
- Go to **Deployments** tab
- Click latest deployment → **⋯** → **Redeploy**

## ✅ Done!
Your app will be live in ~2 minutes.

---

**Need help?** See full guide: `VERCEL_ENV_SETUP.md`
