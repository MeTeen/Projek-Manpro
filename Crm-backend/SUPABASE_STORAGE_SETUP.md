# Supabase Storage Setup Guide

## Overview
This guide will help you migrate from local file storage to Supabase Storage for avatar uploads. This solves the issue with stateless servers where uploaded files disappear after container restarts.

## Prerequisites
1. Active Supabase project (you already have this)
2. Supabase API keys

## Setup Steps

### 1. Get Supabase API Keys

1. Go to your Supabase dashboard: https://app.supabase.com/project/slmrcglupqfskshfcsut
2. Navigate to **Settings > API**
3. Copy the following keys:
   - **anon public key** → Use for `SUPABASE_ANON_KEY`
   - **service_role secret key** → Use for `SUPABASE_SERVICE_ROLE_KEY`

### 2. Update Environment Variables

Update your `.env.production` file with the actual Supabase keys:

```bash
# Supabase Configuration
SUPABASE_URL=https://slmrcglupqfskshfcsut.supabase.co
SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
# Storage bucket name for avatars
SUPABASE_STORAGE_BUCKET=avatars
```

### 3. Create Storage Bucket

Run the setup script to create the storage bucket:

```bash
npm run setup:storage
```

This script will:
- Create an `avatars` bucket in your Supabase Storage
- Set up proper permissions (public access)
- Configure file size limits (5MB)
- Test upload functionality

### 4. Update Docker Configuration

If using Docker, make sure your environment variables are properly passed to the container in your `docker-compose.yml`.

### 5. Deploy Changes

After updating your environment variables:

1. Rebuild your Docker image
2. Deploy to GCP
3. Test avatar upload functionality

## How It Works

### Before (Local Storage)
```
Client → Backend → Local Filesystem (/uploads/avatars/)
                   ↓
                   ❌ Files lost on container restart
```

### After (Supabase Storage)
```
Client → Backend → Supabase Storage (persistent)
                   ↓
                   ✅ Files persist forever
```

## File URL Format

### Old Format (Local)
```
https://your-api.run.app/uploads/avatars/avatar-123456789.jpg
```

### New Format (Supabase)
```
https://slmrcglupqfskshfcsut.supabase.co/storage/v1/object/public/avatars/avatar-123456789.jpg
```

## API Changes

### Upload Process
1. Frontend sends file via multipart form data
2. Backend receives file in memory (not saved to disk)
3. Backend uploads file buffer to Supabase Storage
4. Supabase returns public URL
5. Backend saves public URL to database

### Automatic Cleanup
- When updating avatar: old avatar is automatically deleted from Supabase
- Only Supabase URLs are cleaned up (for safety during migration)

## Testing

1. Create a new customer with avatar
2. Verify avatar URL starts with Supabase domain
3. Check that image is accessible
4. Update customer avatar
5. Verify old image is deleted and new one is uploaded

## Troubleshooting

### Common Issues

1. **Bucket creation fails**
   - Check your `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Ensure you have storage permissions

2. **Upload fails**
   - Verify file size is under 5MB
   - Check file type is image (jpeg, png, gif, webp)

3. **Images not loading**
   - Verify bucket is set to public
   - Check CORS settings in Supabase

### Debug Commands

```bash
# Test storage setup
npm run setup:storage

# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

## Benefits

✅ **Persistent Storage**: Files survive server restarts  
✅ **CDN Integration**: Fast global image delivery  
✅ **Automatic Scaling**: No storage space limits  
✅ **Cost Effective**: Pay only for what you use  
✅ **Easy Management**: Manage files via Supabase dashboard
