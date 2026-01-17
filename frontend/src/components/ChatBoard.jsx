import {
  Box,
  Typography,
  TextField,
  Button,
  Input,
  Divider,
  IconButton,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import api from "../api";
import SendIcon from "@mui/icons-material/Send";
import { io } from "socket.io-client";
const ChatBoard = () => {
  const socket = io("http://localhost:1111", {
    withCredentials: true,
    extraHeaders: {
      "my-custom-header": "abcd",
    },
  });
  const [data, setdata] = useState([]);
  const getalluser = async () => {
    try {
      const { data } = await api.get("/getallusers");
      setdata(data);
    } catch (err) {
      console.error("Failed ", err);
    }
  };
  useEffect(() => {
    getalluser();
  }, []);
  return (
    <Box
      sx={{
        fontFamily: "Arial, sans-serif",
        p: 10,
      }}
    >
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
        <Box sx={{ height: "535px" }}>
          <Box
            sx={{ bgcolor: "#6457AE", p: 2, borderRadius: "10px 10px 0px 0px" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <SearchIcon sx={{ color: "white" }} />
              <Input />
            </Box>
          </Box>
          <Box
            sx={{
              bgcolor: "#F5F5F5",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              color: "white",
              borderRadius: "0px 0px 10px 10px",
              overflowY: "scroll",
              height: "90%",
              scrollbarWidth: "none",
            }}
          >
            {data?.result?.map((e) => (
              <>
                <Box
                  sx={{
                    p: 0.9,
                    borderRadius: "10px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <IconButton>
                    <AccountCircleIcon />
                  </IconButton>
                  <Typography sx={{ fontWeight: 600, color: "black" }}>
                    {e.name}
                  </Typography>
                </Box>
              </>
            ))}
          </Box>
        </Box>

        <Box sx={{ width: "100%" }}>
          <Box
            sx={{
              bgcolor: "#6457AE",
              color: "white",
              p: 2,
              textAlign: "center",
              boxShadow: 2,
              display:"flex",
              alignItems:"center",
              justifyContent:"flex-start",
              gap:"20px",
              borderRadius: "10px 10px 0px 0px",
            }}
          >
            <IconButton>
                     <AccountCircleIcon />
            </IconButton>
            <Typography variant="h6">Sumit</Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.100",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box
              sx={{
                alignSelf: "flex-start",
                bgcolor: "white",

                p: 1.5,
                borderRadius: 2,
                maxWidth: "70%",
                boxShadow: 1,
              }}
            >
              <Typography variant="body1" color="text.primary">
                Hello! How are you?
              </Typography>
            </Box>
            <Box
              sx={{
                alignSelf: "flex-end",
                bgcolor: "#6457AE",
                color: "white",
                p: 1.5,
                borderRadius: 2,
                maxWidth: "70%",
                boxShadow: 1,
              }}
            >
              <Typography variant="body1">
                I'm good, thanks! How about you?
              </Typography>
            </Box>
          </Box>{" "}
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.100",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box
              sx={{
                alignSelf: "flex-start",
                bgcolor: "white",

                p: 1.5,
                borderRadius: 2,
                maxWidth: "70%",
                boxShadow: 1,
              }}
            >
              <Typography variant="body1" color="text.primary">
                Hello! How are you?
              </Typography>
            </Box>
            <Box
              sx={{
                alignSelf: "flex-end",
                bgcolor: "#6457AE",
                color: "white",
                p: 1.5,
                borderRadius: 2,
                maxWidth: "70%",
                boxShadow: 1,
              }}
            >
              <Typography variant="body1">
                I'm good, thanks! How about you?
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              p: 2,
              bgcolor: "grey.100",
              overflow: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Box
              sx={{
                alignSelf: "flex-start",
                bgcolor: "white",

                p: 1.5,
                borderRadius: 2,
                maxWidth: "70%",
                boxShadow: 1,
              }}
            >
              <Typography variant="body1" color="text.primary">
                Hello! How are you?
              </Typography>
            </Box>
            <Box
              sx={{
                alignSelf: "flex-end",
                bgcolor: "#6457AE",
                color: "white",
                p: 1.5,
                borderRadius: 2,
                maxWidth: "70%",
                boxShadow: 1,
              }}
            >
              <Typography variant="body1">
                I'm good, thanks! How about you?
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              p: 2,
              bgcolor: "background.paper",
              display: "flex",
              gap: 1,
              borderTop: "1px solid",
              borderColor: "divider",
              borderRadius: "0px 0px 10px 10px",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Type a message..."
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 20,
                },
              }}
            />
            <Button
              variant="contained"
              sx={{ borderRadius: 2, bgcolor: "#6457AE" }}
            >
              <SendIcon sx={{ fontSize: "20px" }} />
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatBoard;
