import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://gaday099_db_user:your_password@cluster0.njpkhy2.mongodb.net/testlash_tizmi?retryWrites=true&w=majority&appName=Cluster0';
    
    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
