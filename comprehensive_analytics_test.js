// Enhanced Analytics Performance Test with Multiple Runs
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

let authToken = '';

// Test authentication and get token
async function authenticate() {
    try {
        console.log('🔐 Authenticating...');
        const response = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: 'admin_new@example.com',
            password: 'password123'
        });
        
        authToken = response.data.data.token;
        console.log('✅ Authentication successful');
        return true;
    } catch (error) {
        console.error('❌ Authentication failed:', error.response?.data || error.message);
        return false;
    }
}

// Test single endpoint with timing
async function testEndpoint(name, url) {
    const startTime = Date.now();
    try {
        const response = await axios.get(`${BASE_URL}${url}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`✅ ${name}: ${duration}ms - ${response.data.success ? 'SUCCESS' : 'FAILED'}`);
        if (response.data.data && response.data.data.length !== undefined) {
            console.log(`   📊 Data points: ${response.data.data.length}`);
        }
        if (response.data.data && typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
            const keys = Object.keys(response.data.data);
            console.log(`   📋 Data keys: ${keys.join(', ')}`);
        }
        
        return { name, duration, success: true, data: response.data.data };
    } catch (error) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.error(`❌ ${name}: ${duration}ms - FAILED`);
        console.error(`   Error: ${error.response?.data?.error || error.message}`);
        return { name, duration, success: false, error: error.response?.data?.error || error.message };
    }
}

// Test all analytics endpoints
async function testAllEndpoints() {
    console.log('\n📊 Testing All Analytics Endpoints:');
    
    const endpoints = [
        { name: 'KPIs', url: '/api/analytics/kpis' },
        { name: 'Sales Trend', url: '/api/analytics/sales-trend' },
        { name: 'Product Sales', url: '/api/analytics/product-sales-distribution' },
        { name: 'Top Customers', url: '/api/analytics/top-customers?limit=5' }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
        const result = await testEndpoint(endpoint.name, endpoint.url);
        results.push(result);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
}

// Run performance test multiple times
async function runPerformanceTest() {
    if (!(await authenticate())) {
        return;
    }
    
    console.log('\n🚀 Running Comprehensive Analytics Performance Test');
    console.log('=' .repeat(60));
    
    const runs = 3;
    const allResults = [];
    
    for (let run = 1; run <= runs; run++) {
        console.log(`\n📍 Run ${run}/${runs}:`);
        const results = await testAllEndpoints();
        allResults.push(results);
        
        if (run < runs) {
            console.log('⏱️  Waiting 2 seconds before next run...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Calculate statistics
    console.log('\n📈 Performance Statistics:');
    console.log('=' .repeat(60));
    
    const endpoints = ['KPIs', 'Sales Trend', 'Product Sales', 'Top Customers'];
    
    endpoints.forEach(endpointName => {
        const times = allResults.map(run => 
            run.find(result => result.name === endpointName)?.duration
        ).filter(time => time !== undefined);
        
        const successes = allResults.map(run => 
            run.find(result => result.name === endpointName)?.success
        ).filter(success => success === true).length;
        
        if (times.length > 0) {
            const avg = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
            const min = Math.min(...times);
            const max = Math.max(...times);
            
            const status = avg < 300 ? '🟢' : avg < 500 ? '🟡' : '🔴';
            const successRate = Math.round((successes / runs) * 100);
            
            console.log(`${status} ${endpointName.padEnd(15)} - Avg: ${avg}ms | Min: ${min}ms | Max: ${max}ms | Success: ${successRate}%`);
        } else {
            console.log(`🔴 ${endpointName.padEnd(15)} - No successful responses`);
        }
    });
    
    // Show target analysis
    console.log('\n🎯 Target Analysis (Sub-300ms):');
    const successfulEndpoints = endpoints.filter(endpointName => {
        const times = allResults.map(run => 
            run.find(result => result.name === endpointName)?.duration
        ).filter(time => time !== undefined);
        
        if (times.length === 0) return false;
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        return avg < 300;
    });
    
    console.log(`✅ Endpoints meeting target: ${successfulEndpoints.length}/${endpoints.length}`);
    if (successfulEndpoints.length > 0) {
        console.log(`   ${successfulEndpoints.join(', ')}`);
    }
    
    const pendingEndpoints = endpoints.filter(endpointName => {
        const times = allResults.map(run => 
            run.find(result => result.name === endpointName)?.duration
        ).filter(time => time !== undefined);
        
        if (times.length === 0) return true;
        const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
        return avg >= 300;
    });
    
    if (pendingEndpoints.length > 0) {
        console.log(`⏰ Still need optimization: ${pendingEndpoints.join(', ')}`);
    }
}

// Run the test
runPerformanceTest().catch(console.error);
