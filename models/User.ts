import { Schema, model } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  display_name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  date_registered: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: Number,
    default: 0,
  },
});

export default model("User", UserSchema, "users");
