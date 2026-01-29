import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    kycStatus: { type: String, default: "Pending" },
    role: { type: String, default: "CUSTOMER" },
    Image: { type: Schema.Types.ObjectId, ref: "Image" },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema, "users");
export default User;
