README (O'zbek) — Testlash tizmini lokal va bulutga joylash

Ushbu hujjat loyihani lokalda ishga tushirish va Render + Vercel/Netlify ga joylash bo'yicha bosqichma-bosqich ko'rsatmalarni o'z ichiga oladi. Bazaviy talablar:

- Node.js 18+ va npm
- Git
- (Ixtiyoriy) Yarn

Muhit o'zgaruvchilari (env vars)
- DATABASE_URL - Neon yoki boshqa PostgreSQL ulanish qatori (postgres://...)
- JWT_SECRET - JWT uchun maxfiy kalit
- CLOUD_NAME - Cloudinary bulut nomi
- API_KEY - Cloudinary API kaliti
- API_SECRET - Cloudinary API siri
- PORT - server port (masalan, 10000)
- NODE_ENV - production yoki development

Lokal ishga tushirish
1. Loyihani klonlash
   git clone <repo>
   cd <repo>

2. Backend o'rnatish va ishga tushurish
   cd server
   npm install

   # .env faylini yaratish (server/.env yoki repo rootda .env)
   # DATABASE_URL ni Neon dan olingan ulanish qatori bilan to'ldiring

   # Lokal ishlab chiqish uchun:
   npm run dev

   # Yoki ishlab chiqarish qurilishi va boshlash uchun:
   npm start

   Keyinchalik tekshirish uchun brauzer yoki curl orqali:
   http://localhost:10000/health

3. Frontend o'rnatish va ishga tushurish
   cd ../client
   npm install

   # Agar lokal backend http://localhost:10000 da ishlayotgan bo'lsa, client/src/services/api.js ichidagi baseURL default yordamida /api ga yo'naltiriladi.
   npm start

Produksiyaga joylash
1. Neon DB yaratish
   - neon.tech ga kiring va yangi "branch" (subscription) yarating.
   - Yaratilgan DB uchun connection string (DATABASE_URL) ni nusxa oling.

2. Backend (Render)
   - render.com da yangi Web Service yarating va GitHub repo-ni ulang.
   - `render.yaml` fayli mavjud va `server/` papkasida build/start buyruqlariga yo'naltirilgan.
   - Render-da quyidagi environment o'zgaruvchilarni qo'shing:
     - DATABASE_URL = <neon connection string>
     - JWT_SECRET = <random secret> (yoki generate qilinsin)
     - CLOUD_NAME, API_KEY, API_SECRET = Cloudinary ma'lumotlari
     - PORT = 10000
   - Deployni ishga tushuring.

3. Frontend (Vercel yoki Netlify)
   - Vercel: `client/` katalogni deploy qiling. `REACT_APP_API_URL` muhit o'zgaruvchisini Render-da joylashgan backend URL (masalan, https://<app>.onrender.com/api) ga sozlang.
   - Netlify: `client/` papkasini deploy qiling va build komanda `npm run build`, publish papka `build` bo'lishi kerak. `REACT_APP_API_URL` muhit o'zgaruvchisini sozlang.

Qo'shimcha eslatmalar
- Agar Neon SSL talab qilsa, `server/models/index.js` faylida Sequelize ulanish konfiguratsiyasida `ssl: { rejectUnauthorized: false }` parametrlari kerak bo'lishi mumkin. Hozirgi kod buning uchun shartli konfiguratsiya ishlatadi.
- Backend ES Module ("type": "module") bilan ishlaydi. Node 18+ talab qilinadi.
- Avval ro'yxatdan o'tib, admin roliga ega bo'lgan foydalanuvchi yarating (db orqali yoki backendning /auth/register endpoint yordamida va keyin ro'lni `admin` ga qo'ying).

Agar xohlasangiz, men:
- Lokalda serverni ishga tushirish uchun aniq buyruqlarni bajarib, keltirilgan chiqishni tekshirish uchun yordam bera olaman (agar terminalga ruxsat bo'lsa).
- Render va Neon konfiguratsiyasini aniq sozlash uchun .env va render.yaml ni yangilab beraman.

Yakun: bu qo'llanma loyihani tezda ishga tushurish va deploy qilish uchun yetarli bo'lishi kerak. Kerak bo'lsa, aniq variantlar va URL-larni repo konfiguratsiyasiga joylashtirishda yordam beraman.
