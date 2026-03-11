const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  gmailId: { type: String, unique: true },
  subject: String,
  from: String,
  date: Date,
  snippet: String,
  to:String,
  body: String
});

module.exports = mongoose.model("Email", emailSchema);