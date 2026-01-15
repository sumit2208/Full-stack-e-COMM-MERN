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
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { MdEdit } from "react-icons/md";
import { IoIosAddCircle } from "react-icons/io";
import { AiFillProduct } from "react-icons/ai";
import { useEffect, useState } from "react";
import { FaProductHunt } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useForm, Controller } from "react-hook-form";
import Cookies from "js-cookie";
import api from "../api";

export default function AllProducts() {
  const token = Cookies.get("token");

  const [product, setproduct] = useState([]);
  const [open, setopen] = useState(false);
  const [editopen, seteditopen] = useState(false);
  const [deleteopen, setdelete] = useState(false);
  const [sneakbar, setsneakbar] = useState(false);
  const [selectedId, setselectedId] = useState(null);

  const { control, handleSubmit, reset } = useForm();
  const {
    control: control2,
    handleSubmit: handleSubmit2,
    reset: reset2,
  } = useForm();

  useEffect(() => {
    fetchallproducts();
  }, []);

  const onSubmit = async (data) => {
    const createProduct = async () => {
      await api.post("/crateproduct", data);

      fetchallproducts();
    };
    reset();
    handleclose();
    createProduct();
    setsneakbar(true);
  };

  const onSubmit2 = async (data) => {
    const UpdateProduct = async (_id) => {
      await api.patch(`/updateproduct/${_id}`, data);

      fetchallproducts();
    };
    reset2();
    UpdateProduct(selectedId);
    handleeditmodalclose();
  };

  const deleteproduct = async (_id) => {
    await api.delete(`/deleteproduct/${_id}`);

    fetchallproducts();
  };

  const fetchallproducts = async () => {
    try {
      const { data } = await api.get("/Allproducts");
      setproduct(data);
    } catch (error) {
      console.error("failed", err);
    }
  };

  const handlemodal = () => {
    setopen(true);
  };
  const handleclose = () => {
    setopen(false);
    setsneakbar(false);
  };

  const handleeditmodal = (_id) => {
    seteditopen(true);
    setselectedId(_id);
  };

  const handleeditmodalclose = () => {
    seteditopen(false);
  };

  const handledelete = (_id) => {
    deleteproduct(_id); 
  };

  const handledeleteclose = () => {
    setdelete(false);
  };

  return (
    <>
      <Snackbar
        open={sneakbar}
        onClose={handleclose}
        autoHideDuration={6000}
        message="Product Added Succesfully"
      />
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
            <Typography>You want to delete this Product</Typography>

            <Button
              variant="contained"
              color="error"
              onClick={() => deleteproduct()}
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
      <Modal open={open} onClose={handleclose}>
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
              <Typography sx={{ fontWeight: "bold" }}>
                Create Product{" "}
              </Typography>
              <FaProductHunt />
            </Box>
            <Controller
              name="name"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter the Product Name"
                  id="filled-basic"
                  label="Name"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="stock"
              control={control}
              rules={{ required: "Stock is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Stock"
                  id="filled-basic"
                  label="Stock"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter description"
                  id="filled-basic"
                  label="description"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="price"
              control={control}
              rules={{ required: "Price is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter price"
                  id="filled-basic"
                  label="Price"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="category"
              control={control}
              rules={{ required: "Cateogory is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter Cateogory"
                  id="filled-basic"
                  label="Cateogory"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="DiscountAmount"
              control={control}
              rules={{ required: "DiscountAmount is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter DiscountAmount"
                  id="filled-basic"
                  label="DiscountAmount"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="DiscountedAmount"
              control={control}
              rules={{ required: "DiscountedAmount is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter DiscountedAmount"
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
              <Button onClick={handleclose} variant="contained" color="error">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="success">
                Create Product
              </Button>
            </Box>
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
          onSubmit={handleSubmit2(onSubmit2)}
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
              <Typography sx={{ fontWeight: "bold" }}>
                Update Product{" "}
              </Typography>
              <FaProductHunt />
            </Box>
            <Controller
              name="name"
              control={control2}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter the Product Name"
                  id="filled-basic"
                  label="Name"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="stock"
              control={control2}
              rules={{ required: "Stock is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Stock"
                  id="filled-basic"
                  label="Stock"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="description"
              control={control2}
              rules={{ required: "Description is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter description"
                  id="filled-basic"
                  label="description"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="price"
              control={control2}
              rules={{ required: "Price is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter price"
                  id="filled-basic"
                  label="Price"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="cateogory"
              control={control2}
              rules={{ required: "Cateogory is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter Cateogory"
                  id="filled-basic"
                  label="Cateogory"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="DiscountAmount"
              control={control2}
              rules={{ required: "DiscountAmount is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter DiscountAmount"
                  id="filled-basic"
                  label="DiscountAmount"
                  variant="filled"
                />
              )}
            />
            <Controller
              name="DiscountedAmount"
              control={control2}
              rules={{ required: "DiscountedAmount is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter DiscountedAmount"
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
          All Products <AiFillProduct />
        </Typography>
        <IconButton>
          <IoIosAddCircle color="white" onClick={handlemodal} />
        </IconButton>
      </Box>
      <TableContainer component={Paper}>
        {product?.result ? (
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Stock
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Image
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Cateogory
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Description
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Price
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  DiscountAmount
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  DiscountedAmount
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
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.stock}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.imageUrl}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.category}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.description}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.price}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.DiscountAmount}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.DiscountedAmount}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
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
                        onClick={() => handleeditmodal(row._id)}
                      >
                        <MdEdit color="white" />{" "}
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handledelete(row._id)}
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
