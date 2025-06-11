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
exports.SupabaseStorageService = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'avatars';
if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase configuration. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
}
// Create Supabase client with service role key for storage operations
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
class SupabaseStorageService {
    /**
     * Upload a file to Supabase Storage
     * @param file - File buffer
     * @param fileName - Name of the file
     * @param contentType - MIME type of the file
     * @returns Promise with upload result
     */
    static uploadFile(file, fileName, contentType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Ensure bucket exists
                yield this.ensureBucketExists();
                const { data, error } = yield supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, {
                    contentType,
                    upsert: true, // Allow overwriting existing files
                });
                if (error) {
                    console.error('Supabase upload error:', error);
                    throw new Error(`Failed to upload file: ${error.message}`);
                }
                // Get public URL
                const { data: urlData } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(fileName);
                return {
                    success: true,
                    data: data,
                    publicUrl: urlData.publicUrl,
                    fileName: fileName
                };
            }
            catch (error) {
                console.error('Upload service error:', error);
                throw error;
            }
        });
    }
    /**
     * Delete a file from Supabase Storage
     * @param fileName - Name of the file to delete
     * @returns Promise with deletion result
     */
    static deleteFile(fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data, error } = yield supabase.storage
                    .from(bucketName)
                    .remove([fileName]);
                if (error) {
                    console.error('Supabase delete error:', error);
                    throw new Error(`Failed to delete file: ${error.message}`);
                }
                return {
                    success: true,
                    data: data
                };
            }
            catch (error) {
                console.error('Delete service error:', error);
                throw error;
            }
        });
    }
    /**
     * Get public URL for a file
     * @param fileName - Name of the file
     * @returns Public URL
     */
    static getPublicUrl(fileName) {
        const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);
        return data.publicUrl;
    }
    /**
     * Ensure the storage bucket exists
     */
    static ensureBucketExists() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if bucket exists
                const { data: buckets, error: listError } = yield supabase.storage.listBuckets();
                if (listError) {
                    console.error('Error listing buckets:', listError);
                    return;
                }
                const bucketExists = buckets === null || buckets === void 0 ? void 0 : buckets.some(bucket => bucket.name === bucketName);
                if (!bucketExists) {
                    // Create bucket if it doesn't exist
                    const { data, error: createError } = yield supabase.storage.createBucket(bucketName, {
                        public: true, // Make bucket public so images can be accessed directly
                        fileSizeLimit: 5242880, // 5MB limit
                        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
                    });
                    if (createError) {
                        console.error('Error creating bucket:', createError);
                        throw new Error(`Failed to create storage bucket: ${createError.message}`);
                    }
                    console.log('✅ Created Supabase storage bucket:', bucketName);
                }
            }
            catch (error) {
                console.error('Error ensuring bucket exists:', error);
                // Don't throw here - let the upload continue and fail if bucket really doesn't exist
            }
        });
    }
    /**
     * Generate a unique filename for avatar uploads
     * @param originalName - Original filename
     * @param userId - User ID for uniqueness
     * @returns Unique filename
     */
    static generateAvatarFileName(originalName, userId) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000000);
        const extension = originalName.split('.').pop() || 'jpg';
        if (userId) {
            return `avatar-${userId}-${timestamp}-${random}.${extension}`;
        }
        return `avatar-${timestamp}-${random}.${extension}`;
    }
    /**
     * Extract filename from Supabase public URL
     * @param publicUrl - Supabase public URL
     * @returns Filename or null if not a valid Supabase URL
     */
    static extractFileNameFromUrl(publicUrl) {
        try {
            const url = new URL(publicUrl);
            const pathParts = url.pathname.split('/');
            // Supabase storage URLs have format: /storage/v1/object/public/bucket-name/filename
            const bucketIndex = pathParts.indexOf(bucketName);
            if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
                return pathParts[bucketIndex + 1];
            }
            return null;
        }
        catch (error) {
            console.error('Error extracting filename from URL:', error);
            return null;
        }
    }
}
exports.SupabaseStorageService = SupabaseStorageService;
exports.default = SupabaseStorageService;
//# sourceMappingURL=supabase-storage.service.js.map