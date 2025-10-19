# Complete Deployment Guide

## Current Status
✅ Backend working locally on port 10001  
✅ Neon database connected  
✅ All API endpoints tested  
✅ Git repository initialized and committed  
⚠️ GitHub push pending (authentication issue)

---

## Step 1: Fix GitHub Push

### Option A: Use GitHub Desktop (Easiest)
1. Download and install GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. Sign in with your GitHub account
4. File → Add Local Repository
5. Browse to: `D:\N25_2\testlash-tizmi`
6. Click "Publish repository"
7. Choose "testing99-pro/test-system"
8. Uncheck "Keep this code private" if you want it public
9. Click "Publish repository"

### Option B: Fix Token Permissions
1. Go to: https://github.com/settings/tokens
2. Delete old tokens
3. Generate new token with these permissions:
   - ✅ repo (full control)
   - ✅ workflow
4. Copy the new token
5. Run: `git push https://YOUR_NEW_TOKEN@github.com/testing99-pro/test-system.git main`

### Option C: Use SSH (Alternative)
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub: https://github.com/settings/ssh/new
# Copy public key: cat ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote remove origin
git remote add origin git@github.com:testing99-pro/test-system.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize Render to access your repositories

### 2.2 Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `testing99-pro/test-system`
3. Configure:
   - **Name**: `testlash-tizmi-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 2.3 Set Environment Variables
Click "Environment" tab and add:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://neondb_owner:npg_mDle56rIjyat@ep-small-sun-adywycce-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random
IMAGEKIT_PUBLIC_KEY=public_/RQ7wDgI06wW6LhMZWzqITWrHz8=
IMAGEKIT_PRIVATE_KEY=private_2b0GeWBkCc0eMThbL6NaSyIKuhY=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

⚠️ **Important**: Update `IMAGEKIT_URL_ENDPOINT` with your actual ImageKit URL!

### 2.4 Deploy
1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Your backend URL will be: `https://testlash-tizmi-backend.onrender.com`
4. Test health endpoint: `https://testlash-tizmi-backend.onrender.com/health`

---

## Step 3: Update Frontend API URL

Once backend is deployed, update the frontend to point to it:

### Edit `client/src/services/api.js`
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://testlash-tizmi-backend.onrender.com/api'  // ← Your Render URL
    : '/api');
```

Commit and push this change:
```bash
git add client/src/services/api.js
git commit -m "Update API URL to production Render backend"
git push origin main
```

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub account

### 4.2 Import Project
1. Click "Add New..." → "Project"
2. Import `testing99-pro/test-system`
3. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 4.3 Set Environment Variable
Add this environment variable:
```
REACT_APP_API_URL=https://testlash-tizmi-backend.onrender.com/api
```

### 4.4 Deploy
1. Click "Deploy"
2. Wait for build (2-5 minutes)
3. Your frontend URL will be: `https://test-system-xxx.vercel.app`

---

## Step 5: Test the Deployed Application

### 5.1 Backend Tests
```bash
# Health check
curl https://testlash-tizmi-backend.onrender.com/health

# Register user
curl -X POST https://testlash-tizmi-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","password":"admin123","fullName":"Admin"}'
```

### 5.2 Frontend Tests
1. Open your Vercel URL in browser
2. Test registration
3. Test login
4. Create a quiz (after setting user role to 'admin' in database)

### 5.3 Set Admin Role
Connect to Neon database and run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@test.com';
```

---

## Step 6: Update ImageKit URL Endpoint

You need to get your actual ImageKit URL endpoint:

1. Go to https://imagekit.io
2. Sign in to your dashboard
3. Find your URL Endpoint (looks like: `https://ik.imagekit.io/your_id`)
4. Update in Render environment variables
5. Restart the Render service

---

## Troubleshooting

### Backend won't start on Render
- Check logs in Render dashboard
- Verify all environment variables are set
- Ensure DATABASE_URL is correct

### Frontend can't connect to backend
- Check CORS settings in backend
- Verify API URL in frontend
- Check browser console for errors

### Database connection fails
- Verify Neon database is running
- Check DATABASE_URL format
- Ensure SSL is enabled in production

---

## Quick Reference

**Local Development:**
```bash
# Backend
cd server
npm run dev

# Frontend
cd client
npm start
```

**Environment Variables:**
- Backend: See `.env` in root
- Frontend: Set in Vercel dashboard

**URLs:**
- Backend: https://testlash-tizmi-backend.onrender.com
- Frontend: https://your-app.vercel.app
- Database: Neon PostgreSQL
- Media: ImageKit

---

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Enable HTTPS (automatic on Vercel/Render)
3. Set up monitoring and logging
4. Create admin user and test all features
5. Add more quiz content
6. Share with users!

---

## Support

If you encounter issues:
1. Check Render/Vercel logs
2. Test API endpoints with curl/Postman
3. Check browser console for frontend errors
4. Verify environment variables are set correctly
