const mongoose = require('mongoose');

const User = mongoose.model("User", new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: Number, default: 2 },
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }))

module.exports = User;