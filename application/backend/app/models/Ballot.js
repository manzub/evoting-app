const mongoose = require("mongoose");

const Ballots = mongoose.model("Ballot", new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  candidates: [ { type: Object } ],
  status: { type: String, required: true, default: 'ongoing' },
  duration: { type: Number, required: true }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }))

module.exports = Ballots