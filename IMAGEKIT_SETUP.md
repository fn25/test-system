# 🖼️ ImageKit Integration Guide

## Overview
This project uses **ImageKit.io** for efficient image and video uploads with automatic optimization, resizing, and CDN delivery.

## Features
- ✅ **Dual Upload Mode**: URL input or file upload
- ✅ **Client-side Authentication**: Secure signature-based uploads
- ✅ **File Validation**: Type and size checks
- ✅ **Progress Tracking**: Real-time upload progress
- ✅ **Image Preview**: Instant preview of uploaded images
- ✅ **Automatic Optimization**: ImageKit handles optimization automatically

---

## 🚀 Setup Instructions

### 1. Create ImageKit Account
1. Go to [https://imagekit.io/](https://imagekit.io/)
2. Sign up for a free account
3. Get your credentials from [Developer Dashboard](https://imagekit.io/dashboard/developer/api-keys)

### 2. Configure Backend (.env)
Add these to your `.env` file in the **root directory**:

```bash
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

### 3. Configure Frontend (client/.env.development)
Add these to `client/.env.development`:

```bash
# ImageKit Configuration
REACT_APP_IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxxx
REACT_APP_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
REACT_APP_IMAGEKIT_AUTH_ENDPOINT=http://localhost:10000/api/imagekit/auth
```

### 4. Install Dependencies (Optional)
If you want full ImageKit features, install the SDK:

```bash
cd client
npm install imagekit-javascript
```

---

## 📝 Usage

### In CreateQuizPage.js
```javascript
import ImageUpload from './ImageUpload';

// In your form:
<ImageUpload
  label="Question Image"
  type="image"
  value={imageUrl}
  onChange={(url) => setImageUrl(url)}
/>
```

### Component Props
- `label` (string): Display label for the upload field
- `type` (string): Either "image" or "video"
- `value` (string): Current URL value
- `onChange` (function): Callback when URL changes

---

## 🎯 How It Works

### 1. User selects upload mode:
   - **URL Mode**: Paste image/video URL directly
   - **Upload Mode**: Upload file from computer

### 2. File Upload Process:
   ```
   User selects file
   ↓
   Validation (type, size)
   ↓
   Request auth from backend (/api/imagekit/auth)
   ↓
   Upload to ImageKit with signature
   ↓
   Get CDN URL
   ↓
   Save URL to form
   ```

### 3. Backend Authentication:
   - Server generates secure signature using private key
   - Signature expires in 1 hour
   - Frontend uses signature for authenticated upload

---

## 🔒 Security Notes

1. **Private Key**: Never expose `IMAGEKIT_PRIVATE_KEY` to frontend
2. **Authentication Endpoint**: Generates time-limited signatures
3. **Rate Limiting**: Consider adding rate limits to `/api/imagekit/auth` in production
4. **File Validation**: Both client-side and server-side validation

---

## 📏 File Limits

| Type  | Max Size | Formats              |
|-------|----------|----------------------|
| Image | 10 MB    | JPG, PNG, GIF, WebP  |
| Video | 50 MB    | MP4, WebM, OGG       |

---

## 🐛 Troubleshooting

### "ImageKit not configured" error
- Check if environment variables are set correctly
- Make sure you've restarted both frontend and backend after adding env vars
- Verify your ImageKit credentials are correct

### Upload fails
- Check browser console for detailed error messages
- Verify backend `/api/imagekit/auth` endpoint is accessible
- Check if file size/type is within limits

### Preview doesn't show
- Check if image URL is valid and accessible
- Check browser console for CORS errors
- Verify ImageKit URL endpoint is correct

---

## 🎨 Customization

### Change Upload Limits
Edit `client/src/utils/imagekit.js`:
```javascript
export const validateFileSize = (file, type = 'image') => {
  const maxSize = type === 'image' ? 20 * 1024 * 1024 : 100 * 1024 * 1024; // 20MB or 100MB
  return file.size <= maxSize;
};
```

### Add More File Types
Edit `ImageUpload.js`:
```javascript
<input
  type="file"
  accept="image/*,video/*,.pdf,.doc" // Add more types
  onChange={handleFileSelect}
/>
```

---

## 📚 Resources

- [ImageKit Documentation](https://docs.imagekit.io/)
- [ImageKit React SDK](https://github.com/imagekit-developer/imagekit-react)
- [Upload API Reference](https://docs.imagekit.io/api-reference/upload-file-api)

---

## 💡 Tips

1. **Use folders**: Organize uploads by category (quiz-images, quiz-videos)
2. **Enable auto-optimization**: ImageKit automatically optimizes images
3. **Use transformations**: Apply on-the-fly transformations via URL
4. **Monitor usage**: Check your ImageKit dashboard for usage stats

---

## 🆘 Support

If you need help:
1. Check ImageKit docs: https://docs.imagekit.io/
2. Review error messages in browser console
3. Test authentication endpoint: `curl http://localhost:10000/api/imagekit/auth`

---

## ✅ Testing

### Test Authentication Endpoint:
```bash
curl http://localhost:10000/api/imagekit/auth
```

Expected response:
```json
{
  "success": true,
  "token": "...",
  "expire": 1234567890,
  "signature": "...",
  "publicKey": "..."
}
```

### Test Upload Flow:
1. Start backend: `cd server && npm start`
2. Start frontend: `cd client && npm start`
3. Go to Create Quiz page
4. Try uploading an image
5. Check browser console for any errors

---

## 📦 Alternative: Without ImageKit

If you don't want to use ImageKit, the component falls back to:
- Direct URL input only
- No file uploads
- Users must host images elsewhere

To use without ImageKit:
1. Don't add ImageKit credentials to `.env`
2. Component will show "URL Mode" only
3. Users can paste image URLs from any source
