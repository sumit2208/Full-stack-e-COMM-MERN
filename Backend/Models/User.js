import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    kycStatus: { type: String, default: "Pending" },
    role: { type: String, default: "CUSTOMER" },
  },
  { timestamps: true },
);

const User = mongoose.model("users", userSchema, "users");
export default User;
