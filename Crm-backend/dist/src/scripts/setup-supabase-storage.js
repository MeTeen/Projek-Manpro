"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'avatars';
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase configuration. Please check your environment variables.');
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
function setupSupabaseStorage() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🚀 Setting up Supabase Storage...');
            console.log(`📦 Project URL: ${supabaseUrl}`);
            console.log(`📂 Bucket name: ${bucketName}`);
            // Check if bucket already exists
            const { data: buckets, error: listError } = yield supabase.storage.listBuckets();
            if (listError) {
                console.error('❌ Error listing buckets:', listError);
                return;
            }
            const bucketExists = buckets === null || buckets === void 0 ? void 0 : buckets.some(bucket => bucket.name === bucketName);
            if (bucketExists) {
                console.log(`✅ Bucket "${bucketName}" already exists!`);
            }
            else {
                console.log(`📦 Creating bucket "${bucketName}"...`);
                // Create bucket
                const { data, error: createError } = yield supabase.storage.createBucket(bucketName, {
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
            const { data: uploadData, error: uploadError } = yield supabase.storage
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
            const { error: deleteError } = yield supabase.storage
                .from(bucketName)
                .remove([testFileName]);
            if (deleteError) {
                console.warn('⚠️ Warning: Could not delete test file:', deleteError);
            }
            else {
                console.log('🧹 Test file cleaned up successfully');
            }
            console.log('\n✅ Supabase Storage setup completed successfully!');
            console.log('\n📋 Next steps:');
            console.log('1. Make sure your SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY are correct');
            console.log('2. Update your frontend to use the new avatar URLs');
            console.log('3. Test avatar upload functionality');
        }
        catch (error) {
            console.error('❌ Setup failed:', error);
        }
    });
}
// Run setup
setupSupabaseStorage();
//# sourceMappingURL=setup-supabase-storage.js.map