import mongoose from 'mongoose';

export async function connectDB() {
  try {
    // Support both MONGODB_URI (Railway) and DATABASE_URL (legacy)
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;
    
    if (!mongoUri) {
      throw new Error(
        'MongoDB connection string not found!\n' +
        'Set either MONGODB_URI or DATABASE_URL environment variable.\n' +
        'Example: mongodb+srv://username:password@cluster.mongodb.net/dbname'
      );
    }

    console.log("Attempting MongoDB connection...");
    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error:', error.message);
    console.error('\n⚠️  Application cannot start without MongoDB connection.');
    console.error('Please check your MONGODB_URI or DATABASE_URL environment variable.');
    process.exit(1);
  }
}

export async function disconnectDB() {
  try {
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnect failed:', error.message);
  }
}

export { default as User } from '../models/User.js';
export { default as Project } from '../models/Project.js';
export { default as Task } from '../models/Task.js';
