(() => {
  const STORAGE_EMPLOYEES = "sutton_sellers";
  const STORAGE_SESSION = "sutton_seller_session";
  const STORAGE_PRODUCTS = "sutton_seller_products";
  const STORAGE_SALES = "sutton_sales";

  function readEmployees() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_EMPLOYEES) || "[]");
    } catch {
      return [];
    }
  }

  function writeEmployees(employees) {
    localStorage.setItem(STORAGE_EMPLOYEES, JSON.stringify(employees));
  }

  function readProducts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PRODUCTS) || "[]");
    } catch {
      return [];
    }
  }

  function writeProducts(products) {
    localStorage.setItem(STORAGE_PRODUCTS, JSON.stringify(products));
  }

  function readSales() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SALES) || "[]");
    } catch {
      return [];
    }
  }

  function writeSales(sales) {
    localStorage.setItem(STORAGE_SALES, JSON.stringify(sales));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SESSION) || "null");
    } catch {
      return null;
    }
  }

  const DEFAULT_ACCESS = {
    tyres: true,
    sales: true,
    services: true,
    products: true,
  };

  function setSession(employee) {
    localStorage.setItem(
      STORAGE_SESSION,
      JSON.stringify({
        email: employee.email,
        name: employee.name,
        shop: employee.shop || "Sutton Car Care",
        access: { ...DEFAULT_ACCESS, ...(employee.access || {}) },
        active: employee.active !== false,
        at: Date.now(),
      })
    );
  }

  function resolveAccess(session) {
    const employee = readEmployees().find((e) => e.email === session.email);
    if (!employee) return { ...DEFAULT_ACCESS, ...(session.access || {}) };
    return { ...DEFAULT_ACCESS, ...(employee.access || {}) };
  }

  function enforceStaffAccess(session) {
    const employee = readEmployees().find((e) => e.email === session.email);
    if (employee && employee.active === false) {
      clearSession();
      window.location.href = "seller-login.html";
      return false;
    }

    const access = resolveAccess(session);
    const path = window.location.pathname || "";
    const gates = [
      [/seller-tyres/i, "tyres"],
      [/seller-sales/i, "sales"],
      [/seller-services/i, "services"],
      [/seller-products/i, "products"],
    ];
    for (const [re, key] of gates) {
      if (re.test(path) && !access[key]) {
        window.location.href = "seller-dashboard.html";
        return false;
      }
    }

    const linkMap = {
      "seller-tyres.html": access.tyres,
      "seller-sales.html": access.sales,
      "seller-services.html": access.services,
      "seller-products.html": access.products,
    };
    Object.entries(linkMap).forEach(([href, allowed]) => {
      if (allowed) return;
      document.querySelectorAll('a[href="' + href + '"]').forEach((a) => {
        a.hidden = true;
      });
    });
    return true;
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_SESSION);
  }

  function getCatalogue() {
    return readProducts().sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
    );
  }

  function getSalesSorted() {
    return readSales().sort(
      (a, b) => new Date(b.soldAt) - new Date(a.soldAt)
    );
  }

  function getEmployeeSales(email) {
    const key = String(email || "").toLowerCase();
    return getSalesSorted().filter((s) => s.employeeEmail === key);
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

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function requireEmployee() {
    const session = getSession();
    const path = window.location.pathname || "";
    const onLogin = /seller-login/i.test(path);
    if (!session && !onLogin) {
      window.location.href = "seller-login.html";
      return null;
    }
    if (session && onLogin) {
      window.location.href = "seller-dashboard.html";
      return session;
    }
    return session;
  }

  function seedCatalogue() {
    if (readProducts().length) return;
    const now = Date.now();
    const samples = [
      {
        name: "All-season tyre 205/55 R16",
        category: "tyres",
        price: 65,
        stock: 24,
        sold: 0,
        description: "Budget all-season tyre, fitted option available",
      },
      {
        name: "Premium tyre 225/45 R17",
        category: "tyres",
        price: 95,
        stock: 16,
        sold: 0,
        description: "Quiet road tyre for hatchbacks and saloons",
      },
      {
        name: "Van tyre 215/65 R16C",
        category: "tyres",
        price: 88,
        stock: 12,
        sold: 0,
        description: "Commercial load-rated tyre for vans",
      },
      {
        name: "Winter tyre 195/65 R15",
        category: "tyres",
        price: 72,
        stock: 10,
        sold: 0,
        description: "Cold-weather grip for UK winters",
      },
      {
        name: "Car MOT test voucher",
        category: "service",
        price: 40,
        stock: 50,
        sold: 0,
        description: "Standard car MOT booking credit",
      },
      {
        name: "Brake pad set (front)",
        category: "parts",
        price: 48,
        stock: 14,
        sold: 0,
        description: "Compatible with popular hatchbacks",
      },
    ].map((item, index) => ({
      ...item,
      id: "SP" + (now + index),
      createdAt: new Date(now - index * 86400000).toISOString(),
      updatedAt: new Date(now - index * 3600000).toISOString(),
    }));

    writeProducts(samples);
  }

  function recordSale({ productId, quantity, unitPrice, employee }) {
    const qty = Math.max(1, Math.floor(Number(quantity) || 0));
    const price = Math.max(0, Number(unitPrice) || 0);
    const all = readProducts();
    const index = all.findIndex((p) => p.id === productId);
    if (index === -1) {
      return { ok: false, error: "Product not found." };
    }
    if (all[index].stock < qty) {
      return {
        ok: false,
        error: "Not enough stock. Only " + all[index].stock + " left.",
      };
    }

    const product = all[index];
    const soldAt = new Date().toISOString();
    const sale = {
      id: "SL" + Date.now() + String(Math.floor(Math.random() * 90) + 10),
      productId: product.id,
      productName: product.name,
      category: product.category,
      quantity: qty,
      unitPrice: price,
      totalPrice: Math.round(price * qty * 100) / 100,
      soldAt,
      employeeEmail: String(employee.email || "").toLowerCase(),
      employeeName: employee.name || "Staff",
    };

    all[index] = {
      ...product,
      stock: product.stock - qty,
      sold: (product.sold || 0) + qty,
      updatedAt: soldAt,
    };
    writeProducts(all);

    const sales = readSales();
    sales.push(sale);
    writeSales(sales);

    return { ok: true, sale };
  }

  /* Password toggles */
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

  /* Login / register tabs */
  document.querySelectorAll("[data-seller-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      const name = tab.getAttribute("data-seller-tab");
      document.querySelectorAll("[data-seller-tab]").forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
      });
      document.querySelectorAll("[data-seller-panel]").forEach((panel) => {
        panel.hidden = panel.getAttribute("data-seller-panel") !== name;
      });
    });
  });

  const loginForm = document.getElementById("seller-login-form");
  const loginStatus = document.getElementById("seller-login-status");
  if (loginForm && loginStatus) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!loginForm.checkValidity()) {
        loginStatus.textContent = "Please enter email and password.";
        loginStatus.className = "form-status is-error";
        loginForm.reportValidity();
        return;
      }
      const data = new FormData(loginForm);
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = String(data.get("password") || "");
      const employee = readEmployees().find(
        (s) => s.email === email && s.password === password
      );
      if (!employee) {
        loginStatus.textContent =
          "Invalid staff credentials. Register your employee account first.";
        loginStatus.className = "form-status is-error";
        return;
      }
      if (employee.active === false) {
        loginStatus.textContent =
          "This staff account is deactivated. Contact the manager.";
        loginStatus.className = "form-status is-error";
        return;
      }
      setSession(employee);
      seedCatalogue();
      loginStatus.textContent = "Welcome back — opening staff panel…";
      loginStatus.className = "form-status is-success";
      setTimeout(() => {
        window.location.href = "seller-dashboard.html";
      }, 700);
    });
  }

  const registerForm = document.getElementById("seller-register-form");
  const registerStatus = document.getElementById("seller-register-status");
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
      const shop = String(data.get("shop") || "Sutton Car Care").trim();
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim().toLowerCase();
      const password = String(data.get("password") || "");
      if (password.length < 6) {
        registerStatus.textContent = "Password must be at least 6 characters.";
        registerStatus.className = "form-status is-error";
        return;
      }
      const employees = readEmployees();
      if (employees.some((s) => s.email === email)) {
        registerStatus.textContent =
          "An employee with this email already exists.";
        registerStatus.className = "form-status is-error";
        return;
      }
      const employee = {
        shop,
        name,
        email,
        password,
        role: "employee",
        access: { ...DEFAULT_ACCESS },
        active: true,
      };
      employees.push(employee);
      writeEmployees(employees);
      setSession(employee);
      seedCatalogue();
      registerStatus.textContent =
        "Employee account created — opening panel…";
      registerStatus.className = "form-status is-success";
      setTimeout(() => {
        window.location.href = "seller-dashboard.html";
      }, 800);
    });
  }

  document.querySelectorAll("[data-seller-logout]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      clearSession();
      window.location.href = "seller-login.html";
    });
  });

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const session = requireEmployee();
  if (!session) return;
  if (!enforceStaffAccess(session)) return;

  seedCatalogue();

  document.querySelectorAll("[data-seller-shop]").forEach((el) => {
    el.textContent = session.name || "Staff";
  });
  document.querySelectorAll("[data-seller-name]").forEach((el) => {
    el.textContent = (session.name || "Staff").split(" ")[0];
  });

  /* -------- Sale modal helpers -------- */
  const saleModal = document.getElementById("sale-modal");
  const saleForm = document.getElementById("sale-form");
  const saleStatus = document.getElementById("sale-form-status");
  let saleProductId = "";

  function openSaleModal(product) {
    if (!saleModal || !saleForm) return;
    saleProductId = product.id;
    document.getElementById("sale-product-name").textContent = product.name;
    document.getElementById("sale-product-meta").textContent =
      money(product.price) + " · " + product.stock + " in stock";
    saleForm.quantity.value = "1";
    saleForm.quantity.max = String(product.stock);
    saleForm.unitPrice.value = String(product.price);
    if (saleStatus) {
      saleStatus.textContent = "";
      saleStatus.className = "form-status";
    }
    saleModal.hidden = false;
    document.body.classList.add("modal-open");
    saleForm.quantity.focus();
  }

  function closeSaleModal() {
    if (!saleModal) return;
    saleModal.hidden = true;
    document.body.classList.remove("modal-open");
    saleProductId = "";
  }

  document.querySelectorAll("[data-sale-close]").forEach((el) => {
    el.addEventListener("click", closeSaleModal);
  });

  if (saleForm) {
    saleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!saleProductId) return;
      const quantity = Number(saleForm.quantity.value || 0);
      const unitPrice = Number(saleForm.unitPrice.value || 0);
      const result = recordSale({
        productId: saleProductId,
        quantity,
        unitPrice,
        employee: session,
      });
      if (!result.ok) {
        if (saleStatus) {
          saleStatus.textContent = result.error;
          saleStatus.className = "form-status is-error";
        }
        return;
      }
      if (saleStatus) {
        saleStatus.textContent =
          "Sale recorded under " + (session.name || "your account") + ".";
        saleStatus.className = "form-status is-success";
      }
      setTimeout(() => {
        closeSaleModal();
        window.location.reload();
      }, 650);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && saleModal && !saleModal.hidden) {
      closeSaleModal();
    }
  });

  /* -------- Dashboard -------- */
  const kpiRevenue = document.getElementById("kpi-revenue");
  if (kpiRevenue) {
    const mySales = getEmployeeSales(session.email);
    const allSales = getSalesSorted();
    const products = getCatalogue();

    const myRevenue = mySales.reduce((sum, s) => sum + s.totalPrice, 0);
    const myUnits = mySales.reduce((sum, s) => sum + s.quantity, 0);
    const stock = products.reduce((sum, p) => sum + p.stock, 0);

    kpiRevenue.textContent = money(myRevenue);
    document.getElementById("kpi-sold").textContent = String(myUnits);
    document.getElementById("kpi-stock").textContent = String(stock);
    document.getElementById("kpi-products").textContent = String(mySales.length);

    const recentWrap = document.getElementById("recent-sales");
    if (recentWrap) {
      const recent = mySales.slice(0, 8);
      if (!recent.length) {
        recentWrap.innerHTML =
          '<p class="panel-empty">No sales on your account yet. Record one from Products.</p>';
      } else {
        recentWrap.innerHTML =
          '<div class="seller-mobile-list">' +
          recent
            .map(
              (s) =>
                '<article class="seller-sale-card">' +
                "<strong>" +
                escapeHtml(s.productName) +
                "</strong>" +
                '<div class="seller-sale-meta">' +
                "<span>" +
                s.quantity +
                "×</span>" +
                '<span class="gold-text">' +
                money(s.totalPrice) +
                "</span>" +
                "<span>" +
                escapeHtml(formatDateTime(s.soldAt)) +
                "</span>" +
                "</div></article>"
            )
            .join("") +
          "</div>" +
          '<div class="seller-table-wrap seller-table-desktop"><table class="seller-table"><thead><tr><th>Tyre / product</th><th>Qty</th><th>Price</th><th>When</th></tr></thead><tbody>' +
          recent
            .map(
              (s) =>
                "<tr><td>" +
                escapeHtml(s.productName) +
                "</td><td>" +
                s.quantity +
                '</td><td class="gold-text">' +
                money(s.totalPrice) +
                "</td><td>" +
                escapeHtml(formatDateTime(s.soldAt)) +
                "</td></tr>"
            )
            .join("") +
          "</tbody></table></div>";
      }
    }

    const teamWrap = document.getElementById("team-sales");
    if (teamWrap) {
      const recentAll = allSales.slice(0, 8);
      if (!recentAll.length) {
        teamWrap.innerHTML =
          '<p class="panel-empty">No team sales recorded yet.</p>';
      } else {
        teamWrap.innerHTML =
          '<div class="seller-mobile-list">' +
          recentAll
            .map(
              (s) =>
                '<article class="seller-sale-card">' +
                "<strong>" +
                escapeHtml(s.productName) +
                "</strong>" +
                '<div class="seller-sale-meta">' +
                "<span>" +
                s.quantity +
                "×</span>" +
                '<span class="gold-text">' +
                money(s.totalPrice) +
                "</span>" +
                "<span>" +
                escapeHtml(s.employeeName) +
                "</span>" +
                "<span>" +
                escapeHtml(formatDateTime(s.soldAt)) +
                "</span>" +
                "</div></article>"
            )
            .join("") +
          "</div>" +
          '<div class="seller-table-wrap seller-table-desktop"><table class="seller-table"><thead><tr><th>Product</th><th>Qty</th><th>Total</th><th>Employee</th><th>When</th></tr></thead><tbody>' +
          recentAll
            .map(
              (s) =>
                "<tr><td>" +
                escapeHtml(s.productName) +
                "</td><td>" +
                s.quantity +
                '</td><td class="gold-text">' +
                money(s.totalPrice) +
                "</td><td>" +
                escapeHtml(s.employeeName) +
                "</td><td>" +
                escapeHtml(formatDateTime(s.soldAt)) +
                "</td></tr>"
            )
            .join("") +
          "</tbody></table></div>";
      }
    }

    const alerts = products.filter((p) => p.stock <= 5);
    const alertWrap = document.getElementById("stock-alerts");
    if (alertWrap) {
      if (!alerts.length) {
        alertWrap.innerHTML =
          '<p class="panel-empty">All good — no low-stock items.</p>';
      } else {
        alertWrap.innerHTML = alerts
          .map(
            (p) =>
              '<div class="alert-item' +
              (p.stock === 0 ? " is-critical" : "") +
              '"><strong>' +
              escapeHtml(p.name) +
              "</strong><span>" +
              p.stock +
              " left</span></div>"
          )
          .join("");
      }
    }
  }

  /* -------- Sales log page -------- */
  const salesList = document.getElementById("sales-list");
  if (salesList) {
    let salesFilter = "mine";
    const emptyState = document.getElementById("sales-empty");
    const summaryEls = {
      count: document.getElementById("sales-sum-count"),
      units: document.getElementById("sales-sum-units"),
      revenue: document.getElementById("sales-sum-revenue"),
    };

    function renderSales() {
      let items = getSalesSorted();
      if (salesFilter === "mine") {
        items = items.filter(
          (s) => s.employeeEmail === session.email.toLowerCase()
        );
      } else if (salesFilter === "tyres") {
        items = items.filter((s) => s.category === "tyres");
      } else if (salesFilter === "service") {
        items = items.filter((s) => s.category === "service");
      }

      const units = items.reduce((sum, s) => sum + s.quantity, 0);
      const revenue = items.reduce((sum, s) => sum + s.totalPrice, 0);
      if (summaryEls.count) summaryEls.count.textContent = String(items.length);
      if (summaryEls.units) summaryEls.units.textContent = String(units);
      if (summaryEls.revenue) summaryEls.revenue.textContent = money(revenue);

      if (!items.length) {
        salesList.innerHTML = "";
        if (emptyState) emptyState.hidden = false;
        return;
      }
      if (emptyState) emptyState.hidden = true;

      salesList.innerHTML =
        '<div class="seller-table-wrap sales-table-wrap"><table class="seller-table sales-table"><thead><tr>' +
        "<th>Tyre / product</th><th>Qty</th><th>Unit price</th><th>Sale total</th><th>Employee</th><th>Sold at</th>" +
        "</tr></thead><tbody>" +
        items
          .map(
            (s) =>
              "<tr><td><strong>" +
              escapeHtml(s.productName) +
              '</strong><span class="sale-cat">' +
              escapeHtml(s.category) +
              "</span></td><td>" +
              s.quantity +
              "</td><td>" +
              money(s.unitPrice) +
              '</td><td class="gold-text">' +
              money(s.totalPrice) +
              "</td><td>" +
              escapeHtml(s.employeeName) +
              '<span class="sale-emp-email">' +
              escapeHtml(s.employeeEmail) +
              "</span></td><td>" +
              escapeHtml(formatDateTime(s.soldAt)) +
              "</td></tr>"
          )
          .join("") +
        "</tbody></table></div>";
    }

    document.querySelectorAll("[data-sales-filter]").forEach((chip) => {
      chip.addEventListener("click", () => {
        salesFilter = chip.getAttribute("data-sales-filter") || "mine";
        document.querySelectorAll("[data-sales-filter]").forEach((c) => {
          c.classList.toggle("is-active", c === chip);
        });
        renderSales();
      });
    });

    renderSales();
  }

  /* -------- Products page -------- */
  const productForm = document.getElementById("product-form");
  const productsList = document.getElementById("products-list");
  if (!productForm || !productsList) return;

  const formStatus = document.getElementById("product-form-status");
  const formTitle = document.getElementById("product-form-title");
  const resetBtn = document.getElementById("product-form-reset");
  const emptyState = document.getElementById("products-empty");
  let currentFilter = "all";

  function resetForm() {
    productForm.reset();
    document.getElementById("product-id").value = "";
    if (formTitle) formTitle.textContent = "Add to catalogue";
    if (resetBtn) resetBtn.hidden = true;
    if (formStatus) {
      formStatus.textContent = "";
      formStatus.className = "form-status";
    }
  }

  function renderProducts() {
    let items = getCatalogue();
    if (currentFilter === "low") {
      items = items.filter((p) => p.stock <= 5);
    } else if (currentFilter !== "all") {
      items = items.filter((p) => p.category === currentFilter);
    }

    if (!items.length) {
      productsList.innerHTML = "";
      if (emptyState) emptyState.hidden = false;
      return;
    }
    if (emptyState) emptyState.hidden = true;

    productsList.innerHTML = items
      .map((p) => {
        const low = p.stock <= 5;
        return (
          '<article class="product-manage-card' +
          (low ? " is-low" : "") +
          '" data-id="' +
          p.id +
          '">' +
          '<div class="pmc-top">' +
          "<div><p class=\"pmc-cat\">" +
          escapeHtml(p.category) +
          "</p><h3>" +
          escapeHtml(p.name) +
          "</h3>" +
          (p.description
            ? '<p class="pmc-desc">' + escapeHtml(p.description) + "</p>"
            : "") +
          "</div>" +
          '<strong class="pmc-price">' +
          money(p.price) +
          "</strong></div>" +
          '<div class="pmc-metrics">' +
          "<div><span>Sold</span><strong>" +
          (p.sold || 0) +
          "</strong></div>" +
          "<div><span>Remaining</span><strong class=\"" +
          (low ? "warn-text" : "") +
          '">' +
          p.stock +
          "</strong></div>" +
          "<div><span>List price</span><strong class=\"gold-text\">" +
          money(p.price) +
          "</strong></div></div>" +
          '<div class="pmc-actions">' +
          '<button type="button" class="btn btn-gold btn-sm" data-sell="' +
          p.id +
          '">Record sale</button>' +
          '<button type="button" class="btn btn-outline btn-sm" data-edit="' +
          p.id +
          '">Edit</button>' +
          '<button type="button" class="btn btn-outline btn-sm" data-stock-plus="' +
          p.id +
          '">+Stock</button>' +
          '<button type="button" class="btn btn-outline btn-sm danger" data-delete="' +
          p.id +
          '">Delete</button>' +
          "</div></article>"
        );
      })
      .join("");
  }

  productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!productForm.checkValidity()) {
      formStatus.textContent = "Please complete the required fields.";
      formStatus.className = "form-status is-error";
      productForm.reportValidity();
      return;
    }

    const data = new FormData(productForm);
    const id = String(data.get("id") || "");
    const payload = {
      name: String(data.get("name") || "").trim(),
      category: String(data.get("category") || "other"),
      price: Number(data.get("price") || 0),
      stock: Number(data.get("stock") || 0),
      description: String(data.get("description") || "").trim(),
      updatedAt: new Date().toISOString(),
    };

    const all = readProducts();
    if (id) {
      const index = all.findIndex((p) => p.id === id);
      if (index === -1) {
        formStatus.textContent = "Product not found.";
        formStatus.className = "form-status is-error";
        return;
      }
      all[index] = {
        ...all[index],
        ...payload,
      };
      writeProducts(all);
      formStatus.textContent = "Product updated.";
    } else {
      all.push({
        ...payload,
        id: "SP" + Date.now(),
        sold: 0,
        createdAt: new Date().toISOString(),
      });
      writeProducts(all);
      formStatus.textContent = "Product added to shared catalogue.";
    }

    formStatus.className = "form-status is-success";
    resetForm();
    renderProducts();
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", resetForm);
  }

  document.querySelectorAll("[data-product-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      currentFilter = chip.getAttribute("data-product-filter") || "all";
      document.querySelectorAll("[data-product-filter]").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
      });
      renderProducts();
    });
  });

  productsList.addEventListener("click", (event) => {
    const sellId = event.target.getAttribute("data-sell");
    const editId = event.target.getAttribute("data-edit");
    const plusId = event.target.getAttribute("data-stock-plus");
    const deleteId = event.target.getAttribute("data-delete");
    const all = readProducts();

    if (sellId) {
      const product = all.find((p) => p.id === sellId);
      if (!product) return;
      if (product.stock <= 0) {
        alert("No stock remaining for this product.");
        return;
      }
      openSaleModal(product);
      return;
    }

    if (plusId) {
      const index = all.findIndex((p) => p.id === plusId);
      if (index === -1) return;
      all[index].stock += 1;
      all[index].updatedAt = new Date().toISOString();
      writeProducts(all);
      renderProducts();
      return;
    }

    if (deleteId) {
      if (!confirm("Delete this product from the shared catalogue?")) return;
      writeProducts(all.filter((p) => p.id !== deleteId));
      renderProducts();
      return;
    }

    if (editId) {
      const product = all.find((p) => p.id === editId);
      if (!product) return;
      document.getElementById("product-id").value = product.id;
      productForm.name.value = product.name;
      productForm.category.value = product.category;
      productForm.price.value = product.price;
      productForm.stock.value = product.stock;
      productForm.description.value = product.description || "";
      if (formTitle) formTitle.textContent = "Edit product";
      if (resetBtn) resetBtn.hidden = false;
      productForm.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  renderProducts();
})();
