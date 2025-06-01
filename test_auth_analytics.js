// Test script for authentication and analytics
const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8080/api';

async function testAuthAndAnalytics() {
    try {
        console.log('🔐 Testing Authentication Flow...');
        
        // Step 1: Login to get token
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'admin_new@example.com',
            password: 'password123'
        });
        
        console.log('✅ Login successful');
        console.log('Response structure:', Object.keys(loginResponse.data));
        console.log('Has data object:', !!loginResponse.data.data);
        console.log('Has token in data:', !!loginResponse.data.data?.token);
        
        const token = loginResponse.data.data.token;
        console.log('Token length:', token.length);
        console.log('Token starts with:', token.substring(0, 20) + '...');
        
        // Step 2: Test analytics endpoints with token
        console.log('\n📊 Testing Analytics Endpoints...');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Test KPIs endpoint
        console.log('Testing KPIs endpoint...');
        const startTime = Date.now();
        const kpisResponse = await axios.get(`${BASE_URL}/analytics/kpis`, { headers });
        const kpisTime = Date.now() - startTime;
        console.log(`✅ KPIs Response (${kpisTime}ms):`, kpisResponse.data);
        
        // Test Sales Trend endpoint
        console.log('\nTesting Sales Trend endpoint...');
        const salesStartTime = Date.now();
        const salesResponse = await axios.get(`${BASE_URL}/analytics/sales-trend?period=monthly`, { headers });
        const salesTime = Date.now() - salesStartTime;
        console.log(`✅ Sales Trend Response (${salesTime}ms):`, salesResponse.data);
        
        // Test Product Sales endpoint
        console.log('\nTesting Product Sales endpoint...');
        const productsStartTime = Date.now();
        const productsResponse = await axios.get(`${BASE_URL}/analytics/product-sales`, { headers });
        const productsTime = Date.now() - productsStartTime;
        console.log(`✅ Product Sales Response (${productsTime}ms):`, productsResponse.data);
        
        // Test Top Customers endpoint
        console.log('\nTesting Top Customers endpoint...');
        const customersStartTime = Date.now();
        const customersResponse = await axios.get(`${BASE_URL}/analytics/top-customers?limit=5`, { headers });
        const customersTime = Date.now() - customersStartTime;
        console.log(`✅ Top Customers Response (${customersTime}ms):`, customersResponse.data);
        
        console.log('\n🎉 All tests passed!');
        console.log('Performance Summary:');
        console.log(`- KPIs: ${kpisTime}ms`);
        console.log(`- Sales Trend: ${salesTime}ms`);
        console.log(`- Product Sales: ${productsTime}ms`);
        console.log(`- Top Customers: ${customersTime}ms`);
        
        const avgTime = (kpisTime + salesTime + productsTime + customersTime) / 4;
        console.log(`- Average: ${avgTime.toFixed(2)}ms`);
        
        if (avgTime < 300) {
            console.log('🚀 TARGET ACHIEVED: Analytics optimized to under 300ms!');
        } else if (avgTime < 500) {
            console.log('⚡ GOOD: Analytics performing well under 500ms');
        } else {
            console.log('⚠️ NEEDS OPTIMIZATION: Analytics taking longer than expected');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.status === 401) {
            console.error('Authentication failed - check credentials');
        } else if (error.response?.status === 403) {
            console.error('Authorization failed - check user role');
        }
    }
}

testAuthAndAnalytics();
