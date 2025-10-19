# ImageKit Sozlash Yo'riqnomasi

## ImageKit nima?
ImageKit - bu rasmlar va videolarni yuklash, saqlash va optimallashtirish xizmati. Biz uni quiz savollarga rasm va video qo'shish uchun ishlatamiz.

## 1-qadam: ImageKit hisobini yaratish

1. [imagekit.io](https://imagekit.io/) saytiga kiring
2. "Sign Up" tugmasini bosing va ro'yxatdan o'ting
3. Bepul rejim 20GB umumiy hajm va 20GB bandwidth beradi (darsliklar uchun yetarli)

## 2-qadam: API kalitlarini olish

1. ImageKit hisobingizga kiring
2. Chap tarafdagi menuda "Developer options" bo'limiga o'ting
3. Quyidagi ma'lumotlarni nusxalang:
   - **Public Key** (masalan: `public_ABC123xyz`)
   - **URL Endpoint** (masalan: `https://ik.imagekit.io/sizning_id`)
   - **Private Key** (bu server uchun kerak)

## 3-qadam: Render'dagi backend'ga sozlamalarni qo'shish

1. [render.com](https://render.com/) saytiga kiring
2. O'z backend xizmat
ingizni oching
3. "Environment" bo'limiga o'ting
4. Quyidagi o'zgaruvchilarni qo'shing:
   ```
   IMAGEKIT_PUBLIC_KEY=sizning_public_key
   IMAGEKIT_PRIVATE_KEY=sizning_private_key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/sizning_id
   ```
5. "Save Changes" tugmasini bosing

## 4-qadam: Vercel'dagi frontend'ga sozlamalarni qo'shish

1. [vercel.com](https://vercel.com/) saytiga kiring
2. O'z proyektingizni oching
3. "Settings" > "Environment Variables" bo'limiga o'ting
4. Quyidagi o'zgaruvchilarni qo'shing:
   ```
   REACT_APP_IMAGEKIT_PUBLIC_KEY=sizning_public_key
   REACT_APP_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/sizning_id
   REACT_APP_IMAGEKIT_AUTH_ENDPOINT=https://sizning-backend-url.onrender.com/api/imagekit/auth
   ```
5. "Save" tugmasini bosing
6. Proyektni qayta deploy qiling (Vercel avtomatik ravishda qayta deploy qilishi mumkin)

## 5-qadam: Lokal muhitda test qilish

Agar lokal muhitda test qilmoqchi bo'lsangiz:

1. `client/.env.development` faylini oching
2. ImageKit ma'lumotlarini kiriting:
   ```
   REACT_APP_IMAGEKIT_PUBLIC_KEY=sizning_public_key
   REACT_APP_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/sizning_id
   REACT_APP_IMAGEKIT_AUTH_ENDPOINT=http://localhost:10000/api/imagekit/auth
   ```

3. Server uchun `.env` fayl yarating va quyidagi ma'lumotlarni kiriting:
   ```
   IMAGEKIT_PUBLIC_KEY=sizning_public_key
   IMAGEKIT_PRIVATE_KEY=sizning_private_key
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/sizning_id
   ```

## 6-qadam: Tekshirish

1. Quiz yaratish sahifasiga o'ting
2. Savol qo'shing
3. "Upload Image" tugmasini bosing
4. Rasm tanlang va yuklang
5. Agar muvaffaqiyatli bo'lsa, rasm ko'rinishi kerak

## Muammolarni hal qilish

### "ImageKit not configured" xatosi
- `.env` fayllarda barcha kerakli o'zgaruvchilar to'g'ri kiritilganini tekshiring
- `your_public_key_here` kabi namuna qiymatlar o'zgartirilganini tekshiring

### "Failed to get authentication parameters" xatosi
- Backend'da ImageKit sozlamalari to'g'ri ekanini tekshiring
- Backend serveringiz ishlayotganini tekshiring
- `IMAGEKIT_AUTH_ENDPOINT` to'g'ri URL ekanini tekshiring

### Rasm yuklanmayapti
- Rasm hajmi 10MB dan kichik ekanini tekshiring
- Rasm formati qo'llab-quvvatlanadi (JPG, PNG, GIF, WebP)
- Brauzer konsolida xatoliklarni tekshiring (F12)

## Xavfsizlik maslahatlari

1. ⚠️ **Private Key** ni hech qachon frontend kodiga qo'shmang!
2. ⚠️ **Private Key** ni GitHub'ga yuklashdan saqlaning (.gitignore faylida .env mavjud)
3. ✅ Faqat backend'da private key ishlatiladi
4. ✅ Frontend faqat public key ishlatadi

## Qo'shimcha imkoniyatlar

ImageKit quyidagi imkoniyatlarni ham taqdim etadi:
- Rasmlarni avtomatik optimallashtirish
- Rasmlarni o'lchamini o'zgartirish
- Rasmlarni format konvertatsiya qilish
- CDN orqali tez yuklash
- Video optimizatsiya

## Yordam

Agar muammo yuzaga kelsa:
1. ImageKit [dokumentatsiyasi](https://docs.imagekit.io/)ni ko'ring
2. Render va Vercel loglarini tekshiring
3. Brauzer konsolida xatoliklarni tekshiring
