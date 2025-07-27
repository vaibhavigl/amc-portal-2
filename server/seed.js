import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@igl.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@igl.com',
      password: hashedPassword,
      role: 'ADMIN',
      department: '',
      emailPreference: true,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@igl.com' },
    update: {},
    create: {
      name: 'IT Manager',
      email: 'manager@igl.com',
      password: hashedPassword,
      role: 'MANAGER',
      department: 'IT',
      emailPreference: true,
    },
  });

  const cngManager = await prisma.user.upsert({
    where: { email: 'cng.manager@igl.com' },
    update: {},
    create: {
      name: 'CNG Manager',
      email: 'cng.manager@igl.com',
      password: hashedPassword,
      role: 'MANAGER',
      department: 'CNG',
      emailPreference: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@igl.com' },
    update: {},
    create: {
      name: 'IT Asset Owner',
      email: 'owner@igl.com',
      password: hashedPassword,
      role: 'OWNER',
      department: 'IT',
      emailPreference: true,
    },
  });

  const cngOwner = await prisma.user.upsert({
    where: { email: 'cng.owner@igl.com' },
    update: {},
    create: {
      name: 'CNG Asset Owner',
      email: 'cng.owner@igl.com',
      password: hashedPassword,
      role: 'OWNER',
      department: 'CNG',
      emailPreference: false,
    },
  });

  // Create sample AMC contracts
  const contracts = [
    {
      amcType: 'Comprehensive',
      make: 'Dell',
      model: 'OptiPlex 7090',
      serialNumber: 'DL001234',
      assetNumber: 'IGL-IT-001',
      warrantyStart: new Date('2023-01-01'),
      warrantyEnd: new Date('2024-12-31'),
      amcStart: new Date('2024-01-01'),
      amcEnd: new Date('2025-03-15'),
      location: 'Main Office - IT Department',
      vendor: 'Dell Technologies',
      department: 'IT',
      ownerId: owner.id,
    },
    {
      amcType: 'Non-comprehensive',
      make: 'HP',
      model: 'LaserJet Pro M404dn',
      serialNumber: 'HP567890',
      assetNumber: 'IGL-PR-002',
      warrantyStart: new Date('2023-06-01'),
      warrantyEnd: new Date('2024-05-31'),
      amcStart: new Date('2024-06-01'),
      amcEnd: new Date('2025-02-28'),
      location: 'Reception Area',
      vendor: 'HP Inc.',
      department: 'IT',
      ownerId: owner.id,
    },
    {
      amcType: 'Comprehensive',
      make: 'Compressor Systems',
      model: 'CNG-500',
      serialNumber: 'CNG001',
      assetNumber: 'IGL-CNG-001',
      warrantyStart: new Date('2023-03-01'),
      warrantyEnd: new Date('2025-02-28'),
      amcStart: new Date('2025-03-01'),
      amcEnd: new Date('2026-02-28'),
      location: 'CNG Station - Sector 15',
      vendor: 'CNG Equipment Ltd.',
      department: 'CNG',
      ownerId: cngOwner.id,
    },
  ];

  for (const contract of contracts) {
    await prisma.amcContract.upsert({
      where: { assetNumber: contract.assetNumber },
      update: {},
      create: contract,
    });
  }

  console.log('Database seeded successfully!');
  console.log('Login credentials:');
  console.log('Admin: admin@igl.com / password123');
  console.log('IT Manager: manager@igl.com / password123');
  console.log('CNG Manager: cng.manager@igl.com / password123');
  console.log('IT Owner: owner@igl.com / password123');
  console.log('CNG Owner: cng.owner@igl.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });