import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Box, Typography, Button, Paper, Container, Fade } from "@mui/material";
import {
  IoCheckmarkCircleSharp,
  IoArrowBackCircleOutline,
} from "react-icons/io5";

const PaymentSuccess = () => {
  const query = new URLSearchParams(useLocation().search);
  const reference = query.get("reference");

  return (
    <Container maxWidth="md">
      <Fade in timeout={800}>
        <Box
          sx={{
            minHeight: "80vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            py: 6,
          }}
        >
          <Paper
            elevation={6}
            sx={{
              p: { xs: 4, md: 7 },
              borderRadius: 4,
              maxWidth: 600,
              width: "100%",
              background: "linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
   
            <Box
              sx={{
                mb: 4,
                color: "#4caf50",
                fontSize: { xs: "5rem", md: "7rem" },
                animation: "pulse 2s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { transform: "scale(1)" },
                  "50%": { transform: "scale(1.08)" },
                },
              }}
            >
              <IoCheckmarkCircleSharp />
            </Box>

            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              color="success.main"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Payment Successful!
            </Typography>

            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 420, mx: "auto" }}
            >
              Thank you for your purchase. Your payment has been processed
              successfully.
            </Typography>

            {reference && (
              <Box
                sx={{
                  bgcolor: "grey.100",
                  p: 2,
                  borderRadius: 2,
                  mb: 5,
                  display: "inline-block",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary">
                  Reference ID
                </Typography>
                <Typography
                  variant="h6"
                  fontFamily="monospace"
                  color="primary.main"
                >
                  {reference}
                </Typography>
              </Box>
            )}

            <Button
              component={Link}
              to="/products"
              variant="contained"
              color="success"
              size="large"
              startIcon={<IoArrowBackCircleOutline />}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: "1.1rem",
                borderRadius: 2,
                boxShadow: 3,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.25s ease",
              }}
            >
              Back to Products
            </Button>
          </Paper>

  
        </Box>
      </Fade>
    </Container>
  );
};

export default PaymentSuccess;
