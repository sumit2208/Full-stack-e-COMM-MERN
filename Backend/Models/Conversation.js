import mongoose, { Schema } from "mongoose";

const ConversationSchema = new mongoose.Schema({
  unreadCounts: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User" },
      count: { type: Number, default: 0 },
      lastReadAt: { type: Date },
    },
  ],
  name: {
    type: String,
  },
  type: {
    type: String,
    enum: ["single", "group"],
    required: true,
  },
  participants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  Admin: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  logo: {
    type: String,
    default: null,
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "Message",
  },

  lastMessageAt: {
    type: Date,
  },
});

const Conversation = mongoose.model(
  "Conversation",
  ConversationSchema,
  "Conversation",
);
export default Conversation;
