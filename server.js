const express = require("express");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* =======================
   TRUST PROXY (IMPORTANT)
======================= */
app.set("trust proxy", 1);

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "https://pexura.onrender.com",
    credentials: true,
  })
);

/* =======================
   SESSION CONFIG (CRITICAL)
======================= */
app.use(
  session({
    name: "eco.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,       // ⚠️ Render = HTTPS
      httpOnly: true,
      sameSite: "none",   // ⚠️ OAuth
    },
  })
);

/* =======================
   STATIC FRONTEND
======================= */
app.use(express.static(path.join(__dirname, "public")));

/* =======================
   ROUTES
======================= */

// Home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Discord OAuth
app.get("/auth/discord", (req, res) => {
  const redirectUrl =
    "https://discord.com/oauth2/authorize" +
    "?client_id=" + process.env.CLIENT_ID +
    "&response_type=code" +
    "&redirect_uri=" + encodeURIComponent(process.env.REDIRECT_URI) +
    "&scope=identify email" +
    "&prompt=consent";

  res.redirect(redirectUrl);
});

// Discord Callback
app.get("/auth/discord/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect("/");

  try {
    // Save session (mock user for now)
    req.session.user = {
      logged: true,
    };

    res.redirect("/dashboard.html");
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

// Protected dashboard
app.get("/dashboard.html", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }

  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// API: get current user
app.get("/user/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }

  res.json(req.session.user);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("eco.sid");
    res.redirect("/");
  });
});

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
