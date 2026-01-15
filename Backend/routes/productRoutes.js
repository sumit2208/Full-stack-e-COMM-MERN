import express from "express";
import { 
  AddtoCart,
  CreateProduct,
  DeleteProduct,
  getAllProducts,
  GetCart,
  RemoveCartItem,
  Updateproduct, 
  UpdateQuantity,
} from "../controller/ProductController.js";
import { authenticate } from "../middleware/ValidateUser.js"; 

const router = express.Router();

router.get("/Allproducts",authenticate, getAllProducts);
router.get("/getcart/:_id",authenticate, GetCart);
router.post("/crateproduct",authenticate, CreateProduct);
router.post("/addtocart",authenticate, AddtoCart);
router.delete("/deleteproduct/:_id", authenticate, DeleteProduct);
router.patch("/updateproduct/:_id",authenticate, Updateproduct);
router.patch('/updatequantity/:productid',authenticate,UpdateQuantity)
router.delete("/cartdeleteitem/:_id", authenticate,RemoveCartItem)

export default router;
