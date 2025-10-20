# CORS xatosi uchun temporary fix
# Agar hali ham CORS xatosi bo'lsa, server.js'da quyidagicha o'zgartiring:

# Option 1: Barcha origin'larni qabul qilish (development uchun)
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

# Option 2: Vercel domain'larni to'g'ri tekshirish
app.use(cors({
  origin: (origin, callback) => {
    console.log('🔍 Request from origin:', origin);
    
    if (!origin) return callback(null, true);
    
    // Allow all Vercel domains
    if (origin.includes('vercel.app') || origin.includes('vercel.com')) {
      return callback(null, true);
    }
    
    // Allow localhost
    if (origin.includes('localhost')) {
      return callback(null, true);
    }
    
    callback(null, true); // Temporary: allow all
  },
  credentials: true
}));

# Render Environment Variables tekshiring:
FRONTEND_ORIGIN=https://test-system-m83sglvo8-sardors-projects-0bb5ea52.vercel.app
NODE_ENV=production
