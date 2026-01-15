import { Box, CardActions } from "@mui/material";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import api from "../api";
import { useEffect, useState } from "react";
import { FaCartPlus, FaTags, FaBoxOpen } from "react-icons/fa";
import { GiPriceTag } from "react-icons/gi";

const ProductCard = (props) => {
  const user = localStorage.getItem("_id");
  const [hide, sethide] = useState([]);
  
  const getitemlist = async (user) => {
    const data = await api.get(`/getcart/${user}`);
    sethide(data.data.data.map((e) => e.productId._id));
  };

  useEffect(() => {
    getitemlist(user);
  }, [user]);

  const handleAddTocart = async (_id) => {
    await api.post("/addtocart", {
      user: user,
      productId: _id,
    });
    getitemlist(user);
  };

  return (
    <Card
      sx={{
        width: 270,
        margin: 2,
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        backgroundColor: "background.paper",  
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(35, 51, 177, 0.25)",
          borderColor: "primary.main",
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image="https://imgs.search.brave.com/J4C1b7XxQEbnszcCzpuzw3PWHoaMxqAdmIczApmKC7M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9ndWlk/ZS1pbWFnZXMuY2Ru/LmlmaXhpdC5jb20v/aWdpL2xNRmNXWG8x/cHBxa0lIWVYuc3Rh/bmRhcmQ"
        alt={props.name}
        sx={{
          objectFit: "cover",
          transition: "transform 0.3s ease",
          "&:hover": {
            transform: "scale(1.05)",
          },
        }}
      />
      <CardContent
        sx={{
          padding: 3,
          "&:last-child": {
            paddingBottom: 2,
          },
        }}
      >
        <Typography
          gutterBottom
          variant="h6"
          component="div"
          fontWeight="700"
          color="text.primary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        > 
          {props.name}
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary" 
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            mb: 1.5,
            minHeight: "3em",
          }}
        >
          {props.description}
        </Typography>

        <Typography
          variant="body2"
          color="error"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            mb: 1,
          }}
        >
          <FaBoxOpen size={14} />
          {props.stock} Left in stock
        </Typography>

        <Box sx={{ mt: 1.5, p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <GiPriceTag size={14} color="text.secondary" />
            <span style={{ textDecoration: "line-through" }}>{props.price}</span>
          </Typography>
          
          <Typography
            variant="body2"
            color="success.main"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mt: 0.5,
            }}
          >
            <FaTags size={14} />
            Discount: {props.DiscountAmount}
          </Typography>
          
          <Typography
            variant="h6"
            color="primary"
            fontWeight="bold"
            sx={{
              mt: 0.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <FaCartPlus size={18} />
            Final: {props.DiscountedAmount}
          </Typography>
        </Box>
      </CardContent>
      
      <CardActions
        sx={{
          padding: 2,
          pt: 0,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="small"
          fullWidth
          disabled={hide.includes(props._id)}
          onClick={() => handleAddTocart(props._id)}
          startIcon={<FaCartPlus />}
          sx={{
            textTransform: "none",
            fontWeight: "600",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            "&:hover": {
              boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
              transform: "translateY(-1px)",
            },
          }}
        >
          {hide.includes(props._id) ? "Added to Cart" : "Add to Cart"}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;   