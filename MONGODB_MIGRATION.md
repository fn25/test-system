# MongoDB Migration Guide

## O'zgarishlar:

PostgreSQL → MongoDB ga o'tdik

## Kerakli qadamlar:

### 1. Environment Variables (.env file)
```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://gaday099_db_user:YOUR_PASSWORD@cluster0.njpkhy2.mongodb.net/testlash_tizmi?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret
JWT_SECRET=your_secret_key_here

# Other configs...
```

### 2. Install dependencies
```bash
cd server
npm install
```

### 3. Start server
```bash
npm start
```

## Asosiy o'zgarishlar:

1. **Sequelize → Mongoose** - ORM o'zgartirildi
2. **PostgreSQL → MongoDB** - Database o'zgartirildi  
3. **UUID → MongoDB ObjectId** - ID formatlar o'zgartirildi
4. **Migrations → Schema validation** - Migration tizimi o'chirildi

## Test qilish:

```bash
# Health check
curl https://test-system-m678.onrender.com/api/health

# Register
curl -X POST https://test-system-m678.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123","role":"admin"}'
```

## MongoDB ga ulash:

MongoDB Compass yoki Studio 3T orqali ulanishingiz mumkin:
```
mongodb+srv://gaday099_db_user:YOUR_PASSWORD@cluster0.njpkhy2.mongodb.net/
```

---

**Eslatma**: Eski PostgreSQL ma'lumotlarini MongoDB ga ko'chirish kerak bo'lsa, alohida migration script yozish kerak.
