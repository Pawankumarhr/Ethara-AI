import bcryptjs from 'bcryptjs';
import { connectDB, disconnectDB, User, Project, Task } from '../config/db.js';

async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create users
    const adminPassword = await bcryptjs.hash('password123', 10);
    const memberPassword = await bcryptjs.hash('password123', 10);

    const adminUser = await User.create({
      email: 'admin@ethara.ai',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      signup_timestamp: new Date('2025-01-15T10:30:00Z'),
      last_login: new Date(),
    });

    const member1 = await User.create({
      email: 'john@ethara.ai',
      password: memberPassword,
      name: 'John Doe',
      role: 'MEMBER',
      signup_timestamp: new Date('2025-01-16T09:00:00Z'),
      last_login: new Date(),
    });

    const member2 = await User.create({
      email: 'sarah@ethara.ai',
      password: memberPassword,
      name: 'Sarah Smith',
      role: 'MEMBER',
      signup_timestamp: new Date('2025-01-17T08:00:00Z'),
      last_login: new Date(),
    });

    console.log('✓ Created 3 users (1 ADMIN, 2 MEMBERS)');

    // Create projects
    const project1 = await Project.create({
      title: 'Q1 Marketing Campaign',
      description: 'Spring marketing initiative for new product launch',
      created_by: adminUser._id,
      members: [
        { user_id: adminUser._id },
        { user_id: member1._id },
        { user_id: member2._id },
      ],
    });

    const project2 = await Project.create({
      title: 'Website Redesign',
      description: 'Complete redesign of company website with new branding',
      created_by: adminUser._id,
      members: [
        { user_id: adminUser._id },
        { user_id: member1._id },
      ],
    });

    const project3 = await Project.create({
      title: 'Mobile App Development',
      description: 'Build iOS and Android apps for customer engagement',
      created_by: adminUser._id,
      members: [
        { user_id: adminUser._id },
        { user_id: member2._id },
      ],
    });

    console.log('✓ Created 3 projects');

    // Create tasks
    await Task.create({
      title: 'Design marketing materials',
      description: 'Create posters, brochures, and digital ads',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigned_to: member1._id,
      project_id: project1._id,
      due_date: new Date('2025-02-15T00:00:00Z'),
    });

    await Task.create({
      title: 'Social media campaign setup',
      description: 'Plan and schedule posts across all platforms',
      status: 'PENDING',
      priority: 'HIGH',
      assigned_to: member2._id,
      project_id: project1._id,
      due_date: new Date('2025-02-20T00:00:00Z'),
    });

    await Task.create({
      title: 'Market research analysis',
      description: 'Analyze competitor strategies and market trends',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      assigned_to: member1._id,
      project_id: project1._id,
      due_date: new Date('2025-01-30T00:00:00Z'),
    });

    await Task.create({
      title: 'Homepage design mockup',
      description: 'Create Figma mockup for new homepage',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      assigned_to: member1._id,
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
      assigned_to: member2._id,
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
    console.log('  Admin: admin@ethara.ai / password123');
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
