const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },

  gmailId: { type: String },
  subject: String,
  from: String,
  to: String,
  date: Date,
  snippet: String,
  body: String
});

emailSchema.index({ date: -1 });     // for sorting & time analytics
emailSchema.index({ from: 1 });      // for top senders
emailSchema.index({ gmailId: 1, userEmail: 1 }, { unique: true });   // for fast upserts
emailSchema.index({ userEmail: 1, date: -1 });

module.exports = mongoose.model("Email", emailSchema);