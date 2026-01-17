import {
  Button,
  CardMedia,
  LinearProgress,
  MenuItem,
  Modal,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { MdDeleteForever, MdEdit } from "react-icons/md";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import { AiFillProduct } from "react-icons/ai";
import { Controller, useForm } from "react-hook-form";
import { MdOutlinePending } from "react-icons/md";
import { FcApproval } from "react-icons/fc";
import { FcCancel } from "react-icons/fc";
import Cookies from "js-cookie";
import api from "../api";

const AllUsers = () => {
  const token = Cookies.get("token");
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      role: "CUSTOMER",
      kycStatus: "PENDING",
    },
  });

  const [data, setdata] = useState([]);
  const [open, setopen] = useState();
  const [permission, setpermission] = useState([]);
  const [selectedId, setselectedId] = useState();

  const getalluser = async () => {
    try {
      const { data } = await api.get("/getallusers");
      setdata(data);
    } catch (err) {
      console.error("Failed ", err);
    }
  };

  const getallpermission = async () => {
    try {
      const { data } = await api.get("/allpermission");
      setpermission(data);
    } catch (error) {
      console.error("Failed", err);
    }
  };

  const handleclose = () => {
    setopen(false);
  };
  const onSubmit = async (data) => {
    const upadteuser = async (_id) => {
    
       await api.patch(`/updateuser/${_id}`, data);
      getalluser();
    };
    upadteuser(selectedId);
    reset();
    handleclose();
  };

  const handleDelete = async (_id) => {
    await api.delete(`userdelete/${_id}`);
  };

  const handleUpdate = (_id) => {
    setopen(true);
    setselectedId(_id);
  };

  useEffect(() => {
    getalluser();
    getallpermission();
  }, []);

  return (
    <>
      <Modal open={open} onClose={handleclose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
          }}
          component="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <Typography sx={{ fontWeight: "bold" }}>Update User </Typography>
            </Box>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter the Updated Name"
                  id="filled-basic"
                  label="Name"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="kycStatus"
              control={control}
              defaultValue="PENDING"
              render={({ field }) => (
                <Select {...field}>
                  <MenuItem value="PENDING">
                    PENDING <MdOutlinePending />
                  </MenuItem>
                  <MenuItem value="REJECTED">
                    REJECTED
                    <FcCancel />
                  </MenuItem>
                  <MenuItem value="APPROVED">
                    APPROVED
                    <FcApproval />
                  </MenuItem>
                </Select>
              )}
            />
            <Controller
              name="role"
              control={control}
              defaultValue="CUSTOMER"
              render={({ field }) => (
                <Select {...field}>
                  <MenuItem value="CUSTOMER">CUSTOMER</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                  <MenuItem value="CUSTOMER_SUPPORT">CUSTOMER_SUPPORT</MenuItem>
                </Select>
              )}
            />

            <Box
              sx={{
                display: "flex",
                gap: "20px",
                justifyContent: "space-between",
              }}
            >
              <Button onClick={handleclose} variant="contained" color="error">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="success">
                Update Users
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      <Box
        sx={{
          bgcolor: "#6457ae",
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography color="white" variant="h4">
          All Users <AiFillProduct />
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        {data?.result ? (
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead sx={{ bgcolor: "#6457ae" }}>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: "bold", color: "white" }}
                  align="right"
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: "white" }}
                  align="right"
                >
                  Email
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: "white" }}
                  align="right"
                >
                  KycStatus
                </TableCell>
                <TableCell
                  sx={{ fontWeight: "bold", color: "white" }}
                  align="right"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.result?.map((row) => (
                <TableRow
                  key={row._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.name || "USERS"}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.email}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.kycStatus}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    <Box
                      sx={{
                        display: "flex",
                        gap: "10px",
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleUpdate(row._id)}
                      >
                        <MdEdit color="white" />{" "}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(row._id)}
                      >
                        <MdDeleteForever color="white" />{" "}
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Box sx={{ width: "100%" }}>
            <LinearProgress />
          </Box>
        )}
      </TableContainer>
    </>
  );
};

export default AllUsers;
