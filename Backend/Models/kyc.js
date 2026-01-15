import mongoose from "mongoose";

const kycSchema = new mongoose.Schema(
  {
    name: {
      type: String, 
    },
    dob: {
      type: Date, 
    },
    address: {
      type: String, 
    },
    idProof: {
      type: String, 
    },
    addressProof: {
      type: String, 
    },
    status: {
      type: String,
      default: "Pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId, 
    },
  },
  { timestamps: true }
);

const Kyc = mongoose.model("kyc", kycSchema, "kyc");
export default Kyc;
