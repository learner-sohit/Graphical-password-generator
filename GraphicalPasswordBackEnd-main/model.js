const mongoose = require("mongoose");

const user = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
  },
  normalizedEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  allId: {
    type: [String],
    required: true,
  },
  password: {
    type: String,
    default: null,
  },
  passwordHash: {
    type: String,
    default: null,
  },
  passwordSalt: {
    type: String,
    default: null,
  },
  theme: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

const UserDB = mongoose.model("User", user);

module.exports = UserDB;
