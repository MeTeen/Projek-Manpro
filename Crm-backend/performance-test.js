const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8080/api';

// Authentication credentials from seeded data
const AUTH_CREDENTIALS = {
  email: 'admin_new@example.com',
  password: 'password123'
};

// Test endpoints
const endpoints = [
  { name: 'Dashboard Summary', url: `${BASE_URL}/dashboard/summary` },
  { name: 'Recent Activities', url: `${BASE_URL}/activities/recent?limit=10` },
  { name: 'All Tasks', url: `${BASE_URL}/tasks?page=1&limit=50` },
  { name: 'All Customers', url: `${BASE_URL}/customers?page=1&limit=50` }
];

// Global token storage
let authToken = null;

async function authenticate() {
  try {
    console.log('🔐 Authenticating with admin credentials...');
    const response = await axios.post(`${BASE_URL}/auth/login`, AUTH_CREDENTIALS);
    
    if (response.data.success && response.data.data && response.data.data.token) {
      authToken = response.data.data.token;
      console.log('✅ Authentication successful');
      return true;
    } else {
      console.log('❌ Authentication failed - no token received');
      return false;
    }
  } catch (error) {
    console.log('❌ Authentication error:', error.message);
    return false;
  }
}

async function measurePerformance(url, name, attempts = 3) {
  const times = [];
  
  for (let i = 0; i < attempts; i++) {
    const start = Date.now();
    try {
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const end = Date.now();
      const duration = end - start;
      times.push(duration);
      console.log(`${name} - Attempt ${i + 1}: ${duration}ms (Status: ${response.status})`);
    } catch (error) {
      console.log(`${name} - Attempt ${i + 1}: ERROR - ${error.message}`);
      times.push(999999); // Large number for failed requests
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  return { avgTime, minTime, maxTime, times };
}

async function runPerformanceTest() {
  console.log('🚀 Starting CRM Backend Performance Test');
  console.log('='.repeat(50));
  console.log('Target: All endpoints should respond < 1000ms\n');
  
  // First authenticate
  const authSuccess = await authenticate();
  if (!authSuccess) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  const results = [];
  
  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint.name}`);
    console.log('-'.repeat(30));
    
    const result = await measurePerformance(endpoint.url, endpoint.name);
    results.push({
      name: endpoint.name,
      ...result
    });
    
    console.log(`Average: ${result.avgTime.toFixed(0)}ms`);
    console.log(`Range: ${result.minTime}ms - ${result.maxTime}ms`);
    
    if (result.avgTime < 1000) {
      console.log('✅ PASS - Under 1 second');
    } else {
      console.log('❌ FAIL - Over 1 second');
    }
    console.log('');
  }
  
  // Summary
  console.log('📊 Performance Test Summary');
  console.log('='.repeat(50));
  
  let allPassed = true;
  results.forEach(result => {
    const status = result.avgTime < 1000 ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.avgTime.toFixed(0)}ms avg`);
    if (result.avgTime >= 1000) allPassed = false;
  });
  
  console.log('');
  if (allPassed) {
    console.log('🎉 All endpoints are performing well (< 1 second)!');
  } else {
    console.log('⚠️  Some endpoints need further optimization.');
  }
  
  const overallAvg = results.reduce((sum, r) => sum + r.avgTime, 0) / results.length;
  console.log(`Overall average response time: ${overallAvg.toFixed(0)}ms`);
}

// Run the test
runPerformanceTest().catch(console.error);
