(() => {
  const STORAGE_USERS = "sutton_users";
  const STORAGE_SESSION = "sutton_session";
  const STORAGE_ORDERS = "sutton_orders";

  function readUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_USERS) || "[]");
    } catch {
      return [];
    }
  }

  function writeUsers(users) {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
  }

  function readAllOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_ORDERS) || "[]");
    } catch {
      return [];
    }
  }

  function writeAllOrders(orders) {
    localStorage.setItem(STORAGE_ORDERS, JSON.stringify(orders));
  }

  function getOrders(email) {
    const key = String(email || "").toLowerCase();
    return readAllOrders()
      .filter((o) => o.email === key)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  function addOrder(email, order) {
    const all = readAllOrders();
    const id =
      "SC" +
      String(Date.now()).slice(-8) +
      String(Math.floor(Math.random() * 90) + 10);
    const entry = {
      id,
      email: String(email || "").toLowerCase(),
      service: order.service || "Service",
      price: order.price || "—",
      duration: order.duration || "—",
      date: order.date || "",
      vehicle: order.vehicle || "",
      phone: order.phone || "",
      name: order.name || "",
      status: order.status || "pending",
      type: order.type || "booking",
      items: order.items || null,
      fitment: order.fitment || "",
      notes: order.notes || "",
      createdAt: order.createdAt || new Date().toISOString(),
    };
    all.push(entry);
    writeAllOrders(all);
    return entry;
  }

  function setSession(user, remember) {
    const payload = JSON.stringify({
      email: user.email,
      name: user.name,
      phone: user.phone || "",
      at: Date.now(),
    });
    if (remember) {
      localStorage.setItem(STORAGE_SESSION, payload);
      sessionStorage.removeItem(STORAGE_SESSION);
    } else {
      sessionStorage.setItem(STORAGE_SESSION, payload);
      localStorage.removeItem(STORAGE_SESSION);
    }
  }

  function getSession() {
    try {
      return JSON.parse(
        sessionStorage.getItem(STORAGE_SESSION) ||
          localStorage.getItem(STORAGE_SESSION) ||
          "null"
      );
    } catch {
      return null;
    }
  }

  function clearSession() {
    sessionStorage.removeItem(STORAGE_SESSION);
    localStorage.removeItem(STORAGE_SESSION);
  }

  function redirectAfterAuth() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next");
    const safe =
      next && /^[a-z0-9\-]+\.html$/i.test(next) ? next : "orders.html";
    window.location.href = safe;
  }

  document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".password-field");
      const input = wrap && wrap.querySelector("input");
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "Hide" : "Show";
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });

  const registerForm = document.getElementById("register-form");
  const registerStatus = document.getElementById("register-status");

  if (registerForm && registerStatus) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!registerForm.checkValidity()) {
        registerStatus.textContent = "Please fill in all required fields.";
        registerStatus.className = "form-status is-error";
        registerForm.reportValidity();
        return;
      }

      const data = new FormData(registerForm);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = String(data.get("password") || "");
      const confirm = String(data.get("confirm") || "");

      if (password.length < 6) {
        registerStatus.textContent = "Password must be at least 6 characters.";
        registerStatus.className = "form-status is-error";
        return;
      }

      if (password !== confirm) {
        registerStatus.textContent = "Passwords do not match.";
        registerStatus.className = "form-status is-error";
        return;
      }

      if (!data.get("terms")) {
        registerStatus.textContent = "Please accept the terms to continue.";
        registerStatus.className = "form-status is-error";
        return;
      }

      const users = readUsers();
      if (users.some((u) => u.email === email)) {
        registerStatus.textContent =
          "An account with this email already exists. Try signing in.";
        registerStatus.className = "form-status is-error";
        return;
      }

      const user = { name, phone, email, password };
      users.push(user);
      writeUsers(users);
      setSession(user, true);

      registerStatus.textContent = "Account created — redirecting…";
      registerStatus.className = "form-status is-success";
      registerForm.reset();

      setTimeout(redirectAfterAuth, 900);
    });
  }

  const loginForm = document.getElementById("login-form");
  const loginStatus = document.getElementById("login-status");

  if (loginForm && loginStatus) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (!loginForm.checkValidity()) {
        loginStatus.textContent = "Please enter your email and password.";
        loginStatus.className = "form-status is-error";
        loginForm.reportValidity();
        return;
      }

      const data = new FormData(loginForm);
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = String(data.get("password") || "");
      const remember = Boolean(data.get("remember"));

      const user = readUsers().find(
        (u) => u.email === email && u.password === password
      );

      if (!user) {
        loginStatus.textContent =
          "Invalid email or password. Create an account if you are new.";
        loginStatus.className = "form-status is-error";
        return;
      }

      setSession(user, remember);
      loginStatus.textContent =
        "Welcome back, " + user.name.split(" ")[0] + " — redirecting…";
      loginStatus.className = "form-status is-success";

      setTimeout(redirectAfterAuth, 800);
    });
  }

  const forgotLink = document.getElementById("forgot-link");
  if (forgotLink && loginStatus) {
    forgotLink.addEventListener("click", (event) => {
      event.preventDefault();
      loginStatus.textContent =
        "Password reset is demo-only — please call 0121 378 0001.";
      loginStatus.className = "form-status";
    });
  }

  function refreshAuthNav() {
    const session = getSession();
    const guestEls = document.querySelectorAll("[data-auth-guest]");
    const userEls = document.querySelectorAll("[data-auth-user]");
    const nameEls = document.querySelectorAll("[data-user-name]");

    guestEls.forEach((el) => {
      el.hidden = Boolean(session);
    });

    userEls.forEach((el) => {
      el.hidden = !session;
      el.classList.toggle("is-visible", Boolean(session));
    });

    if (session) {
      const first = (session.name || "Account").split(" ")[0];
      nameEls.forEach((el) => {
        el.textContent = first;
      });
    }
  }

  document.querySelectorAll("[data-auth-logout]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      clearSession();
      refreshAuthNav();
      if (!document.body.classList.contains("page-auth")) {
        window.location.href = "login.html";
      }
    });
  });

  refreshAuthNav();

  window.SuttonAuth = {
    getSession,
    clearSession,
    refreshAuthNav,
    getOrders,
    addOrder,
    logout() {
      clearSession();
      window.location.href = "login.html";
    },
  };
})();
