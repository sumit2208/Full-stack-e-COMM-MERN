import mongoose from "mongoose";

const UserRole = new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
        required:true
    },
    role_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Role",
        required:true
    }
})

export default mongoose.model("User_Role",UserRole,"User_Role")