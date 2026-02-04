import express, { Router } from "express";
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
import multer from "multer";
import path from "path";
import mongoose, { Schema } from "mongoose";
import { fileURLToPath } from "url";
import { Image } from "./Models/Image.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  // group chat

  socket.on("GroupChat", async (data) => {
    const { name, participants, type = "group", Admin } = data;

    try {
      await Conversation.create({
        name: name,
        type,
        participants: participants,
        Admin: Admin,
      });
    } catch (error) {
      console.error("Create Group Chat   Error:", error);
    }
  });

  // Edit chat

  socket.on("EditChat", async (data) => {
    const { msg, msg_id, SenderId, userId, conId } = data;

    if (SenderId !== userId) {
    }
    try {
      await Message.findByIdAndUpdate(
        { _id: msg_id },
        { message: msg, isEdited: true },
      );
      socket.to(conId).emit("MessageEdit", { NewText: msg, messageid: msg_id });
    } catch (error) {
      console.error("Error:", error);
    }
  });

  //delete

  socket.on("deleteMessage", async ({ messageId }) => {
    try {
      const msg = await Message.findOne({ _id: messageId });

      if (!msg) {
        return socket.emit("error", { msg: "Not found or not yours" });
      }
      await Message.updateOne({ _id: messageId }, { isDeleted: true });
      socket.to(msg.conversationId.toString()).emit("messageDeleted", {
        MesId: messageId,
      });
    } catch (err) {
      console.error("deleteMessage error:", err);
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

      socket.to(conversationId).emit("messagereceived", payload);
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
      const now = new Date();
      const conversation = await Conversation.findById(conversationId);

      if (!conversation) return;

      let userEntry = conversation.unreadCounts.find(
        (e) => e.user.toString() === socket.user.id,
      );

      if (userEntry) {
        userEntry.count = 0;
        userEntry.lastReadAt = now;
      } else {
        conversation.unreadCounts.push({
          user: socket.user.id,
          count: 0,
          lastReadAt: now,
        });
      }

      await conversation.save();

      io.to(socket.user.id).emit("unreadCountUpdated", {
        conversationId,
        count: 0,
        userId: socket.user.id,
      });
    } catch (err) {
      console.error("markMessagesRead error:", err);
    }
  });
});

// Image Upload Function

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.post("/uploads", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(401).json({ message: "No File Uploaded" });
  const newImage = new Image({
    name: req.file.originalname,
    path: req.file.filename,
    UserId: req.body._id,
  });
  await newImage.save();
});

app.get("/getprofileimage/:_id", async (req, res) => {
  const _id = req.params;
  const result = await Image.findOne({ UserId: _id }).populate({
    path: "UserId",
    select: "name",
  });
  if (result) {
    res.status(200).json({
      result,
      messsage: "Succesfully Fetch ProfileImage",
      success: true,
    });
  } else {
    res.status(500).json({ success: false, message: "error.message" });
  }
});

// End Image Upload Function

app.get("/getlastread/:myId/:selectedConvId", async (req, res) => {
  try {
    const { myId, selectedConvId } = req.params;

    const conversation = await Conversation.findById(selectedConvId)
      .select("unreadCounts")
      .lean();

    if (!conversation) {
      return res.json({
        lastReadTimestamp: null,
        lastReadMessageId: null,
      });
    }

    const userUnreadEntry = conversation.unreadCounts?.find(
      (entry) => entry.user.toString() === myId,
    );

    const lastReadAt = userUnreadEntry?.lastReadAt;

    if (!lastReadAt) {
      return res.json({
        lastReadTimestamp: null,
        lastReadMessageId: null,
      });
    }

    const lastReadMessage = await Message.findOne({
      conversationId: new mongoose.Types.ObjectId(selectedConvId),
      createdAt: { $lte: lastReadAt },
    })
      .sort({ createdAt: -1 })
      .select("createdAt _id")
      .lean();

    if (lastReadMessage) {
      return res.json({
        lastReadTimestamp: lastReadAt.toISOString(),
        lastReadMessageId: lastReadMessage._id.toString(),
      });
    }

    return res.json({
      lastReadTimestamp: lastReadAt.toISOString(),
      lastReadMessageId: null,
    });
  } catch (error) {
    console.error("Get last read error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.patch("/chats/add-user", async (req, res) => {
  const { conversationId, userId } = req.body;

  const conversation = await Conversation.findById(conversationId);
  conversation.participants.push(userId);
  await conversation.save();

  io.to(conversationId).emit("group-update", {
    type: "user-added",
    conversationId,
    userId,
    timestamp: new Date(),
  });

  res.json({ message: "User added" });
});

app.patch("/chats/remove-user", async (req, res) => {
  const { conversationId, userId } = req.body;

  const conversation = await Conversation.findById(conversationId);
  conversation.participants.pull(userId);
  await conversation.save();

  io.to(conversationId).emit("group-update", {
    type: "user-remove",
    conversationId,
    userId,
    timestamp: new Date(),
  });

  res.json({ message: "User Remove" });
});

app.get("/chats/getmessage/:convId/msg", async (req, res) => {
  const { convId } = req.params;
  const { page = 1, limit = 20, since } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  try {
    const query = {
      conversationId: new mongoose.Types.ObjectId(convId),
    };

    let sort = { createdAt: -1 };  
 
    if (since) {
      let sinceDate = null;
 
      if (mongoose.isValidObjectId(since)) {
        const anchor = await Message.findById(since).select("createdAt").lean();
        if (anchor) {
          sinceDate = anchor.createdAt;
          console.log(`since=messageId → using createdAt: ${sinceDate.toISOString()}`);
        }
      } 
      else {
        sinceDate = new Date(since);
        if (!isNaN(sinceDate.getTime())) {
          console.log(`since=timestamp → using: ${sinceDate.toISOString()}`);
        } else {
          console.warn(`Invalid since format: ${since}`);
        }
      }

      if (sinceDate) {
        query.createdAt = { $gt: sinceDate };
      }
    }
 
    const messages = await Message.find(query)
      .sort(sort)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();
 
    const messagesForClient = messages.reverse();

    const hasMore = messages.length === limitNum;
 
    const total = await Message.countDocuments({ conversationId: new mongoose.Types.ObjectId(convId) });

    console.log(`getmessage → conv:${convId} | page:${pageNum} | limit:${limitNum} | since:${since || 'none'} | returned:${messagesForClient.length} msgs`);

    res.json({
      messages: messagesForClient,
      hasMore,
      total,
      page: pageNum,
    });
  } catch (err) {
    console.error("getmessage error:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

server.listen(PORT);
