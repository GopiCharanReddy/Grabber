import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    requird: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  }
},{timestamps: true})

export const User = mongoose.model("User", userSchema)