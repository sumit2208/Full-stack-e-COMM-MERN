import React from "react";
import { Box, Typography } from "@mui/material";
import Badge from '@mui/material/Badge';
import { FiShoppingCart } from "react-icons/fi";    

function TotalCart({ totalAmount , Maptotal}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1,
        borderRadius: 2,
        bgcolor: "background.paper",
        boxShadow: 2,
        border: "1px solid",
        borderColor: "divider",
        
      }}
    >
      <Badge
        badgeContent={Maptotal.length}
        color="primary"
        sx={{
          "& .MuiBadge-badge": {
            fontSize: "0.75rem",
            minWidth: 20,
            height: 20,
            padding: "0",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            transform: "translate(40%, -40%)",
            boxShadow: "0px 1px 2px rgba(0,0,0,0.2)",
          },
        }}
      >
        <FiShoppingCart
          style={{
            fontSize: 22,
            color: "#1976d2",
            transition: "color 0.2s",
          }}
        />
      </Badge>

      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          letterSpacing: "0.5px",
        }}
      >
        Total: Rs {totalAmount}
      </Typography>
    </Box>
  );
}

export default TotalCart;
