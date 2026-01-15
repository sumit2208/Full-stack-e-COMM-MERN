import OrderItems from "../Models/OrderItems.js";
import { Payment } from "../Models/Payment.js";
import UserOrder from "../Models/UserOrder.js";

export const Allorders = async (req, res) => {
  try {
    const result = await UserOrder.find();
    res.send({
      message: "All Orders Fetched",
      success: true,
      result,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).send({ message: "Internal Server Error", success: false });
  }
};

export const UserOrders = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.send({ message: "Missing email", success: false });
  }

  try {
    const result = await UserOrder.find({ userId: userId });
    if (result) {
      res.send({
        message: "Orders Fetched Successfully",
        success: true,
        result,
      });
    } else {
      res.send({
        message: "No Order Found with this ID",
        success: false,
      });
    }
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).send({ message: "Internal Server Error", success: false });
  }
};

export const DeleteOrder = async (req, res) => {
  const { UserId } = req.params;

  if (!UserId) {
    return res.send({ message: "Missing UserId parameter", success: false });
  }

  try {
    const result = await UserOrder.deleteOne({ UserId });
    if (result.deletedCount > 0) {
      res.status(200).send({
        message: "Order Deleted Successfully",
        success: true,
      });
    } else {
      res.status(404).send({
        message: "Order Not Found",
        success: false,
      });
    }
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send({ message: "Internal Server Error", success: false });
  }
};

export const UpdateOrder = async (req, res) => {
  const { UserId } = req.params;

  if (!UserId) {
    return res
      .status(400)
      .send({ message: "Missing UserId parameter", success: false });
  }

  try {
    const result = await UserOrder.updateOne({ UserId }, { $set: req.body });
    if (result.matchedCount > 0) {
      res.status(200).send({
        message: "Order Updated Successfully",
        success: true,
      });
    } else {
      res.status(404).send({
        message: "Order Not Found",
        success: false,
      });
    }
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).send({ message: "Internal Server Error", success: false });
  }
};

export const GetOrderDetailById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await Payment.findOne({ orderId: orderId });
    if (result) {
      res.status(200).send({
        result,
        message: "SuccessFully Fetch OrderDetils",
        success: true,
      });
    } else {
      res.status(400).send({
        message: "Not Fetch",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const GetOrderitembyId = async (req, res) => {
  try {
    const { orderid } = req.params;
    const result = await OrderItems.find({ orderId: orderid });
    if (result) {
      res.status(200).send({
        result,
        message: "SuccessFully Fetch OrderItem With OrderId",
        success: true,
      });
    } else {
      res.status(400).send({
        message: "Not Fetch",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
