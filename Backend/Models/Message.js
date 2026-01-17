import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    SendId: {
      type: String,
    },
    conversation_id:{
        type:String
    },
    message: {
      type: String,
    },
    is_deleted :{
        type:Boolean
    },
    is_edit:{
        type:Boolean
    }
  },
  { timestamps: true }
);
const Message = mongoose.model("Message", MessageSchema);
export default Message;
