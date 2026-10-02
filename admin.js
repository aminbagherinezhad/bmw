(() => {
  const STORAGE_ADMINS = "sutton_admins";
  const STORAGE_ADMIN_SESSION = "sutton_admin_session";
  const STORAGE_EMPLOYEES = "sutton_sellers";
  const STORAGE_TYRES = "sutton_tyres";
  const STORAGE_PRODUCTS = "sutton_seller_products";
  const STORAGE_SALES = "sutton_sales";
  const STORAGE_SERVICES = "sutton_services";
  const STORAGE_USERS = "sutton_users";
  const STORAGE_ORDERS = "sutton_orders";
  const STORAGE_REQUESTS = "sutton_service_requests";

  const DEFAULT_ACCESS = {
    tyres: true,
    sales: true,
    services: true,
    products: true,
  };

  function read(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function money(n) {
    return (
      "£" +
      Number(n || 0).toLocaleString("en-GB", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    );
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDateTime(iso) {
    try {
      return new Date(iso).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso || "—";
    }
  }

  function dayKey(iso) {
    try {
      return new Date(iso).toISOString().slice(0, 10);
    } catch {
      return "";
    }
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function seedAdmin() {
    const admins = read(STORAGE_ADMINS, []);
    if (!admins.length) {
      write(STORAGE_ADMINS, [
        {
          name: "Site Manager",
          email: "admin@suttoncarcare.co.uk",
          password: "admin123",
        },
      ]);
    }
  }

  function seedDemoSalesIfEmpty() {
    if (read(STORAGE_SALES, []).length) return;

    let employees = getEmployees();
    if (!employees.length) {
      write(STORAGE_EMPLOYEES, [
        {
          name: "Alex Morgan",
          email: "alex@suttoncarcare.co.uk",
          password: "staff123",
          shop: "Sutton Car Care Centre",
          role: "employee",
          access: { ...DEFAULT_ACCESS },
          active: true,
        },
        {
          name: "Jordan Lee",
          email: "jordan@suttoncarcare.co.uk",
          password: "staff123",
          shop: "Sutton Car Care Centre",
          role: "employee",
          access: { ...DEFAULT_ACCESS },
          active: true,
        },
      ]);
      employees = getEmployees();
    }

    let tyres = getTyres();
    if (!tyres.length) {
      const now = Date.now();
      tyres = [
        {
          id: "TY" + now,
          brand: "Michelin",
          model: "Primacy 4",
          size: "205/55 R16",
          price: 98,
          stock: 14,
          barcode: "3528703512345",
          location: { row: "A", shelf: "1", level: "2" },
          sold: 0,
        },
        {
          id: "TY" + (now + 1),
          brand: "Continental",
          model: "PremiumContact 6",
          size: "225/45 R17",
          price: 112,
          stock: 8,
          barcode: "4019238123456",
          location: { row: "A", shelf: "2", level: "1" },
          sold: 0,
        },
        {
          id: "TY" + (now + 2),
          brand: "Goodyear",
          model: "Vector 4Seasons",
          size: "205/55 R16",
          price: 86,
          stock: 3,
          barcode: "5452000456789",
          location: { row: "B", shelf: "1", level: "3" },
          sold: 0,
        },
      ];
      write(STORAGE_TYRES, tyres);
    }

    const now = Date.now();
    const demo = [];
    for (let i = 0; i < 8; i++) {
      const emp = employees[i % employees.length];
      const tyre = tyres[i % tyres.length];
      const qty = 1 + (i % 3);
      const dayOffset = i % 5;
      const soldAt = new Date(now - dayOffset * 86400000 - i * 3600000).toISOString();
      demo.push({
        id: "AS" + (now + i),
        productId: tyre.id,
        productName: tyre.brand + " " + tyre.model + " " + tyre.size,
        category: "tyres",
        quantity: qty,
        unitPrice: tyre.price,
        totalPrice: qty * Number(tyre.price || 0),
        employeeEmail: emp.email,
        employeeName: emp.name,
        soldAt,
        note: "Demo sale",
      });
    }
    write(STORAGE_SALES, demo);
  }

  function getAdminSession() {
    return read(STORAGE_ADMIN_SESSION, null);
  }

  function setAdminSession(admin) {
    write(STORAGE_ADMIN_SESSION, {
      email: admin.email,
      name: admin.name,
      at: Date.now(),
    });
  }

  function clearAdminSession() {
    localStorage.removeItem(STORAGE_ADMIN_SESSION);
  }

  function requireAdmin() {
    const session = getAdminSession();
    const onLogin = /admin-login/i.test(window.location.pathname || "");
    if (!session && !onLogin) {
      window.location.href = "admin-login.html";
      return null;
    }
    if (session && onLogin) {
      window.location.href = "admin.html";
      return session;
    }
    return session;
  }

  function getEmployees() {
    return read(STORAGE_EMPLOYEES, []).map((e) => ({
      ...e,
      role: e.role || "employee",
      access: { ...DEFAULT_ACCESS, ...(e.access || {}) },
      active: e.active !== false,
    }));
  }

  function getSales() {
    return read(STORAGE_SALES, []).sort(
      (a, b) => new Date(b.soldAt) - new Date(a.soldAt)
    );
  }

  function getTyres() {
    return read(STORAGE_TYRES, []);
  }

  function getProducts() {
    return read(STORAGE_PRODUCTS, []);
  }

  function getServices() {
    return read(STORAGE_SERVICES, []);
  }

  function getCustomers() {
    return read(STORAGE_USERS, []);
  }

  function getOrders() {
    return read(STORAGE_ORDERS, []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  function getRequests() {
    return read(STORAGE_REQUESTS, []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  function filterSalesByRange(sales, from, to) {
    return sales.filter((s) => {
      const d = dayKey(s.soldAt);
      if (!d) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  function tyreLabel(s) {
    return s.productName || s.name || "Item";
  }

  /* -------- Login page -------- */
  seedAdmin();

  const loginForm = document.getElementById("admin-login-form");
  const loginStatus = document.getElementById("admin-login-status");
  if (loginForm && loginStatus) {
    const session = getAdminSession();
    if (session) {
      window.location.href = "admin.html";
      return;
    }

    document.querySelectorAll("[data-toggle-password]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const wrap = btn.closest(".password-field");
        const input = wrap && wrap.querySelector("input");
        if (!input) return;
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.textContent = show ? "Hide" : "Show";
      });
    });

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(loginForm);
      const email = String(data.get("email") || "")
        .trim()
        .toLowerCase();
      const password = String(data.get("password") || "");
      const admin = read(STORAGE_ADMINS, []).find(
        (a) => a.email === email && a.password === password
      );
      if (!admin) {
        loginStatus.textContent = "Invalid manager credentials.";
        loginStatus.className = "form-status is-error";
        return;
      }
      setAdminSession(admin);
      loginStatus.textContent = "Welcome — opening admin panel…";
      loginStatus.className = "form-status is-success";
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 600);
    });
    return;
  }

  /* -------- Admin app -------- */
  const session = requireAdmin();
  if (!session) return;
  seedDemoSalesIfEmpty();

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll("[data-admin-name]").forEach((el) => {
    el.textContent = (session.name || "Manager").split(" ")[0];
  });

  document.querySelectorAll("[data-admin-logout]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      clearAdminSession();
      window.location.href = "admin-login.html";
    });
  });

  let currentView = "dashboard";

  function showView(name) {
    currentView = name;
    document.querySelectorAll("[data-admin-view]").forEach((panel) => {
      panel.hidden = panel.getAttribute("data-admin-view") !== name;
    });
    document.querySelectorAll("[data-admin-nav]").forEach((link) => {
      const active = link.getAttribute("data-admin-nav") === name;
      link.classList.toggle("is-active", active);
      if (link.tagName === "A") {
        if (active) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      }
    });
    const title = document.getElementById("admin-page-title");
    const titles = {
      dashboard: "Overview",
      reports: "Sales reports",
      employees: "Employees & access",
      tyres: "Tyres & stock",
      products: "Products",
      sales: "All sales",
      services: "Services",
      customers: "Customers",
      orders: "Orders & requests",
    };
    if (title) title.textContent = titles[name] || "Admin";
    renderView(name);
  }

  document.querySelectorAll("[data-admin-nav]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      showView(link.getAttribute("data-admin-nav") || "dashboard");
    });
  });

  function renderView(name) {
    if (name === "dashboard") renderDashboard();
    if (name === "reports") renderReports();
    if (name === "employees") renderEmployees();
    if (name === "tyres") renderTyres();
    if (name === "products") renderProducts();
    if (name === "sales") renderSales();
    if (name === "services") renderServices();
    if (name === "customers") renderCustomers();
    if (name === "orders") renderOrders();
  }

  /* ---- Dashboard ---- */
  function renderDashboard() {
    const sales = getSales();
    const today = todayKey();
    const todaySales = sales.filter((s) => dayKey(s.soldAt) === today);
    const revenueToday = todaySales.reduce((n, s) => n + (s.totalPrice || 0), 0);
    const unitsToday = todaySales.reduce((n, s) => n + (s.quantity || 0), 0);
    const tyres = getTyres();
    const stock = tyres.reduce((n, t) => n + (Number(t.stock) || 0), 0);
    const employees = getEmployees().filter((e) => e.active !== false);

    setText("admin-kpi-revenue", money(revenueToday));
    setText("admin-kpi-units", String(unitsToday));
    setText("admin-kpi-staff", String(employees.length));
    setText("admin-kpi-stock", String(stock));
    setText("admin-kpi-orders", String(getOrders().length));
    setText("admin-kpi-customers", String(getCustomers().length));

    const byEmp = {};
    todaySales.forEach((s) => {
      const key = s.employeeEmail || "unknown";
      if (!byEmp[key]) {
        byEmp[key] = {
          name: s.employeeName || key,
          units: 0,
          revenue: 0,
          lines: 0,
        };
      }
      byEmp[key].units += s.quantity || 0;
      byEmp[key].revenue += s.totalPrice || 0;
      byEmp[key].lines += 1;
    });

    const empWrap = document.getElementById("admin-today-staff");
    if (empWrap) {
      const rows = Object.values(byEmp).sort((a, b) => b.revenue - a.revenue);
      empWrap.innerHTML = rows.length
        ? tableHtml(
            ["Employee", "Sales", "Units", "Revenue"],
            rows.map((r) => [
              escapeHtml(r.name),
              r.lines,
              r.units,
              '<span class="gold-text">' + money(r.revenue) + "</span>",
            ])
          )
        : '<p class="panel-empty">No sales recorded today yet.</p>';
    }

    const tyreWrap = document.getElementById("admin-today-tyres");
    if (tyreWrap) {
      const tyreSales = todaySales.filter(
        (s) => s.category === "tyres" || !s.category || s.category === "tyres"
      );
      const byModel = {};
      tyreSales.forEach((s) => {
        const key = tyreLabel(s);
        if (!byModel[key]) byModel[key] = { name: key, qty: 0, revenue: 0, staff: {} };
        byModel[key].qty += s.quantity || 0;
        byModel[key].revenue += s.totalPrice || 0;
        const emp = s.employeeName || "Staff";
        byModel[key].staff[emp] = (byModel[key].staff[emp] || 0) + (s.quantity || 0);
      });
      const rows = Object.values(byModel).sort((a, b) => b.qty - a.qty);
      tyreWrap.innerHTML = rows.length
        ? tableHtml(
            ["Tyre / product", "Qty", "By staff", "Revenue"],
            rows.map((r) => [
              escapeHtml(r.name),
              r.qty,
              escapeHtml(
                Object.entries(r.staff)
                  .map(([n, q]) => n + " (" + q + ")")
                  .join(", ")
              ),
              '<span class="gold-text">' + money(r.revenue) + "</span>",
            ])
          )
        : '<p class="panel-empty">No tyre sales today.</p>';
    }
  }

  /* ---- Reports ---- */
  function renderReports() {
    const fromEl = document.getElementById("report-from");
    const toEl = document.getElementById("report-to");
    if (fromEl && !fromEl.value) {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      fromEl.value = d.toISOString().slice(0, 10);
    }
    if (toEl && !toEl.value) toEl.value = todayKey();

    const from = fromEl ? fromEl.value : "";
    const to = toEl ? toEl.value : "";
    const sales = filterSalesByRange(getSales(), from, to);

    const revenue = sales.reduce((n, s) => n + (s.totalPrice || 0), 0);
    const units = sales.reduce((n, s) => n + (s.quantity || 0), 0);
    setText("report-sum-count", String(sales.length));
    setText("report-sum-units", String(units));
    setText("report-sum-revenue", money(revenue));

    // Daily breakdown: date × employee × tyre model
    const daily = {};
    sales.forEach((s) => {
      const day = dayKey(s.soldAt);
      const emp = s.employeeName || s.employeeEmail || "Staff";
      const model = tyreLabel(s);
      const key = day + "|" + emp + "|" + model;
      if (!daily[key]) {
        daily[key] = { day, emp, model, qty: 0, revenue: 0, category: s.category || "" };
      }
      daily[key].qty += s.quantity || 0;
      daily[key].revenue += s.totalPrice || 0;
    });

    const dailyRows = Object.values(daily).sort((a, b) => {
      if (a.day !== b.day) return a.day < b.day ? 1 : -1;
      if (a.emp !== b.emp) return a.emp.localeCompare(b.emp);
      return a.model.localeCompare(b.model);
    });

    const dailyWrap = document.getElementById("report-daily");
    if (dailyWrap) {
      dailyWrap.innerHTML = dailyRows.length
        ? tableHtml(
            ["Date", "Employee", "Tyre / item", "Qty", "Revenue"],
            dailyRows.map((r) => [
              escapeHtml(r.day),
              escapeHtml(r.emp),
              escapeHtml(r.model) +
                (r.category
                  ? '<span class="sale-cat">' + escapeHtml(r.category) + "</span>"
                  : ""),
              r.qty,
              '<span class="gold-text">' + money(r.revenue) + "</span>",
            ])
          )
        : '<p class="panel-empty">No sales in this period.</p>';
    }

    // Employee performance
    const perf = {};
    sales.forEach((s) => {
      const key = s.employeeEmail || s.employeeName || "unknown";
      if (!perf[key]) {
        perf[key] = {
          name: s.employeeName || key,
          email: s.employeeEmail || "",
          sales: 0,
          units: 0,
          revenue: 0,
          tyres: 0,
          services: 0,
        };
      }
      perf[key].sales += 1;
      perf[key].units += s.quantity || 0;
      perf[key].revenue += s.totalPrice || 0;
      if (s.category === "service") perf[key].services += s.quantity || 0;
      else perf[key].tyres += s.quantity || 0;
    });

    const perfWrap = document.getElementById("report-performance");
    if (perfWrap) {
      const rows = Object.values(perf).sort((a, b) => b.revenue - a.revenue);
      perfWrap.innerHTML = rows.length
        ? tableHtml(
            ["Employee", "Email", "Records", "Units", "Tyres", "Services", "Revenue"],
            rows.map((r) => [
              escapeHtml(r.name),
              escapeHtml(r.email),
              r.sales,
              r.units,
              r.tyres,
              r.services,
              '<span class="gold-text">' + money(r.revenue) + "</span>",
            ])
          )
        : '<p class="panel-empty">No staff performance data in this period.</p>';
    }
  }

  document.getElementById("report-apply")?.addEventListener("click", () => {
    renderReports();
  });

  document.querySelectorAll("[data-report-preset]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = btn.getAttribute("data-report-preset");
      const fromEl = document.getElementById("report-from");
      const toEl = document.getElementById("report-to");
      const to = todayKey();
      let from = to;
      if (preset === "today") from = to;
      if (preset === "7") {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        from = d.toISOString().slice(0, 10);
      }
      if (preset === "30") {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        from = d.toISOString().slice(0, 10);
      }
      if (preset === "month") {
        const d = new Date();
        from = d.toISOString().slice(0, 8) + "01";
      }
      if (fromEl) fromEl.value = from;
      if (toEl) toEl.value = to;
      document.querySelectorAll("[data-report-preset]").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });
      renderReports();
    });
  });

  /* ---- Employees ---- */
  function renderEmployees() {
    const list = document.getElementById("admin-employees-list");
    if (!list) return;
    const employees = getEmployees();
    if (!employees.length) {
      list.innerHTML = '<p class="panel-empty">No employees registered yet.</p>';
      return;
    }
    list.innerHTML = employees
      .map((e) => {
        const access = e.access || DEFAULT_ACCESS;
        return (
          '<article class="admin-card' +
          (e.active === false ? " is-inactive" : "") +
          '" data-emp-email="' +
          escapeHtml(e.email) +
          '">' +
          '<div class="admin-card-top">' +
          "<div><h3>" +
          escapeHtml(e.name) +
          '</h3><p class="admin-muted">' +
          escapeHtml(e.email) +
          " · " +
          escapeHtml(e.role || "employee") +
          "</p></div>" +
          "<strong>" +
          (e.active === false ? "Inactive" : "Active") +
          "</strong></div>" +
          '<div class="admin-access-grid">' +
          accessToggle(e.email, "tyres", access.tyres, "Tyres") +
          accessToggle(e.email, "sales", access.sales, "Sales") +
          accessToggle(e.email, "services", access.services, "Services") +
          accessToggle(e.email, "products", access.products, "Products") +
          "</div>" +
          '<div class="pmc-actions">' +
          '<button type="button" class="btn btn-outline btn-sm" data-emp-toggle="' +
          escapeHtml(e.email) +
          '">' +
          (e.active === false ? "Activate" : "Deactivate") +
          "</button>" +
          '<button type="button" class="btn btn-outline btn-sm danger" data-emp-delete="' +
          escapeHtml(e.email) +
          '">Delete</button>' +
          "</div></article>"
        );
      })
      .join("");
  }

  function accessToggle(email, key, on, label) {
    return (
      '<label class="admin-access-chip' +
      (on ? " is-on" : "") +
      '"><input type="checkbox" data-emp-access="' +
      escapeHtml(email) +
      '" data-access-key="' +
      key +
      '"' +
      (on ? " checked" : "") +
      " /><span>" +
      label +
      "</span></label>"
    );
  }

  const empForm = document.getElementById("admin-employee-form");
  if (empForm) {
    empForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(empForm);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "")
        .trim()
        .toLowerCase();
      const password = String(data.get("password") || "");
      const role = String(data.get("role") || "employee");
      if (!name || !email || password.length < 6) {
        setStatus("admin-employee-status", "Name, email and password (6+) required.", true);
        return;
      }
      const all = read(STORAGE_EMPLOYEES, []);
      if (all.some((e) => e.email === email)) {
        setStatus("admin-employee-status", "Employee email already exists.", true);
        return;
      }
      all.push({
        name,
        email,
        password,
        shop: "Sutton Car Care Centre",
        role,
        access: { ...DEFAULT_ACCESS },
        active: true,
      });
      write(STORAGE_EMPLOYEES, all);
      empForm.reset();
      setStatus("admin-employee-status", "Employee account created.", false);
      renderEmployees();
      renderDashboard();
    });
  }

  document.getElementById("admin-employees-list")?.addEventListener("change", (event) => {
    const input = event.target;
    if (!input.matches("[data-emp-access]")) return;
    const email = input.getAttribute("data-emp-access");
    const key = input.getAttribute("data-access-key");
    const all = read(STORAGE_EMPLOYEES, []);
    const index = all.findIndex((e) => e.email === email);
    if (index === -1) return;
    all[index].access = {
      ...DEFAULT_ACCESS,
      ...(all[index].access || {}),
      [key]: input.checked,
    };
    write(STORAGE_EMPLOYEES, all);
    input.closest(".admin-access-chip")?.classList.toggle("is-on", input.checked);
  });

  document.getElementById("admin-employees-list")?.addEventListener("click", (event) => {
    const toggle = event.target.getAttribute("data-emp-toggle");
    const del = event.target.getAttribute("data-emp-delete");
    const all = read(STORAGE_EMPLOYEES, []);
    if (toggle) {
      const index = all.findIndex((e) => e.email === toggle);
      if (index === -1) return;
      all[index].active = all[index].active === false;
      write(STORAGE_EMPLOYEES, all);
      renderEmployees();
      return;
    }
    if (del) {
      if (!confirm("Delete this employee account?")) return;
      write(
        STORAGE_EMPLOYEES,
        all.filter((e) => e.email !== del)
      );
      renderEmployees();
      renderDashboard();
    }
  });

  /* ---- Tyres ---- */
  function renderTyres() {
    const wrap = document.getElementById("admin-tyres-list");
    if (!wrap) return;
    const tyres = getTyres().sort((a, b) =>
      String(a.brand || "").localeCompare(String(b.brand || ""))
    );
    const units = tyres.reduce((n, t) => n + (Number(t.stock) || 0), 0);
    setText("admin-tyre-count", String(tyres.length));
    setText("admin-tyre-units", String(units));
    wrap.innerHTML = tyres.length
      ? tableHtml(
          ["Brand / model", "Size", "Stock", "Location", "Price", "Barcode", ""],
          tyres.map((t) => {
            const loc = t.location || {};
            return [
              "<strong>" +
                escapeHtml(t.brand) +
                "</strong> " +
                escapeHtml(t.model),
              escapeHtml(t.size),
              t.stock,
              escapeHtml(
                "R" +
                  (loc.row || "—") +
                  " / S" +
                  (loc.shelf || "—") +
                  " / L" +
                  (loc.level || "—")
              ),
              money(t.price),
              escapeHtml(t.barcode || "—"),
              '<button type="button" class="btn btn-outline btn-sm" data-tyre-stock="' +
                escapeHtml(t.id) +
                '">Set stock</button>',
            ];
          })
        )
      : '<p class="panel-empty">No tyres in warehouse yet. Staff can add them from Tyre warehouse.</p>';
  }

  document.getElementById("admin-tyres-list")?.addEventListener("click", (event) => {
    const id = event.target.getAttribute("data-tyre-stock");
    if (!id) return;
    const all = read(STORAGE_TYRES, []);
    const index = all.findIndex((t) => t.id === id);
    if (index === -1) return;
    const current = Number(all[index].stock) || 0;
    const next = window.prompt("Set stock quantity", String(current));
    if (next === null) return;
    const qty = Math.max(0, Math.floor(Number(next)));
    if (Number.isNaN(qty)) return;
    all[index].stock = qty;
    all[index].updatedAt = new Date().toISOString();
    write(STORAGE_TYRES, all);
    renderTyres();
    renderDashboard();
  });

  /* ---- Products ---- */
  function renderProducts() {
    const wrap = document.getElementById("admin-products-list");
    if (!wrap) return;
    const products = getProducts();
    wrap.innerHTML = products.length
      ? tableHtml(
          ["Name", "Category", "Price", "Stock", "Sold"],
          products.map((p) => [
            escapeHtml(p.name),
            escapeHtml(p.category),
            money(p.price),
            p.stock,
            p.sold || 0,
          ])
        )
      : '<p class="panel-empty">No catalogue products yet.</p>';
  }

  /* ---- Sales ---- */
  function renderSales() {
    const wrap = document.getElementById("admin-sales-list");
    if (!wrap) return;
    const sales = getSales().slice(0, 100);
    wrap.innerHTML = sales.length
      ? tableHtml(
          ["When", "Item", "Qty", "Total", "Employee", "Category"],
          sales.map((s) => [
            escapeHtml(formatDateTime(s.soldAt)),
            escapeHtml(tyreLabel(s)),
            s.quantity,
            '<span class="gold-text">' + money(s.totalPrice) + "</span>",
            escapeHtml(s.employeeName || s.employeeEmail || "—"),
            escapeHtml(s.category || "—"),
          ])
        )
      : '<p class="panel-empty">No sales recorded yet.</p>';
  }

  /* ---- Services ---- */
  function renderServices() {
    const wrap = document.getElementById("admin-services-list");
    if (!wrap) return;
    const services = getServices();
    wrap.innerHTML = services.length
      ? tableHtml(
          ["Service", "Category", "Price", "Jobs", "Status", ""],
          services.map((s) => [
            escapeHtml(s.name),
            escapeHtml(s.category),
            money(s.price),
            s.jobsDone || 0,
            s.active === false ? "Inactive" : "Active",
            '<button type="button" class="btn btn-outline btn-sm" data-svc-toggle="' +
              escapeHtml(s.id) +
              '">' +
              (s.active === false ? "Activate" : "Deactivate") +
              "</button>",
          ])
        )
      : '<p class="panel-empty">No services in catalogue.</p>';
  }

  document.getElementById("admin-services-list")?.addEventListener("click", (event) => {
    const id = event.target.getAttribute("data-svc-toggle");
    if (!id) return;
    const all = read(STORAGE_SERVICES, []);
    const index = all.findIndex((s) => s.id === id);
    if (index === -1) return;
    all[index].active = all[index].active === false;
    write(STORAGE_SERVICES, all);
    renderServices();
  });

  /* ---- Customers ---- */
  function renderCustomers() {
    const wrap = document.getElementById("admin-customers-list");
    if (!wrap) return;
    const customers = getCustomers();
    const orders = getOrders();
    wrap.innerHTML = customers.length
      ? tableHtml(
          ["Name", "Email", "Phone", "Orders"],
          customers.map((c) => [
            escapeHtml(c.name),
            escapeHtml(c.email),
            escapeHtml(c.phone || "—"),
            orders.filter((o) => o.email === c.email).length,
          ])
        )
      : '<p class="panel-empty">No customer accounts yet.</p>';
  }

  /* ---- Orders & requests ---- */
  function renderOrders() {
    const ordersWrap = document.getElementById("admin-orders-list");
    const reqWrap = document.getElementById("admin-requests-list");
    const orders = getOrders().slice(0, 50);
    const requests = getRequests().slice(0, 50);

    if (ordersWrap) {
      ordersWrap.innerHTML = orders.length
        ? tableHtml(
            ["ID", "Customer", "Service", "Date", "Status"],
            orders.map((o) => [
              escapeHtml(o.id),
              escapeHtml(o.name || o.email),
              escapeHtml(o.service),
              escapeHtml(o.date || formatDateTime(o.createdAt)),
              '<select data-order-status="' +
                escapeHtml(o.id) +
                '">' +
                ["pending", "confirmed", "completed", "cancelled"]
                  .map(
                    (st) =>
                      '<option value="' +
                      st +
                      '"' +
                      (o.status === st ? " selected" : "") +
                      ">" +
                      st +
                      "</option>"
                  )
                  .join("") +
                "</select>",
            ])
          )
        : '<p class="panel-empty">No online bookings yet.</p>';
    }

    if (reqWrap) {
      reqWrap.innerHTML = requests.length
        ? tableHtml(
            ["ID", "Customer", "Services", "Preferred", "Status", ""],
            requests.map((r) => [
              escapeHtml(r.id),
              escapeHtml(r.name) +
                '<span class="sale-emp-email">' +
                escapeHtml(r.email) +
                "</span>",
              escapeHtml((r.services || []).join(", ")),
              escapeHtml(
                (r.preferredDate || "") + " " + (r.preferredTime || "")
              ),
              escapeHtml(r.status || "pending"),
              '<button type="button" class="btn btn-outline btn-sm" data-req-status="' +
                escapeHtml(r.id) +
                '" data-status="confirmed">Confirm</button>',
            ])
          )
        : '<p class="panel-empty">No service requests yet.</p>';
    }
  }

  document.getElementById("admin-orders-list")?.addEventListener("change", (event) => {
    const sel = event.target;
    if (!sel.matches("[data-order-status]")) return;
    const id = sel.getAttribute("data-order-status");
    const all = read(STORAGE_ORDERS, []);
    const index = all.findIndex((o) => o.id === id);
    if (index === -1) return;
    all[index].status = sel.value;
    write(STORAGE_ORDERS, all);
  });

  document.getElementById("admin-requests-list")?.addEventListener("click", (event) => {
    const id = event.target.getAttribute("data-req-status");
    const status = event.target.getAttribute("data-status");
    if (!id || !status) return;
    const all = read(STORAGE_REQUESTS, []);
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) return;
    all[index].status = status;
    write(STORAGE_REQUESTS, all);
    renderOrders();
  });

  /* helpers */
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setStatus(id, message, isError) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = message;
    el.className = "form-status " + (isError ? "is-error" : "is-success");
  }

  function tableHtml(headers, rows) {
    return (
      '<div class="seller-table-wrap"><table class="seller-table admin-table"><thead><tr>' +
      headers.map((h) => "<th>" + h + "</th>").join("") +
      "</tr></thead><tbody>" +
      rows
        .map(
          (row) =>
            "<tr>" + row.map((cell) => "<td>" + cell + "</td>").join("") + "</tr>"
        )
        .join("") +
      "</tbody></table></div>"
    );
  }

  showView("dashboard");
})();
