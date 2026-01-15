import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Box,
  Button,
  CardMedia,
} from "@mui/material";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";
import api from "../api";
import { useSearchParams } from "react-router-dom";

const Transactions = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [payments, setpayments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get(`orderdetailbyid/${orderId}`);
      setpayments(response.data.result);
    } catch (err) {
      console.error("err");
    } finally {
      setLoading(false);
    }
  };
  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "175px" }}>
          <CardMedia
            component="img"
            height="50px"
            width="50px"
            image="https://expressfly.in/img/logo.png"
            alt="Paella dish"
          />
        </Box>
      </Box>
    );

  return (
    <Container maxWidth="xl" sx={{ py: 6, bgcolor: "#6457AE" }}>
      <Typography variant="h4" gutterBottom fontWeight="bold" color="white">
        Razorpay Transactions
      </Typography>

      <TableContainer component={Paper} elevation={4} sx={{ borderRadius: 5 }}>
        <Table>
          <TableHead sx={{ bgcolor: "#32209abf" }}>
            <TableRow>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                payments ID
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Amount
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Status
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Method
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Customer
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Date & Time
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow hover>
              <TableCell>{payments._id}</TableCell>
              <TableCell>₹{payments.amount}</TableCell>
              <TableCell>
                <Chip
                  icon={
                    payments.status === "captured" ? (
                      <IoCheckmarkCircle />
                    ) : (
                      <IoCloseCircle />
                    )
                  }
                  label={payments.status.toUpperCase()}
                  color={payments.status === "captured" ? "success" : "error"}
                  size="small"
                />
              </TableCell>
              <TableCell>{payments.method?.toUpperCase() || "-"}</TableCell>
              <TableCell>{payments?.email || payments.contact || "-"}</TableCell>
              <TableCell>
                {new Date(payments?.createdAt).toLocaleString()}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {payments.length === 0 && (
        <Typography color="text.secondary" align="center" sx={{ mt: 6 }}>
          No transactions found
        </Typography>
      )}
    </Container>
  );
};

export default Transactions;
