"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSupabaseUrl = exports.uploadAvatar = void 0;
const multer_1 = __importDefault(require("multer"));
// Use memory storage instead of disk storage since we'll upload to Supabase
const storage = multer_1.default.memoryStorage();
// Filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
// Configure multer middleware
exports.uploadAvatar = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
}).single('avatar');
// Helper function to validate if URL is a Supabase storage URL
const isSupabaseUrl = (url) => {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl)
        return false;
    return url.startsWith(`${supabaseUrl}/storage/v1/object/public/`);
};
exports.isSupabaseUrl = isSupabaseUrl;
//# sourceMappingURL=upload.middleware.js.map