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
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseStorageService = exports.SupabaseStorageService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and Service Role Key must be provided');
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
class SupabaseStorageService {
    constructor() {
        this.bucketName = 'avatars';
    }
    /**
     * Upload file to Supabase Storage
     */
    uploadAvatar(file, customerId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Generate unique filename
                const fileExt = file.originalname.split('.').pop();
                const fileName = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
                // Upload file to Supabase Storage
                const { data, error } = yield supabase.storage
                    .from(this.bucketName)
                    .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });
                if (error) {
                    console.error('Supabase upload error:', error);
                    throw new Error(`Failed to upload file: ${error.message}`);
                }
                // Get public URL
                const { data: publicUrlData } = supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(fileName);
                console.log('File uploaded successfully:', publicUrlData.publicUrl);
                return publicUrlData.publicUrl;
            }
            catch (error) {
                console.error('Upload service error:', error);
                throw error;
            }
        });
    }
    /**
     * Delete file from Supabase Storage
     */
    deleteAvatar(fileUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Extract filename from URL
                const urlParts = fileUrl.split('/');
                const fileName = urlParts[urlParts.length - 1];
                if (!fileName) {
                    console.warn('Could not extract filename from URL:', fileUrl);
                    return false;
                }
                const { error } = yield supabase.storage
                    .from(this.bucketName)
                    .remove([fileName]);
                if (error) {
                    console.error('Supabase delete error:', error);
                    return false;
                }
                console.log('File deleted successfully:', fileName);
                return true;
            }
            catch (error) {
                console.error('Delete service error:', error);
                return false;
            }
        });
    }
    /**
     * Get public URL for a file
     */
    getPublicUrl(fileName) {
        const { data } = supabase.storage
            .from(this.bucketName)
            .getPublicUrl(fileName);
        return data.publicUrl;
    }
    /**
     * Create bucket if it doesn't exist (for setup)
     */
    initializeBucket() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if bucket exists
                const { data: buckets, error: listError } = yield supabase.storage.listBuckets();
                if (listError) {
                    console.error('Error listing buckets:', listError);
                    return;
                }
                const bucketExists = buckets === null || buckets === void 0 ? void 0 : buckets.some(bucket => bucket.name === this.bucketName);
                if (!bucketExists) {
                    // Create bucket
                    const { error: createError } = yield supabase.storage.createBucket(this.bucketName, {
                        public: true,
                        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
                        fileSizeLimit: 5 * 1024 * 1024 // 5MB
                    });
                    if (createError) {
                        console.error('Error creating bucket:', createError);
                    }
                    else {
                        console.log('Avatars bucket created successfully');
                    }
                }
                else {
                    console.log('Avatars bucket already exists');
                }
            }
            catch (error) {
                console.error('Error initializing bucket:', error);
            }
        });
    }
}
exports.SupabaseStorageService = SupabaseStorageService;
exports.supabaseStorageService = new SupabaseStorageService();
//# sourceMappingURL=supabaseStorage.service.js.map