const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://vishalch22254_db_user:oT0coC3yFmz8llmf@cluster0.u5kmtgq.mongodb.net/?appName=Cluster0/emailTelemetry"
);

mongoose.connection.on("connected", () => {
  console.log("MongoDB Atlas connected");
});

mongoose.connection.on("error", (err) => {
  console.log("MongoDB error:", err);
});