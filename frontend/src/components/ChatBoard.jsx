// ChatBoard.jsx - Full Updated Component with Permanent System Messages
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
  Alert,
  colors,
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
import PersonRemoveAlt1Icon from "@mui/icons-material/PersonRemoveAlt1";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ChangeCircleIcon from "@mui/icons-material/ChangeCircle";
import PreviewIcon from "@mui/icons-material/Preview";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import MarkChatUnreadIcon from "@mui/icons-material/MarkChatUnread";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import toast, { Toaster } from "react-hot-toast";

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
  const [DeleteModal, setDeleteModal] = useState(false);
  const [SeletectedMsgId, setSeletectedMsgId] = useState([]);
  const [AdminName, setAdminName] = useState([]);
  const [Admin_id, setAdmin_id] = useState([]);
  const [selectedUserId, setselectedUserId] = useState([]);
  const [EditMsg, SetEditMsg] = useState("");
  const [editopen, seteditopen] = useState(false);
  const [Profile, setProfile] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [OpenParticipantsModal, setOpenParticipantsModal] = useState(false);
  const [ViewMembers, setViewMembers] = useState([]);
  const [UserParticipantsRemaining, setUserParticipantsRemaining] = useState(
    [],
  );
  const [ChangeGroupName, setChangeGroupName] = useState("");
  const [Transforminput, setTransforminput] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [messageMenuAnchor, setMessageMenuAnchor] = useState(null);
  const [selectedMessageForMenu, setSelectedMessageForMenu] = useState(null);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState(null);

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const firstUnreadRef = useRef(null);

  const MESSAGES_PER_PAGE = 15;

  const scrollToBottom = (force = false) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: force ? "auto" : "smooth",
        block: "end",
      });
      setShowScrollToBottom(false);
    }
  };

  const scrollToFirstUnreadMessage = () => {
    if (firstUnreadRef.current) {
      setTimeout(() => {
        firstUnreadRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        setTimeout(() => {
          setFirstUnreadMessageId(null);
        }, 800);
      }, 100);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollToBottom(!isNearBottom);

    if (scrollTop < 100 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  const handleMessageMouseEnter = (messageId, messageData, e) => {
    setHoveredMessageId(messageId);
    setSelectedMessageForMenu(messageData);
  };

  const handleMessageMouseLeave = () => {
    setHoveredMessageId(null);
  };

  const handleMessageMenuClick = (event) => {
    setMessageMenuAnchor(event.currentTarget);
  };

  const handleMessageMenuClose = () => {
    setMessageMenuAnchor(null);
    setHoveredMessageId(null);
    setSelectedMessageForMenu(null);
  };

  const handleEditFromMenu = () => {
    if (selectedMessageForMenu) {
      setSeletectedMsgId(selectedMessageForMenu._id);
      SetEditMsg(selectedMessageForMenu.message);
      seteditopen(true);
      handleMessageMenuClose();
    }
  };

  const handleDeleteFromMenu = () => {
    if (selectedMessageForMenu) {
      setSeletectedMsgId(selectedMessageForMenu._id);
      setDeleteModal(true);
      handleMessageMenuClose();
    }
  };

  const canEditDeleteMessage = (message) => {
    return message.SenderId === myId || Admin_id.includes(myId);
  };

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

  const newmembers = new Set(ViewMembers.map((e) => e._id));

  const UserWithoutAdd = async () => {
    try {
      const { data } = await api.get("/getallusers");
      const withoutadduser = data.result.filter((e) => !newmembers.has(e._id));
      setUserParticipantsRemaining(withoutadduser);
    } catch (error) {
      console.error(error);
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

  const fetchMessages = async (scrollToUnread = false) => {
    try {
      let lastReadTimestamp = null;

      try {
        const res = await axios.get(
          `http://localhost:1111/getlastread/${myId}/${selectedConvId}`,
        );
        lastReadTimestamp = res?.data?.lastReadTimestamp;
      } catch (err) {
        console.error("Failed to get last read timestamp:", err);
      }

      const res = await axios.get(
        `http://localhost:1111/chats/getmessage/${selectedConvId}/msg?page=1&limit=${MESSAGES_PER_PAGE}`,
      );
      const fetchedMessages = res.data.messages || [];

      setMessages(fetchedMessages);
      setPage(1);
      setHasMore(fetchedMessages.length === MESSAGES_PER_PAGE);

      if (scrollToUnread && lastReadTimestamp && fetchedMessages.length > 0) {
        const lastReadDate = new Date(lastReadTimestamp);
        const firstUnreadMsg = fetchedMessages.find((msg) => {
          const msgDate = new Date(msg.createdAt);
          return msgDate > lastReadDate && msg.SenderId !== myId;
        });

        if (firstUnreadMsg) {
          console.log("Found unread message:", firstUnreadMsg._id);
          setFirstUnreadMessageId(firstUnreadMsg._id);
          setTimeout(() => {
            socket.emit("markMessagesRead", { conversationId: selectedConvId });
          }, 1000);
        } else {
          setTimeout(() => scrollToBottom(true), 100);
          socket.emit("markMessagesRead", { conversationId: selectedConvId });
        }
      } else {
        setTimeout(() => scrollToBottom(true), 100);
        socket.emit("markMessagesRead", { conversationId: selectedConvId });
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  //  UseEffect

  useEffect(() => {
    AllUsers();
    FetchImage();
  }, []);

  useEffect(() => {
    socket.emit("setup", myId);
    fetchConversations();

    socket.on("startTyping", ({ userId, conversationId }) => {
      if (conversationId === selectedConvId && userId !== myId) {
        setIsTyping(true);
        setTimeout(() => scrollToBottom(true), 100);
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
        const container = messagesContainerRef.current;
        const isNearBottom = container
          ? container.scrollHeight -
              container.scrollTop -
              container.clientHeight <
            100
          : true;

        setMessages((prev) => {
          const alreadyExists = prev.some(
            (m) =>
              m._id === newMsg._id ||
              (m._id?.startsWith("temp-") && m.message === newMsg.message),
          );
          if (alreadyExists) return prev;
          return [...prev, { ...newMsg, _id: newMsg._id }];
        });

        if (newMsg.SenderId !== myId) {
          socket.emit("markMessagesRead", { conversationId: selectedConvId });
        }

        if (isNearBottom || newMsg.SenderId === myId) {
          setTimeout(() => scrollToBottom(true), 100);
        } else {
          setShowScrollToBottom(true);
        }
      }
    };

    socket.on("messagereceived", handleNewMessage);

    return () => {
      socket.off("messagereceived", handleNewMessage);
    };
  }, [socket, selectedConvId, myId]);

  useEffect(() => {
    if (isTyping) {
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [isTyping]);

  useEffect(() => {
    if (firstUnreadMessageId && messages.length > 0) {
      scrollToFirstUnreadMessage();
    }
  }, [firstUnreadMessageId, messages.length]);

  useEffect(() => {
    if (!selectedConvId) return;

    socket.emit("join chat", selectedConvId);

    const hasUnread = unreadCounts[selectedConvId] > 0;

    fetchMessages(hasUnread);

    socket.on("group-update", (data) => {
      if (data.conversationId !== selectedConvId) return;

      let systemMessageText = data.systemMessage;

      if (!systemMessageText) {
        if (data.type === "user-added") {
          systemMessageText = `${data.adderUserName} added ${data.addedUserName}`;
        } else if (data.type === "user-removed") {
          systemMessageText = `${data.removerUserName} removed ${data.removedUserName}`;
        }
      }

      if (systemMessageText) {
        const tempSystemMsg = {
          _id: `sys-${Date.now()}`,
          message: systemMessageText,
          isSystem: true,
          createdAt: data.timestamp || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, tempSystemMsg]);
        setTimeout(() => scrollToBottom(true), 50);
      }
    });

    socket.on("leave-group", (data) => {
      if (data.conversationId !== selectedConvId) return;

      let systemMessageText = data.systemMessage;

      if (systemMessageText) {
        const tempSystemMsg = {
          _id: `sys-${Date.now()}`,
          message: systemMessageText,
          isSystem: true,
          createdAt: data.timestamp || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, tempSystemMsg]);
        setTimeout(() => scrollToBottom(true), 50);
      }
    });

    return () => {
      socket.off("group-update");
      socket.off("leave-group");
    };
  }, [selectedConvId, socket]);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !hasMore || !selectedConvId) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;

    setFirstUnreadMessageId(null);

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

  const handleSelectConversation = (name, convId, adminname, admin_id) => {
    setAdminName(adminname);
    setAdmin_id(admin_id);
    if (convId === selectedConvId) return;

    setSelectedName(name);
    setSelectedConvId(convId);
    setMessages([]);
    setIsTyping(false);
    setPage(1);
    setHasMore(true);
    setShowScrollToBottom(false);
    setFirstUnreadMessageId(null);
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

    setTimeout(() => {
      scrollToBottom(true);
      setShowScrollToBottom(false);
    }, 100);
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
    socket.emit("GroupChat", {
      name: GroupName || "GroupChatDemo",
      participants: GroupUserSelect,
      Admin: myId,
    });

    HandleClose();
    fetchConversations();
    toast.success("Group Created Successfully");
  };

  const HandleMenuItem = () => {
    setopen(true);
    handleClose2();
  };

  const HandleEdit = (senderid) => {
    if (senderid !== myId) {
      console.log("senderid and userid does not match", senderid, myId);
    } else {
      socket.emit("EditChat", {
        msg_id: SeletectedMsgId,
        msg: EditMsg,
        userId: myId,
        SenderId: senderid,
        conId: selectedConvId,
      });
    }

    handleEditClose();
    fetchMessages(false);
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

  const handleDeleteModal = () => {
    setDeleteModal(true);
  };

  const HandleCloseDeleteModal = () => {
    setDeleteModal(false);
    handleClose3();
    setSeletectedMsgId([]);
  };

  const HandleDeleteMsg = () => {
    socket.emit("deleteMessage", {
      messageId: SeletectedMsgId,
    });
    fetchMessages(false);
    HandleCloseDeleteModal();
  };

  const FetchImage = async () => {
    const res = await axios.get(
      `http://localhost:1111/getprofileimage/${myId}`,
    );
    setProfile(res?.data?.result);
  };

  const [anchorEl, setAnchorEl] = useState(null);
  const open2 = Boolean(anchorEl);

  const handleClose2 = () => {
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const [anchorE3, setAnchorE3] = useState(null);
  const open3 = Boolean(anchorE3);

  const handleClose3 = () => {
    setAnchorE3(null);
  };

  const handleClick3 = (event) => {
    setAnchorE3(event.currentTarget);
  };

  const [anchorE4, setAnchorE4] = useState(null);
  const open4 = Boolean(anchorE4);

  const handleClose4 = () => {
    setAnchorE4(null);
  };

  const handleClick4 = (event) => {
    setAnchorE4(event.currentTarget);
  };

  const HandleAddPersons = () => {
    setOpenParticipantsModal(true);
    UserWithoutAdd();
  };
  const handleParticipantsModalClose = () => {
    setOpenParticipantsModal(false);
  };

  const ViewParticipants = async (convId) => {
    const result = await axios.get(
      `http://localhost:1111/chats/getviewparticipants/${convId}`,
    );

    // socket.on('participants-updated',({participants})=>{
    //   setViewMembers(participants)
    // })
    setViewMembers(result.data.result.participants);
  };

  useEffect(() => {
    ViewParticipants(selectedConvId);
  }, [selectedConvId]);

  const HandleMembersId = (UserId) => {
    setselectedUserId((prev) => {
      return [...prev, UserId];
    });
  };

  const AddParticipants = async (convId) => {
    selectedUserId.forEach((userId) => {
      socket.emit("addGroupMember", {
        conversationId: convId,
        userIdToAdd: userId,
      });
    });
    setselectedUserId([]);
    handleParticipantsModalClose();
    ViewParticipants(selectedConvId);
  };

  const HandleMakeAdmin = async (_id) => {
    await api.patch(`/chats/makeadmin/${selectedConvId}`, { _id: _id });
    ViewParticipants(selectedConvId);
  };

  const HandleRemoveMember = async (_id) => {
    socket.emit("removeGroupMember", {
      conversationId: selectedConvId,
      userIdToRemove: _id,
    });
    ViewParticipants(selectedConvId);
    fetchConversations();
  };

  const HandleLeaveGroup = async () => {
    socket.emit("UserLeave", {
      conversationId: selectedConvId,
      userId: myId,
    });
    ViewParticipants(selectedConvId);
    fetchConversations();
  };

  const HandleKickAdmin = async (_id) => {
    await api.patch(`/chats/pullAdmin/${selectedConvId}`, { _id: _id });
    ViewParticipants(selectedConvId);
    fetchConversations();
  };

  const HandleNameChange = async () => {
    setTransforminput(true);
  };

  const ApiGroupName = async () => {
    try {
      await api.patch(`/chats/groupnamechange/${selectedConvId}`, {
        NewName: ChangeGroupName.toString(),
      });
      fetchConversations();
      setTransforminput(false);
      setChangeGroupName("");
      toast.success("SuccessFully GroupName is Changed.");
    } catch (error) {
      toast.failed("GroupName is not Changed");
    }
  };

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
          paper: {
            style: {
              marginTop: -529,
              marginLeft: 400,
            },
          },
          list: {
            "aria-labelledby": "basic-button",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "auto",
            overflowY: "scroll",
            maxHeight: "300px",
            "&::-webkit-scrollbar": {
              width: "2px",
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
          <Typography
            sx={{
              bgcolor: "#075E54",
              px: 7,
              py: 1.5,
              color: "white",
              textAlign: "center",
            }}
          >
            Members {ViewMembers.length}
          </Typography>
          {ViewMembers.map((e) => (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1,
                }}
              >
                <MenuItem sx={{ px: 5, py: 2, width: "50%" }}>
                  {e.name}
                </MenuItem>
                {Admin_id.includes(myId) && !Admin_id.includes(e._id) ? (
                  <>
                    <IconButton
                      variant="outlined"
                      onClick={() => HandleMakeAdmin(e._id)}
                    >
                      <AdminPanelSettingsIcon sx={{ color: "green" }} />
                    </IconButton>
                    <IconButton onClick={() => HandleRemoveMember(e._id)}>
                      <PersonRemoveAlt1Icon sx={{ color: "red" }} />
                    </IconButton>
                  </>
                ) : (
                  Admin_id.includes(myId) && (
                    <>
                      <Button
                        variant="outlined"
                        sx={{ fontSize: "10px" }}
                        onClick={() => HandleKickAdmin(e._id)}
                      >
                        Pull Admin
                      </Button>
                      <IconButton onClick={() => HandleRemoveMember(e._id)}>
                        <PersonRemoveAlt1Icon sx={{ color: "red" }} />
                      </IconButton>
                    </>
                  )
                )}
              </Box>
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
            {UserParticipantsRemaining.map((e) => (
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
                <IconButton onClick={() => HandleMembersId(e._id)}>
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
              onClick={() => AddParticipants(selectedConvId)}
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

      <Menu
        anchorEl={messageMenuAnchor}
        open={Boolean(messageMenuAnchor)}
        onClose={handleMessageMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {selectedMessageForMenu &&
          canEditDeleteMessage(selectedMessageForMenu) && (
            <>
              <MenuItem onClick={handleEditFromMenu}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                Edit
              </MenuItem>
              <MenuItem onClick={handleDeleteFromMenu}>
                <DeleteForeverIcon fontSize="small" sx={{ mr: 1 }} />
                Delete
              </MenuItem>
            </>
          )}
      </Menu>

      {/* Main code */}

      <Toaster />
      <Box sx={{ fontFamily: "Arial, sans-serif", p: 4 }}>
        {Transforminput ? (
          <Alert
            className="shadow"
            sx={{
              width: "30%",
              zIndex: -9999,
              marginLeft: "40%",
              py: 2,
              bgcolor: "white",
              border: "none",
            }}
            variant="outlined"
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <Input
                value={ChangeGroupName}
                onChange={(e) => setChangeGroupName(e.target.value)}
              />
              <Box sx={{ display: "flex", gap: "20px" }}>
                <Button
                  className="shadow"
                  sx={{
                    borderColor: "grey",
                    bgcolor: "white",
                    color: "grey",
                    borderWidth: "20px",
                  }}
                  onClick={() => setTransforminput(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={ApiGroupName}
                  className="shadow"
                  variant="contained"
                  sx={{ bgcolor: "#075E54", color: "white" }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </Alert>
        ) : (
          ""
        )}

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
            <Box>
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

                <img
                  height={30}
                  width={50}
                  src={`http://localhost:1111/uploads/${Profile?.path}`}
                />
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
            </Box>
            <Box
              sx={{
                bgcolor: "#F5F5F5",
                p: 2,
                maxHeight: " 450px",
                overflowY: "auto",
                mt: "8px",
                borderRadius: "10px",
                "&::-webkit-scrollbar": {
                  width: "3px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#888",
                  borderRadius: "10px",
                },
              }}
            >
              {conversations.map((conv) => {
                const unread = unreadCounts[conv.conversationId] || 0;

                return (
                  <>
                    <Box>
                      <Box
                        key={conv.conversationId}
                        onClick={() =>
                          handleSelectConversation(
                            conv.userDetail.name,
                            conv.conversationId,
                            conv?.Admin?.map((e) => e.name),
                            conv?.Admin?.map((e) => e._id),
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
                          mt: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            width: "100%",
                            justifyContent: "space-between",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "20px",
                            }}
                          >
                            {conv.type === "group" ? (
                              <>
                                <PeopleAltIcon fontSize="medium" />
                              </>
                            ) : (
                              <AccountCircleIcon fontSize="medium" />
                            )}
                            <Box>
                              <Typography
                                fontWeight={
                                  selectedConvId === conv.conversationId
                                    ? 600
                                    : 500
                                }
                              >
                                {conv.userDetail.name}
                              </Typography>
                              <Typography sx={{ fontSize: "10px" }}>
                                {conv?.lastMessage?.message || ""}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography sx={{ fontSize: "10px" }}>
                            {new Date(
                              conv?.lastMessage?.createdAt,
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </Typography>
                        </Box>

                        {unread > 0 &&
                          selectedConvId !== conv.conversationId && (
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
                    </Box>
                  </>
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
              position: "relative",
            }}
          >
            {selectedName ? (
              <>
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
                    <Typography variant="h6" sx={{ cursor: "pointer" }}>
                      {selectedName || "Select a chat"}
                    </Typography>

                    <Typography>{`${AdminName},`}</Typography>
                  </Box>

                  <Box>
                    <IconButton onClick={handleClick3}>
                      <MoreVertIcon sx={{ color: "white" }} />
                    </IconButton>

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
                        padding: "10px",
                        bgcolor: "red",
                      }}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          alignItems: "center",
                          justifyContent: "space-evenly",
                        }}
                      >
                        {SeletectedMsgId.length > 0 ? (
                          <>
                            <MenuItem
                              sx={{ width: "100%" }}
                              onClick={EditMOdal}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "20px",
                                  justifyContent: "space-between",
                                  width: "100%",
                                }}
                              >
                                <Typography>EditChat</Typography>
                                <EditIcon />
                              </Box>
                            </MenuItem>
                            <MenuItem
                              sx={{ width: "100%" }}
                              onClick={handleDeleteModal}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "20px",
                                  justifyContent: "space-between",
                                  width: "100%",
                                }}
                              >
                                <Typography>DeleteChat</Typography>
                                <DeleteForeverIcon />
                              </Box>
                            </MenuItem>
                          </>
                        ) : (
                          ""
                        )}

                        <MenuItem sx={{ width: "100%" }} onClick={handleClick4}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "20px",
                              justifyContent: "space-between",
                              width: "100%",
                            }}
                          >
                            <Typography>View Members</Typography>
                            <PreviewIcon />
                          </Box>
                        </MenuItem>
                        <MenuItem
                          sx={{ width: "100%" }}
                          onClick={HandleNameChange}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "20px",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography>Change Group Name</Typography>
                            <ChangeCircleIcon />
                          </Box>
                        </MenuItem>

                        {Admin_id.includes(myId) && (
                          <MenuItem
                            sx={{ width: "100%" }}
                            onClick={HandleAddPersons}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "20px",
                                width: "100%",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography>Add New Members</Typography>
                              <PersonAddIcon />
                            </Box>
                          </MenuItem>
                        )}
                        <MenuItem
                          sx={{ width: "100%" }}
                          onClick={HandleLeaveGroup}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: "20px",
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <Typography>Leave Group</Typography>
                            <ExitToAppIcon />
                          </Box>
                        </MenuItem>
                      </Box>
                    </Menu>
                  </Box>
                </Box>

                {showScrollToBottom && (
                  <IconButton
                    onClick={() => scrollToBottom(false)}
                    sx={{
                      position: "absolute",
                      bottom: 70,
                      right: 20,
                      zIndex: 1000,
                      bgcolor: "#075E54",
                      color: "white",
                      "&:hover": {
                        bgcolor: "#054d44",
                      },
                      boxShadow: 3,
                    }}
                    size="medium"
                  >
                    <KeyboardDoubleArrowDownIcon />
                  </IconButton>
                )}
              </>
            ) : (
              ""
            )}

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

              {messages.map((msg, index) => {
                const isMe = msg.SenderId === myId;
                const isFirstUnread = msg._id === firstUnreadMessageId;

                return (
                  <React.Fragment key={msg._id}>
                    {isFirstUnread && (
                      <Box
                        ref={firstUnreadRef}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          my: 2,
                          py: 1,
                          px: 3,
                          borderRadius: "20px",
                          backgroundColor: "#075E54",
                          color: "white",
                          alignSelf: "center",
                          maxWidth: "80%",
                        }}
                      >
                        <MarkChatUnreadIcon sx={{ mr: 1, fontSize: "16px" }} />
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          Unread Messages
                        </Typography>
                      </Box>
                    )}
                    {msg.isSystem ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          my: 1,
                          py: 0.5,
                          px: 2,
                          borderRadius: "10px",
                          backgroundColor: "#E8F5E9",
                          alignSelf: "center",
                          maxWidth: "80%",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "12px",
                            color: "#1B5E20",
                            fontStyle: "italic",
                            textAlign: "center",
                          }}
                        >
                          {msg.message}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        data-message-id={msg._id}
                        sx={{
                          alignSelf: isMe ? "flex-end" : "flex-start",
                          maxWidth: "70%",
                          cursor: "pointer",
                          position: "relative",
                          "&:hover .message-actions": {
                            opacity: 1,
                          },
                        }}
                        onMouseEnter={(e) =>
                          handleMessageMouseEnter(msg._id, msg, e)
                        }
                        onMouseLeave={handleMessageMouseLeave}
                      >
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
                            borderLeft:
                              isFirstUnread && !isMe
                                ? "3px solid #25D366"
                                : "none",
                          }}
                          onDoubleClick={() => setSeletectedMsgId([])}
                        >
                          {hoveredMessageId === msg._id &&
                            canEditDeleteMessage(msg) &&
                            !msg.isDeleted && (
                              <IconButton
                                size="small"
                                className="message-actions"
                                onClick={handleMessageMenuClick}
                                sx={{
                                  position: "absolute",
                                  top: 0,
                                  right: 0,
                                  opacity: 0,
                                  transition: "opacity 0.2s",
                                  bgcolor: "rgba(255, 255, 255, 0.8)",
                                  "&:hover": {
                                    bgcolor: "rgba(255, 255, 255, 1)",
                                  },
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            )}

                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: "20px",
                            }}
                          >
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

                            {!msg.isDeleted ? (
                              <Typography variant="body1">
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
                              {new Date(msg.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                },
                              )}
                            </Typography>
                            {msg._id === SeletectedMsgId &&
                            msg.SenderId === myId ? (
                              <MoreVertIcon />
                            ) : (
                              ""
                            )}
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </React.Fragment>
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
