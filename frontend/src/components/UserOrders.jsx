import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Modal,
  IconButton,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import {
  FiEye,
  FiPackage,
  FiX,
  FiShoppingBag,
  FiDollarSign,
} from "react-icons/fi";
import api from "../api";
import { FcApproval } from "react-icons/fc";
import { FcCancel } from "react-icons/fc";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "92%", sm: 520 },
  maxHeight: "88vh",
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  overflow: "hidden",
  outline: "none",
};

function UserOrders() {
  const userId = localStorage.getItem("_id");
  const [orders, setOrders] = useState([]);
  const [kycdata, setkycdata] = useState([]);
  const [selectedOrderItems, setSelectedOrderItems] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    GetUserOrders(userId);
    GetAddress(userId);
  }, []);

  const GetUserOrders = async (userId) => {
    try {
      const res = await api.get(`/userorder/${userId}`);
      setOrders(res?.data?.result || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const GetAddress = async (userId) => {
    try {
      const result = await api.get(`/getkycbyid/${userId}`); 
      setkycdata(result?.data?.data?.address);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleViewOrderItems = async (orderId) => {
    try {
      setLoadingItems(true);
      const res = await api.get(`/orderitem/${orderId}`);
      console.log(res?.data?.result[0].items.map((e)=>e))
      setSelectedOrderItems(res?.data?.result[0].items.map((e)=>e) || []);
      setOpenModal(true);
    } catch (error) {
      console.error("Error fetching order items:", error);
    } finally {
      setLoadingItems(false);
    }
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" fontWeight={600} mb={3}>
        My Orders
      </Typography>

      <Stack spacing={2.5}>
        {orders.toReversed().map((order) => (
          <Paper
            key={order._id}
            elevation={2}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.2s",
              "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
            }}
          >
            <Box sx={{ p: 2.5, pb: 1.5 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1.5}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  Order ID: {order?.orderId}
                </Typography>
                <Typography
                  sx={{
                    gap: "5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  variant="subtitle1"
                  fontWeight={600}
                >
                  status: {order?.status || "N/A"}{" "}
                  {order?.status === "captured" ? <FcApproval /> : <FcCancel />}
                </Typography>
                <Button
                  onClick={() => handleViewOrderItems(order?.orderId)}
                  variant="contained"
                  size="small"
                  startIcon={<FiEye />}
                  sx={{
                    bgcolor: "#6457AE",
                    "&:hover": { bgcolor: "#5648A0" },
                  }}
                >
                  View Items
                </Button>
              </Stack>

              <Stack direction="row" spacing={4} mb={1}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {order?.createdAt
                      ? new Date(order.createdAt).toDateString()
                      : "N/A"}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="primary.main"
                  >
                    ₹{Number(order?.TotalAmount || 0).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
              <Box>
                <Typography sx={{ fontWeight: 600 }} variant="h6">
                  Address
                </Typography>
                <Typography variant="body2">{kycdata}</Typography>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>

      {orders.length === 0 && (
        <Box sx={{ textAlign: "center", py: 10, color: "text.secondary" }}>
          <FiPackage size={64} style={{ opacity: 0.4, marginBottom: 24 }} />
          <Typography variant="h6" gutterBottom>
            No orders yet
          </Typography>
          <Typography variant="body2">
            When you place an order, it will appear here
          </Typography>
        </Box>
      )}

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="order-items-modal"
      >
        <Box sx={modalStyle}>
          <Box
            sx={{
              p: 3,
              bgcolor: "#6457AE",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" component="h2" fontWeight={600}>
              Order Items
            </Typography>
            <IconButton onClick={handleCloseModal} sx={{ color: "white" }}>
              <FiX size={22} />
            </IconButton>
          </Box>

          <Divider />

          <Box sx={{ p: 3, maxHeight: "70vh", overflowY: "auto" }}>
            {loadingItems ? (
              <Typography align="center" color="text.secondary" py={8}>
                Loading items...
              </Typography>
            ) : selectedOrderItems.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="center">Qty</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedOrderItems.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <FiShoppingBag color="#6457AE" />
                            <Typography variant="body2" fontWeight={500}>
                              Product ID: {item.productId}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.quantity}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            justifyContent="flex-end"
                          >
                            <Typography variant="body2">
                              {Number(item.price).toLocaleString()}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>
                          ₹
                          {(
                            item.quantity * Number(item.price)
                          ).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography color="text.secondary">
                  No items found for this order
                </Typography>
              </Box>
            )}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              p: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              textAlign: "right",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{ minWidth: 100 }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

export default UserOrders;
