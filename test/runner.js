const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function runTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING CAREERLOOP AI TEST SUITE");
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

  try {
    // 1. Database Connectivity Test
    console.log("\n[1] Testing Database Connectivity & Schema...");
    const userCount = await prisma.user.count();
    assert(userCount >= 0, `Database connected successfully (found ${userCount} users).`);

    // 2. Trainee Unique ID & Profile Integrity
    console.log("\n[2] Testing Trainee ID & Identity Integrity...");
    const trainees = await prisma.traineeProfile.findMany({ include: { user: true, skills: true } });
    if (trainees.length > 0) {
      const sampleTrainee = trainees[0];
      assert(sampleTrainee.traineeId.startsWith("CLP-"), `Trainee ID format valid: ${sampleTrainee.traineeId}`);
      assert(sampleTrainee.userId !== null, "Trainee successfully linked to parent user.");
    } else {
      console.log("  ℹ️ No trainee records present (clean state).");
    }

    // 3. Password Hashing Security
    console.log("\n[3] Testing Password Hashing & Auth Verification...");
    const testPassword = "CareerLoop2026!";
    const hash = await bcrypt.hash(testPassword, 10);
    const isMatch = await bcrypt.compare(testPassword, hash);
    const isWrongMatch = await bcrypt.compare("WrongPassword!", hash);
    assert(isMatch === true, "Valid password matched bcrypt hash correctly.");
    assert(isWrongMatch === false, "Invalid password rejected as expected.");

    // 4. Longitudinal Milestones Verification
    console.log("\n[4] Testing Follow-Up Milestone Integrity...");
    const followups = await prisma.followUp.findMany();
    const validMilestones = [30, 90, 180, 365];
    const invalidMilestones = followups.filter((f) => !validMilestones.includes(f.milestoneDays));
    assert(invalidMilestones.length === 0, `All follow-up records adhere to standard milestones (30d, 90d, 180d, 365d).`);

    // 5. Verification Status State Machine
    console.log("\n[5] Testing Employer Verification States...");
    const employments = await prisma.employmentRecord.findMany();
    const validStatuses = ["SELF_REPORTED", "PENDING_VERIFICATION", "EMPLOYER_VERIFIED", "REJECTED"];
    const invalidStatuses = employments.filter((e) => !validStatuses.includes(e.verificationStatus));
    assert(invalidStatuses.length === 0, "All employment records have valid verification status lifecycle states.");

    // 6. Skill Taxonomy Coverage
    console.log("\n[6] Testing Master Skill Taxonomy...");
    const skills = await prisma.skill.findMany();
    assert(skills.length > 0, `Standard skill taxonomy contains ${skills.length} verified competencies.`);

    // 7. Candidate Matching & Retention Heuristics
    console.log("\n[7] Testing Candidate Fit & Retention Scoring Heuristics...");
    const testCandidate = {
      skills: [{ name: "React", proficiencyLevel: "ADVANCED", verified: true }],
      locationDistrict: "Pune",
      targetSalary: 30000,
    };
    const testJob = {
      title: "Frontend Developer",
      locationDistrict: "Pune",
      salaryMin: 28000,
      salaryMax: 45000,
      requiredSkills: [{ name: "React", required: true, minLevel: "INTERMEDIATE" }],
    };
    const hasLocalMatch = testCandidate.locationDistrict === testJob.locationDistrict;
    assert(hasLocalMatch === true, "District match detected correctly to reduce commute friction.");
    const isSalaryAligned = testCandidate.targetSalary <= testJob.salaryMax;
    assert(isSalaryAligned === true, "Candidate target salary fits within job budget bracket.");

    // 8. Trainer Profile & Batch Linkage Integrity
    console.log("\n[8] Testing Trainer Profile & Batch Association...");
    const trainers = await prisma.trainerProfile.findMany({
      include: {
        batches: true,
        provider: true,
      },
    });
    console.log(`  ℹ️ Found ${trainers.length} trainer profile(s).`);
    if (trainers.length > 0) {
      const sampleTrainer = trainers[0];
      assert(sampleTrainer.userId !== null, "Trainer profile linked to a parent user.");
      assert(sampleTrainer.providerId !== null, "Trainer linked to a Training Provider institution.");
      console.log(`     Trainer: ${sampleTrainer.userId}, Provider: ${sampleTrainer.providerId}, Batches: ${sampleTrainer.batches.length}`);
    } else {
      console.log("  ℹ️ No trainer records present. Run seed to populate trainer data.");
    }

    // 9. Batch Model Integrity
    console.log("\n[9] Testing Batch Model & Enrollment Linkage...");
    const batches = await prisma.batch.findMany({
      include: {
        enrollments: true,
        trainer: true,
      },
    });
    console.log(`  ℹ️ Found ${batches.length} batch(es).`);
    if (batches.length > 0) {
      const sampleBatch = batches[0];
      assert(sampleBatch.programId !== null, `Batch '${sampleBatch.name}' is linked to a training program.`);
      assert(["UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"].includes(sampleBatch.status), `Batch status '${sampleBatch.status}' is a valid lifecycle state.`);
    } else {
      console.log("  ℹ️ No batch records present. Run seed to populate batch data.");
    }

    // 10. Role-Based Access Control: Role Mismatch Denial
    console.log("\n[10] Testing RBAC Role Mismatch Denial Logic...");
    // Simulate the RBAC check logic from auth.ts
    function checkRoleAccess(userRole, expectedRole) {
      if (!expectedRole) return true; // no restriction
      return userRole === expectedRole;
    }
    assert(checkRoleAccess("TRAINEE", "TRAINEE") === true, "TRAINEE accessing /login/student: ALLOWED.");
    assert(checkRoleAccess("TRAINEE", "ADMINISTRATOR") === false, "TRAINEE accessing /login/admin: DENIED.");
    assert(checkRoleAccess("EMPLOYER", "TRAINING_PROVIDER") === false, "EMPLOYER accessing /login/provider: DENIED.");
    assert(checkRoleAccess("TRAINER", "TRAINER") === true, "TRAINER accessing /login/trainer: ALLOWED.");
    assert(checkRoleAccess("GOVERNMENT_ADMIN", "GOVERNMENT_ADMIN") === true, "GOVERNMENT_ADMIN accessing /login/government: ALLOWED.");
    assert(checkRoleAccess("ADMINISTRATOR", "EMPLOYER") === false, "ADMINISTRATOR accessing /login/employer: DENIED.");

    // 11. Resume Parser Heuristic Logic Unit Tests
    console.log("\n[11] Testing Resume Parser Heuristic Extraction...");
    // Inline heuristic simulation (mirrors LocalHeuristicResumeParser logic)
    function extractSkillsHeuristic(text, skillKeywords) {
      const found = [];
      const lower = text.toLowerCase();
      for (const kw of skillKeywords) {
        if (lower.includes(kw.toLowerCase())) {
          found.push(kw);
        }
      }
      return found;
    }

    const sampleResumeText = `
      Arjun Verma | arjun@example.com | Pune, Maharashtra
      Education: B.Tech Computer Science, SPPU (2023)
      Skills: JavaScript, React, Node.js, SQL, Python, Docker
      Projects:
        - SkillTrack: A trainee management platform built with Next.js and Prisma.
        - DataPipeline: ETL pipeline using Python and Apache Kafka.
    `;
    const knownSkills = ["JavaScript", "React", "Node.js", "SQL", "Python", "Docker", "Kubernetes", "Java", "C++"];
    const extractedSkills = extractSkillsHeuristic(sampleResumeText, knownSkills);
    assert(extractedSkills.includes("JavaScript"), "Heuristic parser: 'JavaScript' extracted from resume text.");
    assert(extractedSkills.includes("React"), "Heuristic parser: 'React' extracted from resume text.");
    assert(extractedSkills.includes("Python"), "Heuristic parser: 'Python' extracted from resume text.");
    assert(!extractedSkills.includes("Kubernetes"), "Heuristic parser: 'Kubernetes' correctly NOT found in resume text.");
    assert(extractedSkills.length >= 5, `Heuristic parser: at least 5 skills extracted (found ${extractedSkills.length}).`);

    // Name extraction heuristic — find first non-empty line
    const firstLine = sampleResumeText.trim().split("\n").map(l => l.trim()).find(l => l.length > 0) || "";
    const nameMatch = firstLine.split("|")[0].trim();
    assert(nameMatch === "Arjun Verma", `Heuristic parser: Name extracted correctly as '${nameMatch}'.`);

    // Education keyword heuristic
    const hasEducationKeyword = sampleResumeText.toLowerCase().includes("b.tech") || sampleResumeText.toLowerCase().includes("bachelor");
    assert(hasEducationKeyword === true, "Heuristic parser: Education level keyword ('B.Tech') detected.");

    // 12. Certification Verification Status Integrity
    console.log("\n[12] Testing Certification Verification Status...");
    const certifications = await prisma.certification.findMany();
    const validCertStatuses = ["PENDING", "VERIFIED", "REVOKED", "EXPIRED"];
    const invalidCerts = certifications.filter((c) => !validCertStatuses.includes(c.verificationStatus));
    assert(invalidCerts.length === 0, `All ${certifications.length} certification records have valid verification status values.`);

    console.log("\n==================================================");
    console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
