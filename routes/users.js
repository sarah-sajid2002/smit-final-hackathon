const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/login-signup-practice");
const plm = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
  },
  projects: {
    type: [
      {
        projectName: String,
        timestamp: String,
        date: String,
        hostedUrl: String,
        description: String,
        file: String, // New field for storing image URL
      },
    ],
    default: null,
  },
});
userSchema.plugin(plm);

const User = mongoose.model("User", userSchema);

module.exports = User;
