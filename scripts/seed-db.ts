
import { PrismaClient as AuthPrisma } from '../services/auth-service/node_modules/.prisma/client';
import { PrismaClient as ProfilePrisma } from '../services/profile-service/node_modules/.prisma/client';
import { PrismaClient as PaymentPrisma } from '../services/payment-service/node_modules/.prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const authPrisma = new AuthPrisma();
const profilePrisma = new ProfilePrisma();
const paymentPrisma = new PaymentPrisma();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🧹 Clearing existing data...');
    await authPrisma.user.deleteMany({});
    await profilePrisma.user.deleteMany({});
    await paymentPrisma.user.deleteMany({});
    console.log('✓ Data cleared\n');
  }

  // Create admin user
  console.log('👑 Creating admin user...');
  const adminPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || 'Admin123!@#',
    10
  );

  const admin = await authPrisma.user.create({
    data: {
      email: process.env.ADMIN_EMAIL || 'admin@etincel.app',
      password: adminPassword,
      name: 'Admin',
      birthDate: new Date('1990-01-01'),
      gender: 'MALE',
      isVerified: true,
      isPremium: true,
      planType: 'GOLD',
    },
  });
  console.log(`✓ Admin created: ${admin.email}\n`);

  // Create test users
  console.log('👥 Creating test users...');
  const testUsers = [];
  const names = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava',
    'Ethan', 'Sophia', 'Mason', 'Isabella', 'James'
  ];

  for (let i = 0; i < 10; i++) {
    const password = await bcrypt.hash('Test123!@#', 10);
    const gender = i % 2 === 0 ? 'MALE' : 'FEMALE';
    const age = 22 + i;

    const user = await authPrisma.user.create({
      data: {
        email: `user${i + 1}@etincel.app`,
        password,
        name: names[i],
        birthDate: new Date(2001 - i, 5, 15),
        gender,
        bio: `Hi! I'm ${names[i]}. I love traveling, coffee, and meeting new people. Looking for genuine connections! 🌟`,
        location: {
          type: 'Point',
          coordinates: [
            -82.6403 + (Math.random() - 0.5) * 0.2,
            27.7676 + (Math.random() - 0.5) * 0.2,
          ],
        },
        isVerified: i < 5,
        isPremium: i < 3,
        planType: i === 0 ? 'GOLD' : i < 3 ? 'PREMIUM' : 'FREE',
      },
    });

    testUsers.push(user);

    // Create profile
    await profilePrisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        bio: user.bio,
        birthDate: user.birthDate,
        gender: user.gender,
        location: user.location,
        isVerified: user.isVerified,
      },
    });

    // Create preferences
    await profilePrisma.preference.create({
      data: {
        userId: user.id,
        maxDistance: 50,
        minAge: 21,
        maxAge: 35,
        showMe: gender === 'MALE' ? 'FEMALE' : 'MALE',
      },
    });

    // Add photos
    await profilePrisma.photo.create({
      data: {
        userId: user.id,
        url: `https://i.pravatar.cc/400?img=${i + 1}`,
        isMain: true,
        moderationStatus: 'APPROVED',
      },
    });

    // Create payment record
    await paymentPrisma.user.create({
      data: {
        id: user.id,
        email: user.email,
      },
    });

    console.log(`✓ Created user ${i + 1}: ${user.email}`);
  }

  // Create sample subscriptions
  console.log('\n💳 Creating sample subscriptions...');
  for (let i = 0; i < 3; i++) {
    await paymentPrisma.subscription.create({
      data: {
        userId: testUsers[i].id,
        plan: i === 0 ? 'GOLD' : 'PREMIUM',
        status: 'ACTIVE',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log('✓ Subscriptions created\n');

  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║           🎉 DATABASE SEEDED SUCCESSFULLY!          ║');
  console.log('╚════════════════════════════════════════════════════╝\n');
  
  console.log('📋 TEST CREDENTIALS:\n');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│ ADMIN LOGIN                                     │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log(`│ Email:    ${process.env.ADMIN_EMAIL || 'admin@etincel.app'}`);
  console.log(`│ Password: ${process.env.ADMIN_PASSWORD || 'Admin123!@#'}`);
  console.log('└─────────────────────────────────────────────────┘\n');
  
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│ TEST USERS                                      │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log('│ Email:    user1@etincel.app - user10@etincel.app');
  console.log('│ Password: Test123!@#                            │');
  console.log('└─────────────────────────────────────────────────┘\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await authPrisma.$disconnect();
    await profilePrisma.$disconnect();
    await paymentPrisma.$disconnect();
  });