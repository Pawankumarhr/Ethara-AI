import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB, disconnectDB, User, Project, Task } from '../config/db.js';

dotenv.config();

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create users
    const AdminPassword = await bcryptjs.hash('password123', 10);
    const MemberPassword = await bcryptjs.hash('password123', 10);

    const AdminUser = await User.create({
      email: 'admin@ethara.ai',
      password: AdminPassword,
      name: 'Admin User',
      role: 'Admin',
      signup_timestamp: new Date('2025-01-15T10:30:00Z'),
      last_login: new Date(),
    });

    const Member1 = await User.create({
      email: 'john@ethara.ai',
      password: MemberPassword,
      name: 'John Doe',
      role: 'Member',
      signup_timestamp: new Date('2025-01-16T09:00:00Z'),
      last_login: new Date(),
    });

    const Member2 = await User.create({
      email: 'sarah@ethara.ai',
      password: MemberPassword,
      name: 'Sarah Smith',
      role: 'Member',
      signup_timestamp: new Date('2025-01-17T08:00:00Z'),
      last_login: new Date(),
    });

    console.log('✓ Created 3 users (1 Admin, 2 MemberS)');

    // Create projects
    const project1 = await Project.create({
      title: 'Q1 Marketing Campaign',
      description: 'Spring marketing initiative for new product launch',
      created_by: AdminUser._id,
      Members: [
        { user_id: AdminUser._id },
        { user_id: Member1._id },
        { user_id: Member2._id },
      ],
    });

    const project2 = await Project.create({
      title: 'Website Redesign',
      description: 'Complete redesign of company website with new branding',
      created_by: AdminUser._id,
      Members: [
        { user_id: AdminUser._id },
        { user_id: Member1._id },
      ],
    });

    const project3 = await Project.create({
      title: 'Mobile App Development',
      description: 'Build iOS and Android apps for customer engagement',
      created_by: AdminUser._id,
      Members: [
        { user_id: AdminUser._id },
        { user_id: Member2._id },
      ],
    });

    console.log('✓ Created 3 projects');

    // Create tasks
    await Task.create({
      title: 'Design marketing materials',
      description: 'Create posters, brochures, and digital ads',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigned_to: Member1._id,
      project_id: project1._id,
      due_date: new Date('2025-02-15T00:00:00Z'),
    });

    await Task.create({
      title: 'Social media campaign setup',
      description: 'Plan and schedule posts across all platforms',
      status: 'PENDING',
      priority: 'HIGH',
      assigned_to: Member2._id,
      project_id: project1._id,
      due_date: new Date('2025-02-20T00:00:00Z'),
    });

    await Task.create({
      title: 'Market research analysis',
      description: 'Analyze competitor strategies and market trends',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      assigned_to: Member1._id,
      project_id: project1._id,
      due_date: new Date('2025-01-30T00:00:00Z'),
    });

    await Task.create({
      title: 'Homepage design mockup',
      description: 'Create Figma mockup for new homepage',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigned_to: Member1._id,
      project_id: project2._id,
      due_date: new Date('2025-02-10T00:00:00Z'),
    });

    await Task.create({
      title: 'Backend API development',
      description: 'Develop REST APIs for website functionality',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigned_to: null,
      project_id: project2._id,
      due_date: new Date('2025-02-28T00:00:00Z'),
    });

    await Task.create({
      title: 'iOS app development',
      description: 'Develop core features for iOS application',
      status: 'PENDING',
      priority: 'MEDIUM',
      assigned_to: Member2._id,
      project_id: project3._id,
      due_date: new Date('2025-03-31T00:00:00Z'),
    });

    await Task.create({
      title: 'Testing and QA',
      description: 'Comprehensive testing of all app features',
      status: 'PENDING',
      priority: 'MEDIUM',
      assigned_to: null,
      project_id: project3._id,
      due_date: new Date('2025-04-15T00:00:00Z'),
    });

    console.log('✓ Created 7 tasks');

    console.log('\n✅ Seed data created successfully!\n');
    console.log('Demo Users:');
    console.log('  Admin: Admin@ethara.ai / password123');
    console.log('  Member: john@ethara.ai / password123');
    console.log('  Member: sarah@ethara.ai / password123\n');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed script error:', error.message);
    await disconnectDB();
    process.exit(1);
  }
}

seedDatabase();
