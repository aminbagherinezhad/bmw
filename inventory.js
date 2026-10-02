(() => {
  const STORAGE_SESSION = "sutton_seller_session";
  const STORAGE_TYRES = "sutton_tyres";
  const STORAGE_SALES = "sutton_sales";

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SESSION) || "null");
    } catch {
      return null;
    }
  }

  function readTyres() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_TYRES) || "[]");
    } catch {
      return [];
    }
  }

  function writeTyres(tyres) {
    localStorage.setItem(STORAGE_TYRES, JSON.stringify(tyres));
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

  function tyreLabel(t) {
    return [t.brand, t.model, t.size].filter(Boolean).join(" ");
  }

  function locationText(t) {
    const loc = t.location || {};
    if (!loc.row && !loc.shelf && !loc.level) return "Location not set";
    return (
      "Row " +
      (loc.row || "—") +
      " · Shelf " +
      (loc.shelf || "—") +
      " · Level " +
      (loc.level || "—")
    );
  }

  function stockClass(stock) {
    if (stock <= 0) return "is-out";
    if (stock <= 4) return "is-low";
    return "is-ok";
  }

  function stockLabel(stock) {
    if (stock <= 0) return "Out of stock";
    if (stock <= 4) return "Low stock";
    return "In stock";
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

  function requireStaff() {
    const session = getSession();
    if (!session) {
      window.location.href = "seller-login.html";
      return null;
    }
    return session;
  }

  function seedTyres() {
    if (readTyres().length) return;
    const now = Date.now();
    const samples = [
      {
        brand: "Michelin",
        model: "Primacy 4",
        size: "205/55 R16",
        loadIndex: "91",
        speedRating: "V",
        season: "summer",
        specs: "Wet grip A · Fuel C · Quiet road tyre",
        barcode: "3528703512345",
        price: 98,
        stock: 14,
        location: { row: "A", shelf: "1", level: "2" },
      },
      {
        brand: "Continental",
        model: "PremiumContact 6",
        size: "225/45 R17",
        loadIndex: "94",
        speedRating: "Y",
        season: "summer",
        specs: "XL · High performance saloon fitment",
        barcode: "4019238123456",
        price: 112,
        stock: 8,
        location: { row: "A", shelf: "2", level: "1" },
      },
      {
        brand: "Goodyear",
        model: "Vector 4Seasons",
        size: "205/55 R16",
        loadIndex: "91",
        speedRating: "H",
        season: "all-season",
        specs: "All-season M+S · 3PMSF",
        barcode: "5452000456789",
        price: 86,
        stock: 3,
        location: { row: "B", shelf: "1", level: "3" },
      },
      {
        brand: "Pirelli",
        model: "Winter Sottozero 3",
        size: "195/65 R15",
        loadIndex: "91",
        speedRating: "T",
        season: "winter",
        specs: "Winter compound · 3PMSF",
        barcode: "8019227345678",
        price: 79,
        stock: 10,
        location: { row: "C", shelf: "2", level: "1" },
      },
      {
        brand: "Hankook",
        model: "Vantra LT",
        size: "215/65 R16C",
        loadIndex: "109",
        speedRating: "R",
        season: "summer",
        specs: "Commercial C tyre · Dual load rating",
        barcode: "8808563456789",
        price: 88,
        stock: 0,
        location: { row: "D", shelf: "1", level: "2" },
      },
      {
        brand: "Bridgestone",
        model: "Turanza T005",
        size: "225/40 R18",
        loadIndex: "92",
        speedRating: "Y",
        season: "summer",
        specs: "OEM-style touring tyre",
        barcode: "3286341890123",
        price: 125,
        stock: 6,
        location: { row: "B", shelf: "3", level: "2" },
      },
    ].map((item, index) => ({
      ...item,
      id: "TY" + (now + index),
      sold: 0,
      createdAt: new Date(now - index * 86400000).toISOString(),
      updatedAt: new Date(now - index * 3600000).toISOString(),
    }));
    writeTyres(samples);
  }

  function getTyresSorted() {
    return readTyres().sort((a, b) => {
      const brandCmp = String(a.brand || "").localeCompare(String(b.brand || ""));
      if (brandCmp) return brandCmp;
      return String(a.size || "").localeCompare(String(b.size || ""));
    });
  }

  function findTyres(query) {
    const q = String(query || "")
      .trim()
      .toLowerCase();
    const all = getTyresSorted();
    if (!q) return all;
    return all.filter((t) => {
      const hay = [
        t.brand,
        t.model,
        t.size,
        t.barcode,
        t.season,
        t.specs,
        t.loadIndex,
        t.speedRating,
        locationText(t),
        tyreLabel(t),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q) || String(t.barcode || "") === q;
    });
  }

  function findByBarcode(code) {
    const key = String(code || "").trim();
    if (!key) return null;
    return readTyres().find((t) => String(t.barcode || "") === key) || null;
  }

  function upsertTyre(payload, id) {
    const all = readTyres();
    const barcode = String(payload.barcode || "").trim();
    if (barcode) {
      const clash = all.find(
        (t) => t.barcode === barcode && (!id || t.id !== id)
      );
      if (clash) {
        return { ok: false, error: "Another tyre already uses this barcode." };
      }
    }

    const record = {
      brand: String(payload.brand || "").trim(),
      model: String(payload.model || "").trim(),
      size: String(payload.size || "").trim(),
      loadIndex: String(payload.loadIndex || "").trim(),
      speedRating: String(payload.speedRating || "").trim().toUpperCase(),
      season: String(payload.season || "all-season"),
      specs: String(payload.specs || "").trim(),
      barcode: barcode,
      price: Math.max(0, Number(payload.price) || 0),
      stock: Math.max(0, Math.floor(Number(payload.stock) || 0)),
      location: {
        row: String(payload.row || "").trim().toUpperCase(),
        shelf: String(payload.shelf || "").trim(),
        level: String(payload.level || "").trim(),
      },
      updatedAt: new Date().toISOString(),
    };

    if (!record.brand || !record.model || !record.size) {
      return { ok: false, error: "Brand, model and size are required." };
    }

    if (id) {
      const index = all.findIndex((t) => t.id === id);
      if (index === -1) return { ok: false, error: "Tyre not found." };
      all[index] = {
        ...all[index],
        ...record,
        sold: all[index].sold || 0,
      };
      writeTyres(all);
      return { ok: true, tyre: all[index] };
    }

    const tyre = {
      ...record,
      id: "TY" + Date.now(),
      sold: 0,
      createdAt: new Date().toISOString(),
    };
    all.push(tyre);
    writeTyres(all);
    return { ok: true, tyre };
  }

  function updateLocation(id, { row, shelf, level }) {
    const all = readTyres();
    const index = all.findIndex((t) => t.id === id);
    if (index === -1) return { ok: false, error: "Tyre not found." };
    all[index].location = {
      row: String(row || "").trim().toUpperCase(),
      shelf: String(shelf || "").trim(),
      level: String(level || "").trim(),
    };
    all[index].updatedAt = new Date().toISOString();
    writeTyres(all);
    return { ok: true, tyre: all[index] };
  }

  function recordTyreSale({ tyreId, quantity, unitPrice, employee }) {
    const qty = Math.max(1, Math.floor(Number(quantity) || 0));
    const price = Math.max(0, Number(unitPrice) || 0);
    const all = readTyres();
    const index = all.findIndex((t) => t.id === tyreId);
    if (index === -1) return { ok: false, error: "Tyre not found." };
    if (all[index].stock < qty) {
      return {
        ok: false,
        error: "Not enough stock. Only " + all[index].stock + " left.",
      };
    }

    const tyre = all[index];
    const soldAt = new Date().toISOString();
    all[index] = {
      ...tyre,
      stock: tyre.stock - qty,
      sold: (tyre.sold || 0) + qty,
      updatedAt: soldAt,
    };
    writeTyres(all);

    const sale = {
      id: "SL" + Date.now() + String(Math.floor(Math.random() * 90) + 10),
      productId: tyre.id,
      productName: tyreLabel(tyre),
      category: "tyres",
      quantity: qty,
      unitPrice: price,
      totalPrice: Math.round(price * qty * 100) / 100,
      soldAt,
      employeeEmail: String(employee.email || "").toLowerCase(),
      employeeName: employee.name || "Staff",
      barcode: tyre.barcode || "",
      locationAtSale: locationText(tyre),
    };
    const sales = readSales();
    sales.push(sale);
    writeSales(sales);
    return { ok: true, sale, tyre: all[index] };
  }

  function renderTyreCard(t, { highlight } = {}) {
    const stock = Number(t.stock) || 0;
    return (
      '<article class="tyre-card ' +
      stockClass(stock) +
      (highlight ? " is-highlight" : "") +
      '" data-tyre-id="' +
      escapeHtml(t.id) +
      '">' +
      '<div class="tyre-card-top">' +
      "<div>" +
      '<p class="tyre-brand">' +
      escapeHtml(t.brand) +
      "</p>" +
      "<h3>" +
      escapeHtml(t.model) +
      " <span>" +
      escapeHtml(t.size) +
      "</span></h3>" +
      '<p class="tyre-specs">' +
      escapeHtml(
        [t.season, t.loadIndex && t.speedRating ? t.loadIndex + t.speedRating : "", t.specs]
          .filter(Boolean)
          .join(" · ")
      ) +
      "</p>" +
      "</div>" +
      '<div class="tyre-stock-badge ' +
      stockClass(stock) +
      '"><strong>' +
      stock +
      "</strong><span>" +
      stockLabel(stock) +
      "</span></div>" +
      "</div>" +
      '<div class="tyre-meta-grid">' +
      "<div><span>Barcode</span><strong>" +
      escapeHtml(t.barcode || "—") +
      "</strong></div>" +
      "<div><span>Price</span><strong class=\"gold-text\">" +
      money(t.price) +
      "</strong></div>" +
      "<div><span>Warehouse</span><strong>" +
      escapeHtml(locationText(t)) +
      "</strong></div>" +
      "<div><span>Sold</span><strong>" +
      (t.sold || 0) +
      "</strong></div>" +
      "</div>" +
      '<div class="pmc-actions">' +
      '<button type="button" class="btn btn-gold btn-sm" data-tyre-sale="' +
      escapeHtml(t.id) +
      '">Record sale</button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-tyre-move="' +
      escapeHtml(t.id) +
      '">Move location</button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-tyre-edit="' +
      escapeHtml(t.id) +
      '">Edit</button>' +
      '<button type="button" class="btn btn-outline btn-sm danger" data-tyre-delete="' +
      escapeHtml(t.id) +
      '">Delete</button>' +
      "</div></article>"
    );
  }

  /* ---------- Page boot ---------- */
  const session = requireStaff();
  if (!session) return;

  seedTyres();

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  document.querySelectorAll("[data-seller-shop]").forEach((el) => {
    el.textContent = session.name || "Staff";
  });
  document.querySelectorAll("[data-seller-name]").forEach((el) => {
    el.textContent = (session.name || "Staff").split(" ")[0];
  });

  document.querySelectorAll("[data-seller-logout]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.removeItem(STORAGE_SESSION);
      window.location.href = "seller-login.html";
    });
  });

  const listEl = document.getElementById("tyre-list");
  const emptyEl = document.getElementById("tyre-empty");
  const form = document.getElementById("tyre-form");
  const formStatus = document.getElementById("tyre-form-status");
  const formTitle = document.getElementById("tyre-form-title");
  const resetBtn = document.getElementById("tyre-form-reset");
  const searchInput = document.getElementById("tyre-search");
  const searchStatus = document.getElementById("tyre-search-status");
  const findResult = document.getElementById("tyre-find-result");
  const kpiStock = document.getElementById("tyre-kpi-units");
  const kpiSkus = document.getElementById("tyre-kpi-skus");
  const kpiLow = document.getElementById("tyre-kpi-low");
  const kpiOut = document.getElementById("tyre-kpi-out");

  let currentFilter = "all";
  let searchQuery = "";
  let highlightId = "";

  function updateKpis(items) {
    const units = items.reduce((sum, t) => sum + (Number(t.stock) || 0), 0);
    const low = items.filter((t) => t.stock > 0 && t.stock <= 4).length;
    const out = items.filter((t) => t.stock <= 0).length;
    if (kpiStock) kpiStock.textContent = String(units);
    if (kpiSkus) kpiSkus.textContent = String(items.length);
    if (kpiLow) kpiLow.textContent = String(low);
    if (kpiOut) kpiOut.textContent = String(out);
  }

  function renderList() {
    if (!listEl) return;
    let items = searchQuery ? findTyres(searchQuery) : getTyresSorted();

    if (currentFilter === "low") {
      items = items.filter((t) => t.stock > 0 && t.stock <= 4);
    } else if (currentFilter === "out") {
      items = items.filter((t) => t.stock <= 0);
    } else if (currentFilter === "in") {
      items = items.filter((t) => t.stock > 0);
    } else if (currentFilter !== "all") {
      items = items.filter((t) => t.season === currentFilter);
    }

    updateKpis(getTyresSorted());

    if (!items.length) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    listEl.innerHTML = items
      .map((t) => renderTyreCard(t, { highlight: t.id === highlightId }))
      .join("");
  }

  function resetForm() {
    if (!form) return;
    form.reset();
    document.getElementById("tyre-id").value = "";
    if (formTitle) formTitle.textContent = "Register tyre";
    if (resetBtn) resetBtn.hidden = true;
    if (formStatus) {
      formStatus.textContent = "";
      formStatus.className = "form-status";
    }
  }

  function fillForm(tyre) {
    document.getElementById("tyre-id").value = tyre.id;
    form.brand.value = tyre.brand || "";
    form.model.value = tyre.model || "";
    form.size.value = tyre.size || "";
    form.loadIndex.value = tyre.loadIndex || "";
    form.speedRating.value = tyre.speedRating || "";
    form.season.value = tyre.season || "all-season";
    form.specs.value = tyre.specs || "";
    form.barcode.value = tyre.barcode || "";
    form.price.value = tyre.price ?? "";
    form.stock.value = tyre.stock ?? 0;
    form.row.value = (tyre.location && tyre.location.row) || "";
    form.shelf.value = (tyre.location && tyre.location.shelf) || "";
    form.level.value = (tyre.location && tyre.location.level) || "";
    if (formTitle) formTitle.textContent = "Edit tyre";
    if (resetBtn) resetBtn.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function showFindResult(tyre, query) {
    if (!findResult) return;
    if (!tyre) {
      findResult.innerHTML =
        '<div class="tyre-find-empty"><strong>Not in stock / not found</strong><p>No tyre matched "' +
        escapeHtml(query) +
        '". Check size, brand or barcode.</p></div>';
      findResult.hidden = false;
      return;
    }
    highlightId = tyre.id;
    findResult.innerHTML =
      '<div class="tyre-find-hit ' +
      stockClass(tyre.stock) +
      '">' +
      "<div>" +
      '<p class="eyebrow gold">Quick find</p>' +
      "<h3>" +
      escapeHtml(tyreLabel(tyre)) +
      "</h3>" +
      "<p>" +
      escapeHtml(stockLabel(tyre.stock)) +
      " · <strong>" +
      tyre.stock +
      "</strong> units</p>" +
      '<p class="tyre-find-loc"><span>Warehouse location</span><strong>' +
      escapeHtml(locationText(tyre)) +
      "</strong></p>" +
      (tyre.barcode
        ? "<p class=\"tyre-find-barcode\">Barcode <code>" +
          escapeHtml(tyre.barcode) +
          "</code></p>"
        : "") +
      "</div>" +
      '<div class="pmc-actions">' +
      '<button type="button" class="btn btn-gold btn-sm" data-tyre-sale="' +
      escapeHtml(tyre.id) +
      '">Record sale</button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-tyre-move="' +
      escapeHtml(tyre.id) +
      '">Move location</button>' +
      "</div></div>";
    findResult.hidden = false;
    renderList();
  }

  function runSearch(raw, { preferBarcode } = {}) {
    const q = String(raw || "").trim();
    searchQuery = q;
    if (searchStatus) {
      searchStatus.textContent = q
        ? 'Showing matches for "' + q + '"'
        : "Showing full warehouse catalogue";
    }
    if (!q) {
      highlightId = "";
      if (findResult) findResult.hidden = true;
      renderList();
      return;
    }
    const byCode = preferBarcode || /^\d{8,}$/.test(q) ? findByBarcode(q) : null;
    if (byCode) {
      showFindResult(byCode, q);
      return;
    }
    const matches = findTyres(q);
    if (matches.length === 1) {
      showFindResult(matches[0], q);
      return;
    }
    if (findResult) {
      findResult.innerHTML =
        '<div class="tyre-find-empty"><strong>' +
        matches.length +
        " matches</strong><p>Refine by brand, size (e.g. 205/55 R16) or scan the barcode for an exact location.</p></div>";
      findResult.hidden = false;
    }
    highlightId = "";
    renderList();
  }

  if (searchInput) {
    let debounce;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => runSearch(searchInput.value), 180);
    });
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        runSearch(searchInput.value, { preferBarcode: true });
      }
    });
  }

  document.getElementById("tyre-search-clear")?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    runSearch("");
  });

  document.querySelectorAll("[data-tyre-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      currentFilter = chip.getAttribute("data-tyre-filter") || "all";
      document.querySelectorAll("[data-tyre-filter]").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
      });
      renderList();
    });
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        formStatus.textContent = "Please complete the required fields.";
        formStatus.className = "form-status is-error";
        form.reportValidity();
        return;
      }
      const data = new FormData(form);
      const id = String(data.get("id") || "");
      const result = upsertTyre(
        {
          brand: data.get("brand"),
          model: data.get("model"),
          size: data.get("size"),
          loadIndex: data.get("loadIndex"),
          speedRating: data.get("speedRating"),
          season: data.get("season"),
          specs: data.get("specs"),
          barcode: data.get("barcode"),
          price: data.get("price"),
          stock: data.get("stock"),
          row: data.get("row"),
          shelf: data.get("shelf"),
          level: data.get("level"),
        },
        id || null
      );
      if (!result.ok) {
        formStatus.textContent = result.error;
        formStatus.className = "form-status is-error";
        return;
      }
      formStatus.textContent = id
        ? "Tyre updated — stock & location saved."
        : "Tyre registered in warehouse.";
      formStatus.className = "form-status is-success";
      resetForm();
      highlightId = result.tyre.id;
      renderList();
    });
  }

  if (resetBtn) resetBtn.addEventListener("click", resetForm);

  /* Sale modal */
  const saleModal = document.getElementById("tyre-sale-modal");
  const saleForm = document.getElementById("tyre-sale-form");
  const saleStatus = document.getElementById("tyre-sale-status");
  let saleTyreId = "";

  function openSaleModal(tyre) {
    if (!saleModal || !saleForm) return;
    saleTyreId = tyre.id;
    document.getElementById("tyre-sale-name").textContent = tyreLabel(tyre);
    document.getElementById("tyre-sale-meta").textContent =
      money(tyre.price) +
      " · " +
      tyre.stock +
      " in stock · " +
      locationText(tyre);
    saleForm.quantity.value = "1";
    saleForm.quantity.max = String(Math.max(1, tyre.stock));
    saleForm.unitPrice.value = String(tyre.price);
    if (saleStatus) {
      saleStatus.textContent = "";
      saleStatus.className = "form-status";
    }
    saleModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeSaleModal() {
    if (!saleModal) return;
    saleModal.hidden = true;
    document.body.classList.remove("modal-open");
    saleTyreId = "";
  }

  /* Move location modal */
  const moveModal = document.getElementById("tyre-move-modal");
  const moveForm = document.getElementById("tyre-move-form");
  const moveStatus = document.getElementById("tyre-move-status");
  let moveTyreId = "";

  function openMoveModal(tyre) {
    if (!moveModal || !moveForm) return;
    moveTyreId = tyre.id;
    document.getElementById("tyre-move-name").textContent = tyreLabel(tyre);
    document.getElementById("tyre-move-current").textContent =
      "Current: " + locationText(tyre);
    moveForm.row.value = (tyre.location && tyre.location.row) || "";
    moveForm.shelf.value = (tyre.location && tyre.location.shelf) || "";
    moveForm.level.value = (tyre.location && tyre.location.level) || "";
    if (moveStatus) {
      moveStatus.textContent = "";
      moveStatus.className = "form-status";
    }
    moveModal.hidden = false;
    document.body.classList.add("modal-open");
  }

  function closeMoveModal() {
    if (!moveModal) return;
    moveModal.hidden = true;
    document.body.classList.remove("modal-open");
    moveTyreId = "";
  }

  document.querySelectorAll("[data-tyre-sale-close]").forEach((el) => {
    el.addEventListener("click", closeSaleModal);
  });
  document.querySelectorAll("[data-tyre-move-close]").forEach((el) => {
    el.addEventListener("click", closeMoveModal);
  });

  if (saleForm) {
    saleForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = recordTyreSale({
        tyreId: saleTyreId,
        quantity: saleForm.quantity.value,
        unitPrice: saleForm.unitPrice.value,
        employee: session,
      });
      if (!result.ok) {
        saleStatus.textContent = result.error;
        saleStatus.className = "form-status is-error";
        return;
      }
      saleStatus.textContent =
        "Sale saved under " +
        (session.name || "your account") +
        ". Stock now " +
        result.tyre.stock +
        ".";
      saleStatus.className = "form-status is-success";
      setTimeout(() => {
        closeSaleModal();
        renderList();
        if (highlightId === result.tyre.id) showFindResult(result.tyre, "");
      }, 700);
    });
  }

  if (moveForm) {
    moveForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = updateLocation(moveTyreId, {
        row: moveForm.row.value,
        shelf: moveForm.shelf.value,
        level: moveForm.level.value,
      });
      if (!result.ok) {
        moveStatus.textContent = result.error;
        moveStatus.className = "form-status is-error";
        return;
      }
      moveStatus.textContent = "Location updated to " + locationText(result.tyre);
      moveStatus.className = "form-status is-success";
      setTimeout(() => {
        closeMoveModal();
        highlightId = result.tyre.id;
        renderList();
        if (findResult && !findResult.hidden) showFindResult(result.tyre, "");
      }, 650);
    });
  }

  function handleListClick(event) {
    const saleId = event.target.getAttribute("data-tyre-sale");
    const moveId = event.target.getAttribute("data-tyre-move");
    const editId = event.target.getAttribute("data-tyre-edit");
    const deleteId = event.target.getAttribute("data-tyre-delete");
    const all = readTyres();

    if (saleId) {
      const tyre = all.find((t) => t.id === saleId);
      if (!tyre) return;
      if (tyre.stock <= 0) {
        alert("This tyre is out of stock.");
        return;
      }
      openSaleModal(tyre);
      return;
    }
    if (moveId) {
      const tyre = all.find((t) => t.id === moveId);
      if (tyre) openMoveModal(tyre);
      return;
    }
    if (editId) {
      const tyre = all.find((t) => t.id === editId);
      if (tyre) fillForm(tyre);
      return;
    }
    if (deleteId) {
      if (!confirm("Delete this tyre from the warehouse?")) return;
      writeTyres(all.filter((t) => t.id !== deleteId));
      if (highlightId === deleteId) {
        highlightId = "";
        if (findResult) findResult.hidden = true;
      }
      renderList();
    }
  }

  listEl?.addEventListener("click", handleListClick);
  findResult?.addEventListener("click", handleListClick);

  /* Barcode camera scan (optional) */
  const scanBtn = document.getElementById("tyre-scan-btn");
  const scanPanel = document.getElementById("tyre-scan-panel");
  const scanVideo = document.getElementById("tyre-scan-video");
  const scanStatus = document.getElementById("tyre-scan-status");
  let scanStream = null;
  let scanTimer = null;
  let detector = null;

  async function stopScan() {
    if (scanTimer) {
      clearInterval(scanTimer);
      scanTimer = null;
    }
    if (scanStream) {
      scanStream.getTracks().forEach((t) => t.stop());
      scanStream = null;
    }
    if (scanVideo) scanVideo.srcObject = null;
    if (scanPanel) scanPanel.hidden = true;
    if (scanBtn) scanBtn.textContent = "Scan barcode";
  }

  async function startScan() {
    if (!scanPanel || !scanVideo) return;
    if (!("BarcodeDetector" in window)) {
      if (scanStatus) {
        scanStatus.textContent =
          "Camera scan is not supported in this browser. Use a USB barcode scanner or type the code in Search.";
      }
      scanPanel.hidden = false;
      return;
    }
    try {
      detector = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8", "code_128", "qr_code", "upc_a", "upc_e"],
      });
      scanStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      scanVideo.srcObject = scanStream;
      await scanVideo.play();
      scanPanel.hidden = false;
      if (scanBtn) scanBtn.textContent = "Stop scan";
      if (scanStatus) {
        scanStatus.textContent = "Point the camera at the tyre barcode…";
      }
      scanTimer = setInterval(async () => {
        try {
          const codes = await detector.detect(scanVideo);
          if (!codes || !codes.length) return;
          const value = codes[0].rawValue;
          if (!value) return;
          if (searchInput) searchInput.value = value;
          if (scanStatus) {
            scanStatus.textContent = "Scanned: " + value;
          }
          await stopScan();
          runSearch(value, { preferBarcode: true });
        } catch {
          /* keep scanning */
        }
      }, 450);
    } catch (err) {
      if (scanStatus) {
        scanStatus.textContent =
          "Camera permission denied. Type the barcode or use a handheld scanner in the search box.";
      }
      scanPanel.hidden = false;
    }
  }

  scanBtn?.addEventListener("click", async () => {
    if (scanStream) {
      await stopScan();
      return;
    }
    await startScan();
  });

  document.getElementById("tyre-scan-stop")?.addEventListener("click", stopScan);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSaleModal();
      closeMoveModal();
      stopScan();
    }
  });

  renderList();
})();
