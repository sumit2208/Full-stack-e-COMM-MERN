import {
  Button,
  CardMedia,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { MdAutoGraph } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { MdOutlineSecurity } from "react-icons/md";
import api from "../api";
import Transactions from "./Transaction";

const Dashboard = () => { 
  const navigate = useNavigate();
  const [data, setdata] = useState([]);
  const [order, setorder] = useState([]);
  const [product, setproduct] = useState([]);
  const [permissionData, setpermissionData] = useState();

  useEffect(() => {
    getAllUsers();
    getProducts();
    getOrders();
    getAllPermissions();
  }, []);
  const getAllUsers = async () => {
    try {
      const { data } = await api.get("/getallusers");
      setdata(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const getAllPermissions = async () => {
    try {
      const { data } = await api.get("/getallpermission");
      setpermissionData(data);
    } catch (err) {
      console.error(err);
    }
  };
  const getProducts = async () => {
    try {
      const { data } = await api.get("/Allproducts");
      setproduct(data);
    } catch (err) {
      console.error(err);
    }
  };
  const getOrders = async () => {
    try {
      const { data } = await api.get("/allorderget");
      setorder(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
    <Box >
      <Box
        sx={{ 
          display: "flex",
          flexDirection: "column",
          gap: { xs: 2, sm: 3 },
          p: { xs: 2, md: 4 },
          borderRadius: "16px",
          mx: "auto",
          maxWidth: "1200px", 
          mb: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 2, sm: 3 },
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: { xs: "100%", sm: "200px" },
              color: "white",
              p: { xs: 2.5, sm: 3 },
              borderRadius: "16px",
              cursor: "pointer",
              background:
                "linear-gradient(135deg, #a81683 0%, #cb32d9 50%, #e929cc 100%)",
              boxShadow: "0 4px 12px rgba(168, 22, 131, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px rgba(168, 22, 131, 0.4)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
            onClick={() => navigate("/allorders")}
          >
            <Typography variant="h5" fontWeight="600" gutterBottom>
              All Orders
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              <MdAutoGraph size={40} style={{ opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold">
                {order?.result?.length || 0}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: { xs: "100%", sm: "200px" },
              color: "white",
              p: { xs: 2.5, sm: 3 },
              borderRadius: "16px",
              cursor: "pointer",
              background:
                "linear-gradient(135deg, #1b3f9a 0%, #2b56b1 50%, #453bd0 100%)",
              boxShadow: "0 4px 12px rgba(43, 86, 177, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px rgba(43, 86, 177, 0.4)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
            onClick={() => navigate("/allproducts")}
          >
            <Typography variant="h5" fontWeight="600" gutterBottom>
              All Products
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              <MdAutoGraph size={40} style={{ opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold">
                {product?.result?.length || 0}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: { xs: "100%", sm: "200px" },
              color: "white",
              p: { xs: 2.5, sm: 3 },
              borderRadius: "16px",
              cursor: "pointer",
              background:
                "linear-gradient(135deg, #218a33 0%, #22b42c 50%, #1b8d34 100%)",
              boxShadow: "0 4px 12px rgba(34, 180, 44, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px rgba(34, 180, 44, 0.4)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
            onClick={() => navigate("/allusers")}
          >
            <Typography variant="h5" fontWeight="600" gutterBottom>
              All Users
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              <FaUsers size={40} style={{ opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold">
                {data?.result?.length || 0}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: { xs: "100%", sm: "200px" },
              color: "white",
              p: { xs: 2.5, sm: 3 },
              borderRadius: "16px",
              cursor: "pointer",
              background:
                "linear-gradient(135deg, #212522 0%, #1b1d1b 50%, #444644 100%)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
            onClick={() => navigate("/permissionpanel")}
          >
            <Typography variant="h5" fontWeight="600" gutterBottom>
              Permission Panel
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 1,
              }}
            >
              <MdOutlineSecurity size={40} style={{ opacity: 0.9 }} />
              <Typography variant="h4" fontWeight="bold">
                {permissionData?.result?.length || 0}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* <Transactions/> */}
              </Box>
    </>
  );
};

export default Dashboard;
