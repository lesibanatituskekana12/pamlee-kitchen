# Admin Dashboard Diagnostic Guide

## Overview

Comprehensive diagnostic tools specifically designed to test admin dashboard functionality on your Pamlee Kitchen deployment.

## 🔧 Tools Available

### 1. CLI Admin Diagnostic (`admin-diagnostic.js`)
Command-line tool for automated admin testing with detailed output.

### 2. Web Admin Diagnostic (`admin-diagnostic.html`)
Browser-based visual diagnostic with real-time test results.

## 📋 What Gets Tested

### Authentication & Security
- ✅ Admin login with credentials
- ✅ JWT token generation and validation
- ✅ Non-admin access prevention (security test)

### Dashboard Statistics
- ✅ Total orders count
- ✅ Total revenue calculation
- ✅ Pending orders count
- ✅ Total products count

### Order Management
- ✅ View all orders (admin view)
- ✅ Update order status
- ✅ Order timeline updates
- ✅ Status reversion (test cleanup)

### Product Management
- ✅ View all products
- ✅ Create new product
- ✅ Update existing product
- ✅ Delete product
- ✅ Test cleanup (auto-delete test products)

## 🚀 CLI Usage

### Test Local Server

```bash
node admin-diagnostic.js http://localhost:3000
```

### Test Vercel Deployment

```bash
node admin-diagnostic.js https://your-app.vercel.app
```

### Custom Admin Credentials

```bash
node admin-diagnostic.js https://your-app.vercel.app admin@example.com password123
```

### Parameters

1. **URL** (required) - Your application URL
2. **Email** (optional) - Admin email (default: admin@pamlee.co.za)
3. **Password** (optional) - Admin password (default: admin123)

## 🌐 Web Interface Usage

### Access the Diagnostic Page

**Local:**
```
http://localhost:3000/admin-diagnostic.html
```

**Vercel:**
```
https://your-app.vercel.app/admin-diagnostic.html
```

### Steps

1. Open the diagnostic page in your browser
2. Enter admin credentials (pre-filled with defaults)
3. Click "🚀 Run Admin Diagnostics"
4. Watch tests run in real-time
5. Review the summary and detailed results

## 📊 Sample Output

### CLI Output

```
╔════════════════════════════════════════════════════════╗
║   Pamlee Kitchen - Admin Dashboard Diagnostics        ║
╚════════════════════════════════════════════════════════╝

Testing URL: https://your-app.vercel.app
Admin Email: admin@pamlee.co.za
Started: 11/14/2025, 7:49:20 AM

[TEST 1] Admin Authentication
✓ PASS - Admin login successful
  Email: admin@pamlee.co.za
  Role: admin
  Token: eyJhbGciOiJIUzI1NiIs...

[TEST 2] Admin Statistics Dashboard
✓ PASS - Stats retrieved successfully
  Total Orders: 9
  Total Revenue: R1260
  Pending Orders: 6
  Total Products: 8

[TEST 3] Get All Orders (Admin View)
✓ PASS - Orders retrieved successfully
  Total Orders: 9
  Sample Order:
    Tracker ID: PL-mhyjwcai-C83MH
    Status: placed
    Total: R120
    User: customer@example.com

[TEST 4] Update Order Status
✓ PASS - Order status updated successfully
  Order: PL-mhyjwcai-C83MH
  Old Status: placed
  New Status: preparing
  ℹ Status reverted to original

[TEST 5] Get Products (Admin View)
✓ PASS - Products retrieved successfully
  Total Products: 8
  Sample Product:
    ID: 1
    Name: Chocolate Cake
    Price: R250
    Category: cakes

[TEST 6] Create Product (Admin Only)
✓ PASS - Product created successfully
  Product ID: TEST-1763106562286
  ℹ Test product deleted

[TEST 7] Update Product (Admin Only)
✓ PASS - Product updated successfully
  Product: Chocolate Cake
  Old Price: R250
  New Price: R260
  ℹ Price reverted to original

[TEST 8] Delete Product (Admin Only)
✓ PASS - Product deleted successfully
  Product ID: DELETE-TEST-1763106562912

[TEST 9] Non-Admin Access Prevention
✓ PASS - Non-admin access properly blocked
  Customer token rejected: 403
  Error: Admin access required

╔════════════════════════════════════════════════════════╗
║              ADMIN DASHBOARD TEST SUMMARY              ║
╚════════════════════════════════════════════════════════╝

✓ PASS - Admin Login
✓ PASS - Admin Stats
✓ PASS - Get All Orders
✓ PASS - Update Order Status
✓ PASS - Get Products
✓ PASS - Create Product
✓ PASS - Update Product
✓ PASS - Delete Product
✓ PASS - Non-Admin Prevention

═══════════════════════════════════════════════════════
Total Tests: 9
Passed: 9
Failed: 0
Warnings: 0
Success Rate: 100.0%

Completed: 11/14/2025, 7:49:30 AM
═══════════════════════════════════════════════════════

🎉 All admin dashboard tests passed! Admin functionality is working correctly.
```

## 🔍 Test Details

### Test 1: Admin Authentication
- Logs in with provided credentials
- Verifies user role is 'admin'
- Stores JWT token for subsequent tests
- **Pass Criteria:** Status 200, valid token, role = admin

