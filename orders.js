(() => {
  const STATUS_META = {
    pending: {
      label: "Pending",
      hint: "We have received your request and will confirm soon.",
    },
    confirmed: {
      label: "Confirmed",
      hint: "Your slot is booked. Please arrive on time.",
    },
    "in-progress": {
      label: "In progress",
      hint: "Our technicians are working on your vehicle.",
    },
    ready: {
      label: "Ready",
      hint: "Your vehicle is ready for collection.",
    },
    completed: {
      label: "Completed",
      hint: "Job finished — thank you for choosing us.",
    },
    cancelled: {
      label: "Cancelled",
      hint: "This booking was cancelled.",
    },
  };

  const STEPS = ["pending", "confirmed", "in-progress", "ready", "completed"];

  function requireAuth() {
    if (!window.SuttonAuth) return null;
    const session = window.SuttonAuth.getSession();
    if (!session) {
      window.location.href = "login.html?next=orders.html";
      return null;
    }
    return session;
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatDateTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function stepIndex(status) {
    if (status === "cancelled") return -1;
    const i = STEPS.indexOf(status);
    return i === -1 ? 0 : i;
  }

  function renderTimeline(status) {
    if (status === "cancelled") {
      return '<div class="order-timeline is-cancelled"><span>Cancelled</span></div>';
    }
    const current = stepIndex(status);
    return (
      '<ol class="order-timeline" aria-label="Progress">' +
      STEPS.map((step, index) => {
        let state = "";
        if (index < current) state = "is-done";
        else if (index === current) state = "is-current";
        return (
          '<li class="' +
          state +
          '"><span class="tl-dot"></span><span class="tl-label">' +
          STATUS_META[step].label +
          "</span></li>"
        );
      }).join("") +
      "</ol>"
    );
  }

  function renderOrder(order) {
    const meta = STATUS_META[order.status] || STATUS_META.pending;
    return (
      '<article class="order-card" data-status="' +
      order.status +
      '">' +
      '<div class="order-card-top">' +
      "<div>" +
      '<p class="order-id">#' +
      order.id +
      "</p>" +
      "<h2>" +
      escapeHtml(order.service) +
      "</h2>" +
      '<p class="order-hint">' +
      meta.hint +
      "</p>" +
      "</div>" +
      '<span class="status-badge status-' +
      order.status +
      '">' +
      meta.label +
      "</span>" +
      "</div>" +
      '<div class="order-facts">' +
      "<div><span>Preferred date</span><strong>" +
      formatDate(order.date) +
      "</strong></div>" +
      "<div><span>Duration</span><strong>" +
      escapeHtml(order.duration || "—") +
      "</strong></div>" +
      "<div><span>Price</span><strong class=\"gold-text\">" +
      escapeHtml(order.price || "—") +
      "</strong></div>" +
      "<div><span>Placed</span><strong>" +
      formatDateTime(order.createdAt) +
      "</strong></div>" +
      "</div>" +
      (order.vehicle
        ? '<p class="order-vehicle"><span>Vehicle / notes</span>' +
          escapeHtml(order.vehicle) +
          "</p>"
        : "") +
      renderTimeline(order.status) +
      "</article>"
    );
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateStats(orders) {
    const pending = orders.filter((o) => o.status === "pending").length;
    const active = orders.filter(
      (o) => o.status === "confirmed" || o.status === "in-progress"
    ).length;
    const ready = orders.filter((o) => o.status === "ready").length;
    const done = orders.filter((o) => o.status === "completed").length;

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };
    set("stat-pending", pending);
    set("stat-active", active);
    set("stat-ready", ready);
    set("stat-done", done);
  }

  function renderList(orders, filter) {
    const list = document.getElementById("orders-list");
    const empty = document.getElementById("orders-empty");
    if (!list) return;

    const filtered =
      filter === "all" ? orders : orders.filter((o) => o.status === filter);

    if (!filtered.length) {
      list.innerHTML = "";
      if (empty) {
        empty.hidden = false;
        empty.innerHTML = orders.length
          ? 'No orders in this filter. <a href="book-online.html">Book a service</a>'
          : 'You have no bookings yet. <a href="book-online.html">Book your first service</a>';
      }
      return;
    }

    if (empty) empty.hidden = true;
    list.innerHTML = filtered.map(renderOrder).join("");
  }

  function seedDemoOrders(email) {
    if (!window.SuttonAuth || window.SuttonAuth.getOrders(email).length) return;

    const today = new Date();
    const addDays = (n) => {
      const d = new Date(today);
      d.setDate(d.getDate() + n);
      return d.toISOString().slice(0, 10);
    };

    const samples = [
      {
        service: "Car MOT test",
        price: "£40",
        duration: "1 hr",
        date: addDays(2),
        vehicle: "AB12 CDE — Ford Focus",
        status: "pending",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      },
      {
        service: "MOT & full service (up to 2.0L)",
        price: "£280",
        duration: "3 hr",
        date: addDays(0),
        vehicle: "XY69 ZZZ — VW Golf",
        status: "in-progress",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        service: "4-wheel tracking alignment",
        price: "£85",
        duration: "30 min",
        date: addDays(-3),
        vehicle: "AB12 CDE",
        status: "ready",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
      {
        service: "Air conditioning re-gas R134A",
        price: "£45",
        duration: "30 min",
        date: addDays(-20),
        vehicle: "AB12 CDE",
        status: "completed",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25).toISOString(),
      },
    ];

    samples.forEach((sample) => window.SuttonAuth.addOrder(email, sample));
  }

  const session = requireAuth();
  if (!session) return;

  const greeting = document.getElementById("orders-greeting");
  if (greeting) {
    greeting.textContent = (session.name || "there").split(" ")[0];
  }

  seedDemoOrders(session.email);

  let currentFilter = "all";
  let orders = window.SuttonAuth.getOrders(session.email);

  updateStats(orders);
  renderList(orders, currentFilter);

  document.querySelectorAll("[data-order-filter]").forEach((chip) => {
    chip.addEventListener("click", () => {
      currentFilter = chip.getAttribute("data-order-filter") || "all";
      document.querySelectorAll("[data-order-filter]").forEach((c) => {
        c.classList.toggle("is-active", c === chip);
      });
      renderList(orders, currentFilter);
    });
  });
})();
