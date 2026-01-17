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
import http from "http";

import { Server } from "socket.io";

const app = express();
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,        
    methods: ["GET", "POST"],
    credentials: true
  }
});

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
instance.orders.all();

app.post("/payment/process", async (req, res) => {
  try {
    const { amount, userId, email, items } = req.body;

    const options = {
      amount: Number(amount * 100),
      currency: "INR",
    };
    const order = await instance.orders.create(options);

    const UserOrders = new UserOrder({
      TotalAmount: amount,
      orderId: order.id,
      userId: userId,
      email: email,
      status: "Pending",
      orderNumber: uuidv4(),
    });
    await UserOrders.save();

    const OrderItem = new OrderItems({
      orderId: order.id,
      userId: userId,
      totalAmount: amount,
      items: items.map((item) => ({
        productId: item.product,
        quantity: item.quantity,
        price: item.price,
      })),
    });
    await OrderItem.save();

    res.status(200).send({
      success: true,
      order,
      userOrderId: UserOrders._id.toString(),
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "order creation failed" });
  }
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

    await UserOrder.findOneAndUpdate(
      { orderId: PaymentdB?.order_id || razorpay_order_id },
      { status: PaymentdB?.status }
    );

    const PaymentRecord = new Payment({
      paymentId: PaymentdB?.id || razorpay_payment_id,
      orderId: PaymentdB?.order_id || razorpay_order_id,
      amount: PaymentdB?.amount / 100,
      status: PaymentdB?.status,
      method: PaymentdB?.method,
      email: PaymentdB?.email,
    });
    await PaymentRecord.save();

    if (isAuthentic) {
      return res.redirect(
        `http://localhost:5173/paymentSuccess?reference=${razorpay_payment_id}`
      );
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
io.on('connection',(socket)=>{
  console.log('a user connected',socket.id)
})

 
server.listen(PORT);
