const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");

async function createAdmin() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Admin user details
    const adminData = {
      name: "Admin User",
      email: "admin@taskmanager.com",
      password: "Admin@123",
      role: "admin",
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log(`Admin user already exists with email: ${adminData.email}`);
      console.log("If you want to create a new admin, use a different email.");
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create(adminData);
    console.log("\n✅ Admin user created successfully!");
    console.log("\nAdmin Credentials:");
    console.log("==================");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${adminData.password}`);
    console.log(`Role: ${admin.role}`);
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error.message);
    process.exit(1);
  }
}

// Run the script
createAdmin();
