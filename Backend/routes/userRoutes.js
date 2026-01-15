import express from "express";
import {
  allpermission,
  CreateRole,
  createUser,
  getAllUser,
  DeleteRole,
  getallpermission,
  sendkyc,
  UpdateRole,
  UserDelete,
  userLogin,
  UserUpdateData,
  Profile,
  ResumeKycData,
} from "../controller/userController.js";
import { authenticate } from "../middleware/ValidateUser.js";
import {
  getAllTransactions,
  getTransactionById,
} from "../controller/Transaction.js";
const router = express.Router();
router.post("/signup", createUser);
router.post("/login", userLogin);
router.post("/kyc", authenticate, sendkyc);
router.get("/resumekycdata/:_id", authenticate, ResumeKycData);
router.get("/getallusers", authenticate, getAllUser);
router.get("/getallpermission", authenticate, allpermission);
router.post("/createrole", authenticate, CreateRole);
router.delete("/deleterole/:_id", authenticate, DeleteRole);
router.patch("/updaterole/:_id", authenticate, UpdateRole);
router.patch("/updateuser/:_id", authenticate, UserUpdateData);
router.delete("/userdelete/:_id", authenticate, UserDelete);
router.get("/allpermission", getallpermission);
router.get("/profile/:_id", authenticate, Profile);

router.get("/admintransction", authenticate, getAllTransactions);
router.get("/admintransction/:id", authenticate, getTransactionById);

export default router;
