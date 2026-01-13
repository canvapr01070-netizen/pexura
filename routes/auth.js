const router = require("express").Router();
const axios = require("axios");

// STEP 1: Redirect user to Discord
router.get("/discord", (req, res) => {
  const url =
    "https://discord.com/api/oauth2/authorize" +
    `?client_id=${process.env.CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}` +
    "&response_type=code" +
    "&scope=identify";

  res.redirect(url);
});

// STEP 2: Callback from Discord
router.get("/discord/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.send("No code provided");

    // 🔑 Exchange code for access token
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );

    const accessToken = tokenRes.data.access_token;

    // 👤 Get user info
    const userRes = await axios.get(
      "https://discord.com/api/users/@me",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    // 💾 Save user in session
    req.session.user = {
      id: userRes.data.id,
      username: userRes.data.username,
      avatar: userRes.data.avatar
    };

    // ➜ Redirect to dashboard
    res.redirect(process.env.FRONTEND_URL + "/dashboard.html");

  } catch (err) {
    console.error("DISCORD TOKEN ERROR:");
    console.error(err.response?.data || err.message);
    res.send("Discord OAuth failed");
  }
});

module.exports = router;