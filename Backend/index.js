import express from "express";
import connectDB from "./db.js";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import { refreshAccessToken } from "./controller/userController.js";
import cookieParser from "cookie-parser";
import Razorpay from "razorpay";
import crypto from "crypto";
import { Payment } from "./Models/Payment.js";
import UserOrder from "./Models/UserOrder.js";
import { v4 as uuidv4 } from "uuid";
import OrderItems from "./Models/OrderItems.js";
const app = express();
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

app.post("/refresh", refreshAccessToken);
app.use(userRouter);
app.use(orderRoutes);
app.use(productRoutes);

await connectDB();

const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET_KEY,
});

app.post("/payment/process", async (req, res) => {
  const amt = req.body;
  const options = {
    amount: Number(amt.amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);
  res.status(200).send({
    success: true,
    order,
  });
});

app.get("/getkey", async (req, res) => {
  res.status(200).send({
    key: process.env.RAZORPAY_API_KEY,
  });
});

app.post("/paymentverification", async (req, res) => {
  try {
    console.log(req.body.payload?.payment?.entity);
    const PaymentdB = req.body.payload?.payment?.entity;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET_KEY)
      .update(body)
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      return res.redirect(
        `http://localhost:5173/paymentSuccess?reference=${razorpay_payment_id}`
      );
    }
    const yourOrderItems = JSON.parse(PaymentdB?.notes?.yourOrderItems)[0];

    const OrderItem = new OrderItems({
      orderId: PaymentdB?.order_id,
      price: yourOrderItems?.price,
      productId: yourOrderItems?.product,
      quantity: yourOrderItems?.quantity,
    });
    await OrderItem.save();

    const UserOrders = new UserOrder({
      TotalAmount: PaymentdB?.amount / 100,
      orderId: PaymentdB?.order_id,
      email: PaymentdB?.email,
      userId: PaymentdB?.notes?.userId,
      status:PaymentdB?.status,
      orderNumber: uuidv4(),
    });

    const result2 = await UserOrders.save();
    if (result2) {
      res.status(201).send({
        message: " Successfully",
        success: true,
      });
    } else {
      res.status(401).send({
        message: "Something went Wrong",
        success: false,
      });
    }

    const Paymemt = new Payment({
      paymentId: PaymentdB?.id,
      orderId: PaymentdB?.order_id,
      amount: PaymentdB?.amount / 100,
      status: PaymentdB?.status,
      method: PaymentdB?.method,
      email: PaymentdB?.email,
    });

    const result = await Paymemt.save();
    if (result) {
      res.status(201).send({
        message: " Successfully",
        success: true,
      });
    } else {
      res.status(401).send({
        message: "Something went Wrong",
        success: false,
      });
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).send({
      success: false,
      message: "Server error during verification",
    });
  }
});

const PORT = process.env.PORT || 1111;
app.listen(PORT);
