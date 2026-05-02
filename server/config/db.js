const mongoose = require("mongoose");

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is required in environment");
  }

  mongoose.set("strictQuery", true);

  // Connection options to handle SSL/TLS issues
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  await mongoose.connect(mongoUri, options);

  // eslint-disable-next-line no-console
  console.log(`MongoDB connected: ${mongoose.connection.host}`);
}

module.exports = { connectDB };
