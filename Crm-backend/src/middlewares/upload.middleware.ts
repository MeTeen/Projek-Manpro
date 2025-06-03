import multer from 'multer';
import { Request } from 'express';

// Use memory storage instead of disk storage since we'll upload to Supabase
const storage = multer.memoryStorage();

// Filter to allow only images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Configure multer middleware
export const uploadAvatar = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
}).single('avatar');

// Helper function to validate if URL is a Supabase storage URL
export const isSupabaseUrl = (url: string): boolean => {
  const supabaseUrl = process.env.SUPABASE_URL;
  if (!supabaseUrl) return false;
  return url.startsWith(`${supabaseUrl}/storage/v1/object/public/`);
};