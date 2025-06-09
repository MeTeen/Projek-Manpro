import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'avatars';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase configuration. Please check your environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupSupabaseStorage() {
  try {
    console.log('🚀 Setting up Supabase Storage...');
    console.log(`📦 Project URL: ${supabaseUrl}`);
    console.log(`📂 Bucket name: ${bucketName}`);

    // Check if bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      console.log(`✅ Bucket "${bucketName}" already exists!`);
    } else {
      console.log(`📦 Creating bucket "${bucketName}"...`);
      
      // Create bucket
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make bucket public so images can be accessed directly
        fileSizeLimit: 5242880, // 5MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return;
      }

      console.log(`✅ Successfully created bucket "${bucketName}"!`);
    }

    // Test upload to verify everything works
    console.log('🧪 Testing upload functionality...');
    
    const testFileName = `test-${Date.now()}.txt`;
    const testContent = Buffer.from('This is a test file');
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testFileName, testContent, {
        contentType: 'text/plain',
      });

    if (uploadError) {
      console.error('❌ Test upload failed:', uploadError);
      return;
    }

    console.log('✅ Test upload successful!');

    // Get public URL for test file
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(testFileName);

    console.log(`🔗 Test file URL: ${urlData.publicUrl}`);

    // Clean up test file
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([testFileName]);

    if (deleteError) {
      console.warn('⚠️ Warning: Could not delete test file:', deleteError);
    } else {
      console.log('🧹 Test file cleaned up successfully');
    }

    console.log('\n✅ Supabase Storage setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Make sure your SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are correct');
    console.log('2. Update your frontend to use the new avatar URLs');
    console.log('3. Test avatar upload functionality');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run setup
setupSupabaseStorage();
