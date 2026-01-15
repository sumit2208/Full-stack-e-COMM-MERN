import mongoose from "mongoose";

const userOrderSchema = new mongoose.Schema(
  {
    TotalAmount: { type: Number },
    orderId: { type: String },
    userId: { type: String },
    email: { type: String },
    orderNumber: {
      type: String,
    },
    status: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("UserOrders", userOrderSchema, "UserOrders");
