# Render.com MongoDB Sozlamalari

## Environment Variables (Render Dashboard → Environment)

Render.com dashboard'ingizda Web Service'ingizni oching va **Environment** bo'limiga quyidagi o'zgaruvchilarni qo'shing:

### 1. MongoDB Connection
```
MONGODB_URI=mongodb+srv://gaday099_db_user:YOUR_ACTUAL_PASSWORD@cluster0.njpkhy2.mongodb.net/testlash_tizmi?retryWrites=true&w=majority&appName=Cluster0
```
**Muhim**: `YOUR_ACTUAL_PASSWORD` o'rniga haqiqiy MongoDB parolingizni yozing!

### 2. JWT Secret
```
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
```

### 3. Node Environment
```
NODE_ENV=production
```

### 4. Frontend URL (CORS uchun)
```
FRONTEND_ORIGIN=https://test-system-mu.vercel.app
```

### 5. Email Settings (ixtiyoriy - agar email xizmati kerak bo'lsa)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=TestLash Tizmi
```

## Build & Deploy Settings

### Build Command:
```bash
npm install
```

### Start Command:
```bash
npm start
```

### Root Directory:
```
server
```

## Auto Deploy Settings

✅ **Auto-Deploy** - Enable (har safar git push qilganingizda avtomatik deploy bo'ladi)

## Yangi Deploy

Sozlamalarni qo'shganingizdan keyin:
1. **Manual Deploy** tugmasini bosing
2. Yoki `git push` qiling - avtomatik deploy boshlanadi

## Deploy Statusini Tekshirish

Deploy paytida Render.com **Logs** bo'limida quyidagilarni ko'rishingiz kerak:

```
==> Starting service with 'npm start'
✅ MongoDB connected successfully
📊 Database: testlash_tizmi
✅ Server is running on port 10000
```

Agar **MongoDB connection error** chiqsa:
1. MONGODB_URI to'g'ri yozilganini tekshiring
2. MongoDB Atlas'da IP Whitelist'ga `0.0.0.0/0` qo'shilganini tekshiring
3. MongoDB parol to'g'riligini tekshiring

## Test Qilish

Deploy tugagandan keyin:

```bash
# Health check
curl https://test-system-m678.onrender.com/api/health

# Response:
{"status":"OK","message":"Server is running"}
```

## MongoDB Atlas Sozlamalari

MongoDB Atlas dashboardida:
1. **Database Access** → User'ingiz active ekanligini tekshiring
2. **Network Access** → IP Whitelist'da `0.0.0.0/0` (barcha IPlar) yoki Render IP'lari bo'lishi kerak
3. **Database** → `testlash_tizmi` database yaratilganini tekshiring

---

**Eslatma**: Render.com environment variables'ni o'zgartirgandan keyin avtomatik redeploy bo'ladi.
