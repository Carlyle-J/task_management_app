// Command: node scripts/seed.js

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const uri = process.env.MONGODB_URI;
async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const db = client.db("tododb");
    const users = db.collection("users");

    // Remove the old plain-text User account if it exists
    await users.deleteOne({ username: "User" });
    console.log("Removed old User account (if it existed)");

    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash("12345", 10);

    // Create the default admin user with hashed password
    await users.insertOne({
      username: "User",
      email: "user@todoapp.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date().toISOString(),
    });

    console.log('Default admin user created:');
    console.log('Username: User');
    console.log('Password: 12345');
    console.log('Role: admin');
    console.log('Password is now hashed with bcrypt');
  } catch (error) {
    console.error("Seed failed:", error.message);
  } finally {
    await client.close();
  }
}

seed();
