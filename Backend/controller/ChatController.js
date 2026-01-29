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
    })
      .populate({
        path: "Admin",
        select: "name _id",
      })
      .populate({
        path: "lastMessage",
        select: "_id message type createdAt",
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
            name: conv.name || "group",
          };
        }

        return {
          conversationId: conv._id.toString(),
          type: conv.type,
          Admin: conv.Admin,
          lastMessage: conv.lastMessage
            ? {
                _id: conv.lastMessage.SenderId?._id?.toString(),
                message: conv.lastMessage.message,
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

    const messages = await Message.find({ conversationId: con_id })
      // .populate({
      //   path: "SenderId",
      //   select: "name _id",
      // })
      .populate({
        path: "conversationId",
        select: "type",
      })
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

export const getViewParticipants = async (req, res) => {
  const { convId } = req.params;

  try {
    const result = await Conversation.findOne({ _id: convId }).populate({
      path: "participants",
      select: "name email",
    });
    if (result) {
      res.status(200).json({
        result,
        success: true,
      });
    } else {
      res.status(400).josn({
        success: false,
        message: "Not Fetch",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const AddParticipants = async (req, res) => {
  const { convId } = req.params;
  try {
    const result = Conversation.findByIdAndUpdate(
      { _id: convId },
      { $push: { participants: req.body.userId } },
      { new: true },
    );

    if (result) {
      res.status(200).json({
        result,
        success: true,
        message: "User Add to Conversation",
      });
    } else {
      res.status(400).josn({
        success: false,
        message: "Not Fetch",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
