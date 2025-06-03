const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

// Create a test image buffer (1x1 PNG)
const testImageBuffer = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
  0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
  0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
  0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
]);

async function testAvatarUpload() {
  try {
    console.log('🧪 Testing avatar upload with Supabase Storage...');
    
    // Create form data
    const form = new FormData();
    form.append('name', 'Test Customer');
    form.append('email', 'test@example.com');
    form.append('phone', '123-456-7890');
    form.append('avatar', testImageBuffer, {
      filename: 'test-avatar.png',
      contentType: 'image/png'
    });    // Send POST request to create customer with avatar
    const response = await fetch('http://127.0.0.1:8080/api/customers', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Avatar upload successful!');
      console.log('📋 Customer created:', {
        id: result.id,
        name: result.name,
        email: result.email,
        avatar: result.avatar
      });
      
      if (result.avatar && result.avatar.includes('supabase.co')) {
        console.log('🎉 SUCCESS: Avatar is now stored in Supabase!');
        console.log(`🔗 Avatar URL: ${result.avatar}`);
      } else {
        console.log('⚠️ Warning: Avatar URL doesn\'t seem to be from Supabase');
      }
    } else {
      console.error('❌ Upload failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAvatarUpload();
