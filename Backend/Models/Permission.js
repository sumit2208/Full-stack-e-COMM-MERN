import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String },
  active: { type: Boolean, default: true },
  order: { type: Number },
});

export default mongoose.model("User", userSchema);
