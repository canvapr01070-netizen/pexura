const BACKEND_URL = "https://pexura.onrender.com";

// Get user info
fetch(`${BACKEND_URL}/user/me`, {
  credentials: "include"
})
.then(res => {
  if (!res.ok) {
    location.href = "index.html";
    return;
  }
  return res.json();
})
.then(user => {
  document.getElementById("username").value = user.username;
  document.getElementById("userid").value = user.id;

  document.getElementById("avatar").src =
    `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
});

// Logout
function logout() {
  fetch(`${BACKEND_URL}/user/logout`, {
    credentials: "include"
  }).then(() => {
    location.href = "index.html";
  });
}
