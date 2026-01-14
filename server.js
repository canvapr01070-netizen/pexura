const express = require("express");
const session = require("express-session");
const path = require("path");
const cors = require("cors");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

/* =======================
   TRUST PROXY (Render)
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
      secure: true,      // Render = HTTPS
      httpOnly: true,
      sameSite: "none",  // OAuth
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

// Home (login page)
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard.html");
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start Discord OAuth
app.get("/auth/discord", (req, res) => {
  const url =
    "https://discord.com/oauth2/authorize" +
    "?client_id=" + process.env.CLIENT_ID +
    "&response_type=code" +
    "&redirect_uri=" + encodeURIComponent(process.env.REDIRECT_URI) +
    "&scope=identify email" +
    "&prompt=consent";

  res.redirect(url);
});

// Discord Callback
app.get("/auth/discord/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect("/");

  try {
    // 1️⃣ Exchange code for token
    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
    });

    const tokenData = await tokenRes.json();

    // 2️⃣ Get Discord user info
    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const discordUser = await userRes.json();

    // 3️⃣ Save real user in session
    req.session.user = {
      id: discordUser.id,
      username: discordUser.username,
      avatar: discordUser.avatar
        ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
        : "https://cdn.discordapp.com/embed/avatars/0.png",
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

// API: get logged user
app.get("/user/me", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.json(req.session.user);
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("eco.sid", {
      path: "/",
      secure: true,
      sameSite: "none",
    });
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
