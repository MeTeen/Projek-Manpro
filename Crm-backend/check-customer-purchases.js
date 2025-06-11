const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function checkCustomerPurchases() {
    console.log('Checking Customer Purchases...\n');
    
    try {
        // Login as customer
        console.log('1. Logging in as customer...');
        const customerLoginResponse = await axios.post(`${BASE_URL}/api/customer/auth/login`, {
            email: 'petra@petra.ac.id',
            password: 'newpassword123'
        });
        
        const token = customerLoginResponse.data.token;
        console.log('✓ Customer login successful');
        
        // Get customer purchases
        console.log('\n2. Fetching customer purchases...');
        const purchasesResponse = await axios.get(`${BASE_URL}/api/customer/tickets/purchases`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✓ Purchases fetched successfully');
        console.log('Number of purchases:', purchasesResponse.data.data.length);
        
        if (purchasesResponse.data.data.length > 0) {
            console.log('\nCustomer\'s purchases:');
            purchasesResponse.data.data.forEach((purchase, index) => {
                console.log(`  ${index + 1}. Purchase ID: ${purchase.id}`);
                console.log(`     Product: ${purchase.product.name}`);
                console.log(`     Quantity: ${purchase.quantity}`);
                console.log(`     Date: ${purchase.purchaseDate}`);
                console.log(`     Dimensions: ${purchase.product.dimensions || 'N/A'}`);
                console.log('');
            });
            
            console.log(`Use purchaseId: ${purchasesResponse.data.data[0].id} for testing`);
        } else {
            console.log('No purchases found for this customer');
        }
        
    } catch (error) {
        console.error('❌ Error details:');
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Response data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('Error message:', error.message);
        }
    }
}

checkCustomerPurchases();
