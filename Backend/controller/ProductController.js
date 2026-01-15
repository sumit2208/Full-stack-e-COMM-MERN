import mongoose from "mongoose";
import Cart from "../Models/Cart.js";
import Product from "../Models/Products.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.send({
      message: "Products fetched successfully",
      success: true,
      result: products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const CreateProduct = async (req, res) => {
  try {
    const data = req.body;
    const product = new Product({
      name: data.name,
      stock: data.stock,
      imageUrl: "jkksbddssdkldkcks",
      isDeleted: false,
      category: data.category,
      description: data.description,
      price: data.price,
      DiscountAmount: data.DiscountAmount,
      DiscountedAmount: data.DiscountedAmount,
    });
    const result = await product.save();
    res.status(201).send({
      message: "Product Created Successfully",
      success: true,
      result,
    });
  } catch (error) {
    res.status(500).send({
      message: "Failed to create product",
      success: false,
      error: error.message,
    });
  }
};

export const DeleteProduct = async (req, res) => {
  try {
    const result = await Product.deleteOne({ _id: req.params._id });
    if (result.deletedCount)
      return res.send({
        message: "Product Deleted Successfully",
        success: true,
      });
    res.status(404).send({
      message: "Product Not Found",
      success: false,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const Updateproduct = async (req, res) => {
  try {
    const result = await Product.updateOne(
      { _id: req.params._id },
      { $set: req.body }
    );
    if (result.matchedCount)
      return res.send({
        message: "Product Updated Successfully",
        success: true,
      });
    res.status(404).send({
      message: "Product Not Found",
      success: false,
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      success: false,
    });
  }
};

export const AddtoCart = async (req, res) => {
  try {
    const { user, productId } = req.body;

    if (!user || !productId) {
      return res.status(400).json({ error: "User and productId are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(user) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ error: "Invalid ObjectId format" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found " });
    }

    const cartItem = new Cart({ user, productId });
    await cartItem.save();

    const populatedItem = await Cart.findById(cartItem._id).populate(
      "productId"
    );

    res.status(201).json({
      message: "Item added to cart",
      data: populatedItem,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const GetCart = async (req, res) => {
  try {
    const { _id } = req.params;

    if (!_id) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const cartItems = await Cart.find({ user: _id }).populate(
      "productId",
      "name stock price category imageUrl description DiscountAmount  DiscountedAmount"
    );

    res.status(200).json({
      count: cartItems.length,
      data: cartItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const UpdateQuantity = async (req, res) => {
  try {
    const { productid } = req.params;
    const { quantity } = req.body;

    if (!productid) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const updatedCartItem = await Cart.findOneAndUpdate(
      {
        _id: productid,
      },
      {
        $set: { quantity: Number(quantity) },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCartItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quantity updated successfully",
      data: updatedCartItem,
    });
  } catch (error) {
    console.error("Update quantity error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const RemoveCartItem = async (req, res) => {
  const { _id } = req.params;
  if (!_id) {
    return res.status(400).json({
      success: false,
      message: "Product ID is required",
    });
  }
  try {
    const result = await Cart.findByIdAndDelete({ _id: _id });
    if (result) {
      res.status(200).send({ message: "Cart Item delete", success: true });
    } else {
      res
        .status(400)
        .send({ message: "cart Item not Deleted", success: false });
    }
  } catch (error) {}
};
