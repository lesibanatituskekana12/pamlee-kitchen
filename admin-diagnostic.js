#!/usr/bin/env node

/**
 * Pamlee Kitchen - Admin Dashboard Diagnostic Tool
 * Comprehensive testing for admin functionality
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:3000';
const ADMIN_EMAIL = process.argv[3] || 'admin@pamlee.co.za';
const ADMIN_PASSWORD = process.argv[4] || 'admin123';

const isHttps = BASE_URL.startsWith('https');
const client = isHttps ? https : http;

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
  adminToken: null
};

// Helper function to make HTTP requests
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

// Test 1: Admin Login
async function testAdminLogin() {
  console.log(`\n${colors.cyan}[TEST 1]${colors.reset} Admin Authentication`);
  
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      }
    });
    
    if (response.status === 200 && response.data.success && response.data.token) {
      if (response.data.user.role !== 'admin') {
        throw new Error(`User is not admin. Role: ${response.data.user.role}`);
      }
      
      console.log(`${colors.green}✓ PASS${colors.reset} - Admin login successful`);
      console.log(`  Email: ${response.data.user.email}`);
      console.log(`  Role: ${response.data.user.role}`);
      console.log(`  Token: ${response.data.token.substring(0, 30)}...`);
      
      results.passed++;
      results.tests.push({ name: 'Admin Login', status: 'PASS' });
      results.adminToken = response.data.token;
      return { success: true, token: response.data.token };
    } else {
      throw new Error(`Login failed: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Admin Login', status: 'FAIL', error: error.message });
    return { success: false };
  }
}

// Test 2: Admin Stats
async function testAdminStats(token) {
  console.log(`\n${colors.cyan}[TEST 2]${colors.reset} Admin Statistics Dashboard`);
  
  if (!token) {
    console.log(`${colors.yellow}⚠ SKIP${colors.reset} - No admin token available`);
    results.warnings++;
    return false;
  }
  
  try {
    const response = await makeRequest('/api/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200 && response.data.success && response.data.stats) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Stats retrieved successfully`);
      console.log(`  Total Orders: ${response.data.stats.totalOrders}`);
      console.log(`  Total Revenue: R${response.data.stats.totalRevenue}`);
      console.log(`  Pending Orders: ${response.data.stats.pendingOrders}`);
      console.log(`  Total Products: ${response.data.stats.totalProducts}`);
      
      results.passed++;
      results.tests.push({ name: 'Admin Stats', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Failed to get stats: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Admin Stats', status: 'FAIL', error: error.message });
    return false;
  }
}

// Test 3: Get All Orders (Admin)
async function testGetAllOrders(token) {
  console.log(`\n${colors.cyan}[TEST 3]${colors.reset} Get All Orders (Admin View)`);
  
  if (!token) {
    console.log(`${colors.yellow}⚠ SKIP${colors.reset} - No admin token available`);
    results.warnings++;
    return false;
  }
  
  try {
    const response = await makeRequest('/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200 && response.data.success && Array.isArray(response.data.orders)) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Orders retrieved successfully`);
      console.log(`  Total Orders: ${response.data.orders.length}`);
      
      if (response.data.orders.length > 0) {
        const order = response.data.orders[0];
        console.log(`  Sample Order:`);
        console.log(`    Tracker ID: ${order.trackerId}`);
        console.log(`    Status: ${order.status}`);
        console.log(`    Total: R${order.total}`);
        console.log(`    User: ${order.userEmail}`);
      }
      
      results.passed++;
      results.tests.push({ name: 'Get All Orders', status: 'PASS' });
      return { success: true, orders: response.data.orders };
    } else {
      throw new Error(`Failed to get orders: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get All Orders', status: 'FAIL', error: error.message });
    return { success: false };
  }
}

// Test 4: Update Order Status
async function testUpdateOrderStatus(token, orders) {
  console.log(`\n${colors.cyan}[TEST 4]${colors.reset} Update Order Status`);
  
  if (!token) {
    console.log(`${colors.yellow}⚠ SKIP${colors.reset} - No admin token available`);
    results.warnings++;
    return false;
  }
  
  if (!orders || orders.length === 0) {
    console.log(`${colors.yellow}⚠ SKIP${colors.reset} - No orders available to test`);
    results.warnings++;
    results.tests.push({ name: 'Update Order Status', status: 'SKIP' });
    return false;
  }
  
  try {
    const testOrder = orders[0];
    const newStatus = testOrder.status === 'placed' ? 'preparing' : 'placed';
    
    const response = await makeRequest(`/api/orders/${testOrder.trackerId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        status: newStatus,
        note: 'Diagnostic test update'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Order status updated successfully`);
      console.log(`  Order: ${testOrder.trackerId}`);
      console.log(`  Old Status: ${testOrder.status}`);
      console.log(`  New Status: ${newStatus}`);
      
      // Revert the change
      await makeRequest(`/api/orders/${testOrder.trackerId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          status: testOrder.status,
          note: 'Diagnostic test revert'
        }
      });
      console.log(`  ${colors.cyan}ℹ${colors.reset} Status reverted to original`);
      
      results.passed++;
      results.tests.push({ name: 'Update Order Status', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Failed to update order: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Update Order Status', status: 'FAIL', error: error.message });
    return false;
  }
}

// Test 5: Get All Products (Admin)
async function testGetProducts(token) {
  console.log(`\n${colors.cyan}[TEST 5]${colors.reset} Get Products (Admin View)`);
  
  try {
    const response = await makeRequest('/api/products', {
      headers: token ? {
        'Authorization': `Bearer ${token}`
      } : {}
    });
    
    if (response.status === 200 && response.data.success && Array.isArray(response.data.products)) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Products retrieved successfully`);
      console.log(`  Total Products: ${response.data.products.length}`);
      
      if (response.data.products.length > 0) {
        const product = response.data.products[0];
        console.log(`  Sample Product:`);
        console.log(`    ID: ${product.id}`);
        console.log(`    Name: ${product.name}`);
        console.log(`    Price: R${product.price}`);
        console.log(`    Category: ${product.category}`);
      }
      
      results.passed++;
      results.tests.push({ name: 'Get Products', status: 'PASS' });
      return { success: true, products: response.data.products };
    } else {
      throw new Error(`Failed to get products: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get Products', status: 'FAIL', error: error.message });
    return { success: false };
  }
}

// Test 6: Create Product (Admin)
async function testCreateProduct(token) {
  console.log(`\n${colors.cyan}[TEST 6]${colors.reset} Create Product (Admin Only)`);
  
  if (!token) {
    console.log(`${colors.yellow}⚠ SKIP${colors.reset} - No admin token available`);
    results.warnings++;
    return false;
  }
  
  const testProductId = `TEST-${Date.now()}`;
  
  try {
    const response = await makeRequest('/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        id: testProductId,
        name: 'Test Product',
        description: 'Diagnostic test product',
        category: 'test',
        price: 99.99,
        image: 'test.jpg',
        isPopular: false
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Product created successfully`);
      console.log(`  Product ID: ${testProductId}`);
      
      // Clean up - delete the test product
      await makeRequest(`/api/products/${testProductId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`  ${colors.cyan}ℹ${colors.reset} Test product deleted`);
      
      results.passed++;
      results.tests.push({ name: 'Create Product', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Failed to create product: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Create Product', status: 'FAIL', error: error.message });
    return false;
  }
}

// Test 7: Update Product (Admin)
async function testUpdateProduct(token, products) {
  console.log(`\n${colors.cyan}[TEST 7]${colors.reset} Update Product (Admin Only)`);
  
  if (!token) {
    console.log(`${colors.yellow}⚠ SKIP${colors.reset} - No admin token available`);
    results.warnings++;
    return false;
  }
  
  if (!products || products.length === 0) {
    console.log(`${colors.yellow}⚠ SKIP${colors.reset} - No products available to test`);
    results.warnings++;
    return false;
  }
  
  try {
    const testProduct = products[0];
    const originalPrice = testProduct.price;
    const newPrice = originalPrice + 10;
    
    const response = await makeRequest(`/api/products/${testProduct.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        name: testProduct.name,
        description: testProduct.description,
        category: testProduct.category,
        price: newPrice,
        image: testProduct.image,
        isPopular: testProduct.isPopular
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Product updated successfully`);
      console.log(`  Product: ${testProduct.name}`);
      console.log(`  Old Price: R${originalPrice}`);
      console.log(`  New Price: R${newPrice}`);
      
      // Revert the change
      await makeRequest(`/api/products/${testProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: {
          name: testProduct.name,
          description: testProduct.description,
          category: testProduct.category,
          price: originalPrice,
          image: testProduct.image,
          isPopular: testProduct.isPopular
        }
      });
      console.log(`  ${colors.cyan}ℹ${colors.reset} Price reverted to original`);
      
      results.passed++;
      results.tests.push({ name: 'Update Product', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Failed to update product: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Update Product', status: 'FAIL', error: error.message });
    return false;
  }
}

// Test 8: Delete Product (Admin)
async function testDeleteProduct(token) {
  console.log(`\n${colors.cyan}[TEST 8]${colors.reset} Delete Product (Admin Only)`);
  
  if (!token) {
    console.log(`${colors.yellow}⚠ SKIP${colors.reset} - No admin token available`);
    results.warnings++;
    return false;
  }
  
  const testProductId = `DELETE-TEST-${Date.now()}`;
  
  try {
    // First create a product to delete
    await makeRequest('/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: {
        id: testProductId,
        name: 'Delete Test Product',
        description: 'Will be deleted',
        category: 'test',
        price: 1,
        image: 'test.jpg',
        isPopular: false
      }
    });
    
    // Now delete it
    const response = await makeRequest(`/api/products/${testProductId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Product deleted successfully`);
      console.log(`  Product ID: ${testProductId}`);
      
      results.passed++;
      results.tests.push({ name: 'Delete Product', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Failed to delete product: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Delete Product', status: 'FAIL', error: error.message });
    return false;
  }
}

// Test 9: Non-Admin Access Prevention
async function testNonAdminPrevention() {
  console.log(`\n${colors.cyan}[TEST 9]${colors.reset} Non-Admin Access Prevention`);
  
  try {
    // Create a regular user
    const userEmail = `customer${Date.now()}@test.com`;
    const signupResponse = await makeRequest('/api/auth/signup', {
      method: 'POST',
      body: {
        email: userEmail,
        password: 'testpass123',
        name: 'Test Customer'
      }
    });
    
    if (!signupResponse.data.token) {
      throw new Error('Failed to create test user');
    }
    
    const customerToken = signupResponse.data.token;
    
    // Try to access admin stats with customer token
    const statsResponse = await makeRequest('/api/stats', {
      headers: {
        'Authorization': `Bearer ${customerToken}`
      }
    });
    
    if (statsResponse.status === 403 || statsResponse.status === 401) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Non-admin access properly blocked`);
      console.log(`  Customer token rejected: ${statsResponse.status}`);
      console.log(`  Error: ${statsResponse.data.error}`);
      
      results.passed++;
      results.tests.push({ name: 'Non-Admin Prevention', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Security issue: Customer accessed admin endpoint (status: ${statsResponse.status})`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Non-Admin Prevention', status: 'FAIL', error: error.message });
    return false;
  }
}

// Main diagnostic function
async function runAdminDiagnostics() {
  console.log(`
${colors.magenta}╔════════════════════════════════════════════════════════╗
║   Pamlee Kitchen - Admin Dashboard Diagnostics        ║
╚════════════════════════════════════════════════════════╝${colors.reset}

Testing URL: ${colors.cyan}${BASE_URL}${colors.reset}
Admin Email: ${colors.cyan}${ADMIN_EMAIL}${colors.reset}
Started: ${new Date().toLocaleString()}
`);

  // Run tests sequentially
  const loginResult = await testAdminLogin();
  const token = loginResult.token;
  
  await testAdminStats(token);
  
  const ordersResult = await testGetAllOrders(token);
  await testUpdateOrderStatus(token, ordersResult.orders);
  
  const productsResult = await testGetProducts(token);
  await testCreateProduct(token);
  await testUpdateProduct(token, productsResult.products);
  await testDeleteProduct(token);
  
  await testNonAdminPrevention();

  // Print summary
  console.log(`
${colors.magenta}╔════════════════════════════════════════════════════════╗
║              ADMIN DASHBOARD TEST SUMMARY              ║
╚════════════════════════════════════════════════════════╝${colors.reset}
`);

  results.tests.forEach(test => {
    let status;
    if (test.status === 'PASS') {
      status = `${colors.green}✓ PASS${colors.reset}`;
    } else if (test.status === 'SKIP') {
      status = `${colors.yellow}⊘ SKIP${colors.reset}`;
    } else {
      status = `${colors.red}✗ FAIL${colors.reset}`;
    }
    console.log(`${status} - ${test.name}`);
    if (test.error) {
      console.log(`       ${colors.red}Error: ${test.error}${colors.reset}`);
    }
  });

  const total = results.passed + results.failed;
  const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  
  console.log(`
${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}
Total Tests: ${total}
${colors.green}Passed: ${results.passed}${colors.reset}
${colors.red}Failed: ${results.failed}${colors.reset}
${colors.yellow}Warnings: ${results.warnings}${colors.reset}
Success Rate: ${percentage}%

Completed: ${new Date().toLocaleString()}
${colors.magenta}═══════════════════════════════════════════════════════${colors.reset}
`);

  if (results.failed === 0) {
    console.log(`${colors.green}🎉 All admin dashboard tests passed! Admin functionality is working correctly.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️  Some admin tests failed. Please check the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run diagnostics
runAdminDiagnostics().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
