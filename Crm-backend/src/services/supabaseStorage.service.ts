import { createClient } from '@supabase/supabase-js';
import { Request } from 'express';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Role Key must be provided');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export class SupabaseStorageService {
  private bucketName = 'avatars';

  /**
   * Upload file to Supabase Storage
   */
  async uploadAvatar(file: Express.Multer.File, customerId?: string): Promise<string> {
    try {
      // Generate unique filename
      const fileExt = file.originalname.split('.').pop();
      const fileName = `avatar-${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
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

    } catch (error) {
      console.error('Upload service error:', error);
      throw error;
    }
  }

  /**
   * Delete file from Supabase Storage
   */
  async deleteAvatar(fileUrl: string): Promise<boolean> {
    try {
      // Extract filename from URL
      const urlParts = fileUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];

      if (!fileName) {
        console.warn('Could not extract filename from URL:', fileUrl);
        return false;
      }

      const { error } = await supabase.storage
        .from(this.bucketName)
        .remove([fileName]);

      if (error) {
        console.error('Supabase delete error:', error);
        return false;
      }

      console.log('File deleted successfully:', fileName);
      return true;

    } catch (error) {
      console.error('Delete service error:', error);
      return false;
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(fileName: string): string {
    const { data } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);
    
    return data.publicUrl;
  }

  /**
   * Create bucket if it doesn't exist (for setup)
   */
  async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError);
        return;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.bucketName);

      if (!bucketExists) {
        // Create bucket
        const { error: createError } = await supabase.storage.createBucket(this.bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          fileSizeLimit: 5 * 1024 * 1024 // 5MB
        });

        if (createError) {
          console.error('Error creating bucket:', createError);
        } else {
          console.log('Avatars bucket created successfully');
        }
      } else {
        console.log('Avatars bucket already exists');
      }
    } catch (error) {
      console.error('Error initializing bucket:', error);
    }
  }
}

export const supabaseStorageService = new SupabaseStorageService();
