import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
        unread_message_count : {
            type:Number
        },
        name:{
            type:String
        },
        
})