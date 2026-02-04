const express = require("express");
const cors = require("cors");

const app = express();

/* ======================
   ENABLE CORS (CRITICAL)
====================== */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

/* ======================
   TEST ROUTE
====================== */
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

/* ======================
   AUTH ROUTES
====================== */
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

module.exports = app;
