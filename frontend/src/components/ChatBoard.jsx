import {
  Box,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
  Modal,
  Button,
} from "@mui/material";
import React, { useEffect, useMemo, useState, useRef } from "react";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SendIcon from "@mui/icons-material/Send";
import { io } from "socket.io-client";
import axios from "axios";
import Lottie from "react-lottie";
import animationData from "../animations/Typings.json";
import AddIcon from "@mui/icons-material/Add";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import api from "../api";

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
  const [unreadCounts, setUnreadCounts] = useState({});
  const [open, setopen] = useState(false);
  const [User, setUser] = useState([]);
  const [GroupUserSelect, setGroupUserSelect] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const MESSAGES_PER_PAGE = 10;

  const AllUsers = async () => {
    try {
      const { data } = await api.get("/getallusers");
      setUser(data.result);
    } catch (error) {
      console.error("Failed to All Users:", error);
    }
  };

  useEffect(() => {
    AllUsers();
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1111/chats/getconversation/${myId}`,
        );
        const convs = res.data.NewConversations || res.data.data || [];
        setConversations(convs);

        const initialCounts = {};
        convs.forEach((conv) => {
          const userUnreadEntry = conv.unreadCounts?.find(
            (entry) => entry.user?.toString() === myId,
          );
          initialCounts[conv.conversationId] = userUnreadEntry?.count || 0;
        });
        setUnreadCounts(initialCounts);
      } catch (err) {
        console.error("Failed to load conversations:", err);
      }
    };

    fetchConversations();

    socket.emit("setup", myId);

    socket.on("startTyping", ({ userId, conversationId }) => {
      if (conversationId === selectedConvId && userId !== myId) {
        setIsTyping(true);
      }
    });

    socket.on("stopTyping", ({ userId, conversationId }) => {
      if (conversationId === selectedConvId && userId !== myId) {
        setIsTyping(false);
      }
    });

    socket.on("unreadCountUpdated", ({ conversationId, count, userId }) => {
      if (userId === myId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [conversationId]: count,
        }));
      }
    });

    return () => {
      socket.off("startTyping");
      socket.off("stopTyping");
      socket.off("unreadCountUpdated");
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

        if (newMsg.SenderId !== myId) {
          socket.emit("markMessagesRead", { conversationId: selectedConvId });
        }
      }
    };

    socket.on("messagereceived", handleNewMessage);

    return () => {
      socket.off("messagereceived", handleNewMessage);
    };
  }, [socket, selectedConvId, myId]);

  useEffect(() => {
    if (!selectedConvId) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:1111/chats/getmessage/${selectedConvId}/msg?page=1&limit=${MESSAGES_PER_PAGE}`,
        );
        const fetchedMessages = res.data.messages || [];
        setMessages(fetchedMessages);
        setPage(1);
        setHasMore(fetchedMessages.length === MESSAGES_PER_PAGE);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    fetchMessages();
    socket.emit("join chat", selectedConvId);
    socket.emit("markMessagesRead", { conversationId: selectedConvId });
  }, [selectedConvId, socket]);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !selectedConvId) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;

    try {
      const res = await axios.get(
        `http://localhost:1111/chats/getmessage/${selectedConvId}/msg?page=${nextPage}&limit=${MESSAGES_PER_PAGE}`,
      );
      const olderMessages = res.data.messages || [];

      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev]);
        setPage(nextPage);
        setHasMore(olderMessages.length === MESSAGES_PER_PAGE);
        setTimeout(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          }
        }, 0);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more messages:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    if (scrollTop < 50 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  const handleSelectConversation = (name, convId) => {
    if (convId === selectedConvId) return;

    setUnreadCounts((prev) => ({
      ...prev,
      [convId]: 0,
    }));

    setSelectedName(name);
    setSelectedConvId(convId);
    setMessages([]);
    setIsTyping(false);
    setPage(1);
    setHasMore(true);

    socket.emit("markMessagesRead", { conversationId: convId });
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
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isNearBottom) {
        scrollToBottom(false);
      }
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (selectedConvId) {
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [selectedConvId]);

  const HandleClose = () => {
    setopen(false);
  };

  const HandleUserGroup = (userId) => {
    setGroupUserSelect((prev) => {
      if (prev.includes(userId)) {
        return alert("Already Added tHis User");
      }
      return [...prev, userId];
    });
  };

  console.log(GroupUserSelect);

  return (
    <>
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
              <Box
                sx={{
                  bgcolor: "#075E54",
                  p: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderRadius: "10px",
                  color: "white",
                }}
                onClick={() => setopen(true)}
              >
                <Typography sx={{ fontWeight: 700 }}>Create Group</Typography>
                <IconButton>
                  <AddIcon sx={{ color: "white" }} />
                </IconButton>
              </Box>
              <Modal
                open={open}
                onClose={HandleClose}
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 400,
                  boxShadow: 24,
                  height:"450px"
                }}
              >
                <>
                  <Box
                    sx={{
                      bgcolor: "#075E54",
                      p: 1,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "25px", 
                    }}
                  >
                    <Typography sx={{ color: "white", fontSize: "20px" }}>
                      Add Members{" "}
                    </Typography>
                    <GroupAddIcon sx={{ color: "white" }} />
                    <TextField
                      value={text}
                      onChange={handleTyping}
                      placeholder="Type a message..."
                      variant="outlined"
                      size="small"
                      fullWidth
                      multiline
                      maxRows={4}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "20px",
                          bgcolor: "white",
                        },
                      }}
                    />
                  </Box>

                   
                  <Box
                    sx={{
                      p: 2,
                      overflowY: "scroll",
                      height: "350px",
                      "&::-webkit-scrollbar": {
                        width: "4px",
                      },
                      "&::-webkit-scrollbar-track": {
                        background: "transparent",
                      },
                      "&::-webkit-scrollbar-thumb": {
                        background: "#888",
                        borderRadius: "3px",
                      },
                    }}
                  >
                    {User.map((e) => (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          p: 0.8,
                          color: "white", 
                        }}
                      >
                        <Typography>{e.email}</Typography>
                        <IconButton onClick={() => HandleUserGroup(e._id)}>
                          <AddIcon sx={{ color: "white" }} />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>

                  <Box
                    sx={{
                      bgcolor: "#46CD79",
                      p: 1.2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: "10px", 
                      borderEndEndRadius: "10px",
                      borderEndStartRadius: "10px",
                    }}
                  >
                    <Button
                      variant="contained"
                      sx={{ bgcolor: "#075E54" }}
                      onClick={HandleClose}
                    >
                      CANCEL
                    </Button>
                    <Button variant="contained" sx={{ bgcolor: "#075E54" }}>
                      CREATE
                    </Button>
                  </Box>
                </>
              </Modal>
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

                    {unread > 0 && selectedConvId !== conv.conversationId && (
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
                bgcolor: "#075e54",
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
              ref={messagesContainerRef}
              onScroll={handleScroll}
              sx={{
                flex: 1,
                p: 2,
                bgcolor: "#dfdfe2",
                overflowY: "auto",
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#888",
                  borderRadius: "3px",
                },
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              {isLoadingMore && (
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              )}

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
                        display: "flex",
                        gap: "5px",
                        justifyContent: "center",
                        alignItems: "center",
                        bgcolor: isMe ? "#26c964d4" : "white",
                        color: isMe ? "white" : "text.primary",
                        boxShadow: 1,
                        wordBreak: "break-word",
                      }}
                    >
                      <Typography variant="body1">{msg.message}</Typography>
                      <Typography
                        sx={{
                          fontSize: "10px",
                          marginBottom: 0,
                          color: "#272626ae",
                        }}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}

              {isTyping && (
                <Box sx={{ alignSelf: "flex-start" }}>
                  <Lottie
                    options={TYping}
                    width={70}
                    style={{ marginLeft: -10 }}
                  />
                </Box>
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
    </>
  );
};

export default ChatBoard;
