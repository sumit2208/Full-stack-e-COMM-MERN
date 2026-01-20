import { Box, Typography, IconButton } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SendIcon from "@mui/icons-material/Send";
import { io } from "socket.io-client";
import InputEmoji from "react-input-emoji";
import axios from "axios";

const ChatBoard = () => {
  const myId = localStorage.getItem("_id");

  const socket = useMemo(() => {
    return io("http://localhost:1111", {
      auth: { userId: myId },
      reconnection: true,
      autoConnect: true,
      transports: ["websocket"],
    });
  }, [myId]);

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [selectedConvId, setSelectedConvId] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1111/chats/getconversation/${myId}`,
        );
        setConversations(res.data.NewConversations || res.data.data || []);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    };

    fetchConversations();

    socket.emit("setup", myId);
  }, [myId, socket]);

  useEffect(() => {
    const handleNewMessage = (newMsg) => {
      if (newMsg.conversationId === selectedConvId) {
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (m) =>
              m._id === newMsg._id ||
              (m._id?.startsWith("temp-") && m.message === newMsg.message),
          );
          if (alreadyExists) return prev;
          return [
            ...prev,
            { ...newMsg, _id: newMsg._id || `real-${Date.now()}` },
          ];
        });
      } else {
        console.log(
          `Message ignored — belongs to conv ${newMsg.conversationId}, current: ${selectedConvId}`,
        );
      }
    };

    socket.on("messagereceived", handleNewMessage);

    return () => {
      socket.off("messagereceived", handleNewMessage);
    };
  }, [socket, selectedConvId]);

  useEffect(() => {
    if (!selectedConvId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1111/chats/getmessage/${selectedConvId}/msg`,
        );
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    fetchMessages();
    socket.emit("join chat", selectedConvId);
  }, [selectedConvId, socket]);

  const handleSelectConversation = (name, convId) => {
    if (convId === selectedConvId) return;
    setSelectedName(name);
    setSelectedConvId(convId);
    setMessages([]);
  };

  const handleSend = () => {
    if (!text.trim() || !selectedConvId) return;

    const optimisticMsg = {
      _id: `temp-${Date.now()}`,
      SenderId: myId,
      conversationId: selectedConvId,
      message: text,
      type: "text",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");

    socket.emit("sendMessage", {
      conversationId: selectedConvId,
      message: text,
      type: "text",
    });

    console.log("Sent message:", text);
  };

  return (
    <Box sx={{ fontFamily: "Arial, sans-serif", p: 4 }}>
      <Box
        sx={{
          bgcolor: "#C8C8D0",
          p: 2,
          display: "flex",
          gap: "20px",
          borderRadius: "10px",
          boxShadow: 3,
        }}
      >
        <Box sx={{ width: 320, height: "580px" }}>
          <Box
            sx={{
              bgcolor: "#F5F5F5",
              p: 2,
              maxHeight: "calc(100% - 20px)",
              overflowY: "auto",
              borderRadius: "10px",
            }}
          >
            {conversations.map((conv) => (
              <Box
                key={conv.conversationId}
                onClick={() =>
                  handleSelectConversation(
                    conv.userDetail.name,
                    conv.conversationId,
                  )
                }
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  cursor: "pointer",
                  bgcolor:
                    selectedConvId === conv.conversationId
                      ? "#e0e0ff"
                      : "transparent",
                  "&:hover": { bgcolor: "#f0f0ff" },
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 1,
                }}
              >
                <AccountCircleIcon fontSize="large" />
                <Typography
                  fontWeight={
                    selectedConvId === conv.conversationId ? 600 : 500
                  }
                >
                  {conv.userDetail.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            maxHeight: "600px",
          }}
        >
          <Box
            sx={{
              bgcolor: "#6457AE",
              color: "white",
              p: 2,
              borderRadius: "10px 10px 0 0",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <AccountCircleIcon fontSize="large" />
            <Typography variant="h6">
              {selectedName || "Select a chat"}
            </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              bgcolor: "grey.100",
              overflowY: "auto",
              scrollbarWidth: "none",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {messages.map((msg) => {
              const isMe = msg.SenderId === myId;

              return (
                <Box
                  key={msg._id}
                  sx={{
                    alignSelf: isMe ? "flex-end" : "flex-start",
                    maxWidth: "70%",
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isMe ? "#6457AE" : "white",
                      color: isMe ? "white" : "text.primary",
                      boxShadow: 1,
                      wordBreak: "break-word",
                    }}
                  >
                    <Typography variant="body1">{msg.message}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              p: 1.5,
              bgcolor: "white",
              borderTop: "1px solid #ddd",
              display: "flex",
              alignItems: "center",
              gap: 1,
              borderRadius: "0 0 10px 10px",
            }}
          >
            <InputEmoji
              value={text}
              onChange={setText}
              cleanOnEnter
              onEnter={handleSend}
              placeholder="Type a message..."
              height={40}
              borderColor="#6457AE"
            />
            <IconButton color="primary" onClick={handleSend}>
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBoard;
