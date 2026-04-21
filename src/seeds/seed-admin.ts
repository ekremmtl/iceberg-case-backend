import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    fullName: String,
    email: { type: String, lowercase: true, unique: true },
    passwordHash: String,
    role: { type: String, default: "admin" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const UserModel = (mongoose.models["User"] ||
    mongoose.model("User", UserSchema)) as mongoose.Model<any>;

  const email = process.env.SEED_ADMIN_EMAIL.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const fullName = process.env.SEED_ADMIN_FULLNAME;

  const existing = await UserModel.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await UserModel.create({ fullName, email, passwordHash, role: "admin" });
  console.log(`Admin created successfully`);
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);

  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