### Test 2: Admin Statistics
- Fetches dashboard statistics
- Requires admin token
- **Pass Criteria:** Returns totalOrders, totalRevenue, pendingOrders, totalProducts

### Test 3: Get All Orders
- Retrieves all orders (admin view)
- Regular users only see their own orders
- **Pass Criteria:** Returns array of all orders

### Test 4: Update Order Status
- Updates an order's status
- Adds timeline entry
- Reverts change after test
- **Pass Criteria:** Status updated successfully, no data corruption

### Test 5: Get Products
- Retrieves product catalog
- **Pass Criteria:** Returns array of products with IDs

### Test 6: Create Product
- Creates a test product
- Deletes it after verification
- **Pass Criteria:** Product created and cleaned up

### Test 7: Update Product
- Updates product price
- Reverts to original value
- **Pass Criteria:** Product updated successfully, no data corruption

### Test 8: Delete Product
- Creates a product
- Deletes it
- **Pass Criteria:** Product deleted successfully

### Test 9: Non-Admin Prevention
- Creates a customer account
- Attempts to access admin endpoint
- **Pass Criteria:** Access denied (403 or 401)

## ⚠️ Important Notes

### Data Safety
- All tests are **non-destructive**
- Test products are automatically deleted
- Order/product updates are reverted
- No permanent changes to your data

### Test Cleanup
The diagnostic automatically:
- Deletes test products after creation
- Reverts order status changes
- Reverts product price changes
- Leaves no test artifacts

### Security Testing
- Test 9 verifies that customers cannot access admin endpoints
- This is a critical security test
- Failure indicates a security vulnerability

## 🐛 Troubleshooting

### "Admin Login Failed"
**Causes:**
- Wrong credentials
- Admin user not seeded in database
- Database connection issue

**Solutions:**
1. Verify credentials: `admin@pamlee.co.za` / `admin123`
2. Check MongoDB connection
3. Restart server to trigger auto-seeding

### "Admin Stats Failed"
**Causes:**
- Invalid admin token
- Database query error
- Missing stats endpoint

**Solutions:**
1. Ensure admin login succeeded
2. Check server logs for errors
3. Verify `/api/stats` endpoint exists

### "Update Order Status Failed"
**Causes:**
- No orders in database
- Invalid order ID
- Permission issue

**Solutions:**
1. Create test orders first
2. Check order exists in database
3. Verify admin token is valid

### "Create Product Failed"
**Causes:**
- Duplicate product ID
- Missing required fields
- Database write error

**Solutions:**
1. Check for ID conflicts
2. Verify all required fields
3. Check MongoDB write permissions

### "Non-Admin Prevention Failed" (Security Issue!)
**This is critical!**

If this test fails, customers can access admin endpoints.

**Immediate Actions:**
1. Check `requireAdmin` middleware
2. Verify JWT role validation
3. Review authentication flow
4. DO NOT deploy until fixed

## 📈 Success Criteria

Your admin dashboard is working correctly when:

- ✅ All 9 tests pass
- ✅ Success rate: 100%
- ✅ No warnings or errors
- ✅ Test cleanup successful
- ✅ Security test passes

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
- name: Test Admin Dashboard
  run: |
    node admin-diagnostic.js ${{ secrets.VERCEL_URL }}
    if [ $? -ne 0 ]; then
      echo "Admin dashboard tests failed"
      exit 1
    fi
```

### Vercel Deployment Hook

```bash
#!/bin/bash
# After deployment
VERCEL_URL="https://your-app.vercel.app"
node admin-diagnostic.js $VERCEL_URL

if [ $? -eq 0 ]; then
  echo "✅ Admin dashboard verified"
else
  echo "❌ Admin dashboard verification failed"
  exit 1
fi
```

## 📞 Support

If admin diagnostics fail:

1. **Check the specific test** that failed
2. **Review error messages** carefully
3. **Check server logs** (Vercel dashboard or local console)
4. **Verify environment variables** are set correctly
5. **Test locally first** before testing on Vercel
6. **Check MongoDB connection** and permissions

## 🎯 Best Practices

### Before Deployment
1. Run admin diagnostics locally
2. Ensure 100% pass rate
3. Review any warnings
4. Test with actual admin credentials

### After Deployment
1. Run diagnostics on Vercel URL immediately
2. Verify all admin features work
3. Test from different browsers
4. Check mobile responsiveness

### Regular Monitoring
1. Run diagnostics after each deployment
2. Set up automated testing in CI/CD
3. Monitor for security test failures
4. Keep admin credentials secure

## 🔐 Security Recommendations

1. **Change default admin password** immediately in production
2. **Use strong passwords** (min 12 characters)
3. **Enable 2FA** if available
4. **Monitor admin access logs**
5. **Regularly test security** with diagnostic tool
6. **Keep JWT_SECRET secure** and rotate periodically

## 📚 Related Documentation

- `diagnostic.js` - General system diagnostic
- `DIAGNOSTIC_GUIDE.md` - General diagnostic guide
- `VERCEL_SETUP.md` - Deployment setup
- `MONGODB_DEPLOYMENT.md` - Database migration guide

---

**Your admin dashboard is production-ready when all diagnostics pass!** 🚀
