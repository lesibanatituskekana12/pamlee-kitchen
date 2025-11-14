#!/usr/bin/env node

/**
 * Pamlee Kitchen - Deployment Diagnostic Tool
 * Tests all API endpoints and verifies deployment health
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.argv[2] || 'http://localhost:3000';
const isHttps = BASE_URL.startsWith('https');
const client = isHttps ? https : http;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
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

// Test functions
async function testHealthCheck() {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} Health Check`);
  try {
    const response = await makeRequest('/api/health');
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✓ PASS${colors.reset} - API is running`);
      console.log(`  Database: ${response.data.database}`);
      console.log(`  Timestamp: ${response.data.timestamp}`);
      results.passed++;
      results.tests.push({ name: 'Health Check', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Unexpected response: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Health Check', status: 'FAIL', error: error.message });
    return false;
  }
}

async function testSignup() {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} User Signup`);
  const testEmail = `test${Date.now()}@test.com`;
  
  try {
    const response = await makeRequest('/api/auth/signup', {
      method: 'POST',
      body: {
        email: testEmail,
        password: 'testpass123',
        name: 'Test User'
      }
    });
    
    if (response.status === 200 && response.data.success && response.data.token) {
      console.log(`${colors.green}✓ PASS${colors.reset} - User signup successful`);
      console.log(`  Email: ${testEmail}`);
      console.log(`  Token received: ${response.data.token.substring(0, 20)}...`);
      results.passed++;
      results.tests.push({ name: 'User Signup', status: 'PASS' });
      return { success: true, token: response.data.token, email: testEmail };
    } else {
      throw new Error(`Signup failed: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'User Signup', status: 'FAIL', error: error.message });
    return { success: false };
  }
}

async function testAdminLogin() {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} Admin Login`);
  
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@pamlee.co.za',
        password: 'admin123'
      }
    });
    
    if (response.status === 200 && response.data.success && response.data.token) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Admin login successful`);
      console.log(`  Role: ${response.data.user.role}`);
      console.log(`  Token received: ${response.data.token.substring(0, 20)}...`);
      results.passed++;
      results.tests.push({ name: 'Admin Login', status: 'PASS' });
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

async function testGetProducts() {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} Get Products`);
  
  try {
    const response = await makeRequest('/api/products');
    
    if (response.status === 200 && response.data.success && Array.isArray(response.data.products)) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Products retrieved successfully`);
      console.log(`  Total products: ${response.data.products.length}`);
      if (response.data.products.length > 0) {
        console.log(`  Sample: ${response.data.products[0].name} - R${response.data.products[0].price}`);
      }
      results.passed++;
      results.tests.push({ name: 'Get Products', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Failed to get products: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get Products', status: 'FAIL', error: error.message });
    return false;
  }
}

async function testGetProductById() {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} Get Product by ID`);
  
  try {
    // First get all products to find a valid ID
    const productsResponse = await makeRequest('/api/products');
    if (!productsResponse.data.products || productsResponse.data.products.length === 0) {
      throw new Error('No products available to test');
    }
    
    const productId = productsResponse.data.products[0].id;
    const response = await makeRequest(`/api/products/${productId}`);
    
    if (response.status === 200 && response.data.success && response.data.product) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Product retrieved successfully`);
      console.log(`  Product: ${response.data.product.name}`);
      console.log(`  Price: R${response.data.product.price}`);
      results.passed++;
      results.tests.push({ name: 'Get Product by ID', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Failed to get product: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get Product by ID', status: 'FAIL', error: error.message });
    return false;
  }
}

async function testAuthMe(token) {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} Get Current User (Auth)`);
  
  try {
    const response = await makeRequest('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.status === 200 && response.data.success && response.data.user) {
      console.log(`${colors.green}✓ PASS${colors.reset} - User info retrieved`);
      console.log(`  Email: ${response.data.user.email}`);
      console.log(`  Role: ${response.data.user.role}`);
      results.passed++;
      results.tests.push({ name: 'Get Current User', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Failed to get user: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get Current User', status: 'FAIL', error: error.message });
    return false;
  }
}

async function testPlaceOrder(userEmail) {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} Place Order`);
  
  const trackerId = `TEST-${Date.now()}`;
  
  try {
    const response = await makeRequest('/api/orders', {
      method: 'POST',
      body: {
        trackerId,
        userEmail,
        items: [
          { id: '1', name: 'Chocolate Cake', price: 250, quantity: 1 }
        ],
        subtotal: 250,
        deliveryFee: 50,
        total: 300,
        paymentMethod: 'card',
        fulfilment: 'delivery',
        deliveryLocation: 'Johannesburg',
        deliveryAddress: '123 Test St'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Order placed successfully`);
      console.log(`  Tracker ID: ${response.data.trackerId}`);
      results.passed++;
      results.tests.push({ name: 'Place Order', status: 'PASS' });
      return { success: true, trackerId };
    } else {
      throw new Error(`Failed to place order: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Place Order', status: 'FAIL', error: error.message });
    return { success: false };
  }
}

async function testTrackOrder(trackerId) {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} Track Order`);
  
  try {
    const response = await makeRequest(`/api/orders/${trackerId}`);
    
    if (response.status === 200 && response.data.success && response.data.order) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Order tracked successfully`);
      console.log(`  Status: ${response.data.order.status}`);
      console.log(`  Total: R${response.data.order.total}`);
      results.passed++;
      results.tests.push({ name: 'Track Order', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Failed to track order: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Track Order', status: 'FAIL', error: error.message });
    return false;
  }
}

async function testGetStats(adminToken) {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} Get Admin Stats`);
  
  try {
    const response = await makeRequest('/api/stats', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    
    if (response.status === 200 && response.data.success && response.data.stats) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Stats retrieved successfully`);
      console.log(`  Total Orders: ${response.data.stats.totalOrders}`);
      console.log(`  Total Revenue: R${response.data.stats.totalRevenue}`);
      console.log(`  Total Products: ${response.data.stats.totalProducts}`);
      results.passed++;
      results.tests.push({ name: 'Get Admin Stats', status: 'PASS' });
      return true;
    } else {
      throw new Error(`Failed to get stats: ${JSON.stringify(response.data)}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ FAIL${colors.reset} - ${error.message}`);
    results.failed++;
    results.tests.push({ name: 'Get Admin Stats', status: 'FAIL', error: error.message });
    return false;
  }
}

// Main diagnostic function
async function runDiagnostics() {
  console.log(`
${colors.blue}╔════════════════════════════════════════════════════════╗
║     Pamlee Kitchen - Deployment Diagnostics           ║
╚════════════════════════════════════════════════════════╝${colors.reset}

Testing URL: ${colors.cyan}${BASE_URL}${colors.reset}
Started: ${new Date().toLocaleString()}
`);

  // Run tests sequentially
  await testHealthCheck();
  
  const signupResult = await testSignup();
  const adminLoginResult = await testAdminLogin();
  
  await testGetProducts();
  await testGetProductById();
  
  if (signupResult.success) {
    await testAuthMe(signupResult.token);
    const orderResult = await testPlaceOrder(signupResult.email);
    
    if (orderResult.success) {
      await testTrackOrder(orderResult.trackerId);
    }
  }
  
  if (adminLoginResult.success) {
    await testGetStats(adminLoginResult.token);
  }

  // Print summary
  console.log(`
${colors.blue}╔════════════════════════════════════════════════════════╗
║                    TEST SUMMARY                        ║
╚════════════════════════════════════════════════════════╝${colors.reset}
`);

  results.tests.forEach(test => {
    const status = test.status === 'PASS' 
      ? `${colors.green}✓ PASS${colors.reset}` 
      : `${colors.red}✗ FAIL${colors.reset}`;
    console.log(`${status} - ${test.name}`);
    if (test.error) {
      console.log(`       ${colors.red}Error: ${test.error}${colors.reset}`);
    }
  });

  const total = results.passed + results.failed;
  const percentage = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  
  console.log(`
${colors.blue}═══════════════════════════════════════════════════════${colors.reset}
Total Tests: ${total}
${colors.green}Passed: ${results.passed}${colors.reset}
${colors.red}Failed: ${results.failed}${colors.reset}
Success Rate: ${percentage}%

Completed: ${new Date().toLocaleString()}
${colors.blue}═══════════════════════════════════════════════════════${colors.reset}
`);

  if (results.failed === 0) {
    console.log(`${colors.green}🎉 All tests passed! Your deployment is working correctly.${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}⚠️  Some tests failed. Please check the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

// Run diagnostics
runDiagnostics().catch(error => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});
