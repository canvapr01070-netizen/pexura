require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path")

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();

/* =========================
   CORS CONFIG (IMPORTANT)
========================= */
app.use(cors({
  origin: "http://127.0.0.1:5500",
  credentials: true
}));

/* =========================
   BODY PARSER
========================= */
app.use(express.json());

/* =========================
   SESSION CONFIG (KEY PART)
========================= */
app.use(session({

  name: "eco.sid",

  secret: process.env.SESSION_SECRET,

  resave: false,

  saveUninitialized: false,

  cookie: {

    secure: true,

    httpOnly: true,

    sameSite: "none" // ⚠️ هنا

  }

}));

/* =========================
   ROUTES
========================= */
app.use(express.static(path.join(__dirname, "public")));
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

/* =========================
   TEST ROUTE
========================= */
app.get("/", (req, res) => {
  res.send(path.join(__dirname, "public", "index.html"));
});

/* =========================
   START SERVER (PTERODACTYL)
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});