import {
  Box,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
  Modal,
  Button,
  Input,
  Menu,
  MenuItem,
  Select,
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

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
  const [GroupUserSelect, setGroupUserSelect] = useState([myId]);
  const [GroupName, setGroupName] = useState("");
  const [DeleteMessage, setDeleteMessage] = useState(false);
  const [DeleteModal, setDeleteModal] = useState(false);
  const [SeletectedMsgId, setSeletectedMsgId] = useState([]);

  const [AdminName, setAdminName] = useState([]);
  const [Admin_id, setAdmin_id] = useState([]);

  const [EditMsg, SetEditMsg] = useState("");
  const [Msgediticon, setMsgediticon] = useState(false);
  const [editopen, seteditopen] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const MESSAGES_PER_PAGE = 10;

  // UseEffect Function

  const AllUsers = async () => {
    try {
      const { data } = await api.get("/getallusers");
      const FinalUser = data.result.filter((e) => e._id !== myId);
      setUser(FinalUser);
    } catch (error) {
      console.error("Failed to All Users:", error);
    }
  };

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

  //  UseEffect

  useEffect(() => {
    AllUsers();
  }, []);

  useEffect(() => {
    socket.emit("setup", myId);
    fetchConversations();

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

    socket.on("MessageEdit", ({ NewText, messageid }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageid ? { ...msg, message: NewText } : msg,
        ),
      );
    });

    socket.on("unreadCountUpdated", ({ conversationId, count, userId }) => {
      if (userId === myId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [conversationId]: count,
        }));
      }
    });

    socket.on("messageDeleted", ({ MesId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === MesId ? { ...msg, isDeleted: true } : msg,
        ),
      );
    });

    return () => {
      socket.off("startTyping");
      socket.off("stopTyping");
      socket.off("unreadCountUpdated");
      socket.off("MessageEdit");
      socket.off("messageDeleted");
    };
  }, [myId, socket, selectedConvId]);

  useEffect(() => {
    const handleNewMessage = (newMsg) => {
      if (newMsg.conversationId === selectedConvId) {
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (m) => m._id === newMsg._id,
            // ||
            // (m._id?.startsWith("temp-") && m.message === newMsg.message),
          );
          if (alreadyExists) return prev;
          return [...prev, { ...newMsg, _id: newMsg._id }];
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

    socket.emit("join chat", selectedConvId);
    fetchMessages();
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

  const handleSelectConversation = (name, convId, adminname, admin_id) => {
    setAdminName(adminname);
    setAdmin_id(admin_id);
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
      // _id: `temp-${Date.now()}`,
      SenderId: myId,
      conversationId: selectedConvId,
      message: text,
      type: "text",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setText("");

    // send message emit
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
        return prev;
      }
      return [...prev, userId];
    });
  };

  const HandleCreateGroup = () => {
    // Creation of Group chat emit
    socket.emit("GroupChat", {
      name: GroupName || "GroupChatDemo",
      participants: GroupUserSelect,
      Admin: myId,
    });

    HandleClose();
    fetchConversations();
  };

  const HandleMenuItem = () => {
    setopen(true);
    handleClose2();
  };

  const HandleEdit = (senderid) => {
    if (senderid !== myId) {
      console.log("senderid and userid does not match", senderid, myId);
    } else {
      setMsgediticon(true);
      socket.emit("EditChat", {
        msg_id: SeletectedMsgId,
        msg: EditMsg,
        userId: myId,
        SenderId: senderid,
        conId: selectedConvId,
      });
    }

    handleEditClose();
    fetchMessages();
    setMsgediticon(false);
  };

  const EditMOdal = () => {
    seteditopen(true);
  };
  const handleEditClose = () => {
    seteditopen(false);
    handleClose3();
    setSeletectedMsgId([]);
  };
  const EditMsgValue = (e) => {
    SetEditMsg(e.target.value);
  };

  const OpenEditModal = (senderid, msg_id) => {
    setSeletectedMsgId(msg_id);
    if (senderid === myId || myId === Admin_id) {
      setMsgediticon(true);
    }
  };

  const handleDeleteModal = () => {
    setDeleteModal(true);
  };

  const HandleCloseDeleteModal = () => {
    setDeleteModal(false);
    setMsgediticon(false);
    handleClose3();
    setSeletectedMsgId([]);
  };

  // Delete socket
  const HandleDeleteMsg = () => {
    socket.emit("deleteMessage", {
      messageId: SeletectedMsgId,
    });
    fetchMessages();
    HandleCloseDeleteModal();
  };
  // const [image, setimage] = useState(null);
  // const handleImageSelect = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setimage(file);
  //   }
  // };
  // const handleUpload = async () => {
  //   const formdata = new FormData();
  //   formdata.append("image", image);
  //   formdata.append("_id", myId);
  //   try {
  //     const res = await axios.post("http://localhost:1111/uploads", formdata, {
  //       headers: {
  //         "Content-Type": "multipart/formdata",
  //       },
  //     });
  //   } catch (error) {}
  // };

  const [Profile, setProfile] = useState([]);

  const FetchImage = async () => {
    const res = await axios.get(
      `http://localhost:1111/getprofileimage/${myId}`,
    );
    setProfile(res?.data?.result);
  };

  useEffect(() => {
    FetchImage();
  }, []);

  // GroupChat Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open2 = Boolean(anchorEl);

  const handleClose2 = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // edit and delet menu
  const [anchorE3, setAnchorE3] = useState(null);
  const open3 = Boolean(anchorE3);

  const handleClose3 = () => {
    setAnchorE3(null);
  };

  const handleClick3 = (event) => {
    setAnchorE3(event.currentTarget);
  };

  // View Participants
  const [anchorE4, setAnchorE4] = useState(null);
  const open4 = Boolean(anchorE4);

  const handleClose4 = () => {
    setAnchorE4(null);
  };

  const handleClick4 = (event) => {
    setAnchorE4(event.currentTarget);
  };

  // Add Group Participants
  const [OpenParticipantsModal, setOpenParticipantsModal] = useState(false);
  const [ViewMembers, setViewMembers] = useState([]);
  const HandleAddPersons = () => {
    setOpenParticipantsModal(true);
  };
  const handleParticipantsModalClose = () => {
    setOpenParticipantsModal(false);
  };

  const ViewParticipants = async (convId) => {
    const result = await axios.get(
      `http://localhost:1111/chats/getviewparticipants/${convId}`,
    );
    setViewMembers(result.data.result.participants);
  };

  useEffect(() => {
    ViewParticipants(selectedConvId);
  }, [selectedConvId]);

  return (
    <>
      {/* modals */}

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open2}
        onClose={handleClose2}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        <MenuItem onClick={HandleMenuItem}>New Group</MenuItem>
      </Menu>

      <Menu
        id="basic-menu"
        anchorE4={anchorE4}
        open={open4}
        onClose={handleClose4}
        slotProps={{
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          
          <Typography
            sx={{ bgcolor: "#075E54", px: 7, py: 1.5, color: "white" }}
          >
            Members {ViewMembers.length}
          </Typography>
          {ViewMembers.map((e) => (
            <>
              <MenuItem sx={{ px: 5  , py:2}}>{e.name}</MenuItem>
            </>
          ))}
        </Box>
      </Menu>

      <Modal
        open={OpenParticipantsModal}
        onClose={handleParticipantsModalClose}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "AppWorkspace",
          boxShadow: 24,
          height: "450px",
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
              Add Participants{" "}
            </Typography>
            <GroupAddIcon sx={{ color: "white" }} />
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
                  <AddIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              bgcolor: "#075E54",
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
              size="small"
              variant="contained"
              sx={{
                bgcolor: "#d52626",
                color: "white",
                fontWeight: 600,
              }}
              onClick={handleParticipantsModalClose}
            >
              CANCEL
            </Button>
            <Button
              size="small"
              variant="contained"
              sx={{
                bgcolor: "#12ad4b",
                color: "white",
                fontWeight: 600,
              }}
            >
              CREATE
            </Button>
          </Box>
        </>
      </Modal>

      <Modal
        open={open}
        onClose={HandleClose}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "AppWorkspace",
          boxShadow: 24,
          height: "450px",
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
              value={GroupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
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
                  <AddIcon />
                </IconButton>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              bgcolor: "#075E54",
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
              size="small"
              variant="contained"
              sx={{
                bgcolor: "#d52626",
                color: "white",
                fontWeight: 600,
              }}
              onClick={HandleClose}
            >
              CANCEL
            </Button>
            <Button
              size="small"
              onClick={HandleCreateGroup}
              variant="contained"
              sx={{
                bgcolor: "#12ad4b",
                color: "white",
                fontWeight: 600,
              }}
            >
              CREATE
            </Button>
          </Box>
        </>
      </Modal>

      {/* Main code */}
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
                  marginBottom: "7px",
                }}
              >
                <Typography>{Profile?.UserId?.name}</Typography>

                {/* <input
                  accept="image/*"
                  type="file"
                  onChange={handleImageSelect}
                  style={{ borderRadius: 50, width: "28px", height: "28px" }}
                /> */}

                <img
                  height={30}
                  width={50}
                  src={`http://localhost:1111/uploads/${Profile?.path}`}
                />
                {/* <Button onClick={handleUpload} sx={{ borderRadius: 50 }}>
                  Upload
                </Button> */}
              </Box>
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
              >
                <Typography sx={{ fontWeight: 700 }}>ExpressFlyChat</Typography>
                <IconButton onClick={handleClick}>
                  <MoreVertIcon sx={{ color: "white" }} />
                </IconButton>
              </Box>

              {conversations.map((conv) => {
                const unread = unreadCounts[conv.conversationId] || 0;

                return (
                  <Box
                    key={conv.conversationId}
                    onClick={() =>
                      handleSelectConversation(
                        conv.userDetail.name,
                        conv.conversationId,
                        conv?.Admin?.name,
                        conv?.Admin?._id,
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
                      {conv.type === "group" ? (
                        <>
                          <PeopleAltIcon fontSize="medium" />
                        </>
                      ) : (
                        <AccountCircleIcon fontSize="medium" />
                      )}

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
                position: "relative",
                bgcolor: "#075e54",
                color: "white",
                p: 2,
                borderRadius: "10px 10px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <AccountCircleIcon fontSize="large" />
                <Typography
                  variant="h6"
                  sx={{ cursor: "pointer" }}
                  onClick={handleClick4}
                >
                  {selectedName || "Select a chat"}
                </Typography>

                <Typography>{AdminName}</Typography>
              </Box>

              <Box>
                {Msgediticon && (
                  <IconButton onClick={handleClick3}>
                    <MoreVertIcon sx={{ color: "white" }} />
                  </IconButton>
                )}

                {Admin_id === myId && (
                  <IconButton onClick={HandleAddPersons}>
                    <PersonAddIcon sx={{ color: "white" }} />
                  </IconButton>
                )}

                <Menu
                  id="basic-menu"
                  anchorE3={anchorE3}
                  open={open3}
                  onClose={handleClose3}
                  slotProps={{
                    list: {
                      "aria-labelledby": "basic-button",
                    },
                  }}
                  style={{
                    top: "180px",
                    left: -30,
                  }}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                >
                  <>
                    <MenuItem onClick={EditMOdal}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography>EditChat</Typography>
                        <EditIcon />
                      </Box>
                    </MenuItem>
                    <MenuItem onClick={handleDeleteModal}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "20px",
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography>DeleteChat</Typography>
                        <DeleteForeverIcon />
                      </Box>
                    </MenuItem>
                  </>
                </Menu>
              </Box>
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
                      cursor: "pointer",
                    }}
                  >
                    {/* Start Modal */}
                    <Modal
                      open={DeleteModal}
                      onClose={HandleCloseDeleteModal}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#075E54",
                          height: "150px",
                          width: "250px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "20px",
                          borderRadius: "15px",
                        }}
                      >
                        <Typography sx={{ color: "white" }}>
                          Are You Sure!
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "15px",
                          }}
                        >
                          <Button
                            variant="contained"
                            sx={{ bgcolor: "red", borderRadius: "8px" }}
                            onClick={HandleCloseDeleteModal}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            sx={{ bgcolor: "green", borderRadius: "8px" }}
                            onClick={HandleDeleteMsg}
                          >
                            Confirm
                          </Button>
                        </Box>
                      </Box>
                    </Modal>
                    {/* End Modal */}

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        display: "flex",
                        gap: "5px",
                        flexDirection: "column",
                        bgcolor: isMe ? "#26c964d4" : "white",
                        color: isMe ? "white" : "text.primary",
                        boxShadow: 1,
                        wordBreak: "break-word",
                      }}
                    >
                      {/* {msg.conversationId.type === "group" &&
                      msg.SenderId == myId ? (
                        <Box sx={{ fontSize: "12px" }}>You</Box>
                      ) : (
                        <Box sx={{ fontSize: "12px" }}>{msg.SenderId.name}</Box>
                      )} */}

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "20px",
                        }}
                      >
                        {/* Start Modal */}
                        <Modal
                          open={editopen}
                          onClose={handleEditClose}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: "transparent",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              bgcolor: "#272626ae",
                              p: 2,
                              borderRadius: "8px",
                            }}
                          >
                            <Input
                              placeholder="Edit msg"
                              sx={{
                                width: "300px",
                                bgcolor: "white",
                                borderRadius: "10px",
                                p: 1,
                              }}
                              value={EditMsg}
                              onChange={EditMsgValue}
                            />
                            <IconButton>
                              <CheckCircleIcon
                                sx={{ color: "white" }}
                                onClick={() => HandleEdit(msg.SenderId)}
                              />
                            </IconButton>
                          </Box>
                        </Modal>
                        {/* End Modal */}

                        {/* Deleted Msg */}
                        {!msg.isDeleted ? (
                          <Typography
                            variant="body1"
                            sx={{
                              bgcolor:
                                msg._id === SeletectedMsgId &&
                                msg.SenderId === myId
                                  ? "#7876767d"
                                  : "",
                            }}
                            onClick={() => OpenEditModal(msg.SenderId, msg._id)}
                          >
                            {msg.message}
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                            }}
                          >
                            <DoNotDisturbIcon sx={{ color: "#272626ae" }} />{" "}
                            <Typography
                              sx={{
                                color: "#272626ae",
                                fontSize: "14px",
                                fontStyle: "italic",
                              }}
                            >
                              This Messgae has been deleted
                            </Typography>
                          </Box>
                        )}
                        {/* Deleted Msg End*/}

                        <Typography
                          sx={{ fontSize: "10px", color: "#272626ae" }}
                        >
                          {msg.isEdited ? "Edited" : ""}
                        </Typography>
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
            {selectedName ? (
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
            ) : (
              ""
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default ChatBoard;
