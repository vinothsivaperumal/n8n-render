import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Staffing ATS database...');

  // Clean existing data (in reverse order of dependencies)
  console.log('🧹 Cleaning existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.rate.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.stageHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.rightToRepresent.deleteMany();
  await prisma.document.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.resumeVersion.deleteMany();
  await prisma.job.deleteMany();
  await prisma.client.deleteMany();
  await prisma.vendorContact.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.candidate.deleteMany();

  // ========================================
  // SKILLS
  // ========================================
  console.log('📚 Creating skills...');
  const skills = await Promise.all([
    prisma.skill.create({ data: { name: 'JavaScript', category: 'Programming' } }),
    prisma.skill.create({ data: { name: 'TypeScript', category: 'Programming' } }),
    prisma.skill.create({ data: { name: 'React', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'Node.js', category: 'Backend' } }),
    prisma.skill.create({ data: { name: 'Python', category: 'Programming' } }),
    prisma.skill.create({ data: { name: 'Java', category: 'Programming' } }),
    prisma.skill.create({ data: { name: 'AWS', category: 'Cloud' } }),
    prisma.skill.create({ data: { name: 'Docker', category: 'DevOps' } }),
    prisma.skill.create({ data: { name: 'PostgreSQL', category: 'Database' } }),
    prisma.skill.create({ data: { name: 'MongoDB', category: 'Database' } }),
    prisma.skill.create({ data: { name: 'GraphQL', category: 'API' } }),
    prisma.skill.create({ data: { name: 'REST API', category: 'API' } }),
    prisma.skill.create({ data: { name: 'Angular', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'Vue.js', category: 'Frontend' } }),
    prisma.skill.create({ data: { name: 'Spring Boot', category: 'Backend' } }),
  ]);
  console.log(`✅ Created ${skills.length} skills`);

  // ========================================
  // CANDIDATES (10)
  // ========================================
  console.log('👥 Creating candidates...');
  const candidatesData = [
    { firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com', phone: '+1-555-0101', location: 'San Francisco, CA', yearsOfExp: 8, currentRole: 'Senior Full Stack Developer', visaStatus: 'US_CITIZEN' },
    { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@email.com', phone: '+1-555-0102', location: 'New York, NY', yearsOfExp: 6, currentRole: 'Frontend Developer', visaStatus: 'GREEN_CARD' },
    { firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@email.com', phone: '+1-555-0103', location: 'Austin, TX', yearsOfExp: 5, currentRole: 'Backend Developer', visaStatus: 'H1B' },
    { firstName: 'Emily', lastName: 'Williams', email: 'emily.w@email.com', phone: '+1-555-0104', location: 'Seattle, WA', yearsOfExp: 7, currentRole: 'DevOps Engineer', visaStatus: 'US_CITIZEN' },
    { firstName: 'David', lastName: 'Brown', email: 'david.brown@email.com', phone: '+1-555-0105', location: 'Boston, MA', yearsOfExp: 10, currentRole: 'Solutions Architect', visaStatus: 'GREEN_CARD' },
    { firstName: 'Sarah', lastName: 'Davis', email: 'sarah.davis@email.com', phone: '+1-555-0106', location: 'Chicago, IL', yearsOfExp: 4, currentRole: 'Full Stack Developer', visaStatus: 'H4_EAD' },
    { firstName: 'Robert', lastName: 'Miller', email: 'robert.m@email.com', phone: '+1-555-0107', location: 'Denver, CO', yearsOfExp: 9, currentRole: 'Tech Lead', visaStatus: 'US_CITIZEN' },
    { firstName: 'Jessica', lastName: 'Garcia', email: 'jessica.g@email.com', phone: '+1-555-0108', location: 'Los Angeles, CA', yearsOfExp: 3, currentRole: 'Junior Developer', visaStatus: 'OPT' },
    { firstName: 'Daniel', lastName: 'Martinez', email: 'daniel.m@email.com', phone: '+1-555-0109', location: 'Miami, FL', yearsOfExp: 6, currentRole: 'Backend Engineer', visaStatus: 'TN' },
    { firstName: 'Lisa', lastName: 'Anderson', email: 'lisa.a@email.com', phone: '+1-555-0110', location: 'Portland, OR', yearsOfExp: 5, currentRole: 'Full Stack Engineer', visaStatus: 'GC_EAD' },
  ];

  const candidates = [];
  for (const data of candidatesData) {
    const candidate = await prisma.candidate.create({ data });
    
    // Create resume versions for each candidate
    await prisma.resumeVersion.create({
      data: {
        candidateId: candidate.id,
        version: 1,
        fileUrl: `https://storage.example.com/resumes/${candidate.id}_v1.pdf`,
        fileName: `${candidate.firstName}_${candidate.lastName}_Resume_v1.pdf`,
        summary: `Experienced ${data.currentRole} with ${data.yearsOfExp} years of experience`,
        isActive: true,
      },
    });
    
    candidates.push(candidate);
  }
  console.log(`✅ Created ${candidates.length} candidates with resume versions`);

  // ========================================
  // CANDIDATE SKILLS
  // ========================================
  console.log('🎯 Assigning skills to candidates...');
  const candidateSkillsData = [
    { candidateId: candidates[0].id, skillId: skills[0].id, yearsOfExp: 8, proficiency: 'EXPERT' },
    { candidateId: candidates[0].id, skillId: skills[1].id, yearsOfExp: 6, proficiency: 'ADVANCED' },
    { candidateId: candidates[0].id, skillId: skills[2].id, yearsOfExp: 7, proficiency: 'EXPERT' },
    { candidateId: candidates[0].id, skillId: skills[3].id, yearsOfExp: 8, proficiency: 'EXPERT' },
    { candidateId: candidates[1].id, skillId: skills[2].id, yearsOfExp: 6, proficiency: 'EXPERT' },
    { candidateId: candidates[1].id, skillId: skills[1].id, yearsOfExp: 5, proficiency: 'ADVANCED' },
    { candidateId: candidates[1].id, skillId: skills[12].id, yearsOfExp: 4, proficiency: 'ADVANCED' },
    { candidateId: candidates[2].id, skillId: skills[3].id, yearsOfExp: 5, proficiency: 'ADVANCED' },
    { candidateId: candidates[2].id, skillId: skills[4].id, yearsOfExp: 5, proficiency: 'ADVANCED' },
    { candidateId: candidates[2].id, skillId: skills[8].id, yearsOfExp: 4, proficiency: 'ADVANCED' },
    { candidateId: candidates[3].id, skillId: skills[6].id, yearsOfExp: 7, proficiency: 'EXPERT' },
    { candidateId: candidates[3].id, skillId: skills[7].id, yearsOfExp: 6, proficiency: 'EXPERT' },
    { candidateId: candidates[4].id, skillId: skills[5].id, yearsOfExp: 10, proficiency: 'EXPERT' },
    { candidateId: candidates[4].id, skillId: skills[14].id, yearsOfExp: 8, proficiency: 'EXPERT' },
    { candidateId: candidates[4].id, skillId: skills[6].id, yearsOfExp: 7, proficiency: 'ADVANCED' },
  ];
  
  await prisma.candidateSkill.createMany({ data: candidateSkillsData });
  console.log(`✅ Created ${candidateSkillsData.length} candidate-skill associations`);

  // ========================================
  // VENDORS (5)
  // ========================================
  console.log('🏢 Creating vendors...');
  const vendorsData = [
    { name: 'TechStaff Solutions', companyName: 'TechStaff Solutions Inc.', email: 'contact@techstaff.com', phone: '+1-555-2001', taxId: 'EIN-12-3456789', status: 'ACTIVE' },
    { name: 'Global IT Consulting', companyName: 'Global IT Consulting LLC', email: 'info@globalit.com', phone: '+1-555-2002', taxId: 'EIN-98-7654321', status: 'ACTIVE' },
    { name: 'Prime Recruiters', companyName: 'Prime Recruiters Corp', email: 'contact@primerecruiters.com', phone: '+1-555-2003', taxId: 'EIN-45-6789012', status: 'ACTIVE' },
    { name: 'Elite Tech Partners', companyName: 'Elite Tech Partners LLC', email: 'hello@elitetech.com', phone: '+1-555-2004', taxId: 'EIN-78-9012345', status: 'ACTIVE' },
    { name: 'Nexgen Staffing', companyName: 'Nexgen Staffing Solutions', email: 'info@nexgenstaffing.com', phone: '+1-555-2005', taxId: 'EIN-23-4567890', status: 'ACTIVE' },
  ];

  const vendors = [];
  for (const data of vendorsData) {
    const vendor = await prisma.vendor.create({ data });
    
    // Create vendor contacts
    await prisma.vendorContact.create({
      data: {
        vendorId: vendor.id,
        firstName: 'Account',
        lastName: 'Manager',
        email: `am@${data.email.split('@')[1]}`,
        phone: data.phone,
        role: 'Account Manager',
        isPrimary: true,
      },
    });
    
    vendors.push(vendor);
  }
  console.log(`✅ Created ${vendors.length} vendors with contacts`);

  // ========================================
  // CLIENTS (5)
  // ========================================
  console.log('🎯 Creating clients...');
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        name: 'TechCorp Inc',
        industry: 'Technology',
        website: 'https://techcorp.com',
        contactName: 'Alice Johnson',
        contactEmail: 'alice@techcorp.com',
        contactPhone: '+1-555-3001',
        status: 'ACTIVE',
      },
    }),
    prisma.client.create({
      data: {
        name: 'FinanceHub LLC',
        industry: 'Finance',
        website: 'https://financehub.com',
        contactName: 'Bob Williams',
        contactEmail: 'bob@financehub.com',
        contactPhone: '+1-555-3002',
        status: 'ACTIVE',
      },
    }),
    prisma.client.create({
      data: {
        name: 'HealthTech Systems',
        industry: 'Healthcare',
        website: 'https://healthtech.com',
        contactName: 'Carol Davis',
        contactEmail: 'carol@healthtech.com',
        contactPhone: '+1-555-3003',
        status: 'ACTIVE',
      },
    }),
    prisma.client.create({
      data: {
        name: 'RetailMax Co',
        industry: 'Retail',
        website: 'https://retailmax.com',
        contactName: 'David Brown',
        contactEmail: 'david@retailmax.com',
        contactPhone: '+1-555-3004',
        status: 'ACTIVE',
      },
    }),
    prisma.client.create({
      data: {
        name: 'EduSphere Academy',
        industry: 'Education',
        website: 'https://edusphere.com',
        contactName: 'Emma Wilson',
        contactEmail: 'emma@edusphere.com',
        contactPhone: '+1-555-3005',
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log(`✅ Created ${clients.length} clients`);

  // ========================================
  // JOBS (10)
  // ========================================
  console.log('💼 Creating jobs...');
  const jobsData = [
    { clientId: clients[0].id, title: 'Senior Full Stack Developer', description: 'Build scalable web applications', location: 'San Francisco, CA', employmentType: 'FULL_TIME', minSalary: 120000, maxSalary: 180000, billRate: 95, status: 'OPEN', priority: 'HIGH' },
    { clientId: clients[0].id, title: 'React Frontend Developer', description: 'Create amazing user interfaces', location: 'Remote', employmentType: 'CONTRACT', minSalary: 80000, maxSalary: 120000, billRate: 75, status: 'OPEN', priority: 'MEDIUM' },
    { clientId: clients[1].id, title: 'Python Backend Engineer', description: 'Build robust backend systems', location: 'New York, NY', employmentType: 'FULL_TIME', minSalary: 110000, maxSalary: 160000, billRate: 85, status: 'OPEN', priority: 'HIGH' },
    { clientId: clients[1].id, title: 'DevOps Engineer', description: 'Manage cloud infrastructure', location: 'Boston, MA', employmentType: 'CONTRACT', minSalary: 100000, maxSalary: 150000, billRate: 90, status: 'OPEN', priority: 'URGENT' },
    { clientId: clients[2].id, title: 'Java Solutions Architect', description: 'Design enterprise solutions', location: 'Chicago, IL', employmentType: 'FULL_TIME', minSalary: 140000, maxSalary: 200000, billRate: 110, status: 'OPEN', priority: 'HIGH' },
    { clientId: clients[2].id, title: 'Full Stack Engineer', description: 'Work on healthcare platform', location: 'Seattle, WA', employmentType: 'CONTRACT_TO_HIRE', minSalary: 90000, maxSalary: 140000, billRate: 80, status: 'OPEN', priority: 'MEDIUM' },
    { clientId: clients[3].id, title: 'Angular Frontend Developer', description: 'Build retail web apps', location: 'Austin, TX', employmentType: 'CONTRACT', minSalary: 75000, maxSalary: 115000, billRate: 70, status: 'OPEN', priority: 'MEDIUM' },
    { clientId: clients[3].id, title: 'Node.js Backend Developer', description: 'API development', location: 'Denver, CO', employmentType: 'FULL_TIME', minSalary: 95000, maxSalary: 145000, billRate: 82, status: 'OPEN', priority: 'HIGH' },
    { clientId: clients[4].id, title: 'Full Stack Developer', description: 'Education platform development', location: 'Portland, OR', employmentType: 'CONTRACT', minSalary: 85000, maxSalary: 130000, billRate: 75, status: 'OPEN', priority: 'LOW' },
    { clientId: clients[4].id, title: 'Cloud Engineer', description: 'AWS infrastructure', location: 'Remote', employmentType: 'FULL_TIME', minSalary: 105000, maxSalary: 155000, billRate: 88, status: 'OPEN', priority: 'MEDIUM' },
  ];

  const jobs = [];
  for (const data of jobsData) {
    const job = await prisma.job.create({ data });
    jobs.push(job);
  }
  console.log(`✅ Created ${jobs.length} jobs`);

  // ========================================
  // JOB SKILLS
  // ========================================
  console.log('🔧 Assigning skills to jobs...');
  const jobSkillsData = [
    { jobId: jobs[0].id, skillId: skills[0].id, required: true, minYears: 5 },
    { jobId: jobs[0].id, skillId: skills[1].id, required: true, minYears: 3 },
    { jobId: jobs[0].id, skillId: skills[2].id, required: true, minYears: 4 },
    { jobId: jobs[0].id, skillId: skills[3].id, required: true, minYears: 5 },
    { jobId: jobs[1].id, skillId: skills[2].id, required: true, minYears: 4 },
    { jobId: jobs[1].id, skillId: skills[1].id, required: true, minYears: 3 },
    { jobId: jobs[2].id, skillId: skills[4].id, required: true, minYears: 4 },
    { jobId: jobs[2].id, skillId: skills[8].id, required: true, minYears: 3 },
    { jobId: jobs[3].id, skillId: skills[6].id, required: true, minYears: 5 },
    { jobId: jobs[3].id, skillId: skills[7].id, required: true, minYears: 4 },
    { jobId: jobs[4].id, skillId: skills[5].id, required: true, minYears: 7 },
    { jobId: jobs[4].id, skillId: skills[14].id, required: true, minYears: 5 },
  ];
  
  await prisma.jobSkill.createMany({ data: jobSkillsData });
  console.log(`✅ Created ${jobSkillsData.length} job-skill associations`);

  // ========================================
  // RTRs (Right to Represent)
  // ========================================
  console.log('📝 Creating RTRs...');
  const now = new Date();
  const rtrs = await Promise.all([
    prisma.rightToRepresent.create({
      data: {
        candidateId: candidates[0].id,
        validFrom: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        validUntil: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
        signedByCandidateAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
        candidateSignature: 'John Doe - Digital Signature',
        signedByVendorAt: new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000),
        vendorSignature: 'TechStaff Solutions - Authorized',
        status: 'SIGNED',
        documentUrl: 'https://storage.example.com/rtrs/rtr_001.pdf',
      },
    }),
    prisma.rightToRepresent.create({
      data: {
        candidateId: candidates[1].id,
        validFrom: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
        validUntil: new Date(now.getTime() + 345 * 24 * 60 * 60 * 1000),
        signedByCandidateAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
        candidateSignature: 'Jane Smith - Digital Signature',
        signedByVendorAt: new Date(now.getTime() - 19 * 24 * 60 * 60 * 1000),
        vendorSignature: 'Global IT Consulting - Authorized',
        status: 'SIGNED',
        documentUrl: 'https://storage.example.com/rtrs/rtr_002.pdf',
      },
    }),
    prisma.rightToRepresent.create({
      data: {
        candidateId: candidates[2].id,
        validFrom: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        validUntil: new Date(now.getTime() + 350 * 24 * 60 * 60 * 1000),
        signedByCandidateAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
        candidateSignature: 'Michael Johnson - Digital Signature',
        status: 'SIGNED',
        documentUrl: 'https://storage.example.com/rtrs/rtr_003.pdf',
      },
    }),
  ]);
  console.log(`✅ Created ${rtrs.length} RTRs`);

  // ========================================
  // APPLICATIONS (25)
  // ========================================
  console.log('📋 Creating applications...');
  const applicationsData = [
    { candidateId: candidates[0].id, jobId: jobs[0].id, vendorId: vendors[0].id, rtrId: rtrs[0].id, currentStage: 'PLACED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 58 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[1].id, jobId: jobs[1].id, vendorId: vendors[1].id, rtrId: rtrs[1].id, currentStage: 'OFFER_EXTENDED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[2].id, jobId: jobs[2].id, vendorId: vendors[0].id, rtrId: rtrs[2].id, currentStage: 'INTERVIEWING', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[3].id, jobId: jobs[3].id, vendorId: vendors[2].id, currentStage: 'CLIENT_SUBMITTED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[4].id, jobId: jobs[4].id, vendorId: vendors[1].id, currentStage: 'SCREENING', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[5].id, jobId: jobs[5].id, vendorId: vendors[3].id, currentStage: 'SUBMITTED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[6].id, jobId: jobs[6].id, vendorId: vendors[2].id, currentStage: 'FINAL_ROUND', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[7].id, jobId: jobs[7].id, vendorId: vendors[4].id, currentStage: 'REJECTED', status: 'CLOSED', submittedAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 38 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[8].id, jobId: jobs[8].id, vendorId: vendors[0].id, currentStage: 'INTERVIEW_SCHEDULED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[9].id, jobId: jobs[9].id, vendorId: vendors[3].id, currentStage: 'SCREENING', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[0].id, jobId: jobs[2].id, vendorId: vendors[1].id, rtrId: rtrs[0].id, currentStage: 'CLIENT_SUBMITTED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[1].id, jobId: jobs[3].id, vendorId: vendors[2].id, rtrId: rtrs[1].id, currentStage: 'SCREENING', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[2].id, jobId: jobs[4].id, vendorId: vendors[0].id, rtrId: rtrs[2].id, currentStage: 'SUBMITTED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[3].id, jobId: jobs[5].id, vendorId: vendors[3].id, currentStage: 'INTERVIEWING', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[4].id, jobId: jobs[6].id, vendorId: vendors[1].id, currentStage: 'WITHDRAWN', status: 'CLOSED', submittedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[5].id, jobId: jobs[7].id, vendorId: vendors[4].id, currentStage: 'TECHNICAL_ROUND', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 22 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[6].id, jobId: jobs[8].id, vendorId: vendors[2].id, currentStage: 'CLIENT_SUBMITTED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[7].id, jobId: jobs[9].id, vendorId: vendors[0].id, currentStage: 'SCREENING', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[8].id, jobId: jobs[0].id, vendorId: vendors[3].id, currentStage: 'OFFER_ACCEPTED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 48 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[9].id, jobId: jobs[1].id, vendorId: vendors[1].id, currentStage: 'FINAL_ROUND', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[0].id, jobId: jobs[5].id, vendorId: vendors[4].id, rtrId: rtrs[0].id, currentStage: 'INTERVIEW_SCHEDULED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 11 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[1].id, jobId: jobs[6].id, vendorId: vendors[0].id, rtrId: rtrs[1].id, currentStage: 'SUBMITTED', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[2].id, jobId: jobs[7].id, vendorId: vendors[2].id, rtrId: rtrs[2].id, currentStage: 'SCREENING', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[3].id, jobId: jobs[8].id, vendorId: vendors[1].id, currentStage: 'REJECTED', status: 'CLOSED', submittedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 43 * 24 * 60 * 60 * 1000) },
    { candidateId: candidates[4].id, jobId: jobs[9].id, vendorId: vendors[3].id, currentStage: 'INTERVIEWING', status: 'ACTIVE', submittedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), clientSubmittedAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000) },
  ];

  const applications = [];
  for (const data of applicationsData) {
    const application = await prisma.application.create({ data });
    applications.push(application);
  }
  console.log(`✅ Created ${applications.length} applications`);

  // ========================================
  // STAGE HISTORY
  // ========================================
  console.log('📊 Creating stage history...');
  const stageHistoryData = [];
  
  // Add stage history for some applications
  for (let i = 0; i < Math.min(10, applications.length); i++) {
    const app = applications[i];
    stageHistoryData.push({
      applicationId: app.id,
      stage: 'SUBMITTED',
      status: 'ACTIVE',
      notes: 'Application submitted',
      changedBy: 'system',
      createdAt: app.submittedAt,
    });
    
    if (app.clientSubmittedAt) {
      stageHistoryData.push({
        applicationId: app.id,
        stage: 'SCREENING',
        status: 'ACTIVE',
        notes: 'Resume screening completed',
        changedBy: 'recruiter@vendor.com',
        createdAt: new Date(app.submittedAt.getTime() + 1 * 24 * 60 * 60 * 1000),
      });
      
      stageHistoryData.push({
        applicationId: app.id,
        stage: 'CLIENT_SUBMITTED',
        status: 'ACTIVE',
        notes: 'Submitted to client',
        changedBy: 'recruiter@vendor.com',
        createdAt: app.clientSubmittedAt,
      });
    }
  }
  
  await prisma.stageHistory.createMany({ data: stageHistoryData });
  console.log(`✅ Created ${stageHistoryData.length} stage history records`);

  // ========================================
  // CONTRACTS & RATES
  // ========================================
  console.log('📄 Creating contracts and rates...');
  
  // Create contracts for placed candidates
  const placedApplications = applications.filter(app => 
    app.currentStage === 'PLACED' || app.currentStage === 'OFFER_ACCEPTED'
  );
  
  for (const app of placedApplications) {
    const contract = await prisma.contract.create({
      data: {
        applicationId: app.id,
        candidateId: app.candidateId,
        vendorId: app.vendorId,
        contractType: Math.random() > 0.5 ? 'C2C' : 'W2',
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 335 * 24 * 60 * 60 * 1000),
      },
    });
    
    // Create rate for the contract
    const candidateRate = 80 + Math.random() * 40; // $80-120/hr
    const billRate = candidateRate * 1.4; // 40% margin
    const margin = billRate - candidateRate;
    const marginPercent = (margin / billRate) * 100;
    
    await prisma.rate.create({
      data: {
        contractId: contract.id,
        candidateRate,
        billRate,
        payType: 'HOURLY',
        margin,
        marginPercent,
        effectiveFrom: contract.startDate,
      },
    });
  }
  console.log(`✅ Created ${placedApplications.length} contracts with rates`);

  // ========================================
  // DOCUMENTS
  // ========================================
  console.log('📎 Creating documents...');
  const documentsData = [];
  
  // Add documents for first 5 candidates
  for (let i = 0; i < Math.min(5, candidates.length); i++) {
    const candidate = candidates[i];
    documentsData.push(
      {
        candidateId: candidate.id,
        documentType: 'VISA_DOCUMENT',
        fileName: `${candidate.firstName}_${candidate.lastName}_Visa.pdf`,
        fileUrl: `https://storage.example.com/docs/visa_${i + 1}.pdf`,
        fileSize: 256000 + Math.floor(Math.random() * 500000),
        mimeType: 'application/pdf',
        description: 'Visa documentation',
      },
      {
        candidateId: candidate.id,
        documentType: 'ID_PROOF',
        fileName: `${candidate.firstName}_${candidate.lastName}_ID.pdf`,
        fileUrl: `https://storage.example.com/docs/id_${i + 1}.pdf`,
        fileSize: 128000 + Math.floor(Math.random() * 200000),
        mimeType: 'application/pdf',
        description: 'Government ID',
      }
    );
  }
  
  // Add vendor documents
  for (let i = 0; i < Math.min(3, vendors.length); i++) {
    const vendor = vendors[i];
    documentsData.push(
      {
        vendorId: vendor.id,
        documentType: 'MSA',
        fileName: `MSA_${vendor.name.replace(/\s+/g, '_')}.pdf`,
        fileUrl: `https://storage.example.com/docs/msa_vendor_${i + 1}.pdf`,
        fileSize: 512000 + Math.floor(Math.random() * 1000000),
        mimeType: 'application/pdf',
        description: 'Master Service Agreement',
      }
    );
  }
  
  await prisma.document.createMany({ data: documentsData });
  console.log(`✅ Created ${documentsData.length} documents`);

  // ========================================
  // AUDIT LOGS
  // ========================================
  console.log('📝 Creating audit logs...');
  const auditLogsData = [
    {
      entityType: 'Candidate',
      entityId: candidates[0].id,
      action: 'CREATE',
      changedBy: 'admin@system.com',
      oldValues: null,
      newValues: { firstName: 'John', lastName: 'Doe', email: 'john.doe@email.com' },
      createdAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    },
    {
      entityType: 'Application',
      entityId: applications[0].id,
      action: 'CREATE',
      changedBy: 'recruiter@vendor.com',
      oldValues: null,
      newValues: { candidateId: applications[0].candidateId, jobId: applications[0].jobId, currentStage: 'SUBMITTED' },
      createdAt: applications[0].submittedAt,
    },
    {
      entityType: 'Application',
      entityId: applications[0].id,
      action: 'UPDATE',
      changedBy: 'recruiter@vendor.com',
      oldValues: { currentStage: 'SUBMITTED' },
      newValues: { currentStage: 'CLIENT_SUBMITTED' },
      changes: { currentStage: { from: 'SUBMITTED', to: 'CLIENT_SUBMITTED' } },
      createdAt: applications[0].clientSubmittedAt || applications[0].submittedAt,
    },
    {
      entityType: 'Contract',
      entityId: 'contract-example',
      action: 'CREATE',
      changedBy: 'admin@system.com',
      oldValues: null,
      newValues: { contractType: 'C2C', startDate: new Date() },
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    },
  ];
  
  await prisma.auditLog.createMany({ data: auditLogsData });
  console.log(`✅ Created ${auditLogsData.length} audit logs`);

  console.log('\n🎉 Seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`   - ${skills.length} Skills`);
  console.log(`   - ${candidates.length} Candidates`);
  console.log(`   - ${vendors.length} Vendors`);
  console.log(`   - ${clients.length} Clients`);
  console.log(`   - ${jobs.length} Jobs`);
  console.log(`   - ${rtrs.length} RTRs`);
  console.log(`   - ${applications.length} Applications`);
  console.log(`   - ${placedApplications.length} Contracts with Rates`);
  console.log(`   - ${documentsData.length} Documents`);
  console.log(`   - ${auditLogsData.length} Audit Logs`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
