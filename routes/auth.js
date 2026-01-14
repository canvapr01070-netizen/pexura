const router = require("express").Router();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const USERS_FILE = path.join(__dirname, "../users.json");

/* LOGIN */
router.get("/discord", (req, res) => {
  const url =
    "https://discord.com/api/oauth2/authorize" +
    `?client_id=${process.env.CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}` +
    "&response_type=code&scope=identify";

  res.redirect(url);
});

/* CALLBACK */
router.get("/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.redirect("/");

  try {
    /* TOKEN */
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    /* USER INFO */
    const userRes = await axios.get(
      "https://discord.com/api/users/@me",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const user = userRes.data;

    /* SAVE SESSION */
    req.session.user = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
    };

    /* SAVE TO users.json */
    let users = [];
    if (fs.existsSync(USERS_FILE)) {
      users = JSON.parse(fs.readFileSync(USERS_FILE));
    }

    if (!users.find((u) => u.id === user.id)) {
      users.push(req.session.user);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    }

    res.redirect("/dashboard.html");
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

/* LOGOUT */
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("eco.sid");
    res.redirect("/");
  });
});

module.exports = router;
