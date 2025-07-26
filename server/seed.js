import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const manager = await prisma.user.upsert({
    where: { email: 'manager@igl.com' },
    update: {},
    create: {
      name: 'Asset Manager',
      email: 'manager@igl.com',
      password: hashedPassword,
      role: 'MANAGER',
      emailPreference: true,
    },
  });

  const owner = await prisma.user.upsert({
    where: { email: 'owner@igl.com' },
    update: {},
    create: {
      name: 'Asset Owner',
      email: 'owner@igl.com',
      password: hashedPassword,
      role: 'OWNER',
      emailPreference: true,
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
      ownerId: owner.id,
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
  console.log('Manager: manager@igl.com / password123');
  console.log('Owner: owner@igl.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });