# TestLash Tizmi - Quiz Application

A fully functional test-solving web application with admin panel, user authentication, image/video upload via Cloudinary, and PostgreSQL database. Built with Node.js/Express backend and React frontend.

## 🚀 Features

- **User Authentication**: JWT-based login/register system
- **Quiz Management**: Create, edit, and manage quizzes (Admin)
- **Question Types**: Multiple choice, True/False, and Short answer questions
- **Media Support**: Image and video upload via Cloudinary
- **Real-time Quiz Taking**: Timer, progress tracking, and instant results
- **Results Analytics**: Detailed scoring and performance tracking
- **Admin Dashboard**: Complete platform management
- **Responsive Design**: Works on desktop and mobile devices
- **Cloud Ready**: Deployable to Render (backend) and Vercel/Netlify (frontend)

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database with Sequelize ORM
- **JWT** for authentication
- **Cloudinary** for media upload
- **Bcrypt** for password hashing
- **Express Validator** for input validation

### Frontend
- **React** with React Router
- **Axios** for API calls
- **React Hook Form** for form handling
- **React Hot Toast** for notifications
- **Lucide React** for icons
- **CSS3** with responsive design

### Deployment
- **Backend**: Render.com
- **Frontend**: Vercel or Netlify
- **Database**: Neon.tech PostgreSQL

## 📁 Project Structure

```
testlash-tizmi/
├── server/                 # Backend application
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
├── client/                # Frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── context/       # React context (Auth)
│   │   ├── services/      # API service functions
│   │   └── App.js         # Main App component
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
├── .env                   # Environment variables
├── .env.example          # Environment variables template
└── README.md             # This file
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database (local or cloud)
- Cloudinary account for media upload

### 1. Clone the Repository
```bash
git clone <repository-url>
cd testlash-tizmi
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

Required environment variables:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Cloudinary Configuration
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_very_long_and_random

# Server Configuration
PORT=10000
NODE_ENV=development
```

### 3. Backend Setup
```bash
cd server
npm install
npm run dev
```

The backend will start on http://localhost:10000

### 4. Frontend Setup
```bash
# Open new terminal
cd client
npm install
npm start
```

The frontend will start on http://localhost:3000

### 5. Database Setup

The application will automatically create database tables on first run. To create an admin user, you can either:

1. Register a user through the UI and manually update the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

2. Or create an admin user directly:
```sql
INSERT INTO users (id, username, email, password, role, "firstName", "lastName", "isActive", "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(),
  'admin',
  'admin@example.com',
  '$2a$12$hash_your_password_here',
  'admin',
  'Admin',
  'User',
  true,
  NOW(),
  NOW()
);
```

## 🚀 Deployment

### Backend Deployment (Render)

1. **Create Neon Database**:
   - Go to [Neon.tech](https://neon.tech)
   - Create a new PostgreSQL database
   - Copy the connection string

2. **Deploy to Render**:
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Configure environment variables:
     ```
     DATABASE_URL=your_neon_database_url
     CLOUD_NAME=your_cloudinary_cloud_name
     API_KEY=your_cloudinary_api_key
     API_SECRET=your_cloudinary_api_secret
     JWT_SECRET=your_jwt_secret_key
     PORT=10000
     NODE_ENV=production
     ```
   - Set build command: `cd server && npm install`
   - Set start command: `cd server && npm start`

### Frontend Deployment (Vercel)

1. **Update API URL**:
   ```javascript
   // In client/src/services/api.js
   baseURL: process.env.NODE_ENV === 'production' 
     ? 'https://your-backend-url.onrender.com/api'
     : '/api'
   ```

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Set build command: `cd client && npm run build`
   - Set output directory: `client/build`
   - Add environment variable: `REACT_APP_API_URL=https://your-backend-url.onrender.com`

### Frontend Deployment (Netlify)

1. **Deploy to Netlify**:
   - Connect your GitHub repository to Netlify
   - Set build command: `cd client && npm run build`
   - Set publish directory: `client/build`
   - Add environment variable: `REACT_APP_API_URL=https://your-backend-url.onrender.com`

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password

### Quiz Endpoints
- `GET /api/quiz` - Get all quizzes
- `GET /api/quiz/:id` - Get specific quiz
- `POST /api/quiz` - Create quiz (Admin)
- `PUT /api/quiz/:id` - Update quiz (Admin)
- `DELETE /api/quiz/:id` - Delete quiz (Admin)
- `POST /api/quiz/:id/questions` - Add question (Admin)

### Result Endpoints
- `POST /api/result/submit` - Submit quiz answers
- `GET /api/result` - Get user results
- `GET /api/result/:id` - Get specific result
- `GET /api/result/quiz/:quizId` - Get quiz results (Admin)

### Upload Endpoints
- `POST /api/upload/image` - Upload image (Admin)
- `POST /api/upload/video` - Upload video (Admin)
- `DELETE /api/upload/:publicId` - Delete file (Admin)

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

### Code Style
The project uses ESLint and Prettier for code formatting. Run:
```bash
npm run lint
npm run format
```

### Database Migrations
```bash
cd server
npx sequelize-cli db:migrate
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify DATABASE_URL is correct
   - Ensure database server is running
   - Check firewall settings

2. **Cloudinary Upload Fails**:
   - Verify Cloudinary credentials
   - Check file size limits (10MB max)
   - Ensure file type is supported

3. **CORS Errors**:
   - Update CORS origins in server.js
   - Verify frontend URL is whitelisted

4. **Authentication Issues**:
   - Check JWT_SECRET is set
   - Verify token expiration
   - Clear browser localStorage

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For support and questions, please open an issue in the GitHub repository.

## 🎯 Future Enhancements

- [ ] Real-time quiz sessions
- [ ] Advanced analytics dashboard
- [ ] Question bank and categories
- [ ] Bulk question import
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced question types
- [ ] Proctoring features
- [ ] Integration with Learning Management Systems

---

**Happy Testing with TestLash Tizmi! 🎉**