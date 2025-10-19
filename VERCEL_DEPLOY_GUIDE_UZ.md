# Vercel Deploy Qo'llanmasi

## Frontend (React) - Vercel'ga Deploy

### 1. Vercel'ga kirish
1. [Vercel](https://vercel.com) saytiga kiring
2. GitHub akkauntingiz bilan login qiling

### 2. Yangi loyiha yaratish
1. **"Add New Project"** tugmasini bosing
2. GitHub repository'ingizni tanlang: **test-system**
3. **"Import"** tugmasini bosing

### 3. Sozlashlar
**Root Directory:** `client` (muhim!)

**Build and Output Settings:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

**Environment Variables:**
Quyidagi o'zgaruvchini qo'shing:
```
REACT_APP_API_URL=https://testlash-tizmi.onrender.com/api
```

**Eslatma:** Backend URL'ni o'zingizning Render backend URL'ingiz bilan almashtiring!

### 4. Deploy qilish
1. **"Deploy"** tugmasini bosing
2. 2-3 daqiqa kuting
3. Deploy tugagach, Vercel sizga URL beradi (masalan: `your-app.vercel.app`)

### 5. Custom Domain (ixtiyoriy)
Agar o'zingizning domeningiz bo'lsa:
1. Vercel dashboard → **"Settings"** → **"Domains"**
2. Domain nomini kiriting va ko'rsatmalarga amal qiling

---

## Backend (Node.js) - Render'ga Deploy

### 1. Render'ga kirish
1. [Render](https://render.com) saytiga kiring
2. GitHub akkauntingiz bilan login qiling

### 2. Yangi Web Service yaratish
1. **"New +"** → **"Web Service"** ni tanlang
2. GitHub repository'ingizni ulang: **test-system**
3. Quyidagi sozlashlarni kiriting:

**Basic Settings:**
- Name: `testlash-tizmi`
- Root Directory: `.` (root papka)
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `node server/server.js`

**Environment Variables:**
Quyidagi o'zgaruvchilarni qo'shing:
```
DATABASE_URL=postgresql://neondb_owner:npg_mDle56rIjyat@ep-small-sun-adywycce-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=a46a32d07938ca1ade573dbfccfe253e29cfbf76092af8223327017370514d8eace56e6cc363d6
PORT=10001
NODE_ENV=production
IMAGEKIT_PUBLIC_KEY=public_/RQ7wDgI06wW6LhMZWzqITWrHz8=
IMAGEKIT_PRIVATE_KEY=private_2b0GeWBkCc0eMThbL6NaSyIKuhY=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

### 3. Deploy qilish
1. **"Create Web Service"** tugmasini bosing
2. Deploy jarayonini kuzating (5-10 daqiqa)
3. Deploy tugagach, Render sizga URL beradi (masalan: `testlash-tizmi.onrender.com`)

### 4. Backend URL'ni Frontend'ga qo'shish
Backend deploy tugagandan so'ng:
1. Backend URL'ni nusxalang (masalan: `https://testlash-tizmi.onrender.com`)
2. Vercel dashboard'ga qaying
3. **"Settings"** → **"Environment Variables"**
4. `REACT_APP_API_URL` ni yangilang:
   ```
   REACT_APP_API_URL=https://testlash-tizmi.onrender.com/api
   ```
5. **"Redeploy"** tugmasini bosing

---

## To'liq Deploy Tartibi

### Qadam 1: Backend'ni deploy qiling
1. Render'da backend yaratish
2. Environment variables qo'shish
3. Deploy tugashini kuting
4. Backend URL'ni nusxalash (masalan: `https://testlash-tizmi.onrender.com`)

### Qadam 2: Frontend'ni deploy qiling
1. Vercel'da frontend yaratish
2. Root directory: `client`
3. Environment variable qo'shish:
   ```
   REACT_APP_API_URL=https://testlash-tizmi.onrender.com/api
   ```
4. Deploy tugashini kuting
5. Frontend URL'ni nusxalash (masalan: `https://your-app.vercel.app`)

### Qadam 3: Tekshirish
1. Frontend URL'ni brauzerde oching
2. Register sahifasiga o'ting
3. Yangi foydalanuvchi yarating
4. Login qiling
5. Admin panel va boshqa funksiyalarni tekshiring

---

## Muammolarni hal qilish

### Frontend ishlamayapti
1. Vercel logs'ni tekshiring: **"Deployments"** → oxirgi deploy → **"View Function Logs"**
2. Environment variables to'g'ri kiritilganini tekshiring
3. Backend URL'ni to'g'ri sozlanganini tasdiqlang

### Backend ishlamayapti
1. Render logs'ni tekshiring: Dashboard → **"Logs"**
2. Database URL'ni tekshiring
3. Environment variables to'g'ri kiritilganini tasdiqlang

### "Network Error" xatosi
1. Backend ishlayotganini tekshiring (Render dashboard'da "Active" ko'rsatishi kerak)
2. Frontend'dagi `REACT_APP_API_URL` to'g'ri sozlanganini tasdiqlang
3. Backend'da CORS sozlamalari to'g'ri ekanligini tekshiring

---

## Foydali Linklar

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

---

**Eslatma:** Deploy jarayoni tugagandan so'ng, frontend va backend URL'laringizni saqlab qo'ying!
