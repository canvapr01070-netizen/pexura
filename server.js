require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();

/* CORS */
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

/* SESSION */
app.set("trust proxy", 1); // 🔴 ضروري ف Render

app.use(
  session({
    name: "eco.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,      // Render = HTTPS
      sameSite: "none",  // cross-site
      maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
  })
);
/* STATIC FRONTEND */
app.use(express.static(path.join(__dirname, "public")));

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

/* PROTECT DASHBOARD */
app.get("/dashboard.html", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/");
  }
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

/* HOME */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Server running on port " + PORT)
);
