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
