import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function setupMongoDB() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Create Users collection with indexes
    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('✓ Created users collection');
      
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ created_at: 1 });
      await db.collection('users').createIndex({ last_login: 1 });
      console.log('✓ Created users indexes');
    } else {
      // Ensure indexes exist on existing collection
      await db.collection('users').createIndex({ email: 1 }, { unique: true });
      await db.collection('users').createIndex({ created_at: 1 });
      await db.collection('users').createIndex({ last_login: 1 });
      console.log('✓ Verified users indexes');
    }

    // Create Projects collection with indexes
    if (!collectionNames.includes('projects')) {
      await db.createCollection('projects');
      console.log('✓ Created projects collection');
      
      await db.collection('projects').createIndex({ created_by: 1 });
      await db.collection('projects').createIndex({ created_at: 1 });
      await db.collection('projects').createIndex({ 'members.user_id': 1 });
      console.log('✓ Created projects indexes');
    } else {
      // Ensure indexes exist on existing collection
      await db.collection('projects').createIndex({ created_by: 1 });
      await db.collection('projects').createIndex({ created_at: 1 });
      await db.collection('projects').createIndex({ 'members.user_id': 1 });
      console.log('✓ Verified projects indexes');
    }

    // Create Tasks collection with indexes
    if (!collectionNames.includes('tasks')) {
      await db.createCollection('tasks');
      console.log('✓ Created tasks collection');
      
      await db.collection('tasks').createIndex({ project_id: 1 });
      await db.collection('tasks').createIndex({ assigned_to: 1 });
      await db.collection('tasks').createIndex({ status: 1 });
      await db.collection('tasks').createIndex({ due_date: 1 });
      await db.collection('tasks').createIndex({ created_at: 1 });
      console.log('✓ Created tasks indexes');
    } else {
      // Ensure indexes exist on existing collection
      await db.collection('tasks').createIndex({ project_id: 1 });
      await db.collection('tasks').createIndex({ assigned_to: 1 });
      await db.collection('tasks').createIndex({ status: 1 });
      await db.collection('tasks').createIndex({ due_date: 1 });
      await db.collection('tasks').createIndex({ created_at: 1 });
      console.log('✓ Verified tasks indexes');
    }

    console.log('\n✅ MongoDB setup complete!\n');
    console.log('Collections ready:');
    console.log('  - users (with indexes)');
    console.log('  - projects (with indexes)');
    console.log('  - tasks (with indexes)\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB setup error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

setupMongoDB();
