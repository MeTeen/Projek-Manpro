const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:8080/api';

async function testCustomerEndpoint() {
  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin_new@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login successful');
    
    // Test customer endpoint
    console.log('📝 Testing customer endpoint...');
    const customerResponse = await axios.get(`${BASE_URL}/customers?page=1&limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Customer endpoint success:', customerResponse.status);
    console.log('Data:', JSON.stringify(customerResponse.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testCustomerEndpoint();
