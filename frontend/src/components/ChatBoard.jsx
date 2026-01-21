import { Box, Typography, IconButton, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState, useRef } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SendIcon from "@mui/icons-material/Send";
import { io } from "socket.io-client";
import axios from "axios";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";

const ChatBoard = () => {
  const TYping = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

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
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({}); // { conversationId: count }

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch conversations + setup socket listeners
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
    socket.emit("getMyUnreadCounts");

    socket.on("startTyping", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    socket.on("unreadCounts", (counts) => {
      setUnreadCounts(counts);
    });

    socket.on("unreadCountUpdated", ({ conversationId, count }) => {
      setUnreadCounts((prev) => ({
        ...prev,
        [conversationId]: count,
      }));
    });

    socket.on("messagereceived", (newMsg) => {
      if (
        newMsg.SenderId !== myId &&
        newMsg.conversationId !== selectedConvId
      ) {
        setUnreadCounts((prev) => ({
          ...prev,
          [newMsg.conversationId]: (prev[newMsg.conversationId] || 0) + 1,
        }));
      }
    });

    return () => {
      socket.off("startTyping");
      socket.off("stopTyping");
      socket.off("unreadCounts");
      socket.off("unreadCountUpdated");
      socket.off("messagereceived");
    };
  }, [myId, socket, selectedConvId]);

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
    socket.emit("markMessagesRead", { conversationId: selectedConvId });
  }, [selectedConvId, socket]);

  const handleSelectConversation = (name, convId) => {
    if (convId === selectedConvId) return;

    setUnreadCounts((prev) => ({ ...prev, [convId]: 0 }));

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
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setText(value);

    if (!selectedConvId) return;

    socket.emit("startTyping", { conversationId: selectedConvId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId: selectedConvId });
    }, 500);
  };

  const scrollToBottom = (force = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: force ? "auto" : "smooth",
        block: "end",
      });
    }
  };

  useEffect(() => {
    const isSwitchingChat = selectedConvId;
    scrollToBottom(!isSwitchingChat);
  }, [messages, isTyping]);

  useEffect(() => {
    scrollToBottom(true);
  }, [selectedConvId]);

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
            {conversations.map((conv) => {
              const unread = unreadCounts[conv.conversationId] || 0;

              return (
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
                    justifyContent: "space-between",
                    gap: 2,
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <AccountCircleIcon fontSize="large" />
                    <Typography
                      fontWeight={
                        selectedConvId === conv.conversationId ? 600 : 500
                      }
                    >
                      {conv.userDetail.name}
                    </Typography>
                  </Box>

                  {unread > 0 && (
                    <Box
                      sx={{
                        minWidth: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: "#25D366",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.85rem",
                        fontWeight: "bold",
                        px: 1,
                      }}
                    >
                      {unread > 99 ? "99+" : unread}
                    </Box>
                  )}
                </Box>
              );
            })}
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
              bgcolor: "#dfdfe2",
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
                      bgcolor: isMe ? "#6457aedc" : "white",
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

            {isTyping && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ pl: 2 }}
              >
                <Lottie
                  options={TYping}
                  width={70}
                  style={{ marginBottom: 15, marginLeft: -10 }}
                />
              </Typography>
            )}

            <div ref={messagesEndRef} />
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
            <TextField
              value={text}
              onChange={handleTyping}
              placeholder="Type a message..."
              variant="outlined"
              size="small"
              fullWidth
              multiline
              maxRows={4}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px",
                  bgcolor: "white",
                },
              }}
            />

            <IconButton
              color="primary"
              onClick={handleSend}
              disabled={!text.trim()}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBoard;
