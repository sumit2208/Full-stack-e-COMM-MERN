import express from "express";
import {
  AddParticipants,
  ChangeGroupName,
  getMessages,
  getUserConversations,
  getViewParticipants,
  Kickmembers,
  MakeAdmin,
  PullAdmin,
} from "../controller/ChatController.js";

const router = express.Router();

router.get("/chats/getmessage/:con_id/msg", getMessages);
router.get("/chats/getconversation/:CUserId", getUserConversations);
router.get("/chats/getviewparticipants/:convId", getViewParticipants);
router.post("/chats/addnewmembners/:convId", AddParticipants);
router.patch("/chats/makeadmin/:convId", MakeAdmin);
router.patch("/chats/kickmembers/:convId", Kickmembers);
router.patch("/chats/pullAdmin/:convId", PullAdmin);
router.patch("/chats/groupnamechange/:convId", ChangeGroupName);

export default router;
