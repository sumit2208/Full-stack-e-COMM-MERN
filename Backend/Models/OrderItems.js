import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String },
  price: { type: String },
  productId: { type: String },
  quantity: { type: String },
});

export default mongoose.model("Order", orderSchema, "OrderItems");
