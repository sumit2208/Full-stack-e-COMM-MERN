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



export const getViewParticipants = async (req, res) => {
  const { convId } = req.params;

  try {
    const result = await Conversation.findOne({ _id: convId })
      .populate({
        path: "participants",
        select: "name email",
      })
      .populate({
        path: "Admin",
        select: "_id name",
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
  const addtogroup = req.body.UserId;
  try {
    const result = await Conversation.findByIdAndUpdate(
      { _id: convId },
      { $push: { participants: { $each: addtogroup } } },
      { new: true },
    );

    if (result) {
      res.status(200).json({
        result,
        success: true,
        message: "User Add to Conversation",
      });
    } else {
      res.status(400).json({
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

export const MakeAdmin = async (req, res) => {
  const { convId } = req.params;
  const MakeAdminId = req.body._id;
  try {
    const result = await Conversation.findByIdAndUpdate(
      { _id: convId },
      { $push: { Admin: MakeAdminId } },
      { new: true },
    );
    if (result) {
      res.status(200).json({
        result,
        success: true,
        message: `${MakeAdmin} is Now Admin`,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Making Admin Process is failed",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const PullAdmin = async (req, res) => {
  const { convId } = req.params;
  const KickAdminId = req.body._id;
  try {
    const result = await Conversation.updateOne(
      { _id: convId },
      { $pull: { Admin: KickAdminId } },
    );
    if (result) {
      res.status(200).json({
        result,
        success: true,
        message: "Admin Kicked",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Admin NOt Kicked",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const Kickmembers = async (req, res) => {
  const { convId } = req.params;
  const KickGroupMember = req.body._id;
  try {
    const result = await Conversation.updateOne(
      { _id: convId },
      { $pull: { participants: KickGroupMember } },
    );
    if (result) {
      res.status(200).json({
        result,
        success: true,
        message: "KickMembrs from Group Successfully",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Member Not Kicked",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const ChangeGroupName = async (req, res) => {
  const { convId } = req.params;
  const NewGroupName = req.body.NewName.toString();
  try {
    const result = await Conversation.findByIdAndUpdate(
      { _id: convId },
      { name: NewGroupName },
    );
    if (result) {
      res.status(200).json({
        result,
        success: true,
        message: "GroupName Change SuccessFully",
      });
    } else {
      res.status(400).josn({
        result,
        success: false,
        message: "Error While Changing GroupName",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
