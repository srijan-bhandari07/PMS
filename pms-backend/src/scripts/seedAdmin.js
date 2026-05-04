const mongoose = require("mongoose");
const { MONGO_ADMIN_URI } = require("../config/env");

async function seedAdmin() {
  try {
    await mongoose.connect(MONGO_ADMIN_URI);

    const userSchema = new mongoose.Schema(
      {
        name: String,
        email: { type: String, unique: true, lowercase: true },
        password: String,
        role: String,
        active: Boolean,
        accessibleMachines: [Number],
      },
      { timestamps: true }
    );

    const User = mongoose.models.User || mongoose.model("User", userSchema, "users");

    const existing = await User.findOne({ email: "admin@gmail.com" });
    if (existing) {
      console.log("Admin already exists");
      process.exit(0);
    }

    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: "admin",
      role: "admin",
      active: true,
      accessibleMachines: [1, 2, 3, 4, 5, 6, 7, 8],
    });

    console.log("✅ Admin user created");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed admin:", error.message);
    process.exit(1);
  }
}

seedAdmin();