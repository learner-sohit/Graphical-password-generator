const mongoose = require("mongoose");

const user = new mongoose.Schema({
    email: { type: "string", required: true },
    allId: { type: "array", required: true },
    password: { type: "string", required: true },
    theme: { type: "string", required: true },
});

const UserDB = mongoose.model("User", user);

module.exports = UserDB;