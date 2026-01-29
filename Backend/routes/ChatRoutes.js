import express from "express";
import {
  AddParticipants,
  getMessages,
  getUserConversations, 
  getViewParticipants,
} from "../controller/ChatController.js";

const router = express.Router();

router.get("/chats/getmessage/:con_id/msg", getMessages);
router.get("/chats/getconversation/:CUserId", getUserConversations); 
router.get("/chats/getviewparticipants/:convId", getViewParticipants); 
router.post("/chats/addnewmembners/:convId", AddParticipants); 

export default router;
