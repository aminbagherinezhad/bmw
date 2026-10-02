(() => {
  const header = document.getElementById("header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const year = document.getElementById("year");
  const form = document.getElementById("booking-form");
  const formStatus = document.getElementById("form-status");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  const onScroll = () => {
    if (!header) return;
    if (document.body.classList.contains("page-book")) {
      header.classList.add("is-scrolled");
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!open));
      mobileNav.hidden = open;
      menuToggle.setAttribute("aria-label", open ? "Open menu" : "Close menu");
    });

    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open menu");
        mobileNav.hidden = true;
      });
    });
  }

  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  if (form && formStatus) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        formStatus.textContent = "Please fill in the required fields.";
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const service = data.get("service") || "your appointment";
      formStatus.textContent =
        "Thanks — we will confirm your " + service + " shortly. Or call 0121 378 0001.";
      form.reset();
    });
  }

  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");
  if (contactForm && contactStatus) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!contactForm.checkValidity()) {
        contactStatus.textContent = "Please fill in all required fields.";
        contactStatus.className = "form-status is-error";
        contactForm.reportValidity();
        return;
      }
      contactStatus.textContent =
        "Thanks — your message has been received. We will get back to you shortly, or call 0121 378 0001.";
      contactStatus.className = "form-status is-success";
      contactForm.reset();
    });
  }

  const serviceRequestForm = document.getElementById("service-request-form");
  const serviceRequestStatus = document.getElementById("service-request-status");

  function readServiceRequests() {
    try {
      return JSON.parse(localStorage.getItem("sutton_service_requests") || "[]");
    } catch {
      return [];
    }
  }

  function writeServiceRequests(list) {
    localStorage.setItem("sutton_service_requests", JSON.stringify(list));
  }

  function prefillServiceRequestForm() {
    if (!serviceRequestForm) return;
    const session =
      window.SuttonAuth && window.SuttonAuth.getSession
        ? window.SuttonAuth.getSession()
        : null;
    const nameEl = document.getElementById("req-name");
    const phoneEl = document.getElementById("req-phone");
    const emailEl = document.getElementById("req-email");
    if (session) {
      if (nameEl && session.name) nameEl.value = session.name;
      if (phoneEl && session.phone) phoneEl.value = session.phone;
      if (emailEl && session.email) emailEl.value = session.email;
    }
    const params = new URLSearchParams(window.location.search);
    const pick = params.get("service") || params.get("services");
    if (!pick) return;
    const values = pick.split(",").map((s) => s.trim()).filter(Boolean);
    serviceRequestForm.querySelectorAll('input[name="services"]').forEach((input) => {
      const val = input.value.toLowerCase();
      if (
        values.some(
          (v) =>
            val.includes(v.toLowerCase()) ||
            v.toLowerCase().includes(val.slice(0, 8))
        )
      ) {
        input.checked = true;
      }
    });
  }

  if (serviceRequestForm && serviceRequestStatus) {
    prefillServiceRequestForm();
    const dateInput = serviceRequestForm.querySelector('input[name="preferredDate"]');
    if (dateInput) {
      const min = new Date();
      min.setHours(0, 0, 0, 0);
      dateInput.min = min.toISOString().slice(0, 10);
    }

    serviceRequestForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const services = Array.from(
        serviceRequestForm.querySelectorAll('input[name="services"]:checked')
      ).map((el) => el.value);

      if (!services.length) {
        serviceRequestStatus.textContent =
          "Please select at least one service.";
        serviceRequestStatus.className = "form-status is-error";
        return;
      }

      if (!serviceRequestForm.checkValidity()) {
        serviceRequestStatus.textContent = "Please fill in all required fields.";
        serviceRequestStatus.className = "form-status is-error";
        serviceRequestForm.reportValidity();
        return;
      }

      const data = new FormData(serviceRequestForm);
      const session =
        window.SuttonAuth && window.SuttonAuth.getSession
          ? window.SuttonAuth.getSession()
          : null;
      const id =
        "RQ" +
        String(Date.now()).slice(-8) +
        String(Math.floor(Math.random() * 90) + 10);
      const entry = {
        id,
        services,
        name: String(data.get("name") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        email: String(data.get("email") || "").trim().toLowerCase(),
        vehicle: String(data.get("vehicle") || "").trim().toUpperCase(),
        preferredDate: String(data.get("preferredDate") || ""),
        preferredTime: String(data.get("preferredTime") || ""),
        notes: String(data.get("notes") || "").trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
        customerEmail: session ? session.email : null,
      };

      const all = readServiceRequests();
      all.push(entry);
      writeServiceRequests(all);

      serviceRequestStatus.textContent =
        "Request " +
        id +
        " received — we will contact you to confirm. Urgent? Call 0121 378 0001.";
      serviceRequestStatus.className = "form-status is-success";
      serviceRequestForm.reset();
      prefillServiceRequestForm();
    });
  }

  /* ---- Book online: filters + modal (event delegation) ---- */
  const modal = document.getElementById("book-modal");
  const modalForm = document.getElementById("modal-booking-form");
  const modalStatus = document.getElementById("modal-form-status");
  const modalService = document.getElementById("modal-service");
  const modalDuration = document.getElementById("modal-duration");
  const modalPrice = document.getElementById("modal-price");
  const modalTitle = document.getElementById("modal-title");
  const emptyState = document.getElementById("catalogue-empty");
  let lastFocus = null;

  function applyFilter(filter) {
    const chips = document.querySelectorAll(".filter-chip");
    const cards = document.querySelectorAll(".product-card");
    chips.forEach((c) => {
      c.classList.toggle("is-active", c.getAttribute("data-filter") === filter);
    });

    let visible = 0;
    cards.forEach((card) => {
      const cats = (card.getAttribute("data-category") || "").split(/\s+/);
      const show = filter === "all" || cats.indexOf(filter) !== -1;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    if (emptyState) {
      emptyState.hidden = visible > 0;
    }
  }

  function openModal(service, price, duration) {
    if (!modal) return;
    lastFocus = document.activeElement;
    if (modalService) modalService.textContent = service;
    if (modalDuration) modalDuration.textContent = duration;
    if (modalPrice) modalPrice.textContent = price;
    if (modalTitle) modalTitle.textContent = "Book: " + service;
    if (modalStatus) modalStatus.textContent = "";
    if (modalForm) modalForm.reset();
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const firstInput = modal.querySelector("input");
    if (firstInput) firstInput.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  document.addEventListener("click", (event) => {
    const chip = event.target.closest(".filter-chip");
    if (chip) {
      applyFilter(chip.getAttribute("data-filter") || "all");
      return;
    }

    const trigger = event.target.closest(".book-trigger");
    if (trigger) {
      openModal(
        trigger.getAttribute("data-service") || "Service",
        trigger.getAttribute("data-price") || "-",
        trigger.getAttribute("data-duration") || "-"
      );
      return;
    }

    if (event.target.closest("[data-close-modal]")) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeModal();
    }
  });

  if (modalForm && modalStatus) {
    modalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!modalForm.checkValidity()) {
        modalStatus.textContent = "Please fill in the required fields.";
        modalForm.reportValidity();
        return;
      }

      const data = new FormData(modalForm);
      const service = modalService ? modalService.textContent : "Service";
      const price = modalPrice ? modalPrice.textContent : "—";
      const duration = modalDuration ? modalDuration.textContent : "—";
      const session =
        window.SuttonAuth && window.SuttonAuth.getSession
          ? window.SuttonAuth.getSession()
          : null;

      if (session && window.SuttonAuth.addOrder) {
        const order = window.SuttonAuth.addOrder(session.email, {
          service,
          price,
          duration,
          date: String(data.get("date") || ""),
          vehicle: String(data.get("notes") || ""),
          phone: String(data.get("phone") || session.phone || ""),
          name: String(data.get("name") || session.name || ""),
          status: "pending",
        });
        modalStatus.textContent =
          "Booking #" +
          order.id +
          " saved — view it in My orders. Or call 0121 378 0001.";
        modalForm.reset();
        setTimeout(() => {
          window.location.href = "orders.html";
        }, 1200);
        return;
      }

      modalStatus.textContent =
        "Thanks — we will confirm your " +
        service +
        " shortly. Sign in to track orders, or call 0121 378 0001.";
      modalForm.reset();
    });
  }
})();
