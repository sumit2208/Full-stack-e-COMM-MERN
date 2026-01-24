import express from "express";
import connectDB from "./db.js";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import ChatRoutes from "./routes/ChatRoutes.js";
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
import Message from "./Models/Message.js";
import Conversation from "./Models/Conversation.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.post("/refresh", refreshAccessToken);
app.use(userRouter);
app.use(orderRoutes);
app.use(productRoutes);
app.use(ChatRoutes);

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
      { status: PaymentdB?.status },
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
        `http://localhost:5173/paymentSuccess?reference=${razorpay_payment_id}`,
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

io.use((socket, next) => {
  const userId = socket.handshake.auth?.userId;
  if (!userId) {
    return next(new Error("Authentication error - no userId is there"));
  }
  socket.user = { id: userId };
  next();
});

io.on("connection", (socket) => {
  socket.on("setup", (userId) => {
    socket.join(userId);
    console.log(userId);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined The Room :" + room);
  });

  // group chat

  socket.on("GroupChat", async (data) => {
    const { name, participants, type = "group" } = data;

    try {
      await Conversation.create({
        name: name,
        type,
        participants: participants,
      });
    } catch (error) {
      console.error("Create Group Chat   Error:", error);
    }
  });

  // Edit chat

  socket.on("EditChat", async (data) => {
    const { msg, msg_id, SenderId, userId } = data;

    if (SenderId !== userId) {
    }
    try {
      await Message.findByIdAndUpdate(
        { _id: msg_id },
        { message: msg, isEdited: true },
      );
    } catch (error) {
      console.error("Error:", error);
    }
  });

  // send
  socket.on("sendMessage", async (data) => {
    const { conversationId, message, type = "text" } = data;

    if (!conversationId || !message?.trim()) {
      socket.emit("error", { message: "Missing data" });
      return;
    }

    try {
      const newMsg = await Message.create({
        SenderId: socket.user.id,
        conversationId,
        message,
        type,
      });

      const payload = {
        _id: newMsg._id.toString(),
        SenderId: socket.user.id,
        conversationId: conversationId,
        message: newMsg.message,
        type: newMsg.type,
        createdAt: new Date().toISOString(),
      };

      const conversation = await Conversation.findById(conversationId).select(
        "participants unreadCounts",
      );

      if (conversation) {
        const receivers = conversation.participants.filter(
          (p) => p.toString() !== socket.user.id,
        );

        if (receivers.length > 0) {
          for (const receiverId of receivers) {
            const receiverStr = receiverId.toString();

            const existingIndex = conversation.unreadCounts.findIndex(
              (entry) => entry.user.toString() === receiverStr,
            );

            if (existingIndex >= 0) {
              conversation.unreadCounts[existingIndex].count += 1;
            } else {
              conversation.unreadCounts.push({
                user: receiverId,
                count: 1,
              });
            }

            const countEntry = conversation.unreadCounts.find(
              (entry) => entry.user.toString() === receiverStr,
            );

            if (countEntry) {
              io.to(receiverStr).emit("unreadCountUpdated", {
                conversationId,
                count: countEntry.count,
                userId: receiverStr,
              });
            }
          }
          await conversation.save();
        }
      }

      io.to(conversationId).emit("messagereceived", payload);
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  });

  // start typing
  socket.on("startTyping", ({ conversationId }) => {
    if (!conversationId) return console.log("error");

    socket.to(conversationId).emit("startTyping", {
      userId: socket.user?.id,
      conversationId,
    });
  });

  // stop typing
  socket.on("stopTyping", ({ conversationId }) => {
    if (!conversationId) return console.log("error");
    socket.to(conversationId).emit("stopTyping", {
      userId: socket.user?.id,
      conversationId,
    });
  });

  // MessageReadMark
  socket.on("markMessagesRead", async ({ conversationId }) => {
    if (!conversationId) return;

    try {
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) return;

      const userUnreadIndex = conversation.unreadCounts.findIndex(
        (entry) => entry.user.toString() === socket.user.id,
      );

      if (userUnreadIndex >= 0) {
        conversation.unreadCounts[userUnreadIndex].count = 0;

        io.to(socket.user.id).emit("unreadCountUpdated", {
          conversationId,
          count: 0,
          userId: socket.user.id,
        });

        await conversation.save();
      }

      const unreadMessages = await Message.find({
        conversationId,
        SenderId: { $ne: socket.user.id },
        "Read_User.user": { $ne: socket.user.id },
      }).select("_id SenderId");

      if (unreadMessages.length === 0) return;

      await Message.updateMany(
        {
          _id: { $in: unreadMessages.map((m) => m._id) },
          "Read_User.user": { $ne: socket.user.id },
        },
        {
          $push: {
            Read_User: {
              user: socket.user.id,
              readAt: new Date(),
            },
          },
        },
      );

      const readMessageIds = unreadMessages.map((m) => m._id.toString());

      socket.to(conversationId).emit("messagesRead", {
        conversationId,
        readerId: socket.user.id,
        messageIds: readMessageIds,
      });
    } catch (err) {
      console.error("markMessagesRead error:", err);
    }
  });

  //delete
  socket.on(
    "deleteMessage",
    async ({ messageId, deleteForEveryone = true }) => {
      try {
        const msg = await Message.findOne({
          _id: messageId,
          SenderId: socket.user.id,
        });

        if (!msg)
          return socket.emit("error", { msg: "Not found or not yours" });

        if (deleteForEveryone) {
          await Message.updateOne({ _id: messageId }, { isDeleted: true });
          io.to(`conversation:${msg.conversationId}`).emit("messageDeleted", {
            messageId,
            deletedBy: socket.user.id,
            deleteForEveryone: true,
          });
        } else {
          socket.emit("messageDeleted", {
            messageId,
            deleteForEveryone: false,
          });
        }
      } catch (err) {
        console.error("deleteMessage error:", err);
      }
    },
  );
});

server.listen(PORT);
