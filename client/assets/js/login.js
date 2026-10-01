const API_BASE_URL = "http://localhost:3000/api/auth";

const loginCard = document.getElementById("loginCard");
const signupCard = document.getElementById("signupCard");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginError = document.getElementById("loginError");
const signupError = document.getElementById("signupError");
const signupSuccess = document.getElementById("signupSuccess");

const roleSelect = document.getElementById("roleSelect");
const forgotPasswordLink = document.getElementById("lupaPasswordLink");

// ============ Switch antara Login <-> Signup ============
showSignup.addEventListener("click", (e) => {
  e.preventDefault();
  loginCard.classList.add("hidden");
  signupCard.classList.remove("hidden");
  clearMessages();
});

showLogin.addEventListener("click", (e) => {
  e.preventDefault();
  signupCard.classList.add("hidden");
  loginCard.classList.remove("hidden");
  clearMessages();
});

function clearMessages() {
  loginError.textContent = "";
  signupError.textContent = "";
  signupSuccess.textContent = "";
}

// ============ Toggle show/hide password ============
document.querySelectorAll(".toggle-eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);
    input.type = input.type === "password" ? "text" : "password";
  });
});

// ============ Lupa Password ============
forgotPasswordLink.addEventListener("click", (e) => {
  e.preventDefault();
  alert("Lupa password? Silakan hubungi admin sistem untuk mereset password akun kamu.");
});

// ============ LOGIN ============
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError.textContent = "";

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const ingatSaya = document.getElementById("ingatSaya").checked;

  if (!username || !password) {
    loginError.textContent = "Username dan password wajib diisi.";
    return;
  }

  const submitBtn = loginForm.querySelector(".btn-primary");
  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses...";

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, ingatSaya }),
    });

    const data = await res.json();

    if (!res.ok) {
      loginError.textContent = data.message || "Login gagal.";
      return;
    }

    // Kalau "Ingat saya" dicentang -> simpan di localStorage (bertahan lama).
    // Kalau tidak -> simpan di sessionStorage (hilang saat tab/browser ditutup).
    const storage = ingatSaya ? localStorage : sessionStorage;
    storage.setItem("token", data.token);
    storage.setItem("username", data.user.username);
    storage.setItem("role", data.user.role);

    window.location.href = "/dashboard";
  } catch (err) {
    loginError.textContent = "Tidak bisa terhubung ke server.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Log In";
  }
});

// ============ SIGN UP ============
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupError.textContent = "";
  signupSuccess.textContent = "";

  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const konfirmasiPassword = document.getElementById("konfirmasiPassword").value;
  const role = roleSelect.value;

  if (!username || !password || !konfirmasiPassword) {
    signupError.textContent = "Semua field wajib diisi.";
    return;
  }

  if (password.length < 6) {
    signupError.textContent = "Password minimal 6 karakter.";
    return;
  }

  if (password !== konfirmasiPassword) {
    signupError.textContent = "Password dan konfirmasi password tidak sama.";
    return;
  }

  const submitBtn = signupForm.querySelector(".btn-primary");
  submitBtn.disabled = true;
  submitBtn.textContent = "Memproses...";

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, role }),
    });

    const data = await res.json();

    if (!res.ok) {
      signupError.textContent = data.message || "Pendaftaran gagal.";
      return;
    }

    signupSuccess.textContent = "Akun berhasil dibuat! Silakan login.";
    signupForm.reset();

    setTimeout(() => {
      signupCard.classList.add("hidden");
      loginCard.classList.remove("hidden");
      clearMessages();
    }, 1200);
  } catch (err) {
    signupError.textContent = "Tidak bisa terhubung ke server.";
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign Up";
  }
});