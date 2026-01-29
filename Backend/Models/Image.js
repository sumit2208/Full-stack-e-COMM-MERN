import mongoose, { Schema } from "mongoose";

const ImageSchema = new mongoose.Schema({
  name: String,

  path: String,
  UserId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Image = mongoose.model("Image", ImageSchema, "Image");
