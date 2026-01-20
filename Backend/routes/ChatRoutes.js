import express from "express";
import {
  getMessages,
  getUserConversations, 
} from "../controller/ChatController.js";

const router = express.Router();

router.get("/chats/getmessage/:con_id/msg", getMessages);
router.get("/chats/getconversation/:CUserId", getUserConversations); 

export default router;
