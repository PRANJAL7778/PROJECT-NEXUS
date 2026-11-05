/* NEXUS — lightweight interactions (no dependencies) */
(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");

  var header = document.querySelector("[data-header]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.querySelector("[data-nav-menu]");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-links a"));

  /* ---------- Header state on scroll (rAF-throttled, passive) ---------- */
  var ticking = false;
  function updateHeader() {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateHeader);
    }
  }, { passive: true });
  updateHeader();

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
    menu.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    document.body.classList.toggle("nav-open", open);
  }

  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });

  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", function (e) {
    if (menu.classList.contains("is-open") && !header.contains(e.target)) setMenu(false);
  });

  window.matchMedia("(min-width: 821px)").addEventListener("change", function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ---------- Reveal on scroll + active nav link ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    // Stagger siblings for an orchestrated entrance
    Array.prototype.forEach.call(document.querySelectorAll(".hero__copy, .card-grid"), function (group) {
      Array.prototype.forEach.call(group.querySelectorAll(".reveal"), function (el, i) {
        el.style.setProperty("--d", (i * 0.09).toFixed(2) + "s");
      });
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    Array.prototype.forEach.call(reveals, function (el) { revealObserver.observe(el); });

    var sections = ["home", "platform"].map(function (id) { return document.getElementById(id); });
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { if (s) sectionObserver.observe(s); });
  } else {
    Array.prototype.forEach.call(reveals, function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Card tilt + light (precise pointers only, skipped on touch) ---------- */
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (finePointer && !reducedMotion) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-tilt]"), function (card) {
      var frame = 0;
      card.addEventListener("pointermove", function (e) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          var r = card.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width;
          var y = (e.clientY - r.top) / r.height;
          card.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
          card.style.setProperty("--my", (y * 100).toFixed(1) + "%");
          card.style.setProperty("--ry", ((x - 0.5) * 7).toFixed(2) + "deg");
          card.style.setProperty("--rx", ((0.5 - y) * 7).toFixed(2) + "deg");
        });
      });
      card.addEventListener("pointerleave", function () {
        cancelAnimationFrame(frame);
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
      });
    });
  }

  /* ---------- Misc ---------- */
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  // Pause decorative animations when the tab is hidden (saves battery)
  document.addEventListener("visibilitychange", function () {
    doc.style.setProperty("--play", document.hidden ? "paused" : "running");
  });

  requestAnimationFrame(function () { doc.classList.add("is-loaded"); });
})();
