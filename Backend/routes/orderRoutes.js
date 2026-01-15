import express from "express";
import {
  Allorders,
  DeleteOrder,
  GetOrderDetailById,
  GetOrderitembyId,
  UpdateOrder,
  UserOrders,
} from "../controller/OrdersController.js";
import { authenticate } from "../middleware/ValidateUser.js";

const router = express.Router();

router.get("/allorderget", authenticate, Allorders);
router.get("/userorder/:userId", authenticate, UserOrders);
router.patch("/updateorder/:UserId", authenticate, UpdateOrder);
router.delete("/deleteorder/:UserId", authenticate, DeleteOrder);

router.get("/orderdetailbyid/:orderId", authenticate, GetOrderDetailById);

router.get("/orderitem/:orderid", authenticate, GetOrderitembyId);

export default router;
