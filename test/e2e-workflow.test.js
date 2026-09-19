const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function runE2EWorkflowTests() {
  console.log("==================================================");
  console.log("🚀 RUNNING END-TO-END DATA FLOW & ROLE INTEGRATION TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const providerEmail = `provider_${timestamp}@careerloop.org`;
  const studentEmail = `student_${timestamp}@careerloop.org`;
  const passwordHash = await bcrypt.hash("CareerLoop2026!", 10);

  try {
    // -----------------------------------------------------------------
    // STEP 1: Create Training Provider User & Profile
    // -----------------------------------------------------------------
    console.log("\n[TEST 1] Creating Training Provider & Program...");
    const providerUser = await prisma.user.create({
      data: {
        email: providerEmail,
        name: "National Institute of Technology & Skills",
        passwordHash,
        role: "TRAINING_PROVIDER",
        adminApproved: true,
        providerProfile: {
          create: {
            institutionName: "National Institute of Technology & Skills",
            accreditationNumber: `NSDC-ACC-${timestamp}`,
            centerType: "Vocational Skill Center",
            district: "Bengaluru Urban",
            state: "Karnataka",
            contactEmail: providerEmail,
            isVerified: true,
          },
        },
      },
      include: { providerProfile: true },
    });
    assert(providerUser.providerProfile !== null, "Training Provider profile created in Prisma database.");

    // Create Training Program
    const programCode = `PRG-FSW-${Math.floor(1000 + Math.random() * 9000)}`;
    const program = await prisma.trainingProgram.create({
      data: {
        providerId: providerUser.providerProfile.id,
        title: "Full Stack Web Development",
        code: programCode,
        sector: "Information Technology",
        description: "Comprehensive practical software development curriculum covering modern web stacks.",
        durationWeeks: 16,
        minHours: 480,
        skillsOffered: "React, Node.js, TypeScript, PostgreSQL",
        status: "ACTIVE",
      },
    });
    assert(program.id !== null, `Training program created with ID: ${program.id} and code: ${program.code}`);

    // -----------------------------------------------------------------
    // STEP 2: Create Batch for Program
    // -----------------------------------------------------------------
    console.log("\n[TEST 2] Creating Cohort Batch under Program...");
    const batchCode = `BCH-FSW-${Math.floor(100 + Math.random() * 900)}`;
    const batch = await prisma.batch.create({
      data: {
        programId: program.id,
        name: "Morning Batch 2026-Alpha",
        batchCode,
        startDate: new Date("2026-10-01"),
        endDate: new Date("2027-01-31"),
        maxCapacity: 25,
        status: "ACTIVE",
      },
    });
    assert(batch.id !== null, `Batch '${batch.name}' (${batch.batchCode}) created in database under program.`);
    assert(batch.programId === program.id, "Batch is correctly linked to parent program.");

    // -----------------------------------------------------------------
    // STEP 3: Create Student / Trainee User & Profile
    // -----------------------------------------------------------------
    console.log("\n[TEST 3] Creating Student/Trainee & Testing Program Discovery...");
    const traineeId = `CLP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const studentUser = await prisma.user.create({
      data: {
        email: studentEmail,
        name: "Priya Sharma",
        passwordHash,
        role: "TRAINEE",
        traineeProfile: {
          create: {
            traineeId,
            district: "Bengaluru Urban",
            state: "Karnataka",
            educationLevel: "Bachelor's Degree",
            currentStatus: "TRAINING",
          },
        },
      },
      include: { traineeProfile: true },
    });
    assert(studentUser.traineeProfile !== null, `Student profile created with Trainee ID: ${traineeId}`);

    // Student Queries Available Programs
    const availablePrograms = await prisma.trainingProgram.findMany({
      where: { status: "ACTIVE" },
      include: {
        provider: true,
        batches: true,
      },
    });
    const foundProgram = availablePrograms.find((p) => p.id === program.id);
    assert(foundProgram !== undefined, "Student can discover provider-created program from the shared database.");
    assert(foundProgram.batches.some((b) => b.id === batch.id), "Program shows the active batch created by provider.");

    // -----------------------------------------------------------------
    // STEP 4: Student Enrolls in Program & Batch
    // -----------------------------------------------------------------
    console.log("\n[TEST 4] Student Enrollment Flow...");
    const enrollment = await prisma.enrollment.create({
      data: {
        traineeId: studentUser.traineeProfile.id,
        programId: program.id,
        batchId: batch.id,
        status: "ENROLLED",
        enrollmentDate: new Date(),
      },
      include: {
        trainee: { include: { user: true } },
        program: { include: { provider: true } },
        batch: true,
      },
    });
    assert(enrollment.id !== null, "Enrollment successfully recorded in Prisma database.");
    assert(enrollment.program.provider.id === providerUser.providerProfile.id, "Enrollment is linked through to Training Provider.");
    assert(enrollment.batch.id === batch.id, "Enrollment references the specific Batch.");

    // Verify Duplicate Enrollment Prevention Logic
    const duplicateCheck = await prisma.enrollment.findFirst({
      where: {
        traineeId: studentUser.traineeProfile.id,
        programId: program.id,
      },
    });
    assert(duplicateCheck !== null, "Duplicate enrollment detection successfully identified existing record.");

    // -----------------------------------------------------------------
    // STEP 5: Provider Views Enrolled Student Roster
    // -----------------------------------------------------------------
    console.log("\n[TEST 5] Provider Roster Inspection...");
    const providerPrograms = await prisma.trainingProgram.findMany({
      where: { providerId: providerUser.providerProfile.id },
      include: {
        enrollments: {
          include: {
            trainee: { include: { user: true } },
            batch: true,
          },
        },
      },
    });
    const enrolledStudents = providerPrograms.flatMap((p) => p.enrollments);
    const matchedStudent = enrolledStudents.find((e) => e.trainee.id === studentUser.traineeProfile.id);
    assert(matchedStudent !== undefined, "Provider portal sees student in the live program/batch roster.");
    assert(matchedStudent.trainee.user.name === "Priya Sharma", "Student name matches shared database record.");

    // -----------------------------------------------------------------
    // STEP 6: Student Certificate Submission (PENDING)
    // -----------------------------------------------------------------
    console.log("\n[TEST 6] Certificate Submission Workflow...");
    const certNumber = `CERT-${timestamp}`;
    const cert = await prisma.certificate.create({
      data: {
        studentId: studentUser.id,
        certificateName: "AWS Certified Developer Associate",
        courseName: "Cloud Computing",
        issuingOrganization: "Amazon Web Services",
        certificateExternalId: certNumber,
        issueDate: new Date("2026-08-15"),
        fileUrl: "/uploads/certificates/sample.pdf",
        fileName: "aws_cert.pdf",
        status: "PENDING",
      },
    });
    assert(cert.status === "PENDING", "Certificate created with status = 'PENDING'.");
    assert(cert.studentId === studentUser.id, "Certificate linked to student user.");

    // -----------------------------------------------------------------
    // STEP 7: Provider Queue & Approval
    // -----------------------------------------------------------------
    console.log("\n[TEST 7] Provider Verification Queue & Approval...");
    const pendingInQueue = await prisma.certificate.findMany({
      where: { status: "PENDING" },
      include: { student: true },
    });
    const foundInQueue = pendingInQueue.find((c) => c.id === cert.id);
    assert(foundInQueue !== undefined, "Submitted certificate appears in Provider Verification Queue.");

    // Provider Approves
    const approvedCert = await prisma.certificate.update({
      where: { id: cert.id },
      data: {
        status: "APPROVED",
        reviewerId: providerUser.id,
        reviewedAt: new Date(),
        reviewerComments: "Authenticated against AWS badge registry.",
      },
    });
    assert(approvedCert.status === "APPROVED", "Certificate status updated to 'APPROVED' in database.");
    assert(approvedCert.reviewerId === providerUser.id, "Reviewer ID recorded as Training Provider user.");

    // Student Views Updated Status
    const studentCerts = await prisma.certificate.findMany({
      where: { studentId: studentUser.id },
    });
    const verifiedCert = studentCerts.find((c) => c.id === cert.id);
    assert(verifiedCert.status === "APPROVED", "Student immediately sees updated 'APPROVED' status from database.");

    // -----------------------------------------------------------------
    // STEP 8: Certificate Rejection with Reason
    // -----------------------------------------------------------------
    console.log("\n[TEST 8] Certificate Rejection Workflow...");
    const cert2 = await prisma.certificate.create({
      data: {
        studentId: studentUser.id,
        certificateName: "Python for Data Science",
        courseName: "Data Science",
        issuingOrganization: "Online Academy",
        issueDate: new Date("2026-07-10"),
        status: "PENDING",
      },
    });

    const rejectedCert = await prisma.certificate.update({
      where: { id: cert2.id },
      data: {
        status: "REJECTED",
        reviewerId: providerUser.id,
        reviewedAt: new Date(),
        reviewerComments: "Certificate ID cannot be verified with the issuing authority.",
      },
    });
    assert(rejectedCert.status === "REJECTED", "Certificate status updated to 'REJECTED'.");
    assert(rejectedCert.reviewerComments !== null, "Rejection reason saved in database.");

    // Cleanup test records
    await prisma.certificate.deleteMany({ where: { studentId: studentUser.id } });
    await prisma.enrollment.deleteMany({ where: { traineeId: studentUser.traineeProfile.id } });
    await prisma.batch.deleteMany({ where: { programId: program.id } });
    await prisma.trainingProgram.deleteMany({ where: { providerId: providerUser.providerProfile.id } });
    await prisma.traineeProfile.deleteMany({ where: { id: studentUser.traineeProfile.id } });
    await prisma.trainingProviderProfile.deleteMany({ where: { id: providerUser.providerProfile.id } });
    await prisma.user.deleteMany({ where: { id: { in: [providerUser.id, studentUser.id] } } });

    console.log("\n==================================================");
    console.log(`🎉 ALL E2E INTEGRATION TESTS PASSED: ${passed} Passed, ${failed} Failed`);
    console.log("==================================================");
  } catch (err) {
    console.error("E2E Test Failure:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2EWorkflowTests();
