(() => {
  const STORAGE_TYRES = "sutton_tyres";
  const STORAGE_CART = "sutton_shop_cart";

  const CATALOGUE = [
    {
      brand: "Michelin",
      model: "Primacy 4",
      size: "205/55 R16",
      loadIndex: "91",
      speedRating: "V",
      season: "summer",
      vehicle: "car",
      specs: "Wet grip A · Fuel C · Quiet touring tyre",
      barcode: "3528703512345",
      price: 98,
      stock: 14,
      rating: 4.7,
      reviews: 214,
      featured: true,
    },
    {
      brand: "Michelin",
      model: "CrossClimate 2",
      size: "225/45 R17",
      loadIndex: "94",
      speedRating: "Y",
      season: "all-season",
      vehicle: "car",
      specs: "All-season · 3PMSF · Strong wet braking",
      barcode: "3528703987654",
      price: 118,
      stock: 9,
      rating: 4.8,
      reviews: 189,
      featured: true,
    },
    {
      brand: "Continental",
      model: "PremiumContact 6",
      size: "225/45 R17",
      loadIndex: "94",
      speedRating: "Y",
      season: "summer",
      vehicle: "car",
      specs: "XL · High performance saloon fitment",
      barcode: "4019238123456",
      price: 112,
      stock: 8,
      rating: 4.6,
      reviews: 156,
      featured: true,
    },
    {
      brand: "Continental",
      model: "AllSeasonContact",
      size: "205/55 R16",
      loadIndex: "91",
      speedRating: "V",
      season: "all-season",
      vehicle: "car",
      specs: "Year-round grip · M+S · 3PMSF",
      barcode: "4019238555123",
      price: 95,
      stock: 11,
      rating: 4.5,
      reviews: 98,
    },
    {
      brand: "Goodyear",
      model: "Vector 4Seasons",
      size: "205/55 R16",
      loadIndex: "91",
      speedRating: "H",
      season: "all-season",
      vehicle: "car",
      specs: "All-season M+S · 3PMSF",
      barcode: "5452000456789",
      price: 86,
      stock: 3,
      rating: 4.4,
      reviews: 132,
    },
    {
      brand: "Goodyear",
      model: "EfficientGrip Performance 2",
      size: "215/55 R17",
      loadIndex: "94",
      speedRating: "W",
      season: "summer",
      vehicle: "car",
      specs: "Long mileage · Quiet cabin",
      barcode: "5452000789012",
      price: 102,
      stock: 7,
      rating: 4.5,
      reviews: 76,
    },
    {
      brand: "Pirelli",
      model: "Winter Sottozero 3",
      size: "195/65 R15",
      loadIndex: "91",
      speedRating: "T",
      season: "winter",
      vehicle: "car",
      specs: "Winter compound · 3PMSF",
      barcode: "8019227345678",
      price: 79,
      stock: 10,
      rating: 4.3,
      reviews: 64,
    },
    {
      brand: "Pirelli",
      model: "P Zero",
      size: "245/40 R18",
      loadIndex: "97",
      speedRating: "Y",
      season: "summer",
      vehicle: "performance",
      specs: "Ultra-high performance · XL",
      barcode: "8019227987654",
      price: 148,
      stock: 5,
      rating: 4.6,
      reviews: 88,
      featured: true,
    },
    {
      brand: "Bridgestone",
      model: "Turanza T005",
      size: "225/40 R18",
      loadIndex: "92",
      speedRating: "Y",
      season: "summer",
      vehicle: "car",
      specs: "OEM-style touring tyre",
      barcode: "3286341890123",
      price: 125,
      stock: 6,
      rating: 4.5,
      reviews: 110,
    },
    {
      brand: "Bridgestone",
      model: "Weather Control A005 Evo",
      size: "205/55 R16",
      loadIndex: "94",
      speedRating: "V",
      season: "all-season",
      vehicle: "car",
      specs: "All-weather · 3PMSF",
      barcode: "3286341555444",
      price: 92,
      stock: 12,
      rating: 4.4,
      reviews: 71,
    },
    {
      brand: "Hankook",
      model: "Vantra LT",
      size: "215/65 R16C",
      loadIndex: "109",
      speedRating: "R",
      season: "summer",
      vehicle: "van",
      specs: "Commercial C tyre · Dual load rating",
      barcode: "8808563456789",
      price: 88,
      stock: 0,
      rating: 4.2,
      reviews: 45,
    },
    {
      brand: "Hankook",
      model: "Ventus S1 evo3",
      size: "225/45 R17",
      loadIndex: "94",
      speedRating: "Y",
      season: "summer",
      vehicle: "performance",
      specs: "Sporty handling · Wet grip A",
      barcode: "8808563999001",
      price: 99,
      stock: 8,
      rating: 4.5,
      reviews: 92,
    },
    {
      brand: "Dunlop",
      model: "Sport Maxx RT2",
      size: "225/45 R17",
      loadIndex: "94",
      speedRating: "Y",
      season: "summer",
      vehicle: "car",
      specs: "Sharp steering response",
      barcode: "5452000333111",
      price: 89,
      stock: 9,
      rating: 4.3,
      reviews: 57,
    },
    {
      brand: "Yokohama",
      model: "Bluearth-4S AW21",
      size: "195/65 R15",
      loadIndex: "91",
      speedRating: "H",
      season: "all-season",
      vehicle: "car",
      specs: "Budget-friendly all-season",
      barcode: "4968814911223",
      price: 68,
      stock: 15,
      rating: 4.1,
      reviews: 39,
    },
    {
      brand: "Falken",
      model: "EuroAll Season AS220",
      size: "215/55 R17",
      loadIndex: "98",
      speedRating: "W",
      season: "all-season",
      vehicle: "suv",
      specs: "SUV crossover all-season",
      barcode: "4250427412345",
      price: 104,
      stock: 4,
      rating: 4.2,
      reviews: 28,
    },
    {
      brand: "Nexen",
      model: "N'blue HD Plus",
      size: "195/65 R15",
      loadIndex: "91",
      speedRating: "H",
      season: "summer",
      vehicle: "car",
      specs: "Value summer touring tyre",
      barcode: "8808310123456",
      price: 54,
      stock: 20,
      rating: 4.0,
      reviews: 51,
    },
  ];

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

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_CART) || "[]");
    } catch {
      return [];
    }
  }

  function writeCart(items) {
    localStorage.setItem(STORAGE_CART, JSON.stringify(items));
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

  function rimFromSize(size) {
    const m = String(size || "").match(/R(\d{2})C?/i);
    return m ? "R" + m[1] : "";
  }

  function seasonLabel(s) {
    if (s === "all-season") return "All-season";
    if (s === "winter") return "Winter";
    if (s === "summer") return "Summer";
    return s || "—";
  }

  function vehicleLabel(v) {
    const map = {
      car: "Car",
      van: "Van",
      suv: "SUV / Crossover",
      performance: "Performance",
    };
    return map[v] || "Car";
  }

  function stockLabel(stock) {
    if (stock <= 0) return "Out of stock";
    if (stock <= 4) return "Only " + stock + " left";
    return "In stock";
  }

  function stars(rating) {
    const full = Math.floor(rating);
    const half = rating - full >= 0.4;
    let html = "";
    for (let i = 0; i < 5; i++) {
      if (i < full) html += "★";
      else if (i === full && half) html += "☆";
      else html += "☆";
    }
    return html;
  }

  function ensureCatalogue() {
    const existing = readTyres();
    const byBarcode = new Map(existing.map((t) => [String(t.barcode || ""), t]));
    const now = Date.now();
    let changed = false;
    const merged = [...existing];

    CATALOGUE.forEach((item, index) => {
      const key = String(item.barcode || "");
      if (key && byBarcode.has(key)) {
        const cur = byBarcode.get(key);
        let dirty = false;
        ["rating", "reviews", "vehicle", "featured", "season", "specs", "loadIndex", "speedRating"].forEach((field) => {
          if ((cur[field] == null || cur[field] === "") && item[field] != null) {
            cur[field] = item[field];
            dirty = true;
          }
        });
        if (dirty) changed = true;
        return;
      }
      merged.push({
        ...item,
        id: "TY" + (now + index + 100),
        sold: 0,
        location: { row: "S", shelf: String((index % 4) + 1), level: "1" },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      changed = true;
    });

    if (!existing.length || changed) writeTyres(merged);
    return readTyres().map((t) => ({
      ...t,
      rating: Number(t.rating) || 4.2,
      reviews: Number(t.reviews) || 12,
      vehicle: t.vehicle || "car",
      season: t.season || "summer",
      rim: rimFromSize(t.size),
    }));
  }

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const products = ensureCatalogue();
  let cart = readCart();

  const state = {
    q: "",
    brands: new Set(),
    sizes: new Set(),
    seasons: new Set(),
    rims: new Set(),
    vehicles: new Set(),
    prices: new Set(),
    rating: 0,
    inStock: false,
    sort: "featured",
  };

  function uniqueSorted(list) {
    return [...new Set(list.filter(Boolean))].sort((a, b) =>
      String(a).localeCompare(String(b), undefined, { numeric: true })
    );
  }

  function buildFilterOptions() {
    fillChecks(
      "filter-brands",
      "brand",
      uniqueSorted(products.map((p) => p.brand))
    );
    fillChecks(
      "filter-sizes",
      "size",
      uniqueSorted(products.map((p) => p.size))
    );
    fillChecks(
      "filter-seasons",
      "season",
      uniqueSorted(products.map((p) => p.season)),
      seasonLabel
    );
    fillChecks(
      "filter-rims",
      "rim",
      uniqueSorted(products.map((p) => p.rim))
    );
    fillChecks(
      "filter-vehicles",
      "vehicle",
      uniqueSorted(products.map((p) => p.vehicle)),
      vehicleLabel
    );
  }

  function fillChecks(id, name, values, labelFn) {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    wrap.innerHTML = values
      .map(
        (v) =>
          '<label class="shop-check"><input type="checkbox" name="' +
          name +
          '" value="' +
          escapeHtml(v) +
          '" /><span>' +
          escapeHtml(labelFn ? labelFn(v) : v) +
          "</span></label>"
      )
      .join("");
  }

  function priceMatch(price) {
    if (!state.prices.size) return true;
    return [...state.prices].some((range) => {
      const [min, max] = range.split("-").map(Number);
      return price >= min && price <= max;
    });
  }

  function filteredProducts() {
    const q = state.q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (state.brands.size && !state.brands.has(p.brand)) return false;
      if (state.sizes.size && !state.sizes.has(p.size)) return false;
      if (state.seasons.size && !state.seasons.has(p.season)) return false;
      if (state.rims.size && !state.rims.has(p.rim)) return false;
      if (state.vehicles.size && !state.vehicles.has(p.vehicle)) return false;
      if (!priceMatch(Number(p.price) || 0)) return false;
      if (state.rating && (Number(p.rating) || 0) < state.rating) return false;
      if (state.inStock && !(Number(p.stock) > 0)) return false;
      if (q) {
        const hay = [p.brand, p.model, p.size, p.specs, p.season, p.vehicle]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = list.slice().sort((a, b) => {
      if (state.sort === "price-asc") return (a.price || 0) - (b.price || 0);
      if (state.sort === "price-desc") return (b.price || 0) - (a.price || 0);
      if (state.sort === "rating") return (b.rating || 0) - (a.rating || 0);
      if (state.sort === "brand") {
        return String(a.brand).localeCompare(String(b.brand)) ||
          String(a.model).localeCompare(String(b.model));
      }
      const af = a.featured ? 1 : 0;
      const bf = b.featured ? 1 : 0;
      if (bf !== af) return bf - af;
      return (b.rating || 0) - (a.rating || 0);
    });
    return list;
  }

  function renderProducts() {
    const list = filteredProducts();
    const grid = document.getElementById("shop-grid");
    const empty = document.getElementById("shop-empty");
    const count = document.getElementById("shop-result-count");
    if (count) {
      count.textContent =
        list.length + " result" + (list.length === 1 ? "" : "s");
    }
    if (empty) empty.hidden = list.length > 0;
    if (!grid) return;

    grid.innerHTML = list
      .map((p) => {
        const out = Number(p.stock) <= 0;
        return (
          '<article class="shop-card' +
          (p.featured ? " is-featured" : "") +
          (out ? " is-out" : "") +
          '" data-id="' +
          escapeHtml(p.id) +
          '">' +
          '<div class="shop-card-media" aria-hidden="true">' +
          '<div class="shop-tyre-art" data-brand="' +
          escapeHtml(p.brand) +
          '"><span>' +
          escapeHtml((p.brand || "?").slice(0, 1)) +
          "</span></div>" +
          (p.featured ? '<span class="shop-badge">Best seller</span>' : "") +
          "</div>" +
          '<div class="shop-card-body">' +
          '<p class="shop-card-brand">' +
          escapeHtml(p.brand) +
          "</p>" +
          "<h3>" +
          escapeHtml(p.model) +
          "</h3>" +
          '<p class="shop-card-size">' +
          escapeHtml(p.size) +
          " · " +
          escapeHtml(p.loadIndex || "") +
          escapeHtml(p.speedRating || "") +
          "</p>" +
          '<div class="shop-card-meta">' +
          '<span class="shop-season">' +
          escapeHtml(seasonLabel(p.season)) +
          "</span>" +
          '<span class="shop-vehicle">' +
          escapeHtml(vehicleLabel(p.vehicle)) +
          "</span>" +
          "</div>" +
          '<p class="shop-rating" title="' +
          escapeHtml(String(p.rating)) +
          ' out of 5">' +
          '<span class="shop-stars">' +
          stars(p.rating) +
          "</span> " +
          escapeHtml(String(p.rating)) +
          " (" +
          escapeHtml(String(p.reviews)) +
          ")</p>" +
          '<p class="shop-card-specs">' +
          escapeHtml(p.specs || "") +
          "</p>" +
          '<div class="shop-card-foot">' +
          "<div><strong class=\"shop-price\">" +
          money(p.price) +
          '</strong><span class="shop-stock ' +
          (out ? "is-out" : Number(p.stock) <= 4 ? "is-low" : "is-ok") +
          '">' +
          escapeHtml(stockLabel(p.stock)) +
          "</span></div>" +
          '<button type="button" class="btn btn-gold btn-sm" data-add="' +
          escapeHtml(p.id) +
          '"' +
          (out ? " disabled" : "") +
          ">" +
          (out ? "Unavailable" : "Add to basket") +
          "</button>" +
          "</div></div></article>"
        );
      })
      .join("");

    renderActiveFilters();
  }

  function renderActiveFilters() {
    const wrap = document.getElementById("shop-active-filters");
    if (!wrap) return;
    const chips = [];
    const pushSet = (set, label) => {
      set.forEach((v) =>
        chips.push({
          key: label,
          value: v,
          text: label + ": " + (label === "season" ? seasonLabel(v) : label === "vehicle" ? vehicleLabel(v) : v),
        })
      );
    };
    pushSet(state.brands, "brand");
    pushSet(state.sizes, "size");
    pushSet(state.seasons, "season");
    pushSet(state.rims, "rim");
    pushSet(state.vehicles, "vehicle");
    pushSet(state.prices, "price");
    if (state.rating) chips.push({ key: "rating", value: String(state.rating), text: state.rating + "★ & up" });
    if (state.inStock) chips.push({ key: "instock", value: "1", text: "In stock" });
    if (state.q) chips.push({ key: "q", value: state.q, text: "Search: " + state.q });

    wrap.hidden = !chips.length;
    wrap.innerHTML = chips
      .map(
        (c) =>
          '<button type="button" class="shop-active-chip" data-clear-key="' +
          escapeHtml(c.key) +
          '" data-clear-value="' +
          escapeHtml(c.value) +
          '">' +
          escapeHtml(c.text) +
          " ×</button>"
      )
      .join("");
  }

  function syncFiltersFromDom() {
    const box = (name) =>
      new Set(
        [...document.querySelectorAll('input[name="' + name + '"]:checked')].map(
          (el) => el.value
        )
      );
    state.brands = box("brand");
    state.sizes = box("size");
    state.seasons = box("season");
    state.rims = box("rim");
    state.vehicles = box("vehicle");
    state.prices = box("price");
    const rating = document.querySelector('input[name="rating"]:checked');
    state.rating = rating ? Number(rating.value) || 0 : 0;
    state.inStock = !!document.getElementById("filter-instock")?.checked;
    state.sort = document.getElementById("shop-sort")?.value || "featured";
  }

  function clearAllFilters() {
    document
      .querySelectorAll('#shop-filters input[type="checkbox"]')
      .forEach((el) => {
        el.checked = false;
      });
    const allRating = document.querySelector('input[name="rating"][value="0"]');
    if (allRating) allRating.checked = true;
    const search = document.getElementById("shop-search");
    if (search) search.value = "";
    state.q = "";
    syncFiltersFromDom();
    renderProducts();
  }

  function cartCount() {
    return cart.reduce((n, i) => n + (i.qty || 0), 0);
  }

  function cartTotal() {
    return cart.reduce((n, i) => n + (i.qty || 0) * (i.price || 0), 0);
  }

  function updateCartBadge() {
    const el = document.getElementById("shop-cart-count");
    if (el) el.textContent = String(cartCount());
    const btn = document.getElementById("shop-checkout-open");
    if (btn) btn.disabled = cart.length === 0;
  }

  function renderCart() {
    const body = document.getElementById("shop-cart-body");
    const total = document.getElementById("shop-cart-total");
    if (total) total.textContent = money(cartTotal());
    updateCartBadge();
    if (!body) return;
    if (!cart.length) {
      body.innerHTML = '<p class="panel-empty">Your basket is empty. Add tyres from the shop.</p>';
      return;
    }
    body.innerHTML = cart
      .map((item) => {
        return (
          '<article class="shop-cart-item">' +
          "<div><strong>" +
          escapeHtml(item.brand + " " + item.model) +
          '</strong><p>' +
          escapeHtml(item.size) +
          " · " +
          money(item.price) +
          " each</p></div>" +
          '<div class="shop-cart-qty">' +
          '<button type="button" data-qty-dec="' +
          escapeHtml(item.id) +
          '" aria-label="Decrease">−</button>' +
          "<span>" +
          item.qty +
          "</span>" +
          '<button type="button" data-qty-inc="' +
          escapeHtml(item.id) +
          '" aria-label="Increase">+</button>' +
          '<button type="button" class="text-link" data-qty-remove="' +
          escapeHtml(item.id) +
          '">Remove</button>' +
          "</div></article>"
        );
      })
      .join("");
  }

  function addToCart(id) {
    const product = products.find((p) => p.id === id);
    if (!product || Number(product.stock) <= 0) return;
    const existing = cart.find((c) => c.id === id);
    const nextQty = (existing ? existing.qty : 0) + 1;
    if (nextQty > Number(product.stock)) return;
    if (existing) existing.qty = nextQty;
    else {
      cart.push({
        id: product.id,
        brand: product.brand,
        model: product.model,
        size: product.size,
        price: Number(product.price) || 0,
        qty: 1,
      });
    }
    writeCart(cart);
    renderCart();
    openCart(true);
  }

  function openCart(open) {
    const drawer = document.getElementById("shop-cart-drawer");
    const toggle = document.getElementById("shop-cart-toggle");
    if (!drawer) return;
    drawer.hidden = !open;
    document.body.classList.toggle("shop-cart-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  function openCheckout(open) {
    const modal = document.getElementById("shop-checkout-modal");
    if (!modal) return;
    modal.hidden = !open;
    if (open) {
      const session = window.SuttonAuth && window.SuttonAuth.getSession();
      const form = document.getElementById("shop-checkout-form");
      if (form && session) {
        if (form.name) form.name.value = session.name || "";
        if (form.email) form.email.value = session.email || "";
        if (form.phone) form.phone.value = session.phone || "";
      }
      const date = form && form.querySelector('[name="date"]');
      if (date && !date.value) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        date.value = d.toISOString().slice(0, 10);
        date.min = new Date().toISOString().slice(0, 10);
      }
      const sum = document.getElementById("shop-checkout-summary");
      if (sum) {
        sum.textContent =
          cart.length +
          " line" +
          (cart.length === 1 ? "" : "s") +
          " · " +
          cartCount() +
          " tyres · " +
          money(cartTotal());
      }
    }
  }

  function placeOrder(form) {
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const email = String(data.get("email") || "").trim().toLowerCase();
    const vehicle = String(data.get("vehicle") || "").trim().toUpperCase();
    const date = String(data.get("date") || "");
    const fitment = String(data.get("fitment") || "fitted");
    const notes = String(data.get("notes") || "").trim();
    const status = document.getElementById("shop-checkout-status");

    if (!name || !phone || !email || !vehicle || !date || !cart.length) {
      if (status) {
        status.textContent = "Please complete all required fields.";
        status.className = "form-status is-error";
      }
      return;
    }

    if (!window.SuttonAuth || !window.SuttonAuth.addOrder) {
      if (status) {
        status.textContent = "Order system unavailable. Please call the garage.";
        status.className = "form-status is-error";
      }
      return;
    }

    const service =
      "Tyre shop order — " +
      cart
        .map((i) => i.qty + "× " + i.brand + " " + i.model + " " + i.size)
        .join("; ");

    const order = window.SuttonAuth.addOrder(email, {
      name,
      phone,
      vehicle,
      date,
      service,
      price: money(cartTotal()),
      duration: fitment === "fitted" ? "Fitting slot" : "Collection",
      status: "pending",
      type: "shop",
      fitment,
      notes,
      items: cart.map((i) => ({ ...i })),
    });

    // reduce stock
    const all = readTyres();
    cart.forEach((item) => {
      const index = all.findIndex((t) => t.id === item.id);
      if (index === -1) return;
      all[index].stock = Math.max(0, (Number(all[index].stock) || 0) - item.qty);
      all[index].sold = (Number(all[index].sold) || 0) + item.qty;
      all[index].updatedAt = new Date().toISOString();
    });
    writeTyres(all);
    products.forEach((p) => {
      const fresh = all.find((t) => t.id === p.id);
      if (fresh) p.stock = fresh.stock;
    });

    cart = [];
    writeCart(cart);
    renderCart();
    renderProducts();
    openCheckout(false);
    openCart(false);

    if (status) {
      status.textContent = "";
      status.className = "form-status";
    }
    form.reset();
    alert(
      "Order " +
        order.id +
        " placed. We’ll confirm your " +
        (fitment === "fitted" ? "fitting" : "collection") +
        " soon."
    );
  }

  /* events */
  buildFilterOptions();
  renderProducts();
  renderCart();

  document.getElementById("shop-filters")?.addEventListener("change", () => {
    syncFiltersFromDom();
    renderProducts();
  });

  document.getElementById("shop-sort")?.addEventListener("change", () => {
    syncFiltersFromDom();
    renderProducts();
  });

  document.getElementById("shop-clear-filters")?.addEventListener("click", clearAllFilters);

  document.getElementById("shop-search-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    state.q = document.getElementById("shop-search")?.value || "";
    renderProducts();
  });

  document.getElementById("shop-search")?.addEventListener("input", (event) => {
    state.q = event.target.value || "";
    renderProducts();
  });

  document.querySelectorAll("[data-brand-quick]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const brand = btn.getAttribute("data-brand-quick");
      clearAllFilters();
      const input = document.querySelector(
        '#filter-brands input[value="' + brand + '"]'
      );
      if (input) {
        input.checked = true;
        syncFiltersFromDom();
        renderProducts();
      }
    });
  });

  document.getElementById("shop-active-filters")?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-clear-key]");
    if (!btn) return;
    const key = btn.getAttribute("data-clear-key");
    const value = btn.getAttribute("data-clear-value");
    if (key === "q") {
      state.q = "";
      const search = document.getElementById("shop-search");
      if (search) search.value = "";
    } else if (key === "instock") {
      const el = document.getElementById("filter-instock");
      if (el) el.checked = false;
    } else if (key === "rating") {
      const all = document.querySelector('input[name="rating"][value="0"]');
      if (all) all.checked = true;
    } else {
      const input = document.querySelector(
        'input[name="' +
          key +
          '"][value="' +
          String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"') +
          '"]'
      );
      if (input) input.checked = false;
    }
    syncFiltersFromDom();
    renderProducts();
  });

  document.getElementById("shop-grid")?.addEventListener("click", (event) => {
    const id = event.target.getAttribute("data-add");
    if (id) addToCart(id);
  });

  document.getElementById("shop-cart-toggle")?.addEventListener("click", () => {
    const drawer = document.getElementById("shop-cart-drawer");
    openCart(!!drawer?.hidden);
  });
  document.getElementById("shop-cart-toggle-mobile")?.addEventListener("click", () => {
    openCart(true);
  });
  document.querySelectorAll("[data-cart-close]").forEach((el) => {
    el.addEventListener("click", () => openCart(false));
  });

  document.getElementById("shop-cart-body")?.addEventListener("click", (event) => {
    const inc = event.target.getAttribute("data-qty-inc");
    const dec = event.target.getAttribute("data-qty-dec");
    const rem = event.target.getAttribute("data-qty-remove");
    if (inc) {
      const product = products.find((p) => p.id === inc);
      const item = cart.find((c) => c.id === inc);
      if (item && product && item.qty < Number(product.stock)) item.qty += 1;
      writeCart(cart);
      renderCart();
    }
    if (dec) {
      const item = cart.find((c) => c.id === dec);
      if (!item) return;
      item.qty -= 1;
      if (item.qty <= 0) cart = cart.filter((c) => c.id !== dec);
      writeCart(cart);
      renderCart();
    }
    if (rem) {
      cart = cart.filter((c) => c.id !== rem);
      writeCart(cart);
      renderCart();
    }
  });

  document.getElementById("shop-checkout-open")?.addEventListener("click", () => {
    if (!cart.length) return;
    openCheckout(true);
  });
  document.querySelectorAll("[data-checkout-close]").forEach((el) => {
    el.addEventListener("click", () => openCheckout(false));
  });
  document.getElementById("shop-checkout-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    placeOrder(event.target);
  });

  const filters = document.getElementById("shop-filters");
  document.getElementById("shop-filter-mobile")?.addEventListener("click", () => {
    filters?.classList.toggle("is-open");
  });
})();
