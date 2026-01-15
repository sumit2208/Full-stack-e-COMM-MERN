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
  Input,
  LinearProgress,
  Modal,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { MdEdit, MdOutlineSecurity } from "react-icons/md";
import { IoIosAddCircle } from "react-icons/io";
import { useEffect, useState } from "react";
import { MdDeleteForever } from "react-icons/md";
import { useForm, Controller } from "react-hook-form";
import { Checkbox, FormControlLabel } from "@mui/material";
import Cookies from "js-cookie";
import api from "../api";

const Permission = () => {
  const token = Cookies.get("token");
  const { control, handleSubmit, reset } = useForm();
  const {
    control: control2,
    handleSubmit: handleSubmit2,
    reset: reset2,
  } = useForm({
    defaultValues: {
      permission: [],
    },
  });
  const [permissionData, setpermissionData] = useState();
  const [open, setopen] = useState(false);
  const [open2, setopen2] = useState(false);
  const [selectedId, setselectedId] = useState(null);
  useEffect(() => {
    Getallpermission();
  }, []);
  const Getallpermission = async () => {
    try {
      const { data } = await api.get("/getallpermission");
      setpermissionData(data);
    } catch (error) {
      console.error("failed", error);
    }
  };
  const onSubmit = async (datas) => {
    const createRole = async () => {
      // const res = await fetch("http://localhost:1111/createrole", {
      //   method: "POST",
      //   body: JSON.stringify(data),
      //   headers: {
      //     "Content-Type": "application/json",
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
     await api.post("/createrole", datas);
      Getallpermission();
    };
    createRole();
    hanldeclose();
  };

  const handlemodal2 = (_id) => {
    setopen2(true);
    setselectedId(_id);
  };
  const onSubmit2 = async (data) => {
    const updateRole = async (_id) => {
      await api.patch(`/updaterole/${_id}`, data);
      console.log(data,_id)
      Getallpermission();
    };
    updateRole(selectedId);
    hanldeclose2(); 
    reset2();
  };

  const handleDelete = async (_id) => {
    // const res = await fetch(`http://localhost:1111/deleterole/${_id}`, {
    //   method: "DELETE",
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });
    await api.delete(`/deleterole/${_id}`);
    Getallpermission();
  };

  const hanldeclose = () => {
    setopen(false);
  };
  const hanldeclose2 = () => {
    setopen2(false);
  };
  const handlemodal = () => {
    setopen(true);
  };

  const handledelete = (_id) => [handleDelete(_id)];

  return (
    <>
      <Modal open={open2} onClose={hanldeclose2}>
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
            <Typography sx={{ fontWeight: "bold" }}>Update Role</Typography>

            <Controller
              name="name"
              control={control2}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter the Product Name"
                  label="Name"
                  variant="filled"
                />
              )}
            />

            <Controller
              name="description"
              control={control2}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter the Description"
                  label="Description"
                  variant="filled"
                />
              )}
            />

            <Controller
              name="permission"
              control={control2}
              render={({ field }) => (
                <Box>
                  {[
                    "ORDER",
                    "CREATE_PRODUCT",
                    "VISIT_PRODUCT",
                    "ADD_PRODUCT",
                  ].map((tech) => (
                    <FormControlLabel
                      key={tech}
                      control={
                        <Checkbox
                          checked={field.value?.includes(tech)}
                          onChange={(e) => {
                            const newValue = e.target.checked
                              ? [...field.value, tech]
                              : field.value.filter((v) => v !== tech);
                            field.onChange(newValue);
                          }}
                        />
                      }
                      label={tech.charAt(0).toUpperCase() + tech.slice(1)}
                    />
                  ))}
                </Box>
              )}
            />

            <Box
              sx={{
                display: "flex",
                gap: "20px",
                justifyContent: "space-between",
              }}
            >
              <Button variant="contained" color="error" onClick={hanldeclose2}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="success">
                Update Role
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      <Modal open={open} onClose={hanldeclose}>
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
              <Typography sx={{ fontWeight: "bold" }}>Create Role </Typography>
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
              name="description"
              control={control}
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  placeholder="Enter the Description"
                  id="filled-basic"
                  label="Description"
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
              <Button variant="contained" color="error" onClick={hanldeclose}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="success">
                Create Role
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
          Permissions <MdOutlineSecurity />
        </Typography>
        <IconButton onClick={handlemodal}>
          <IoIosAddCircle color="white" />
        </IconButton>
      </Box>
      <TableContainer component={Paper}>
        {permissionData?.result ? (
          <Table sx={{ minWidth: 650 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Description
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {permissionData?.result?.map((row) => (
                <TableRow
                  key={row._id}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ color: "grey" }} align="right">
                    {row.description}
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
                        onClick={() => handlemodal2(row._id)}
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
};

export default Permission;
