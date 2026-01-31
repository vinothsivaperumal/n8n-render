import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@narpavi-ats.com' },
    update: {},
    create: {
      email: 'admin@narpavi-ats.com',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user:', admin.email);

  // Create recruiter user
  const recruiter = await prisma.user.upsert({
    where: { email: 'recruiter@narpavi-ats.com' },
    update: {},
    create: {
      email: 'recruiter@narpavi-ats.com',
      name: 'Recruiter User',
      role: 'RECRUITER',
    },
  });

  console.log('✅ Created recruiter user:', recruiter.email);

  // Create sample jobs
  const job1 = await prisma.job.upsert({
    where: { id: 'job-1' },
    update: {},
    create: {
      id: 'job-1',
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced Full Stack Developer to join our team.',
      department: 'Engineering',
      location: 'Remote',
      type: 'FULL_TIME',
      status: 'OPEN',
    },
  });

  console.log('✅ Created job:', job1.title);

  const job2 = await prisma.job.upsert({
    where: { id: 'job-2' },
    update: {},
    create: {
      id: 'job-2',
      title: 'Product Manager',
      description: 'Join our product team to help shape the future of our ATS platform.',
      department: 'Product',
      location: 'New York, NY',
      type: 'FULL_TIME',
      status: 'OPEN',
    },
  });

  console.log('✅ Created job:', job2.title);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
