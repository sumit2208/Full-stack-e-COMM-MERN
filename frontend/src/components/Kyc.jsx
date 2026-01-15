import React, { useState } from "react";
import {
  Typography,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
  Box,
  Paper,
  Alert,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Kyc = () => {
  const navigate = useNavigate();
  const _id = localStorage.getItem("_id");

  const {
    control,
    handleSubmit,
    reset: resetForm,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { name: "", dob: "", address: "", _id },
  });

  const onSubmit = async (data) => {
    await api.post("/kyc", data);
    navigate("/products");
  };

  const formValues = watch();

  const handleResumeData = async () => {
    const filledData = Object.fromEntries(
      Object.entries(formValues).filter(
        ([_, value]) => value != null && value !== ""
      )
    );
    console.log("Filled Data (Resume):", filledData);
    await api.post("/kyc", filledData);
  };

  useEffect(() => {
    const status = localStorage.getItem("kycStatus");
    if (status === "APPROVED") {
      navigate("/products");
    }
    const ResumeData2 = async (_id) => {
      const res = await api.get(`/resumekycdata/${_id}`);
      resetForm({
        name: res?.data?.data?.name || "",
        dob: res?.data?.data?.dob || "",
        address: res?.data?.data?.address || "",
        _id: _id,
      });
    };

    ResumeData2(_id);
  }, []);

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontWeight: 800 }} variant="h5" gutterBottom>
          KYC Verification
        </Typography>
        <Button variant="contained" onClick={handleResumeData}>
          Save Data
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 500 }}>
          Personal Details
        </Typography>

        <FormControl fullWidth margin="normal" error={!!errors.name}>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                }}
                placeholder="Enter your full Name"
                id="filled-basic"
                label="Full Name"
                variant="filled"
              />
            )}
          />

          {errors.name && (
            <FormHelperText>{errors.name.message}</FormHelperText>
          )}
        </FormControl>

        <FormControl fullWidth margin="normal" error={!!errors.dob}>
          <Controller
            name="dob"
            control={control}
            rules={{ required: "Date of Birth is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                }}
                type="date"
                id="dob filled-basi"
                variant="filled"
              />
            )}
          />
          <InputLabel htmlFor="dob" shrink>
            Date of Birth (DOB)
          </InputLabel>
          {errors.dob && <FormHelperText>{errors.dob.message}</FormHelperText>}
        </FormControl>

        <FormControl fullWidth margin="normal" error={!!errors.address}>
          <Controller
            name="address"
            control={control}
            rules={{ required: "Address is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                }}
                placeholder="Enter your full address"
                id="filled-basic"
                label="Address"
                variant="filled"
              />
            )}
          />

          {errors.address && (
            <FormHelperText>{errors.address.message}</FormHelperText>
          )}
        </FormControl>

        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
          <Button type="submit" variant="contained" color="success">
            Submit
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default Kyc;
