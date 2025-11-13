# Vercel Deployment Guide for Pam_Lee's Kitchen

## 🚀 Quick Deployment Steps

### 1. Prepare Your Repository

Make sure all changes are committed to your Git repository:

```bash
# Check current status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Add card validation, fix admin dashboard, and improve real-time features"

# Push to GitHub
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** Other
   - **Build Command:** (leave empty)
   - **Output Directory:** (leave empty)
   - **Install Command:** `npm install`

5. Add Environment Variables:
   - `JWT_SECRET` = `your_secure_secret_key_here`
   - `JWT_EXPIRES_IN` = `365d`
   - `NODE_ENV` = `production`

6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### 3. Configure Environment Variables in Vercel

Go to your project settings in Vercel Dashboard:

1. Navigate to **Settings** → **Environment Variables**
2. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `JWT_SECRET` | Your secure secret key | Production, Preview, Development |
| `JWT_EXPIRES_IN` | `365d` | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

### 4. Verify Deployment

After deployment, test these URLs:

- **Homepage:** `https://your-project.vercel.app/`
- **Menu:** `https://your-project.vercel.app/menu.html`
- **Admin:** `https://your-project.vercel.app/admin.html`
- **API Products:** `https://your-project.vercel.app/api/products`

## 📋 Pre-Deployment Checklist

- ✅ All JavaScript files have valid syntax
- ✅ Card validation implemented
- ✅ Admin dashboard functions fixed
- ✅ Real-time orders system working
- ✅ Cache busting added (`?v=3` on scripts)
- ✅ Error handling added to all critical functions
- ✅ `vercel.json` configuration created
- ✅ `.env.example` template created
- ✅ All changes committed to Git

## 🔧 Vercel Configuration

The `vercel.json` file is configured to:

1. **Build the Node.js server** using `@vercel/node`
2. **Route API requests** to `server.js`
3. **Serve static files** (HTML, CSS, JS, images)
4. **Set production environment**

## 🗄️ Database Considerations

### SQLite on Vercel

⚠️ **Important:** Vercel's serverless functions are stateless, which means:

- SQLite database file (`pamlee.db`) will be reset on each deployment
- Data is not persistent between deployments

### Solutions:

#### Option 1: Use Vercel Postgres (Recommended)

```bash
# Install Vercel Postgres
npm install @vercel/postgres

# Update server.js to use Postgres instead of SQLite
```

#### Option 2: Use External Database

- **Supabase** (PostgreSQL)
- **PlanetScale** (MySQL)
- **MongoDB Atlas**
- **Railway** (PostgreSQL)

#### Option 3: Keep SQLite for Testing

If you want to keep SQLite for now:
- Database will reset on each deployment
- Good for testing and development
- Not suitable for production with real users

## 🔄 Redeployment After Changes

### Automatic Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

### Manual Deployment

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Force Clear Cache

If users see old cached files:

1. In Vercel Dashboard → **Deployments**
2. Click on latest deployment
3. Click **"Redeploy"**
4. Check **"Use existing Build Cache"** = OFF

## 🐛 Troubleshooting

### Issue: JavaScript files not updating

**Solution:**
1. Clear Vercel build cache (redeploy without cache)
2. Users should hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`
3. Check that `?v=3` is in all script tags

### Issue: API endpoints not working

**Solution:**
1. Check Vercel function logs in Dashboard
2. Verify environment variables are set
3. Check `vercel.json` routes configuration

### Issue: Database resets on deployment

**Solution:**
- This is expected with SQLite on Vercel
- Migrate to a persistent database (see Database Considerations above)

### Issue: CORS errors

**Solution:**
Update `server.js` CORS configuration:

```javascript
app.use(cors({
  origin: process.env.VERCEL_URL || '*',
  credentials: true
}));
```

## 📊 Monitoring

### View Logs

```bash
# View real-time logs
vercel logs

# View logs for specific deployment
vercel logs [deployment-url]
```

### Analytics

- Go to Vercel Dashboard → **Analytics**
- Monitor page views, performance, and errors

## 🔐 Security Notes

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong JWT_SECRET** - Generate with: `openssl rand -base64 32`
3. **Enable HTTPS** - Vercel provides this automatically
4. **Set secure headers** - Already configured in `server.js`

## 📝 Post-Deployment Tasks

1. ✅ Test all pages and features
2. ✅ Verify admin login works
3. ✅ Test card validation
4. ✅ Check real-time order updates
5. ✅ Test on mobile devices
6. ✅ Check browser console for errors
7. ✅ Verify API endpoints respond correctly

## 🆘 Need Help?

- **Vercel Documentation:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Check Deployment Logs:** Vercel Dashboard → Deployments → View Function Logs

## 🎉 Success Indicators

Your deployment is successful when:

- ✅ All pages load without errors
- ✅ Admin can login and manage orders
- ✅ Customers can browse menu and checkout
- ✅ Card validation works correctly
- ✅ Real-time updates function properly
- ✅ No console errors in browser
- ✅ API endpoints return correct data

---

**Last Updated:** November 13, 2025
**Version:** 3.0 (with card validation and admin fixes)
