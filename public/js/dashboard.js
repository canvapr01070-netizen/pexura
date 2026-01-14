const BACKEND_URL = "https://pexura.onrender.com";

// تحميل user
fetch(`${BACKEND_URL}/user/me`, {
  credentials: "include"
})
  .then(res => {
    if (!res.ok) {
      window.location.href = "/";
      return;
    }
    return res.json();
  })
  .then(user => {
    if (!user) return;

    document.getElementById("username").innerText = user.username;
    document.getElementById("userid").innerText = user.id;

    if (user.avatar) {
      document.getElementById("avatar").src =
        `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    }
  });

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", () => {
  fetch(`${BACKEND_URL}/auth/logout`, {
    method: "POST",
    credentials: "include"
  }).then(() => {
    window.location.href = "/";
  });
});
