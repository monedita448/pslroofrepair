(function () {
    "use strict";

    var cfg = window.PSL_CONFIG || {};

    /* ── Phone number injection from config ───────────────────── */
    if (cfg.phoneDisplay) {
        var displays = document.querySelectorAll("[data-phone-display]");
        for (var d = 0; d < displays.length; d++) {
            displays[d].textContent = cfg.phoneDisplay;
        }
    }
    if (cfg.phoneTel) {
        var telLinks = document.querySelectorAll("[data-phone-tel]");
        for (var t = 0; t < telLinks.length; t++) {
            telLinks[t].href = "tel:" + cfg.phoneTel;
        }
    }

    /* ── Webhook POST helper ──────────────────────────────────── */
    function postToWebhook(data) {
        var url = cfg.leadWebhookUrl;
        if (!url) return;
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "text/plain" }
        }).catch(function () {});
    }

    /* ── Callback micro-form (hero on index) ───────────────────── */
    var cbForm = document.querySelector("[data-callback-form]");
    if (cbForm) {
        cbForm.addEventListener("submit", function (e) {
            e.preventDefault();

            /* Honeypot: #website — identical across both forms */
            var honeypot = cbForm.querySelector("[name='website']");
            if (honeypot && honeypot.value) return;

            /* Time-trap: reject if completed in under 2.5s */
            var startField = cbForm.querySelector("[name='form_start']");
            if (startField && startField.value) {
                var elapsed = Date.now() - parseInt(startField.value, 10);
                if (elapsed < 2500) return;
            }

            var phoneInput = cbForm.querySelector("[name='callback_phone']");
            if (!phoneInput || !phoneInput.value.trim()) {
                cbForm.classList.add("has-error");
                phoneInput.focus();
                return;
            }
            cbForm.classList.remove("has-error");

            var submitBtn = cbForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            if (typeof CallTrk !== "undefined" && typeof CallTrk.captureForm === "function") {
                CallTrk.captureForm(cbForm);
            }

            postToWebhook({
                callback_name: (cbForm.querySelector("[name='callback_name']") || {}).value || "",
                callback_phone: phoneInput.value,
                utm_source: (cbForm.querySelector("[name='utm_source']") || {}).value || "",
                utm_medium: (cbForm.querySelector("[name='utm_medium']") || {}).value || "",
                utm_campaign: (cbForm.querySelector("[name='utm_campaign']") || {}).value || "",
                form_start: startField ? startField.value : "",
                page: window.location.href
            });

            cbForm.innerHTML = '<p style="text-align:center;font-weight:700;color:var(--success);padding:12px 0;">Thanks! We\'ll call you shortly.</p>';
        });
    }

    /* ── Get-a-quote form (get-a-quote.html) ──────────────────── */
    var quoteForm = document.getElementById("quote-form");
    var formSuccess = document.getElementById("formSuccess");
    if (quoteForm) {
        quoteForm.addEventListener("submit", function (e) {
            e.preventDefault();

            /* Honeypot: #website — identical across both forms */
            var honeypot = document.getElementById("website");
            if (honeypot && honeypot.value) return;

            /* Time-trap: reject if completed in under 2.5s */
            var startField = document.querySelector("#quote-form [name='form_start']");
            if (startField && startField.value) {
                var elapsed = Date.now() - parseInt(startField.value, 10);
                if (elapsed < 2500) return;
            }

            var submitBtn = quoteForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;

            if (typeof CallTrk !== "undefined" && typeof CallTrk.captureForm === "function") {
                CallTrk.captureForm("#quote-form");
            }

            postToWebhook({
                name: (quoteForm.querySelector("[name='name']") || {}).value || "",
                phone: (quoteForm.querySelector("[name='phone']") || {}).value || "",
                email: (quoteForm.querySelector("[name='email']") || {}).value || "",
                service: (quoteForm.querySelector("[name='service']") || {}).value || "",
                message: (quoteForm.querySelector("[name='message']") || {}).value || "",
                utm_source: (quoteForm.querySelector("[name='utm_source']") || {}).value || "",
                utm_medium: (quoteForm.querySelector("[name='utm_medium']") || {}).value || "",
                utm_campaign: (quoteForm.querySelector("[name='utm_campaign']") || {}).value || "",
                form_start: startField ? startField.value : "",
                page: window.location.href
            });

            quoteForm.hidden = true;
            formSuccess.hidden = false;
        });
    }

    /* ── UTM capture ───────────────────────────────────────────── */
    var params = new URLSearchParams(window.location.search);
    var utmFields = document.querySelectorAll("[data-utm-field]");
    for (var i = 0; i < utmFields.length; i++) {
        var key = utmFields[i].getAttribute("data-utm-field");
        var val = params.get(key);
        if (val) utmFields[i].value = val;
    }

    /* ── Form start timestamp (anti-spam time-trap) ────────────── */
    var formStartFields = document.querySelectorAll("[data-form-start]");
    var now = String(Date.now());
    for (var j = 0; j < formStartFields.length; j++) {
        formStartFields[j].value = now;
    }

    /* ── Mobile nav toggle ─────────────────────────────────────── */
    var navToggle = document.querySelector(".nav-toggle");
    var header = document.querySelector(".site-header");
    if (navToggle && header) {
        navToggle.addEventListener("click", function () {
            var isOpen = header.classList.toggle("nav-open");
            navToggle.setAttribute("aria-expanded", isOpen);
        });
        document.addEventListener("click", function (e) {
            if (!header.contains(e.target)) {
                header.classList.remove("nav-open");
                navToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* ── FAQ accordion ─────────────────────────────────────────── */
    var faqItems = document.querySelectorAll(".faq-item");
    for (var k = 0; k < faqItems.length; k++) {
        var btn = faqItems[k].querySelector(".faq-q");
        if (btn) {
            btn.addEventListener("click", (function (item) {
                return function () {
                    var isOpen = item.classList.contains("open");
                    for (var m = 0; m < faqItems.length; m++) {
                        faqItems[m].classList.remove("open");
                        var b = faqItems[m].querySelector(".faq-q");
                        if (b) b.setAttribute("aria-expanded", "false");
                    }
                    if (!isOpen) {
                        item.classList.add("open");
                        btn.setAttribute("aria-expanded", "true");
                    }
                };
            })(faqItems[k]));
        }
    }

    /* ── Sticky CTA bar ────────────────────────────────────────── */
    var stickyBar = document.querySelector(".sticky-cta-bar");
    if (stickyBar) {
        document.body.classList.add("has-sticky-cta");
    }
})();
