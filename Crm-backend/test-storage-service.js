// Test Supabase Storage service directly
const path = require('path');
require('dotenv').config();

// Import the TypeScript service (we'll use ts-node to run it)
const { exec } = require('child_process');

// Create test script that uses our Supabase Storage service
const testScript = `
import { SupabaseStorageService } from './src/services/supabase-storage.service';

async function testSupabaseStorage() {
  try {
    console.log('🧪 Testing Supabase Storage Service directly...');
    
    const storageService = new SupabaseStorageService();
    
    // Create a test image buffer (1x1 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0B, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    
    // Test upload
    const fileName = \`test-direct-\${Date.now()}.png\`;
    const uploadResult = await storageService.uploadFile(testImageBuffer, fileName, 'image/png');
    
    if (uploadResult.success) {
      console.log('✅ Direct upload successful!');
      console.log('📋 Upload result:', {
        url: uploadResult.url,
        fileName: uploadResult.fileName
      });
      
      if (uploadResult.url && uploadResult.url.includes('supabase.co')) {
        console.log('🎉 SUCCESS: File is stored in Supabase Storage!');
        console.log(\`🔗 Public URL: \${uploadResult.url}\`);
        
        // Test cleanup
        const deleteResult = await storageService.deleteFile(uploadResult.fileName!);
        if (deleteResult.success) {
          console.log('🧹 Test file cleaned up successfully');
        } else {
          console.log('⚠️ Warning: Could not delete test file');
        }
      } else {
        console.log('⚠️ Warning: URL doesn\\'t seem to be from Supabase');
      }
    } else {
      console.error('❌ Upload failed:', uploadResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSupabaseStorage();
`;

console.log('🚀 Running direct Supabase Storage test...');
require('fs').writeFileSync('test-storage-direct.ts', testScript);

exec('npx ts-node test-storage-direct.ts', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Test execution failed:', error.message);
    return;
  }
  if (stderr) {
    console.error('⚠️ Warnings:', stderr);
  }
  console.log(stdout);
  
  // Clean up test file
  require('fs').unlinkSync('test-storage-direct.ts');
});
