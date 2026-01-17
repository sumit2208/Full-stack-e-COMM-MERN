import { IoSearchOutline } from "react-icons/io5";
import { IoIosNotifications } from "react-icons/io";
import { IoPersonCircle } from "react-icons/io5";
import { FaChevronLeft, FaShoppingCart } from "react-icons/fa";
import { FaCartArrowDown } from "react-icons/fa";
import { MdClear } from "react-icons/md";
import {
  Box,
  Button,
  CardMedia,
  Divider,
  Drawer,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  Badge,
} from "@mui/material";
import { IoMenu } from "react-icons/io5";
import { BsChatSquareDotsFill } from "react-icons/bs";
import { useState } from "react";
import { IoHomeSharp } from "react-icons/io5";
import { useLocation, useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa6";
import api from "../api";
import Cookies from "js-cookie";
import { getDecryptedRole } from "./common/encodedecode";
import { useEffect } from "react";
import { MdVerified } from "react-icons/md";
import { MdOutlineVerifiedUser } from "react-icons/md";
import { MdPending } from "react-icons/md";
import TotalCart from "./TotalCart";
import axios from "axios";
const Navbar = () => {
  const _id = localStorage.getItem("_id");

  // Statess
  const [itemlist, setitemlist] = useState([]);
  const [open, setopen] = useState(false);
  const [secondopen, setsecondopen] = useState(false);
  const [profile, setprofile] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const getitemlist = async (_id) => {
    const data = await api.get(`/getcart/${_id}`);
    const cartItems = data.data.data;

    const itemListWithQuantity = cartItems.map((item) => ({
      ...item.productId,
      quantity: item.quantity,
      _id: item._id,
    }));

    setitemlist(itemListWithQuantity);
  };

  useEffect(() => {
    getitemlist(_id);
    const handlecartupdate = () => {
      getitemlist(_id);
    };

    window.addEventListener("cart-updated", handlecartupdate);
  }, [_id]);

  const Maptotal = itemlist.map((e) => e.DiscountedAmount);

  const Total = itemlist.reduce((sum, item) => {
    return sum + item.DiscountedAmount * (item.quantity || 1);
  }, 0);

  const handleIncreaseQuantity = async (itemId) => {
    setitemlist((prev) =>
      prev.map((item) =>
        item._id === itemId
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item
      )
    );
    const updatedItem = itemlist.find((item) => item._id === itemId);
    const newQuantity = (updatedItem?.quantity || 1) + 1;

    try {
      await api.patch(`/updatequantity/${itemId}`, { quantity: newQuantity });
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const handleDecreaseQuantity = async (itemId) => {
    let newQuantity = 0;

    setitemlist((prev) => {
      const item = prev.find((i) => i._id === itemId);
      if (!item || item.quantity <= 1) return prev;

      newQuantity = item.quantity - 1;

      return prev.map((i) =>
        i._id === itemId ? { ...i, quantity: newQuantity } : i
      );
    });

    if (newQuantity < 1) return;

    try {
      await api.patch(`/updatequantity/${itemId}`, { quantity: newQuantity });
    } catch (error) {
      console.error("Failed to update quantity:", error);
    }
  };

  const navigate = useNavigate();
  const location = useLocation();
  const logout = async () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("_id");
    Cookies.remove("refreshToken");
    setprofile([]);
    navigate("/login");
  };

  const HandleDeleteCartItem = async (_cartid) => {
    await api.delete(`cartdeleteitem/${_cartid}`);
    getitemlist(_id);
  };

  const Role = getDecryptedRole();

  const menuopen = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlenavigate = (e) => {
    navigate(`/${e}`);
    setopen(false);
  };

  const handleViewOrders = () => {
    navigate("/userOrders");
  };
  const handlechat = () =>{
    navigate('/chat')
  }

  useEffect(() => {
    const _id = localStorage.getItem("_id");
    const Profile = async (_id) => {
      try {
        const ProfileData = await api.get(`/profile/${_id}`);
        console.log(ProfileData);
        setprofile(ProfileData);
      } catch (error) {
        console.error("Failed", error);
      }
    };
    Profile(_id);
  }, [location]);

  const handleRemoveCart = async (_id) => {
    await api.delete(`/usercartdelete/${_id}`);
  };

  const handlecheckout = async (amount) => {
    try {
      const { data: keydata } = await axios.get("http://localhost:1111/getkey");
      const { key } = keydata;

      const { data: orderData } = await axios.post(
        "https://unagitated-jamie-waxier.ngrok-free.dev/payment/process",
        {
          amount,
          userId: profile?.data?.result?._id,
          email: profile?.data?.result?.email,
          items: itemlist.map((item) => ({
            product: item._id,
            quantity: item.quantity || 1,
            price: item.DiscountedAmount,
          })),
        }
      );

      const { order, userOrderId } = orderData;

      const options = {
        key,
        amount: amount,
        currency: "INR",
        name: "Sumit Corp",
        description: "Test Transaction",
        order_id: order.id,
        notes: {
          userId: profile?.data?.result?._id,
          userOrderId: userOrderId,
        },

        callback_url:
          "https://unagitated-jamie-waxier.ngrok-free.dev/paymentverification",

        prefill: {
          name: profile?.data?.result?.name,
          email: profile?.data?.result?.email,
        },
        theme: {
          color: "#6457AE",
        },

        handler: function (response) {
          handleRemoveCart(_id);
          window.location.href = `http://localhost:5173/paymentSuccess?reference=${response.razorpay_payment_id}`;
        },
      };

      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      alert("Error starting payment. Please try again.");
    }
  };

  return (
    <>
      <Drawer
        open={secondopen}
        anchor="right"
        onClose={() => setsecondopen(false)}
        slotProps={{
          backdrop: {
            style: {
              background: "rgba(0, 0, 0, 0.5)",
            },
          },
        }}
      >
        <>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 5,
              py: 2,
              bgcolor: "rgba(161, 161, 161, 0.22)",
            }}
          >
            <Typography sx={{ fontWeight: 800 }}>My Cart</Typography>
            <IconButton onClick={() => setsecondopen(false)}>
              <MdClear color="black" />
            </IconButton>
          </Box>
          {itemlist.map((e) => (
            <>
              <Divider
                sx={{ borderColor: "rgb(47, 46, 46)", borderWidth: 1.5 }}
              />
              <Box
                key={e._id}
                sx={{
                  display: "flex",
                  width: "500px",
                  p: 3,
                  gap: "20px",
                }}
              >
                <Box>
                  <CardMedia
                    component="img"
                    height="50px"
                    width="50px"
                    image="https://expressfly.in/img/logo.png"
                    alt="Paella dish"
                  />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {e.name}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {e.DiscountedAmount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="grey">
                      {e.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography>
                      <IconButton>
                        <FaChevronLeft
                          onClick={() => {
                            handleDecreaseQuantity(e._id);
                          }}
                        />
                      </IconButton>
                      {e.quantity}
                      <IconButton>
                        <FaChevronRight
                          onClick={() => {
                            handleIncreaseQuantity(e._id);
                          }}
                        />
                      </IconButton>
                    </Typography>

                    <Button
                      onClick={() => HandleDeleteCartItem(e._id)}
                      variant="contained"
                      size="small"
                      sx={{ fontSize: "10px", bgcolor: "#6457AE" }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ borderColor: "#0b0b0bff", borderWidth: 1 }} />
            </>
          ))}
          <Box
            sx={{
              display: "flex",
              p: 2,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <TotalCart totalAmount={Total} Maptotal={Maptotal} />
            <Button
              variant="contained"
              sx={{ bgcolor: "#6457AE" }}
              onClick={() => handlecheckout(Total)}
            >
              Checkout
            </Button>
          </Box>
        </>
      </Drawer>

      <Drawer
        open={open}
        onClose={() => setopen(false)}
        slotProps={{
          backdrop: {
            style: {
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(8px)",
            },
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: "center" }}>
          <CardMedia
            component="img"
            height="50px"
            width="50px"
            image="https://expressfly.in/img/logo.png"
            alt="Paella dish"
          />
          <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
            Role: {Role}
          </Typography>
          <Divider sx={{ my: 2, borderColor: "black", borderWidth: 2 }} />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            px: 3,
          }}
        >
          {["AllProducts", "AllOrders", "Allprofiles"].map((text) => (
            <Box key={text}>
              {Role === "ADMIN" ? (
                <>
                  <ListItemButton
                    onClick={() => handlenavigate(`${text}`)}
                    sx={{ borderRadius: 1, mb: 1 }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{text}</Typography>
                  </ListItemButton>
                  <Divider sx={{ borderColor: "black", borderWidth: 2 }} />
                </>
              ) : (
                ""
              )}
            </Box>
          ))}
          {Role === "CUSTOMER" ? (
            <Box>
              <ListItemButton onClick={() => navigate("/products")}>
                <Typography sx={{ fontWeight: 700 }}> Products</Typography>
              </ListItemButton>
              <Divider sx={{ borderColor: "black", borderWidth: 2 }} />
            </Box>
          ) : (
            ""
          )}

          <Box
            sx={{
              mt: "auto",
              display: "flex",
              justifyContent: "center",
              gap: 2,
              py: 2,
            }}
          >
            <IconButton>
              <IoIosNotifications
                style={{ color: "black", fontSize: "25px" }}
              />
            </IconButton>
            <IconButton>
              <IoPersonCircle style={{ color: "black", fontSize: "25px" }} />
            </IconButton>

            <IconButton sx={{ display: { xs: "inline", md: "none" } }}>
              <IoMenu style={{ color: "black", fontSize: "25px" }} />
            </IconButton>
          </Box>
        </Box>
      </Drawer>
      <div
        style={{
          backgroundColor: "#c8c8d0",
          padding: "12px clamp(20px, 5vw, 180px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          position: "sticky",
          top: 0,
          zIndex: 1200,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px 32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <IconButton
              onClick={() => {
                setopen(true);
              }}
              sx={{
                color: "white",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.51)" },
              }}
            >
              <IoMenu size={28} color="#6457AE" />
            </IconButton>
            {Role === "ADMIN" && (
              <IconButton
                onClick={() => navigate("/")}
                sx={{
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                }}
              >
                <IoHomeSharp size={26} color="#6457AE" />
              </IconButton>
            )}

            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <CardMedia
                component="img"
                height="50px"
                width="50px"
                image="https://expressfly.in/img/logo.png"
                alt="Paella dish"
              />
            </Box>
          </div>

          <div
            style={{
              backgroundColor: "white",
              borderRadius: "50px",
              flex: "1 1 300px",
              maxWidth: "720px",
              minWidth: "280px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 3,
                py: 0.8,
              }}
            >
              <IoSearchOutline
                style={{ color: "#666", fontSize: "26px", marginRight: "12px" }}
              />
              <Input
                placeholder="Search..."
                disableUnderline
                fullWidth
                sx={{
                  display: { xs: "none", md: "block" },
                  color: "#333",
                  fontSize: "1.05rem",
                  "& input::placeholder": {
                    color: "#999",
                    opacity: 1,
                  },
                }}
              />
            </Box>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {Role === "ADMIN" ? (
              <IconButton
                onClick={handleClick}
                sx={{
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.12)" },
                }}
              >
                <IoPersonCircle size={30} color="#6457AE" />
              </IconButton>
            ) : (
              <>
                <Button
                  onClick={handleViewOrders}
                  variant="contained"
                  sx={{ bgcolor: "#6457AE" }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography variant="body2">View Orders</Typography>
                    <FaCartArrowDown />
                  </Box>
                </Button>
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.51)" },
                  }}
                >
                  <MdOutlineVerifiedUser size={26} color="#6457AE" />
                </IconButton>
                <Button variant="contained" sx={{bgcolor: "#6457AE",display:"flex",gap:"10px",alignItems:"center",justifyContent:"space-between"}} onClick={handlechat}>
                    <Typography>Chat</Typography>
                   <BsChatSquareDotsFill />
                </Button>
                <IconButton
                  sx={{
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.51)" },
                  }}
                >
                  <IoIosNotifications size={26} color="#6457AE" />
                </IconButton>

                <IconButton
                  onClick={() => setsecondopen(true)}
                  sx={{
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.51)" },
                  }}
                >
                  <Badge
                    badgeContent={Maptotal.length}
                    color="error"
                    sx={{
                      "& .MuiBadge-badge": {
                        right: 4,
                        top: 4,
                        padding: "0 4px",
                      },
                    }}
                  >
                    <FaShoppingCart size={26} color="#6457AE" />
                  </Badge>
                </IconButton>
                <IconButton
                  onClick={handleClick}
                  sx={{
                    color: "white",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.51)" },
                  }}
                >
                  <IoPersonCircle size={30} color="#6457AE" />
                </IconButton>
              </>
            )}

            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={menuopen}
              onClose={handleClose}
              slotProps={{
                paper: {
                  sx: {
                    minWidth: 240,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    mt: 1,
                  },
                },
                list: {
                  "aria-labelledby": "basic-button",
                  sx: { p: 0 },
                },
              }}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  Name: {profile?.data?.result?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  Email: {profile?.data?.result?.email}
                </Typography>
                <Typography
                  variant="caption"
                  color="success.main"
                  display="block"
                  mt={0.5}
                >
                  Role: {profile?.data?.result?.role}
                </Typography>
                <Typography
                  variant="caption"
                  color={`${
                    profile?.data?.result?.kycStatus === "APPROVED"
                      ? "success"
                      : "red"
                  }`}
                  display="block"
                >
                  KYC:{" "}
                  {profile?.data?.result?.kycStatus === "APPROVED" ? (
                    <>
                      {profile?.data?.result?.kycStatus}
                      <MdVerified />
                    </>
                  ) : (
                    <>
                      {profile?.data?.result?.kycStatus}
                      <MdPending />
                    </>
                  )}
                </Typography>
              </Box>

              <Divider sx={{ mx: 1.5 }} />

              <MenuItem
                onClick={logout}
                sx={{
                  mx: 1,
                  mt: 1,
                  mb: 0.5,
                  py: 1,
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
