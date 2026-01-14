// 🔗 Backend base URL (بدّلها إلا تبدّل السيرفر)
const BACKEND_URL = "https://pexura.onrender.com";

// 🔐 Check if user already logged in
fetch(`${BACKEND_URL}/user/me`, {
  method: "GET",
  credentials: "include"
})
.then(res => {
  if (res.ok) {
    // User already logged in → redirect to dashboard
    window.location.href = "dashboard.html";
  }
})
.catch(err => {
  console.error("Backend not reachable", err);
});
