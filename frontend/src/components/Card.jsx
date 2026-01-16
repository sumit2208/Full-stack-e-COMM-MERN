import { Box, Button, ButtonGroup, Card, CardActions, CardContent, CardMedia, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import api from "../api";
import { FaCartPlus, FaTags, FaBoxOpen } from "react-icons/fa";
import { GiPriceTag } from "react-icons/gi";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const ProductCard = ({ _id, name, description, image, stock, price, DiscountAmount, DiscountedAmount }) => {
  const userId = localStorage.getItem("_id");
  
  const [isInCart, setIsInCart] = useState(false);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

 
  const checkCartStatus = async () => {
    if (!userId) return;
    try {
      const { data } = await api.get(`/getcart/${userId}`);
      const inCart = data.data.data.some(item => item.productId._id === _id);
      setIsInCart(inCart);
    } catch (err) {
      console.error("Failed to check cart status:", err);
    }
  };

  useEffect(() => {
    if (userId) {
      checkCartStatus();
    }
  }, [userId, _id]);

  const handleQuantityChange = (change) => {
    setQuantity(prev => {
      const newQty = prev + change;
      if (newQty < 1) return 1;
      if (newQty > (stock || 999)) return stock || 999;
      return newQty;
    });
  };

  const handleAddToCart = async () => {

  
    if (!userId) {
      alert("Please login first!");
      return;
    }

    setIsAdding(true);

    try {
      await api.post("/addtocart", {
        user: userId,
        productId: _id,
        quantity: quantity
      });

      setIsInCart(true);
      setShowQuantitySelector(false);
      setQuantity(1); 
      window.dispatchEvent(new CustomEvent('cart-updated'));
    } catch (err) { 
      alert("Failed to add to cart. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card
      sx={{
        width: 280,
        m: 2,
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(35,51,177,0.2)",
        }
      }}
    >
      <CardMedia
        component="img"
        height="220"
        image={image || "https://imgs.search.brave.com/1WO7q56PDL0klF26aeUopfRb5FmxL2hEvklhMf7gZ_E/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ndWlk/ZS1pbWFnZXMuY2Ru/LmlmaXhpdC5jb20v/aWdpL1hJV0ZBYlpy/amQ0Vmdkcnkuc3Rh/bmRhcmQ"}
        alt={name}
        sx={{
          objectFit: "cover",
          transition: "transform 0.4s ease",
          "&:hover": { transform: "scale(1.06)" }
        }}
      />

      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 2,
            minHeight: "2.8em"
          }}
        >
          {description}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <FaBoxOpen size={16} />
          <Typography variant="body2" color="error">
            {stock} in stock
          </Typography>
        </Box>

        <Box sx={{ bgcolor: "grey.50", p: 1.5, borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <span style={{ textDecoration: "line-through" }}>₹{price}</span>
          </Typography>

          <Typography variant="body2" color="success.main" fontWeight={500}>
            Discount: ₹{DiscountAmount}
          </Typography>

          <Typography variant="h6" color="primary" fontWeight="bold" mt={0.5}>
            ₹{DiscountedAmount}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 3, pb: 3, pt: 1 }}>
        { showQuantitySelector ? (
          <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1.5 }}> 
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                bgcolor: "grey.100",
                p: 1,
                borderRadius: 1
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <RemoveIcon fontSize="small" />
                </IconButton>

                <Typography
                  variant="h6"
                  sx={{ minWidth: 40, textAlign: "center", fontWeight: 600 }}
                >
                  {quantity}
                </Typography>

                <IconButton
                  size="small"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (stock || 999)}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>

              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={handleAddToCart}
                disabled={isAdding}
              >
                {isAdding ? "Adding..." : "Add"}
              </Button>
            </Box>

            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={() => {
                setShowQuantitySelector(false);
                setQuantity(1);
              }}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained" 
            fullWidth
            startIcon={<FaCartPlus />}
            onClick={() => setShowQuantitySelector(true)}
            sx={{ py: 1.2, fontWeight: 600,bgcolor:"#6457AE"}}
          >
            Add to Cart
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default ProductCard;