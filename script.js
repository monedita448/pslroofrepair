(function () {
    "use strict";

    var form = document.getElementById("quote-form");
    var success = document.getElementById("formSuccess");
    var submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            // Honeypot check: if this field has a value, it's a bot — silently bail.
            var honeypot = document.getElementById("website");
            if (honeypot && honeypot.value) {
                return;
            }

            // Disable submit button immediately to prevent double-submits / rapid-fire bots.
            if (submitBtn) {
                submitBtn.disabled = true;
            }

            // CallRail's script loads asynchronously and may not always be ready by the
            // time this fires. This guards against calling captureForm before it's
            // defined. If form submissions aren't appearing in CallRail's dashboard,
            // first verify Form Tracking is enabled on the CallRail account itself
            // (separate from Dynamic Number Insertion).
            if (typeof CallTrk !== "undefined" && typeof CallTrk.captureForm === "function") {
                CallTrk.captureForm("#quote-form");
            }

            // NOTE: The success message is static text — no user input is ever injected
            // into the DOM here. If this is later extended to echo back field values,
            // escape them first (e.g. textContent instead of innerHTML, or a dedicated
            // escaping function) to prevent XSS.

            // For production, also add CallRail's recommended reCAPTCHA (see: "Adding
            // reCAPTCHA to an HTML-Only Form" in CallRail's help docs) once the CallRail
            // snippet is installed, to prevent spam submissions from counting against
            // form-tracking billing.

            form.hidden = true;
            success.hidden = false;
        });
    }

    // Mobile nav toggle
    var navToggle = document.querySelector(".nav-toggle");
    var navDropdown = document.getElementById("servicesNav");
    if (navToggle && navDropdown) {
        navToggle.addEventListener("click", function () {
            var isOpen = navDropdown.classList.toggle("open");
            navToggle.setAttribute("aria-expanded", isOpen);
        });
        document.addEventListener("click", function (e) {
            if (!navDropdown.contains(e.target)) {
                navDropdown.classList.remove("open");
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    // FAQ accordion: close other items when one opens
    var faqItems = document.querySelectorAll(".faq-item");
    for (var i = 0; i < faqItems.length; i++) {
        faqItems[i].addEventListener("toggle", function () {
            if (this.open) {
                for (var j = 0; j < faqItems.length; j++) {
                    if (faqItems[j] !== this) {
                        faqItems[j].removeAttribute("open");
                    }
                }
            }
        });
    }
})();
