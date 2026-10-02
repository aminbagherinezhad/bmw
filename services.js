(() => {
  const STORAGE_SESSION = "sutton_seller_session";
  const STORAGE_SERVICES = "sutton_services";
  const STORAGE_SALES = "sutton_sales";

  const CATEGORY_LABELS = {
    fitting: "Tyre fitting",
    puncture: "Puncture repair",
    balance: "Balancing",
    alignment: "Wheel alignment",
    repair: "Tyre repair",
    other: "Other service",
  };

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SESSION) || "null");
    } catch {
      return null;
    }
  }

  function readServices() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_SERVICES) || "[]");
    } catch {
      return [];
    }
  }

  function writeServices(services) {
    localStorage.setItem(STORAGE_SERVICES, JSON.stringify(services));
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
      return iso || "-";
    }
  }

  function categoryLabel(key) {
    return CATEGORY_LABELS[key] || key || "Service";
  }

  function requireStaff() {
    const session = getSession();
    if (!session) {
      window.location.href = "seller-login.html";
      return null;
    }
    return session;
  }

  function seedServices() {
    if (readServices().length) return;
    const now = Date.now();
    const samples = [
      {
        name: "Tyre fitting / replacement",
        category: "fitting",
        description: "Remove old tyre, fit new tyre and torque wheels",
        price: 20,
        durationMins: 25,
        active: true,
      },
      {
        name: "Puncture repair",
        category: "puncture",
        description: "Inspect, plug/patch and reinflate where safe",
        price: 18,
        durationMins: 30,
        active: true,
      },
      {
        name: "Wheel balancing",
        category: "balance",
        description: "Dynamic balance per wheel with weights",
        price: 12,
        durationMins: 15,
        active: true,
      },
      {
        name: "Wheel alignment / tracking",
        category: "alignment",
        description: "Front tracking check and adjust to spec",
        price: 45,
        durationMins: 45,
        active: true,
      },
      {
        name: "Tyre repair (vulcanising)",
        category: "repair",
        description: "Aparat / vulcanising repair for suitable damage",
        price: 25,
        durationMins: 40,
        active: true,
      },
      {
        name: "Valve & TPMS service",
        category: "other",
        description: "Valve replacement or TPMS reset assistance",
        price: 15,
        durationMins: 20,
        active: true,
      },
    ].map((item, index) => ({
      ...item,
      id: "SV" + (now + index),
      jobsDone: 0,
      createdAt: new Date(now - index * 86400000).toISOString(),
      updatedAt: new Date(now - index * 3600000).toISOString(),
    }));
    writeServices(samples);
  }

  function getServicesSorted() {
    return readServices().sort((a, b) => {
      if (Boolean(b.active) !== Boolean(a.active)) return b.active ? 1 : -1;
      return String(a.name || "").localeCompare(String(b.name || ""));
    });
  }

  function upsertService(payload, id) {
    const all = readServices();
    const record = {
      name: String(payload.name || "").trim(),
      category: String(payload.category || "other"),
      description: String(payload.description || "").trim(),
      price: Math.max(0, Number(payload.price) || 0),
      durationMins: Math.max(0, Math.floor(Number(payload.durationMins) || 0)),
      active: payload.active !== false && payload.active !== "false",
      updatedAt: new Date().toISOString(),
    };

    if (!record.name) {
      return { ok: false, error: "Service name is required." };
    }

    if (id) {
      const index = all.findIndex((s) => s.id === id);
      if (index === -1) return { ok: false, error: "Service not found." };
      all[index] = {
        ...all[index],
        ...record,
        jobsDone: all[index].jobsDone || 0,
      };
      writeServices(all);
      return { ok: true, service: all[index] };
    }

    const service = {
      ...record,
      id: "SV" + Date.now(),
      jobsDone: 0,
      createdAt: new Date().toISOString(),
    };
    all.push(service);
    writeServices(all);
    return { ok: true, service };
  }

  function recordServiceJob({
    serviceId,
    quantity,
    unitPrice,
    vehicle,
    notes,
    employee,
  }) {
    const qty = Math.max(1, Math.floor(Number(quantity) || 0));
    const price = Math.max(0, Number(unitPrice) || 0);
    const all = readServices();
    const index = all.findIndex((s) => s.id === serviceId);
    if (index === -1) return { ok: false, error: "Service not found." };
    if (!all[index].active) {
      return { ok: false, error: "This service is inactive." };
    }

    const service = all[index];
    const soldAt = new Date().toISOString();
    all[index] = {
      ...service,
      jobsDone: (service.jobsDone || 0) + qty,
      updatedAt: soldAt,
    };
    writeServices(all);

    const sale = {
      id: "SL" + Date.now() + String(Math.floor(Math.random() * 90) + 10),
      productId: service.id,
      productName: service.name,
      category: "service",
      serviceCategory: service.category,
      quantity: qty,
      unitPrice: price,
      totalPrice: Math.round(price * qty * 100) / 100,
      soldAt,
      employeeEmail: String(employee.email || "").toLowerCase(),
      employeeName: employee.name || "Staff",
      vehicle: String(vehicle || "").trim().toUpperCase(),
      notes: String(notes || "").trim(),
    };
    const sales = readSales();
    sales.push(sale);
    writeSales(sales);
    return { ok: true, sale, service: all[index] };
  }

  function getServiceJobs() {
    return readSales()
      .filter((s) => s.category === "service")
      .sort((a, b) => new Date(b.soldAt) - new Date(a.soldAt));
  }

  function renderServiceCard(service) {
    const inactive = !service.active;
    return (
      '<article class="service-card' +
      (inactive ? " is-inactive" : "") +
      '" data-service-id="' +
      escapeHtml(service.id) +
      '">' +
      '<div class="service-card-top">' +
      "<div>" +
      '<p class="service-cat">' +
      escapeHtml(categoryLabel(service.category)) +
      "</p>" +
      "<h3>" +
      escapeHtml(service.name) +
      "</h3>" +
      (service.description
        ? '<p class="service-desc">' + escapeHtml(service.description) + "</p>"
        : "") +
      "</div>" +
      '<strong class="service-price">' +
      money(service.price) +
      "</strong>" +
      "</div>" +
      '<div class="service-meta">' +
      "<div><span>Duration</span><strong>" +
      (service.durationMins ? service.durationMins + " min" : "-") +
      "</strong></div>" +
      "<div><span>Jobs done</span><strong>" +
      (service.jobsDone || 0) +
      "</strong></div>" +
      "<div><span>Status</span><strong class=\"" +
      (inactive ? "warn-text" : "ok-text") +
      '">' +
      (inactive ? "Inactive" : "Active") +
      "</strong></div>" +
      "</div>" +
      '<div class="pmc-actions">' +
      (inactive
        ? ""
        : '<button type="button" class="btn btn-gold btn-sm" data-service-job="' +
          escapeHtml(service.id) +
          '">Record job</button>') +
      '<button type="button" class="btn btn-outline btn-sm" data-service-edit="' +
      escapeHtml(service.id) +
      '">Edit</button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-service-toggle="' +
      escapeHtml(service.id) +
      '">' +
      (inactive ? "Activate" : "Deactivate") +
      "</button>" +
      '<button type="button" class="btn btn-outline btn-sm danger" data-service-delete="' +
      escapeHtml(service.id) +
      '">Delete</button>' +
      "</div></article>"
    );
  }

  /* ---------- Page boot ---------- */
  const session = requireStaff();
  if (!session) return;

  seedServices();

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

  const listEl = document.getElementById("service-list");
  const emptyEl = document.getElementById("service-empty");
  const form = document.getElementById("service-form");
  const formStatus = document.getElementById("service-form-status");
  const formTitle = document.getElementById("service-form-title");
  const resetBtn = document.getElementById("service-form-reset");
  const jobsEl = document.getElementById("service-jobs");
  const kpiActive = document.getElementById("svc-kpi-active");
  const kpiJobs = document.getElementById("svc-kpi-jobs");
  const kpiRevenue = document.getElementById("svc-kpi-revenue");
  const kpiTypes = document.getElementById("svc-kpi-types");

  let currentFilter = "all";

  function updateKpis() {
    const services = getServicesSorted();
    const jobs = getServiceJobs();
    const revenue = jobs.reduce((sum, j) => sum + (j.totalPrice || 0), 0);
    if (kpiActive) {
      kpiActive.textContent = String(services.filter((s) => s.active).length);
    }
    if (kpiTypes) kpiTypes.textContent = String(services.length);
    if (kpiJobs) kpiJobs.textContent = String(jobs.length);
    if (kpiRevenue) kpiRevenue.textContent = money(revenue);
  }

  function renderList() {
    if (!listEl) return;
    let items = getServicesSorted();
    if (currentFilter === "active") {
      items = items.filter((s) => s.active);
    } else if (currentFilter === "inactive") {
      items = items.filter((s) => !s.active);
    } else if (currentFilter !== "all") {
      items = items.filter((s) => s.category === currentFilter);
    }

    updateKpis();

    if (!items.length) {
      listEl.innerHTML = "";
      if (emptyEl) emptyEl.hidden = false;
      return;
    }
    if (emptyEl) emptyEl.hidden = true;
    listEl.innerHTML = items.map(renderServiceCard).join("");
  }

  function renderJobs() {
    if (!jobsEl) return;
    const jobs = getServiceJobs().slice(0, 12);
    if (!jobs.length) {
      jobsEl.innerHTML =
        '<p class="panel-empty">No service jobs recorded yet.</p>';
      return;
    }
    jobsEl.innerHTML =
      '<table class="seller-table"><thead><tr><th>Service</th><th>Qty</th><th>Total</th><th>Vehicle</th><th>Staff</th><th>When</th></tr></thead><tbody>' +
      jobs
        .map(
          (j) =>
            "<tr><td><strong>" +
            escapeHtml(j.productName) +
            '</strong><span class="sale-cat">' +
            escapeHtml(categoryLabel(j.serviceCategory || "other")) +
            "</span></td><td>" +
            j.quantity +
            '</td><td class="gold-text">' +
            money(j.totalPrice) +
            "</td><td>" +
            escapeHtml(j.vehicle || "-") +
            "</td><td>" +
            escapeHtml(j.employeeName) +
            "</td><td>" +
            escapeHtml(formatDateTime(j.soldAt)) +
            "</td></tr>"
        )
        .join("") +
      "</tbody></table>";
  }

  function resetForm() {
    if (!form) return;
    form.reset();
    document.getElementById("service-id").value = "";
    form.active.checked = true;
    if (formTitle) formTitle.textContent = "Add service";
    if (resetBtn) resetBtn.hidden = true;
    if (formStatus) {
      formStatus.textContent = "";
      formStatus.className = "form-status";
    }
  }

  function fillForm(service) {
    document.getElementById("service-id").value = service.id;
    form.name.value = service.name || "";
    form.category.value = service.category || "other";
    form.description.value = service.description || "";
    form.price.value = service.price ?? "";
    form.durationMins.value = service.durationMins ?? "";
    form.active.checked = service.active !== false;
    if (formTitle) formTitle.textContent = "Edit service";
    if (resetBtn) resetBtn.hidden = false;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
  }

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
      const result = upsertService(
        {
          name: data.get("name"),
          category: data.get("category"),
          description: data.get("description"),
          price: data.get("price"),
          durationMins: data.get("durationMins"),
          active: data.get("active") === "on",
        },
        id || null
      );
      if (!result.ok) {
        formStatus.textContent = result.error;
        formStatus.className = "form-status is-error";
        return;
      }
      formStatus.textContent = id
        ? "Service updated."
        : "New service added to the catalogue.";
      formStatus.className = "form-status is-success";
      resetForm();
      renderList();
      renderJobs();
    });
  }

  if (resetBtn) resetBtn.addEventListener("click", resetForm);

  document.querySelectorAll("[data-service-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      currentFilter = chip.getAttribute("data-service-filter") || "all";
      document.querySelectorAll("[data-service-filter]").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
      });
      renderList();
    });
  });

  /* Job modal */
  const jobModal = document.getElementById("service-job-modal");
  const jobForm = document.getElementById("service-job-form");
  const jobStatus = document.getElementById("service-job-status");
  let jobServiceId = "";

  function openJobModal(service) {
    if (!jobModal || !jobForm) return;
    jobServiceId = service.id;
    document.getElementById("service-job-name").textContent = service.name;
    document.getElementById("service-job-meta").textContent =
      categoryLabel(service.category) +
      " · list price " +
      money(service.price) +
      (service.durationMins ? " · ~" + service.durationMins + " min" : "");
    jobForm.quantity.value = "1";
    jobForm.unitPrice.value = String(service.price);
    jobForm.vehicle.value = "";
    jobForm.notes.value = "";
    if (jobStatus) {
      jobStatus.textContent = "";
      jobStatus.className = "form-status";
    }
    jobModal.hidden = false;
    document.body.classList.add("modal-open");
    jobForm.quantity.focus();
  }

  function closeJobModal() {
    if (!jobModal) return;
    jobModal.hidden = true;
    document.body.classList.remove("modal-open");
    jobServiceId = "";
  }

  document.querySelectorAll("[data-service-job-close]").forEach((el) => {
    el.addEventListener("click", closeJobModal);
  });

  if (jobForm) {
    jobForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const result = recordServiceJob({
        serviceId: jobServiceId,
        quantity: jobForm.quantity.value,
        unitPrice: jobForm.unitPrice.value,
        vehicle: jobForm.vehicle.value,
        notes: jobForm.notes.value,
        employee: session,
      });
      if (!result.ok) {
        jobStatus.textContent = result.error;
        jobStatus.className = "form-status is-error";
        return;
      }
      jobStatus.textContent =
        "Job recorded under " + (session.name || "your account") + ".";
      jobStatus.className = "form-status is-success";
      setTimeout(() => {
        closeJobModal();
        renderList();
        renderJobs();
      }, 650);
    });
  }

  listEl?.addEventListener("click", (event) => {
    const jobId = event.target.getAttribute("data-service-job");
    const editId = event.target.getAttribute("data-service-edit");
    const toggleId = event.target.getAttribute("data-service-toggle");
    const deleteId = event.target.getAttribute("data-service-delete");
    const all = readServices();

    if (jobId) {
      const service = all.find((s) => s.id === jobId);
      if (service) openJobModal(service);
      return;
    }
    if (editId) {
      const service = all.find((s) => s.id === editId);
      if (service) fillForm(service);
      return;
    }
    if (toggleId) {
      const index = all.findIndex((s) => s.id === toggleId);
      if (index === -1) return;
      all[index].active = !all[index].active;
      all[index].updatedAt = new Date().toISOString();
      writeServices(all);
      renderList();
      return;
    }
    if (deleteId) {
      if (!confirm("Delete this service from the catalogue?")) return;
      writeServices(all.filter((s) => s.id !== deleteId));
      renderList();
      renderJobs();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeJobModal();
  });

  renderList();
  renderJobs();
})();
