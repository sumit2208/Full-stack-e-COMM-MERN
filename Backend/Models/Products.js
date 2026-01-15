import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    stock: { type: String, required: true },
    imageUrl: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    DiscountAmount: { type: Number },
    DiscountedAmount: { type: Number },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
