import mongoose, { Schema } from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    SenderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    Read_User: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    message: {
      type: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },

    isEdited: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["text", "image", "video", "voice", "document"],
      default: "text",
    },
  },
  { timestamps: true },
);
const Message = mongoose.model("Message", MessageSchema, "Message");
export default Message;
