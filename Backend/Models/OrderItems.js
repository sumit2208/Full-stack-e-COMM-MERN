import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: { type: String },
  price: { type: String },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      price: { type: Number },
    },
  ],
  quantity: { type: String },
});

export default mongoose.model("Order", orderSchema, "OrderItems");
