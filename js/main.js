/* ============================================================
   Main JavaScript — Rooting Hormone Website
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     Helpers
  ---------------------------------------------------------- */
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  /* ----------------------------------------------------------
     Sticky header with scroll detection
  ---------------------------------------------------------- */
  (function initStickyHeader() {
    var header = qs("#site-header");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 40) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  /* ----------------------------------------------------------
     Mobile navigation toggle
  ---------------------------------------------------------- */
  (function initMobileNav() {
    var toggle = qs("#nav-toggle");
    var menu = qs("#nav-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    // Close on nav link click (mobile)
    qsa(".nav__link", menu).forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close when clicking outside
    document.addEventListener("click", function (e) {
      if (!toggle.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  })();

  /* ----------------------------------------------------------
     Active nav link on scroll (IntersectionObserver)
  ---------------------------------------------------------- */
  (function initActiveNav() {
    var sections = qsa("main [id]");
    var navLinks = qsa(".nav__link");

    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.remove("active");
              var href = link.getAttribute("href");
              if (href === "#" + entry.target.id) {
                link.classList.add("active");
              }
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  })();

  /* ----------------------------------------------------------
     Accordion / FAQ
  ---------------------------------------------------------- */
  (function initAccordion() {
    var accordion = qs("#accordion");
    if (!accordion) return;

    var triggers = qsa(".accordion__trigger", accordion);

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        var panelId = trigger.getAttribute("aria-controls");
        var panel = qs("#" + panelId);
        var isOpen = trigger.getAttribute("aria-expanded") === "true";

        // Close all
        triggers.forEach(function (t) {
          var pid = t.getAttribute("aria-controls");
          var p = qs("#" + pid);
          t.setAttribute("aria-expanded", "false");
          if (p) p.classList.remove("open");
        });

        // Open clicked (if it was closed)
        if (!isOpen && panel) {
          trigger.setAttribute("aria-expanded", "true");
          panel.classList.add("open");
        }
      });

      // Keyboard: Enter / Space already handled by button default;
      // add arrow key navigation for accessibility
      trigger.addEventListener("keydown", function (e) {
        var idx = triggers.indexOf(trigger);
        if (e.key === "ArrowDown") {
          e.preventDefault();
          triggers[(idx + 1) % triggers.length].focus();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          triggers[(idx - 1 + triggers.length) % triggers.length].focus();
        } else if (e.key === "Home") {
          e.preventDefault();
          triggers[0].focus();
        } else if (e.key === "End") {
          e.preventDefault();
          triggers[triggers.length - 1].focus();
        }
      });
    });
  })();

  /* ----------------------------------------------------------
     Contact form validation & submission
  ---------------------------------------------------------- */
  (function initContactForm() {
    var form = qs("#contact-form");
    if (!form) return;

    var successMsg = qs("#form-success");

    function getField(id) {
      return qs("#" + id, form);
    }

    function getError(id) {
      return qs("#" + id + "-error", form);
    }

    function showError(field, errorEl, message) {
      field.classList.add("invalid");
      field.setAttribute("aria-invalid", "true");
      errorEl.textContent = message;
    }

    function clearError(field, errorEl) {
      field.classList.remove("invalid");
      field.setAttribute("aria-invalid", "false");
      errorEl.textContent = "";
    }

    function validateName(value) {
      if (!value.trim()) return "Please enter your name.";
      if (value.trim().length < 2) return "Name must be at least 2 characters.";
      return "";
    }

    function validateEmail(value) {
      if (!value.trim()) return "Please enter your email address.";
      var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!pattern.test(value.trim())) return "Please enter a valid email address.";
      return "";
    }

    function validateMessage(value) {
      if (!value.trim()) return "Please enter a message.";
      if (value.trim().length < 10) return "Message must be at least 10 characters.";
      return "";
    }

    function validate() {
      var nameField = getField("contact-name");
      var emailField = getField("contact-email");
      var messageField = getField("contact-message");
      var nameError = getError("name");
      var emailError = getError("email");
      var messageError = getError("message");

      var errors = {
        name: validateName(nameField.value),
        email: validateEmail(emailField.value),
        message: validateMessage(messageField.value),
      };

      if (errors.name) {
        showError(nameField, nameError, errors.name);
      } else {
        clearError(nameField, nameError);
      }

      if (errors.email) {
        showError(emailField, emailError, errors.email);
      } else {
        clearError(emailField, emailError);
      }

      if (errors.message) {
        showError(messageField, messageError, errors.message);
      } else {
        clearError(messageField, messageError);
      }

      return !errors.name && !errors.email && !errors.message;
    }

    // Live validation on blur
    ["contact-name", "contact-email", "contact-message"].forEach(function (id) {
      var field = getField(id);
      if (!field) return;
      field.addEventListener("blur", validate);
      field.addEventListener("input", function () {
        if (field.classList.contains("invalid")) validate();
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) return;

      // Simulate async submission
      var submitBtn = qs("[type='submit']", form);
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      setTimeout(function () {
        form.reset();
        ["contact-name", "contact-email", "contact-message"].forEach(function (id) {
          var field = getField(id);
          var errorEl = getError(id.replace("contact-", ""));
          if (field && errorEl) clearError(field, errorEl);
        });
        submitBtn.disabled = false;
        submitBtn.textContent = "Send Message";
        if (successMsg) successMsg.hidden = false;
        setTimeout(function () {
          if (successMsg) successMsg.hidden = true;
        }, 6000);
      }, 1000);
    });
  })();

  /* ----------------------------------------------------------
     Footer year
  ---------------------------------------------------------- */
  (function setFooterYear() {
    var el = qs("#footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  })();

  /* ----------------------------------------------------------
     Scroll-reveal (simple fade-in via IntersectionObserver)
  ---------------------------------------------------------- */
  (function initScrollReveal() {
    var targets = qsa(
      ".about__card, .science__item, .step, .tip-card, .accordion__item"
    );

    if (!targets.length || !window.IntersectionObserver) return;

    targets.forEach(function (el, i) {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      el.style.transition =
        "opacity 0.5s ease " + i * 0.05 + "s, transform 0.5s ease " + i * 0.05 + "s";
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    targets.forEach(function (el) {
      observer.observe(el);
    });
  })();
})();
