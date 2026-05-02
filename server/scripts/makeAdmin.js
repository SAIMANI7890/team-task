const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const readline = require("readline");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function makeAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Ask for email
    const email = await question("Enter user email to make admin: ");
    
    if (!email || !email.trim()) {
      console.log("❌ Email is required");
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    
    if (!user) {
      console.log(`\n❌ User not found with email: ${email}`);
      console.log("\n💡 Available users:");
      const allUsers = await User.find().select("email name role");
      allUsers.forEach((u) => {
        console.log(`   - ${u.email} (${u.name}) - Role: ${u.role}`);
      });
      process.exit(1);
    }

    // Check if already admin
    if (user.role === "admin") {
      console.log(`\n⚠️  User ${user.email} is already an admin!`);
      process.exit(0);
    }

    // Update to admin
    user.role = "admin";
    await user.save();

    console.log("\n" + "=".repeat(60));
    console.log("✅ SUCCESS! User is now an admin");
    console.log("=".repeat(60));
    console.log(`\nUser Details:`);
    console.log(`   Name:  ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role:  ${user.role}`);
    console.log(`\n🎯 This user can now:`);
    console.log(`   ✅ Create projects`);
    console.log(`   ✅ Delete projects`);
    console.log(`   ✅ Add team members`);
    console.log(`   ✅ See all projects`);
    console.log("\n" + "=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the script
makeAdmin();
