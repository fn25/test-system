# System Improvements Guide

## O'zgarishlar Ro'yxati

### 1. Registration Form Soddalashtirish ✅
**Maqsad**: Faqat zarur maydonlar qoldirish
- ✅ FirstName va LastName o'chirildi
- ✅ Role tanlash o'chirildi (default "user")
- ✅ Faqat: username, email, password, confirmPassword

### 2. CSS Dizayn Yaxshilash ✅
**Maqsad**: Chiroyli, zamonaviy dizayn
- ✅ Gradient backgrounds
- ✅ Smooth animations
- ✅ Modern color scheme
- ✅ Password toggle icons
- Fayl: `/client/src/styles/auth.css` yaratildi

### 3. LoginPage'ga "Forgot Password" Qo'shish 📋
**Kerak bo'lgan o'zgarishlar**:
- LoginPage.js'da "Forgot Password" link
- ForgotPassword component yaratish
- Backend'da password reset API

### 4. Guest Mode - Quiz Code bilan Kirish 📋
**Kerak bo'lgan o'zgarishlar**:
- HomePage'da "Play Quiz" button
- Quiz code input field
- Backend'da quiz code validation API
- Guest result saqlash

### 5. Admin Panel - Create Quiz Tuzatish 📋
**Kerak bo'lgan o'zgarishlar**:
- CreateQuiz component to'liq
- Video va Image upload
- Quiz code generation
- Quiz preview

## Implementatsiya Bosqichlari

### Bosqich 1: Auth Sahifalari ✅
- [x] CSS stillar yaratildi
- [ ] RegisterPage yangilash
- [ ] LoginPage'ga Forgot Password link
- [ ] ForgotPassword component

### Bosqich 2: Backend API'lar
- [ ] POST /api/auth/forgot-password
- [ ] POST /api/auth/reset-password
- [ ] POST /api/quiz/access-by-code
- [ ] Quiz code generation logic

### Bosqich 3: Admin Panel
- [ ] CreateQuiz component
- [ ] File upload (image/video)
- [ ] Quiz code display
- [ ] Quiz management

### Bosqich 4: Guest Mode
- [ ] Guest access component
- [ ] Quiz code validation
- [ ] Guest results (optional login)

## Navbatdagi Qadamlar

1. **RegisterPage.js ni yangilash** - yangi CSS ishlatish
2. **LoginPage.js'ga Forgot Password link** qo'shish
3. **ForgotPasswordPage.js** yaratish
4. **Backend API'larni** yaratish
5. **CreateQuizPage.js** to'liq yaratish
6. **GuestAccessPage.js** yaratish

## Fayllar Ro'yxati

### Yangi Fayllar:
- ✅ `/client/src/styles/auth.css` - Auth sahifalar CSS
- 📋 `/client/src/components/ForgotPasswordPage.js`
- 📋 `/client/src/components/ResetPasswordPage.js`
- 📋 `/client/src/components/CreateQuizPage.js`
- 📋 `/client/src/components/GuestAccessPage.js`
- 📋 `/server/routes/password-reset.js`

### O'zgartiriladi:
- 📋 `/client/src/components/RegisterPage.js`
- 📋 `/client/src/components/LoginPage.js`
- 📋 `/client/src/components/HomePage.js`
- 📋 `/client/src/components/AdminDashboard.js`
- 📋 `/client/src/App.js` - yangi route'lar
- 📋 `/server/routes/auth.js`
- 📋 `/server/routes/quiz.js`

## Notes

Bu katta loyiha va barcha o'zgarishlarni bir vaqtda qilish qiyin. Eng yaxshi yondashuv:
1. Avval auth sahifalarni tugatish
2. Keyin backend API'larni yaratish
3. So'ngra admin panel
4. Nihoyat guest mode

Har bir bosqichni test qilish va deploy qilish kerak.
