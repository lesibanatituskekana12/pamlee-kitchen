# Quick Test Guide - Pamlee Kitchen

## 🚀 Test Your Deployment in 3 Steps

### Step 1: Test General Functionality

```bash
node diagnostic.js https://your-vercel-url.vercel.app
```

**What it tests:**
- Health check
- User signup
- User login
- Products API
- Order placement
- Order tracking

**Expected:** 9/9 tests pass (100%)

---

### Step 2: Test Admin Dashboard

```bash
node admin-diagnostic.js https://your-vercel-url.vercel.app
```

**What it tests:**
- Admin authentication
- Dashboard statistics
- Order management
- Product management (CRUD)
- Security (non-admin prevention)

**Expected:** 9/9 tests pass (100%)

---

### Step 3: Visual Verification

Open in browser:
```
https://your-vercel-url.vercel.app/admin-diagnostic.html
```

Click "🚀 Run Admin Diagnostics" and verify all tests pass.

---

## 📊 Quick Status Check

### ✅ All Systems Operational
```
General Tests: 9/9 PASS (100%)
Admin Tests:   9/9 PASS (100%)
Total:         18/18 PASS (100%)
```

### ⚠️ Issues Detected
If any test fails:
1. Check the error message
2. Review server logs
3. Verify environment variables
4. Check MongoDB connection
5. See troubleshooting guides

---

## 🔗 Quick Links

### Diagnostic Tools
- **CLI General:** `node diagnostic.js <url>`
- **CLI Admin:** `node admin-diagnostic.js <url>`
- **Web General:** `/diagnostic.html`
- **Web Admin:** `/admin-diagnostic.html`

### Documentation
- `DIAGNOSTIC_GUIDE.md` - General diagnostic guide
- `ADMIN_DIAGNOSTIC_GUIDE.md` - Admin diagnostic guide
- `VERCEL_SETUP.md` - Deployment setup
- `MONGODB_DEPLOYMENT.md` - Database migration
- `DEPLOYMENT_STATUS.md` - Current status

### Application URLs
- **Homepage:** `/index.html`
- **Admin Dashboard:** `/admin.html`
- **Customer Dashboard:** `/customer.html`
- **Menu:** `/menu.html`

---

## 🔐 Default Credentials

**Admin:**
```
Email: admin@pamlee.co.za
Password: admin123
```

⚠️ **Change in production!**

---

## 📱 Test on Different Devices

### Desktop
```bash
# Chrome
open https://your-app.vercel.app

# Firefox
firefox https://your-app.vercel.app
```

### Mobile
1. Open on mobile browser
2. Test responsive design
3. Test touch interactions
4. Test mobile menu

---

## 🎯 Success Checklist

Before going live:

- [ ] General diagnostic: 100% pass
- [ ] Admin diagnostic: 100% pass
- [ ] Can signup new users
- [ ] Can login as admin
- [ ] Products load correctly
- [ ] Can place orders
- [ ] Can track orders
- [ ] Admin can view all orders
- [ ] Admin can update order status
- [ ] Admin can manage products
- [ ] Security test passes
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Environment variables set
- [ ] MongoDB connected
- [ ] Admin password changed

---

## 🚨 Emergency Checks

### If site is down:
```bash
curl https://your-app.vercel.app/api/health
```

Should return:
```json
{
  "success": true,
  "message": "API is running",
  "database": "MongoDB"
}
```

### If admin can't login:
```bash
curl -X POST https://your-app.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pamlee.co.za","password":"admin123"}'
```

Should return token and user object.

### If database issues:
1. Check MongoDB Atlas dashboard
2. Verify cluster is running
3. Check network access (0.0.0.0/0)
4. Verify connection string in Vercel env vars

---

## 📞 Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| Tests fail | Check server logs |
| Can't login | Verify credentials |
| No products | Check database seeding |
| 500 errors | Check MongoDB connection |
| 403 errors | Check authentication |
| Slow response | Check MongoDB Atlas region |

---

## 🎉 All Green?

If all tests pass:
1. ✅ Your deployment is successful
2. ✅ All features are working
3. ✅ Security is properly configured
4. ✅ Ready for production use

**Congratulations! Your Pamlee Kitchen is live!** 🚀

---

*Last Updated: November 14, 2025*
