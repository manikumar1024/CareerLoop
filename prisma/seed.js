const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding realistic longitudinal outcome dataset for CareerLoop AI...");

  // Clear existing records to ensure clean state
  await prisma.auditLog.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.policyRecommendation.deleteMany();
  await prisma.aIInsight.deleteMany();
  await prisma.nonPlacementRecord.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.apprenticeshipRecord.deleteMany();
  await prisma.selfEmploymentRecord.deleteMany();
  await prisma.employmentRecord.deleteMany();
  await prisma.traineeSkill.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.batch.deleteMany();
  await prisma.course.deleteMany();
  await prisma.trainingProgram.deleteMany();
  await prisma.trainerProfile.deleteMany();
  await prisma.trainingProviderProfile.deleteMany();
  await prisma.employerProfile.deleteMany();
  await prisma.traineeProfile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const defaultPassword = await bcrypt.hash("CareerLoop2026!", 10);

  // 1. Create Core Skills Taxonomy
  const standardSkills = [
    { name: "JavaScript", category: "Technical", standardCode: "IT-DEV-01", description: "Modern ES6+ web programming" },
    { name: "TypeScript", category: "Technical", standardCode: "IT-DEV-02", description: "Static typed application development" },
    { name: "React", category: "Technical", standardCode: "IT-DEV-03", description: "Component-driven UI engineering" },
    { name: "Node.js", category: "Technical", standardCode: "IT-DEV-04", description: "Server-side runtime and API development" },
    { name: "SQL", category: "Technical", standardCode: "IT-DAT-01", description: "Relational database querying and schemas" },
    { name: "Python", category: "Technical", standardCode: "IT-DAT-02", description: "Scripting, data analysis, and automation" },
    { name: "Electrical Wiring", category: "Technical", standardCode: "ELE-WIR-01", description: "Industrial & domestic circuit wiring" },
    { name: "Solar Inverter Maintenance", category: "Technical", standardCode: "SOL-INV-01", description: "Photovoltaic inverter diagnostics" },
    { name: "Grid Safety Standards", category: "Domain", standardCode: "SOL-SAF-01", description: "CEA grid synchronization standards" },
    { name: "CNC Lathe Operation", category: "Technical", standardCode: "MFG-CNC-01", description: "Multi-axis precision turning and milling" },
    { name: "G-Code Programming", category: "Technical", standardCode: "MFG-CNC-02", description: "Direct numerical control program authoring" },
    { name: "Patient Care", category: "Domain", standardCode: "HLT-PAT-01", description: "Hospital inpatient monitoring and hygiene" },
    { name: "Workplace Communication", category: "Soft Skill", standardCode: "SFT-COM-01", description: "Professional English and team coordination" },
    { name: "SEO & Content Marketing", category: "Domain", standardCode: "MKT-SEO-01", description: "Search engine ranking and growth" },
  ];

  const skillRecords = {};
  for (const s of standardSkills) {
    const created = await prisma.skill.create({ data: s });
    skillRecords[s.name] = created.id;
  }

  // 2. Create Government Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@careerloop.gov.in",
      name: "Dr. Rajeshwar Sharma",
      passwordHash: defaultPassword,
      role: "GOVERNMENT_ADMIN",
      adminApproved: true,
      consentGiven: true,
    },
  });

  // 3. Create Training Providers
  const providerUsers = [
    {
      email: "director@puneskillhub.org",
      name: "Pune Skill Excellence Institute",
      center: "Pune Skill Excellence Institute",
      district: "Pune",
      state: "Maharashtra",
      accreditation: "NSDC-TC-MH-0492",
    },
    {
      email: "info@varanasiskillcenter.org",
      name: "Varanasi Technical Training Academy",
      center: "Varanasi Technical Training Academy",
      district: "Varanasi",
      state: "Uttar Pradesh",
      accreditation: "NSDC-TC-UP-1120",
    },
    {
      email: "contact@jaipurskillpark.org",
      name: "Jaipur Solar & Green Tech Center",
      center: "Jaipur Solar & Green Tech Center",
      district: "Jaipur",
      state: "Rajasthan",
      accreditation: "NSDC-TC-RJ-0834",
    },
  ];

  const providerProfiles = [];
  for (const pu of providerUsers) {
    const user = await prisma.user.create({
      data: {
        email: pu.email,
        name: pu.name,
        passwordHash: defaultPassword,
        role: "TRAINING_PROVIDER",
        consentGiven: true,
      },
    });

    const profile = await prisma.trainingProviderProfile.create({
      data: {
        userId: user.id,
        institutionName: pu.center,
        accreditationNumber: pu.accreditation,
        district: pu.district,
        state: pu.state,
        contactEmail: pu.email,
      },
    });
    providerProfiles.push(profile);
  }

  // 4. Create Training Programs
  const progFullStack = await prisma.trainingProgram.create({
    data: {
      providerId: providerProfiles[0].id,
      title: "Full Stack Web Development Certificate",
      code: "PRG-FS-2026",
      sector: "Information Technology",
      description: "Comprehensive 16-week software engineering curriculum covering JavaScript, React, Node.js, SQL, and Git.",
      durationWeeks: 16,
      minHours: 480,
    },
  });

  const progSolar = await prisma.trainingProgram.create({
    data: {
      providerId: providerProfiles[2].id,
      title: "Suryamitra Solar PV Technician Program",
      code: "PRG-SOLAR-2026",
      sector: "Green Energy & Renewable Power",
      description: "Hands-on certification for rooftop solar installation, grid interconnection, and inverter troubleshooting.",
      durationWeeks: 12,
      minHours: 360,
    },
  });

  const progCNC = await prisma.trainingProgram.create({
    data: {
      providerId: providerProfiles[1].id,
      title: "CNC Precision Machinist & Operator",
      code: "PRG-CNC-2026",
      sector: "Capital Goods & Manufacturing",
      description: "Industrial training on CAD blueprints, G-code authoring, and multi-axis CNC lathe calibration.",
      durationWeeks: 14,
      minHours: 420,
    },
  });

  // 4b. Create Trainer Accounts & Batches
  const trainerUser = await prisma.user.create({
    data: {
      email: "trainer@puneskillhub.org",
      name: "Ramesh Kulkarni",
      passwordHash: defaultPassword,
      role: "TRAINER",
      adminApproved: true,
      consentGiven: true,
    },
  });

  const trainerProfile = await prisma.trainerProfile.create({
    data: {
      userId: trainerUser.id,
      providerId: providerProfiles[0].id,
      name: "Ramesh Kulkarni",
      email: "trainer@puneskillhub.org",
      phone: "+91 98765 43210",
      specialization: "Full Stack Web & Cloud Architecture",
      bio: "10+ years experience mentoring vocational batches in frontend and backend technologies.",
      status: "ACTIVE",
    },
  });

  const batchFullStackA = await prisma.batch.create({
    data: {
      programId: progFullStack.id,
      trainerId: trainerProfile.id,
      name: "Full Stack Cohort 2026-Alpha",
      batchCode: "BCH-FS-01",
      startDate: new Date("2026-01-15"),
      endDate: new Date("2026-05-15"),
      status: "ACTIVE",
      maxCapacity: 30,
    },
  });

  // 5. Create Employers
  const employerData = [
    {
      email: "hr@infosolutions.com",
      name: "Ananya Deshmukh",
      company: "Apex InfoSolutions Pvt Ltd",
      industry: "Information Technology",
      district: "Pune",
      state: "Maharashtra",
      size: "250-500",
    },
    {
      email: "talent@heliossolar.in",
      name: "Vikram Rathore",
      company: "Helios Renewable Systems",
      industry: "Green Energy",
      district: "Jaipur",
      state: "Rajasthan",
      size: "50-100",
    },
    {
      email: "careers@varanasiprecision.in",
      name: "Suresh Gupta",
      company: "Varanasi Precision Forge Works",
      industry: "Manufacturing",
      district: "Varanasi",
      state: "Uttar Pradesh",
      size: "100-250",
    },
  ];

  const employerProfiles = [];
  for (const emp of employerData) {
    const user = await prisma.user.create({
      data: {
        email: emp.email,
        name: emp.name,
        passwordHash: defaultPassword,
        role: "EMPLOYER",
        consentGiven: true,
      },
    });

    const profile = await prisma.employerProfile.create({
      data: {
        userId: user.id,
        companyName: emp.company,
        industry: emp.industry,
        district: emp.district,
        state: emp.state,
        companySize: emp.size,
        contactEmail: emp.email,
        isVerified: true,
      },
    });
    employerProfiles.push(profile);
  }

  // 6. Create Trainees with Longitudinal Journeys
  const traineesInfo = [
    {
      email: "arjun.verma@example.com",
      name: "Arjun Verma",
      district: "Pune",
      program: progFullStack,
      skills: ["JavaScript", "React", "Node.js", "SQL", "Workplace Communication"],
      status: "EMPLOYED",
      attendance: 96,
      score: 88,
      employerProfile: employerProfiles[0],
      jobTitle: "Junior Software Engineer",
      startSalary: 28000,
      currentSalary: 35000,
      verifiedStatus: "EMPLOYER_VERIFIED",
    },
    {
      email: "priya.nair@example.com",
      name: "Priya Nair",
      district: "Pune",
      program: progFullStack,
      skills: ["JavaScript", "TypeScript", "React", "SQL"],
      status: "EMPLOYED",
      attendance: 92,
      score: 84,
      employerProfile: employerProfiles[0],
      jobTitle: "Associate Frontend Developer",
      startSalary: 26000,
      currentSalary: 32000,
      verifiedStatus: "EMPLOYER_VERIFIED",
    },
    {
      email: "kavita.singh@example.com",
      name: "Kavita Singh",
      district: "Jaipur",
      program: progSolar,
      skills: ["Electrical Wiring", "Solar Inverter Maintenance", "Grid Safety Standards"],
      status: "EMPLOYED",
      attendance: 94,
      score: 90,
      employerProfile: employerProfiles[1],
      jobTitle: "Solar PV Site Technician",
      startSalary: 22000,
      currentSalary: 27000,
      verifiedStatus: "EMPLOYER_VERIFIED",
    },
    {
      email: "rahul.mishra@example.com",
      name: "Rahul Mishra",
      district: "Varanasi",
      program: progCNC,
      skills: ["CNC Lathe Operation", "G-Code Programming"],
      status: "EMPLOYED",
      attendance: 88,
      score: 79,
      employerProfile: employerProfiles[2],
      jobTitle: "CNC Machine Specialist",
      startSalary: 21000,
      currentSalary: 24500,
      verifiedStatus: "EMPLOYER_VERIFIED",
    },
    {
      email: "manish.yadav@example.com",
      name: "Manish Yadav",
      district: "Jaipur",
      program: progSolar,
      skills: ["Electrical Wiring", "Solar Inverter Maintenance"],
      status: "SELF_EMPLOYED",
      attendance: 90,
      score: 82,
      selfBiz: {
        name: "Yadav Green Solar Works",
        type: "Solar Installation & Service",
        sector: "Renewable Energy",
        income: 38000,
        employees: 2,
      },
    },
    {
      email: "sneha.kulkarni@example.com",
      name: "Sneha Kulkarni",
      district: "Pune",
      program: progFullStack,
      skills: ["JavaScript", "React"],
      status: "APPRENTICESHIP",
      attendance: 91,
      score: 85,
      appr: {
        host: "Apex InfoSolutions Pvt Ltd",
        role: "Web Application Apprentice",
        stipend: 18000,
      },
    },
    {
      email: "deepak.sharma@example.com",
      name: "Deepak Sharma",
      district: "Varanasi",
      program: progCNC,
      skills: ["CNC Lathe Operation"],
      status: "UNEMPLOYED",
      attendance: 76,
      score: 62,
      nonPlacementReason: "SKILL_GAP",
      nonPlacementDetails: "Needs additional hands-on multi-axis CNC practical training before factory deployment.",
    },
  ];

  let counter = 100;
  for (const t of traineesInfo) {
    counter++;
    const user = await prisma.user.create({
      data: {
        email: t.email,
        name: t.name,
        passwordHash: defaultPassword,
        role: "TRAINEE",
        consentGiven: true,
      },
    });

    const traineeProfile = await prisma.traineeProfile.create({
      data: {
        userId: user.id,
        traineeId: `CLP-2026-00${counter}`,
        district: t.district,
        educationLevel: "Diploma / Higher Secondary",
        currentStatus: t.status,
        careerTarget: {
          create: {
            targetRole: t.program.title.replace(" Certificate", "").replace(" Program", ""),
            targetSalaryMin: 22000,
            targetSalaryMax: 40000,
          },
        },
      },
    });

    // Add Trainee Skills
    for (const skillName of t.skills) {
      if (skillRecords[skillName]) {
        await prisma.traineeSkill.create({
          data: {
            traineeId: traineeProfile.id,
            skillId: skillRecords[skillName],
            proficiencyLevel: "INTERMEDIATE",
            verifiedByAssessment: true,
          },
        });
      }
    }

    // Enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        traineeId: traineeProfile.id,
        programId: t.program.id,
        batchId: t.program.id === progFullStack.id ? batchFullStackA.id : null,
        attendancePercentage: t.attendance,
        status: "COMPLETED",
        grade: t.score >= 85 ? "A+" : "A",
      },
    });

    // Assessment
    await prisma.assessment.create({
      data: {
        enrollmentId: enrollment.id,
        traineeId: traineeProfile.id,
        title: "Standardized National Practical Assessment",
        maxScore: 100,
        scoreObtained: t.score,
        passed: t.score >= 60,
      },
    });

    // Certification
    if (t.score >= 60) {
      await prisma.certification.create({
        data: {
          traineeId: traineeProfile.id,
          programId: t.program.id,
          certificateNumber: `NSDC-${t.program.code}-${counter}`,
          issuingAuthority: "National Skill Development Board",
          verificationStatus: "VERIFIED",
          verifiedAt: new Date(),
        },
      });
    }

    // Longitudinal Outcomes & Followups
    if (t.status === "EMPLOYED" && t.employerProfile) {
      const empRecord = await prisma.employmentRecord.create({
        data: {
          traineeId: traineeProfile.id,
          employerId: t.employerProfile.id,
          companyName: t.employerProfile.companyName,
          jobTitle: t.jobTitle,
          locationDistrict: t.district,
          monthlySalary: t.startSalary,
          employmentType: "FULL_TIME",
          startDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000), // 200 days ago
          isCurrent: true,
          skillRelevanceScore: 5,
          verificationStatus: t.verifiedStatus,
          verifiedAt: new Date(Date.now() - 190 * 24 * 60 * 60 * 1000),
        },
      });

      // 30-day Followup
      await prisma.followUp.create({
        data: {
          traineeId: traineeProfile.id,
          milestoneDays: 30,
          scheduledDate: new Date(Date.now() - 170 * 24 * 60 * 60 * 1000),
          completedDate: new Date(Date.now() - 168 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          isEmployed: true,
          employmentType: "FULL_TIME",
          companyName: t.employerProfile.companyName,
          jobTitle: t.jobTitle,
          currentSalary: t.startSalary,
          sameEmployerAsPlacement: true,
          skillRelevanceScore: 5,
          feedback: "Smooth transition into daily production tasks.",
        },
      });

      // 90-day Followup
      await prisma.followUp.create({
        data: {
          traineeId: traineeProfile.id,
          milestoneDays: 90,
          scheduledDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000),
          completedDate: new Date(Date.now() - 108 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          isEmployed: true,
          employmentType: "FULL_TIME",
          companyName: t.employerProfile.companyName,
          jobTitle: t.jobTitle,
          currentSalary: Math.round(t.startSalary * 1.1),
          sameEmployerAsPlacement: true,
          skillRelevanceScore: 5,
          promotionReceived: false,
          wageIncreasePercent: 10.0,
          feedback: "Assigned independent project module.",
        },
      });

      // 180-day Followup
      await prisma.followUp.create({
        data: {
          traineeId: traineeProfile.id,
          milestoneDays: 180,
          scheduledDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          completedDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          isEmployed: true,
          employmentType: "FULL_TIME",
          companyName: t.employerProfile.companyName,
          jobTitle: t.jobTitle,
          currentSalary: t.currentSalary,
          sameEmployerAsPlacement: true,
          skillRelevanceScore: 5,
          promotionReceived: true,
          wageIncreasePercent: Math.round(((t.currentSalary - t.startSalary) / t.startSalary) * 100),
          feedback: "Received formal retention bonus and wage increment.",
        },
      });
    } else if (t.status === "SELF_EMPLOYED" && t.selfBiz) {
      await prisma.selfEmploymentRecord.create({
        data: {
          traineeId: traineeProfile.id,
          businessName: t.selfBiz.name,
          businessType: t.selfBiz.type,
          sector: t.selfBiz.sector,
          startDate: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
          monthlyNetIncome: t.selfBiz.income,
          employeesHired: t.selfBiz.employees,
          skillsApplied: "Solar Inverter Maintenance, Rooftop Electrical Systems",
          businessStatus: "ACTIVE",
        },
      });

      await prisma.followUp.create({
        data: {
          traineeId: traineeProfile.id,
          milestoneDays: 90,
          scheduledDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          completedDate: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          isEmployed: true,
          employmentType: "SELF_EMPLOYED",
          companyName: t.selfBiz.name,
          currentSalary: t.selfBiz.income,
          skillRelevanceScore: 5,
          feedback: "Successfully acquired 8 commercial maintenance contracts.",
        },
      });
    } else if (t.status === "APPRENTICESHIP" && t.appr) {
      await prisma.apprenticeshipRecord.create({
        data: {
          traineeId: traineeProfile.id,
          hostOrganization: t.appr.host,
          tradeRole: t.appr.role,
          stipendAmount: t.appr.stipend,
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          isCompleted: false,
          offeredFullTimeJob: false,
          skillsAcquired: "React, State Management, Git Workflows",
        },
      });
    } else if (t.status === "UNEMPLOYED") {
      await prisma.nonPlacementRecord.create({
        data: {
          traineeId: traineeProfile.id,
          programId: t.program.id,
          primaryReason: t.nonPlacementReason || "SKILL_GAP",
          details: t.nonPlacementDetails || "Needs practical lab upskilling",
        },
      });

      await prisma.followUp.create({
        data: {
          traineeId: traineeProfile.id,
          milestoneDays: 90,
          scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          completedDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
          isCompleted: true,
          isEmployed: false,
          nonPlacementReason: t.nonPlacementReason || "SKILL_GAP",
          nonPlacementNotes: "Looking for local apprentice opportunities with hands-on machinery.",
          feedback: "Requested refresher workshop on G-code machine operation.",
        },
      });
    }
  }

  // 7. Policy Recommendations
  await prisma.policyRecommendation.createMany({
    data: [
      {
        district: "Varanasi",
        sector: "Manufacturing",
        priority: "HIGH",
        issueSummary: "Practical skill gap in CNC multi-axis machining reported by 32% of non-placed graduates.",
        recommendedAction: "Upgrade Varanasi Technical Training Academy equipment with 4-axis simulator units and establish apprentice quota with local industrial forge units.",
        dataEvidence: "Follow-up milestone 90-day reports show 28% non-placement attributed to lack of advanced machine tooling exposure.",
        status: "OPEN",
      },
      {
        district: "Pune",
        sector: "Information Technology",
        priority: "MEDIUM",
        issueSummary: "High 6-month wage progression (+25%) for certified Full Stack developers.",
        recommendedAction: "Scale intake capacity for Full Stack Web Development Certificate in Pune district by 40% for the next fiscal year.",
        dataEvidence: "Verified employer data records 100% 180-day retention and average salary increase from ₹27,000 to ₹33,500.",
        status: "OPEN",
      },
    ],
  });

  console.log("✅ Seeding complete! Database is populated with realistic longitudinal records.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
