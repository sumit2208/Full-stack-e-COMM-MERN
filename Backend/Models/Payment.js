import mongoose, { Schema } from "mongoose";

const paymentSchema = new mongoose.Schema({
  paymentId: String,
  orderId: String, 
  amount: Number,
  status: String,
  method: String,
  email: String,
  createdAt: { type: Date, default: Date.now },
});

export const Payment = mongoose.model("Payment", paymentSchema);
