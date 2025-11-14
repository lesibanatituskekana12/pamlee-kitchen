# Vercel Deployment Setup Guide

## 🎯 Quick Setup (3 Steps)

### Step 1: Add Environment Variables in Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable | Value |
|----------|-------|
| `MONGO_URI` | `mongodb+srv://admin:RdLOQWtS5cgkJ9xc@cluster0.6yc6g8u.mongodb.net/pamlee?retryWrites=true&w=majority` |
| `JWT_SECRET` | `supersecret123` (change in production!) |
| `JWT_EXPIRES_IN` | `365d` |

**Important:** Make sure to add them for **Production**, **Preview**, and **Development** environments.

### Step 2: Deploy

Push your changes to trigger a new deployment:

```bash
git add .
git commit -m "Migrate to MongoDB for Vercel compatibility"
git push origin main
```

Or deploy directly:

```bash
vercel --prod
```

### Step 3: Test Your Deployment

Visit your Vercel URL and test:

1. **Sign Up**: Create a new account
2. **Login**: Use `admin@pamlee.co.za` / `admin123`
3. **Browse Products**: Check the menu page
4. **Place Order**: Test the checkout flow
5. **Admin Dashboard**: Login as admin and check dashboard

## ✅ What Was Fixed

### Previous Errors (Now Resolved):
- ❌ "Cannot read properties of null (reading 'prepare')"
- ❌ "Invalid admin credentials"
- ❌ "Invalid credentials"

### Solution:
- Migrated from SQLite (`better-sqlite3`) to MongoDB
- SQLite doesn't work on Vercel serverless functions
- MongoDB works perfectly with serverless architecture

## 🔍 Verify Deployment

### Check Health Endpoint:
```bash
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2025-11-14T07:27:39.470Z",
  "database": "MongoDB"
}
```

### Test Login:
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pamlee.co.za","password":"admin123"}'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "...",
    "email": "admin@pamlee.co.za",
    "name": "Admin",
    "role": "admin"
  }
}
```

## 📊 Database Info

- **Type**: MongoDB Atlas
- **Connection**: Already configured in your `.env`
- **Auto-seeding**: Admin user and products are created automatically
- **Collections**: users, products, orders

## 🔐 Security Notes

1. **Change JWT_SECRET** in production to a strong random string
2. **Change admin password** after first login
3. **Enable MongoDB IP whitelist** for production (currently allows all IPs)
4. **Use environment variables** - never commit secrets to git

## 🐛 Troubleshooting

### If signup/login still fails:

1. Check Vercel deployment logs
2. Verify environment variables are set correctly
3. Test MongoDB connection from Vercel:
   ```bash
   curl https://your-app.vercel.app/api/health
   ```
4. Check MongoDB Atlas:
   - Cluster is running
   - Network access allows Vercel IPs (0.0.0.0/0)
   - Database user has correct permissions

### Common Issues:

**"MongoServerError: bad auth"**
- Check MONGO_URI credentials are correct
- Verify database user exists in MongoDB Atlas

**"ECONNREFUSED"**
- MongoDB cluster might be paused
- Check network access settings in MongoDB Atlas

**"Cannot find module"**
- Run `npm install` locally
- Ensure all dependencies are in package.json
- Redeploy to Vercel

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check MongoDB Atlas logs
3. Test locally first: `npm start`
4. Verify environment variables match between local and Vercel

## 🎉 Success Checklist

- [ ] Environment variables added to Vercel
- [ ] Code pushed to GitHub
- [ ] Deployment successful (no errors in logs)
- [ ] Health endpoint returns success
- [ ] Can signup new users
- [ ] Can login with admin credentials
- [ ] Products load correctly
- [ ] Can place orders
- [ ] Admin dashboard accessible

Once all items are checked, your app is fully deployed! 🚀
