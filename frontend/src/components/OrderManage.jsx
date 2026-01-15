import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { MdEdit } from "react-icons/md";
import { AiFillProduct } from "react-icons/ai";
import { useEffect, useState } from "react";
import { FaProductHunt } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useForm, Controller } from "react-hook-form";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import api from "../api";
export default function OrderManage() {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  const [product, setproduct] = useState([]);
  const [open, setopen] = useState(false);
  const [editopen, seteditopen] = useState(false);
  const [deleteopen, setdelete] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [DelselectedOrderId, setDelSelectedOrderId] = useState(null);
  const { control, handleSubmit, reset } = useForm();
  useEffect(() => {
    fetchallproducts();
  }, []);

  const fetchallproducts = async () => {
    try {
      const { data } = await api.get("/allorderget");
      setproduct(data);
    } catch (error) {
      console.error("Failed", error);
    }
  };
  const onSubmit = async (data) => {
    const UpdateOrders = async (UserId) => {
      await api.patch(`/updateorder/${UserId}`, data);
      fetchallproducts();
    };
    UpdateOrders(selectedOrderId);
    handleeditmodalclose();
    reset();
  };

  const handleclose = () => {
    setopen(false);
  };

  const handleeditmodal = (UserId) => {
    setSelectedOrderId(UserId);
    seteditopen(true);
  };

  const handleeditmodalclose = () => {
    seteditopen(false);
  };

  const handledelete = (UserId) => {
    setdelete(true);
    setDelSelectedOrderId(UserId);
  };

  const handledeleteclose = () => {
    setdelete(false);
  };

  const DeleteOrder = async (UserId) => {
    await api.delete(`/deleteorder/${UserId}`);
    fetchallproducts();
  };

  const HandleOrderDetails = async (OrderId) => {
    navigate(`/razorpay?orderId=${OrderId}`);
   
  };

  return (
    <>
      <Modal open={deleteopen} onClose={handledeleteclose}>
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
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Typography>Are You Sure !</Typography>
            <Typography>You want to delete this Order</Typography>

            <Button
              onClick={() => DeleteOrder(DelselectedOrderId)}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color="info"
              onClick={handledeleteclose}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      <Modal open={editopen} onClose={handleclose}>
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
              <Typography sx={{ fontWeight: "bold" }}>Update Order </Typography>
              <FaProductHunt />
            </Box>
            <Controller
              name="TotalAmount"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Update the TotalAmount"
                  id="filled-basic"
                  label="TotalAmount"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="DiscountAmount"
              control={control}
              rules={{ required: "Reuired" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Update DiscountAmount"
                  id="filled-basic"
                  label="DiscountAmount"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="DiscountedAmount"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Update DiscountedAmount"
                  id="filled-basic"
                  label="DiscountedAmount"
                  variant="filled"
                />
              )}
            />

            <Box
              sx={{
                display: "flex",
                gap: "20px",
                justifyContent: "space-between",
              }}
            >
              <Button
                onClick={handleeditmodalclose}
                variant="contained"
                color="error"
              >
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="info">
                Update Product
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
          OrderManage <AiFillProduct />
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        {product?.result ? (
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }} align="left">
                  Email
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  OrderID
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  TotalAmount
                </TableCell>

                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {product?.result?.map((row) => (
                <TableRow
                  key={row._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell sx={{ color: "grey" }} align="left">
                    {row.email}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.orderId}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.TotalAmount}
                  </TableCell>

                  <TableCell sx={{ color: "grey" }}>
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
                        onClick={() => HandleOrderDetails(row.orderId)}
                      >
                        Details
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handledelete(row.UserId)}
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
}
