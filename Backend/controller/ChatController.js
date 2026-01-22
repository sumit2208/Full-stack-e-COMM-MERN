import Conversation from "./../Models/Conversation.js";
import User from "./../Models/User.js";
import Message from "./../Models/Message.js";
import mongoose from "mongoose";

export const getUserConversations = async (req, res) => {
  try {
    const { CUserId } = req.params;
    if (!CUserId) {
      res.status(400).send({
        message: "userId Not Found",
      });
    }

    const conversations = await Conversation.find({
      participants: CUserId,
    });

    const NewConversations = await Promise.all(
      conversations.map(async (conv) => {
        let userDetail = null;

        if (conv.type === "single") {
          const otherUserId = conv.participants.find(
            (id) => id.toString() !== CUserId.toString(),
          );

          if (otherUserId) {
            const otherUser = await User.findById(otherUserId)
              .select("name email")
              .lean();

            if (otherUser) {
              userDetail = {
                name: otherUser.name,
              };
            }
          }
        } else {
          userDetail = {
            name: conv.name || "Group Chat",
          };
        }

        return {
          conversationId: conv._id.toString(),
          type: conv.type || "single", 
          lastMessage: conv.lastMessage
            ? {
                senderId: conv.lastMessage.senderId?._id?.toString(),
                content: conv.lastMessage.message,
                type: conv.lastMessage.type,
                createdAt: conv.lastMessage.createdAt,
              }
            : null,
          lastMessageAt: conv.lastMessageAt || null,
          userDetail,
          unreadCount:
            conv.unreadCounts?.find((u) => u.user.toString() === CUserId)
              ?.count || 0,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      NewConversations,
    });
  } catch (error) {
    console.error("conversations error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching conversations",
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { con_id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!mongoose.isValidObjectId(con_id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid conversation ID",
      });
    }

    const skip = (page - 1) * limit;

    const totalMessages = await Message.countDocuments({
      conversationId: con_id,
    });

    console.log(totalMessages);

    const messages = await Message.find({ conversationId: con_id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const reversedMessages = messages.reverse();

    return res.status(200).json({
      success: true,
      messages: reversedMessages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasMore: skip + messages.length < totalMessages,
      },
    });
  } catch (error) {
    console.error("getMessages error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
    });
  }
};
