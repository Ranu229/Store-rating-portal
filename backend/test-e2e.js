const http = require('http');

const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  return { status: response.status, data };
}

async function runTests() {
  console.log('🧪 Starting End-to-End API Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    const health = await request('/health');
    assert(health.status === 200 && health.data.status === 'OK', 'GET /api/health responds with 200 OK');

    // 2. Admin Login
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123#' }),
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, 'POST /api/auth/login works for Administrator');
    const adminToken = adminLogin.data.token;

    // 3. Admin Dashboard Metrics
    const adminStats = await request('/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      adminStats.status === 200 &&
      adminStats.data.totalUsers >= 6 &&
      adminStats.data.totalStores >= 3 &&
      adminStats.data.totalRatings >= 6,
      'GET /api/admin/dashboard returns accurate totalUsers, totalStores, and totalRatings'
    );

    // 4. Admin Users List & Store Owner Rating check
    const adminUsers = await request('/admin/users', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminUsers.status === 200 && Array.isArray(adminUsers.data.users), 'GET /api/admin/users returns user list');
    const storeOwnerInList = adminUsers.data.users.find(u => u.role === 'STORE_OWNER');
    assert(
      storeOwnerInList && storeOwnerInList.storeRating !== undefined,
      'Admin user listing includes Store Owner rating for store owners'
    );

    // 5. Normal User Registration Validations:
    // 5a. Name < 20 chars fails
    const shortNameReg = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Short Name',
        email: 'testvalidation1@example.com',
        address: '123 Test St, Test City',
        password: 'ValidPassword1@',
      }),
    });
    assert(shortNameReg.status === 400, 'Registration with Name < 20 chars correctly rejected (400)');

    // 5b. Invalid password (no special char) fails
    const weakPassReg = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Valid Long Name For Testing User',
        email: 'testvalidation2@example.com',
        address: '123 Test St, Test City',
        password: 'Password123',
      }),
    });
    assert(weakPassReg.status === 400, 'Registration with password lacking special char correctly rejected (400)');

    // 5c. Valid registration succeeds
    const validReg = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New Registered Test Customer One',
        email: `newuser_${Date.now()}@example.com`,
        address: '999 Innovation Parkway, Silicon Hills, Austin, TX 78759',
        password: 'TestUser@2026#',
      }),
    });
    assert(validReg.status === 201 && validReg.data.token, 'Registration with valid details succeeds (201)');

    // 6. Normal User Login & Store Directory
    const userLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'user1@example.com', password: 'User@123#' }),
    });
    assert(userLogin.status === 200 && userLogin.data.token, 'POST /api/auth/login works for Normal User');
    const userToken = userLogin.data.token;

    const userStores = await request('/stores', {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(
      userStores.status === 200 &&
      Array.isArray(userStores.data.stores) &&
      userStores.data.stores[0].overallRating !== undefined,
      'GET /api/stores returns store list with overallRating and userRating'
    );

    // 7. Store Owner Login & Owner Dashboard
    const ownerLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'owner1@example.com', password: 'Owner@123#' }),
    });
    assert(ownerLogin.status === 200 && ownerLogin.data.token, 'POST /api/auth/login works for Store Owner');
    const ownerToken = ownerLogin.data.token;

    const ownerDashboard = await request('/owner/dashboard', {
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    assert(
      ownerDashboard.status === 200 &&
      ownerDashboard.data.hasStore === true &&
      ownerDashboard.data.averageRating > 0 &&
      Array.isArray(ownerDashboard.data.userRatings),
      'GET /api/owner/dashboard returns store average rating and customer ratings list'
    );

    console.log(`\n=============================================`);
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`=============================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
