const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Project = require("../models/Project");

async function setupDemo() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB\n");

    // Create Admin User
    console.log("Creating Admin User...");
    const adminEmail = "admin@taskmanager.com";
    
    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log("⚠️  Admin already exists");
    } else {
      admin = await User.create({
        name: "Admin User",
        email: adminEmail,
        password: "Admin@123",
        role: "admin",
      });
      console.log("✅ Admin user created");
    }

    // Create Member User
    console.log("\nCreating Member User...");
    const memberEmail = "member@taskmanager.com";
    
    let member = await User.findOne({ email: memberEmail });
    if (member) {
      console.log("⚠️  Member already exists");
    } else {
      member = await User.create({
        name: "Team Member",
        email: memberEmail,
        password: "Member@123",
        role: "member",
      });
      console.log("✅ Member user created");
    }

    // Create Sample Project
    console.log("\nCreating Sample Project...");
    const existingProject = await Project.findOne({ name: "Website Redesign" });
    
    if (existingProject) {
      console.log("⚠️  Sample project already exists");
    } else {
      const project = await Project.create({
        name: "Website Redesign",
        description: "Redesign company website with modern UI/UX",
        createdBy: admin._id,
        teamMembers: [member._id],
      });
      console.log("✅ Sample project created");
      console.log(`   Project ID: ${project._id}`);
    }

    // Create another project
    console.log("\nCreating Another Project...");
    const existingProject2 = await Project.findOne({ name: "Mobile App Development" });
    
    if (existingProject2) {
      console.log("⚠️  Mobile app project already exists");
    } else {
      const project2 = await Project.create({
        name: "Mobile App Development",
        description: "Build iOS and Android mobile application",
        createdBy: admin._id,
        teamMembers: [admin._id, member._id],
      });
      console.log("✅ Mobile app project created");
      console.log(`   Project ID: ${project2._id}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 DEMO SETUP COMPLETE!");
    console.log("=".repeat(60));
    
    console.log("\n📋 LOGIN CREDENTIALS:\n");
    
    console.log("👑 ADMIN USER (Can create projects):");
    console.log("   Email:    admin@taskmanager.com");
    console.log("   Password: Admin@123");
    console.log("   Role:     admin");
    
    console.log("\n👤 MEMBER USER (Cannot create projects):");
    console.log("   Email:    member@taskmanager.com");
    console.log("   Password: Member@123");
    console.log("   Role:     member");
    
    console.log("\n📁 PROJECTS CREATED:");
    console.log("   1. Website Redesign");
    console.log("   2. Mobile App Development");
    
    console.log("\n🎯 NEXT STEPS:");
    console.log("   1. Logout from current account");
    console.log("   2. Login as admin@taskmanager.com");
    console.log("   3. You can now create projects!");
    console.log("   4. You can assign tasks to team members");
    
    console.log("\n" + "=".repeat(60) + "\n");

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error setting up demo:", error.message);
    process.exit(1);
  }
}

// Run the script
setupDemo();
