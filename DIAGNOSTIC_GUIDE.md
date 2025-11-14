# Diagnostic Tools Guide

## Overview

Two diagnostic tools are available to test your Pamlee Kitchen deployment:

1. **CLI Diagnostic** (`diagnostic.js`) - Command-line tool for automated testing
2. **Web Diagnostic** (`diagnostic.html`) - Browser-based visual diagnostic

## CLI Diagnostic Tool

### Usage

Test your local server:
```bash
node diagnostic.js http://localhost:3000
```

Test your Vercel deployment:
```bash
node diagnostic.js https://your-app.vercel.app
```

### What It Tests

✅ **Health Check** - Verifies API is running and database is connected
✅ **User Signup** - Creates a test user account
✅ **Admin Login** - Tests admin authentication
✅ **Get Products** - Retrieves product catalog
✅ **Get Product by ID** - Tests individual product retrieval
✅ **Auth Token** - Validates JWT authentication
✅ **Place Order** - Creates a test order
✅ **Track Order** - Retrieves order by tracker ID
✅ **Admin Stats** - Tests admin dashboard statistics

### Sample Output

```
╔════════════════════════════════════════════════════════╗
║     Pamlee Kitchen - Deployment Diagnostics           ║
╚════════════════════════════════════════════════════════╝

Testing URL: https://your-app.vercel.app
Started: 11/14/2025, 7:35:02 AM

[TEST] Health Check
✓ PASS - API is running
  Database: MongoDB
  Timestamp: 2025-11-14T07:35:02.832Z

[TEST] User Signup
✓ PASS - User signup successful
  Email: test1763105702837@test.com
  Token received: eyJhbGciOiJIUzI1NiIs...

...

╔════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                        ║
╚════════════════════════════════════════════════════════╝

✓ PASS - Health Check
✓ PASS - User Signup
✓ PASS - Admin Login
...

═══════════════════════════════════════════════════════
Total Tests: 9
Passed: 9
Failed: 0
Success Rate: 100.0%

🎉 All tests passed! Your deployment is working correctly.
```

## Web Diagnostic Tool

### Access

Open in your browser:
- Local: `http://localhost:3000/diagnostic.html`
- Vercel: `https://your-app.vercel.app/diagnostic.html`

### Features

- **Visual Interface** - Color-coded test results
- **Real-time Testing** - Run tests with a button click
- **Detailed Results** - See exactly what's working and what's not
- **Auto-run** - Tests run automatically on page load

### Test Categories

1. **JavaScript Files** - Verifies all scripts are loaded
2. **API Connectivity** - Tests API endpoints
3. **Authentication** - Checks user login status and token validity
4. **Database** - Verifies database tables and records
5. **Real-Time System** - Tests real-time order updates

## Troubleshooting

### Common Issues

**"connect ECONNREFUSED"**
- Server is not running
- Wrong URL provided
- Firewall blocking connection

**"Invalid credentials"**
- Admin user not seeded in database
- Wrong password
- Database connection issue

**"Product not found"**
- Database not seeded with products
- Product ID mismatch

**"Token expired"**
- JWT token has expired
- Need to login again

### Quick Fixes

1. **Restart server**: `npm start`
2. **Check environment variables**: Verify `.env` file
3. **Check MongoDB**: Ensure MongoDB Atlas is running
4. **Clear database**: Drop collections and restart to re-seed
5. **Check logs**: Look at server console for errors

## Vercel Deployment Testing

After deploying to Vercel:

1. **Get your Vercel URL** from the deployment dashboard
2. **Run CLI diagnostic**:
   ```bash
   node diagnostic.js https://your-app.vercel.app
   ```
3. **Check web diagnostic**:
   - Visit `https://your-app.vercel.app/diagnostic.html`
   - Click "Run All Tests"
4. **Verify results**:
   - All tests should pass
   - If any fail, check Vercel logs

## Environment Variables Check

The diagnostic will help identify missing environment variables:

Required for Vercel:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration time

## Success Criteria

Your deployment is successful when:
- ✅ Health check returns success
- ✅ Admin can login
- ✅ Users can signup
- ✅ Products load correctly
- ✅ Orders can be placed
- ✅ Orders can be tracked
- ✅ Admin stats are accessible

## Support

If diagnostics fail:
1. Check the error messages carefully
2. Review server logs (Vercel dashboard or local console)
3. Verify environment variables
4. Check MongoDB Atlas connection
5. Ensure all dependencies are installed

## Automated Testing

You can integrate the CLI diagnostic into your CI/CD pipeline:

```bash
# In your deployment script
node diagnostic.js https://your-app.vercel.app
if [ $? -eq 0 ]; then
  echo "Deployment verified successfully"
else
  echo "Deployment verification failed"
  exit 1
fi
```

## Next Steps

Once all diagnostics pass:
1. Test the full user flow manually
2. Create test orders
3. Verify email notifications (if configured)
4. Test admin dashboard features
5. Monitor for any runtime errors

Your application is ready for production use! 🚀
