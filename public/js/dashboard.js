document.addEventListener("DOMContentLoaded", () => {
  // Get user info from backend
  fetch("/user/me", {
    method: "GET",
    credentials: "include",
  })
    .then((res) => {
      if (!res.ok) {
        // Not logged in
        window.location.href = "/";
        return;
      }
      return res.json();
    })
    .then((user) => {
      if (!user) return;

      // Fill user info
      const usernameEl = document.getElementById("username");
      const userIdEl = document.getElementById("userid");
      const avatarEl = document.getElementById("avatar");

      if (usernameEl) usernameEl.textContent = user.username;
      if (userIdEl) userIdEl.textContent = user.id;
      if (avatarEl) avatarEl.src = user.avatar;
    })
    .catch(() => {
      window.location.href = "/";
    });

  // Logout button
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "/logout";
    });
  }
});
