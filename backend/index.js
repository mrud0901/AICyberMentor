const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS for frontend
app.use(cors({
  origin: "*"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// your other routes below (auth, chat, etc.)

module.exports = app;
