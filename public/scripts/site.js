document.documentElement.classList.add("js");

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.2, rootMargin: "0px 0px -40px 0px" }
);

revealElements.forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
  revealObserver.observe(element);
});

const form = document.querySelector("#contact-form");
const statusEl = document.querySelector("#form-status");
const submitButton = form?.querySelector('button[type="submit"]');
const formLoadedAt = Date.now();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s.'-]{1,79}$/;
const PHONE_PATTERN = /^[0-9()+\-\s.]{7,24}$/;
const URL_PATTERN = /(https?:\/\/|www\.|[a-z0-9-]+\.(com|net|org|io|co|ai|info|biz|me|us|uk|ca|au)\b)/i;
const REPEATED_CHAR_PATTERN = /(.)\1{5,}/;
const MIN_SECONDS_TO_SUBMIT = 4;
const ATTRIBUTION_STORAGE_KEY = "kh_landing_attribution_v1";
const AI_REFERRER_PATTERNS = [
  "chatgpt",
  "openai",
  "perplexity",
  "claude",
  "anthropic",
  "gemini",
  "copilot",
  "bing.com/chat",
  "you.com",
  "phind",
  "mistral",
];

const setStatus = (message, type) => {
  statusEl.textContent = message;
  statusEl.className = `form-status ${type}`;
};

const normalizeWhitespace = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const getWordCount = (value) => normalizeWhitespace(value).split(" ").filter(Boolean).length;

const getDigitCount = (value) => (value.match(/\d/g) || []).length;

const looksLikeSpam = (value) => {
  const normalized = normalizeWhitespace(value);
  return Boolean(normalized) && (URL_PATTERN.test(normalized) || REPEATED_CHAR_PATTERN.test(normalized));
};

const parseHost = (url) => {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
};

const safeReadStoredAttribution = () => {
  try {
    const raw = localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

const safeStoreAttribution = (attribution) => {
  try {
    localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Ignore storage failures in private browsing or restricted contexts.
  }
};

const detectLandingAttribution = () => {
  const query = new URLSearchParams(window.location.search);
  const utmSource = normalizeWhitespace(query.get("utm_source") || "").toLowerCase();
  const utmMedium = normalizeWhitespace(query.get("utm_medium") || "").toLowerCase();
  const utmCampaign = normalizeWhitespace(query.get("utm_campaign") || "");
  const referrerHost = parseHost(document.referrer);

  const source = utmSource || referrerHost || "direct";
  const medium = utmMedium || (utmSource ? "utm" : referrerHost ? "referral" : "none");
  const campaign = utmCampaign || "";

  const aiAssisted = AI_REFERRER_PATTERNS.some(
    (pattern) => source.includes(pattern) || referrerHost.includes(pattern)
  );

  return {
    source,
    medium,
    campaign,
    referrer: referrerHost || "",
    aiAssisted: aiAssisted ? "true" : "false",
  };
};

const getLandingAttribution = () => {
  const current = detectLandingAttribution();
  const stored = safeReadStoredAttribution();

  if (current.source !== "direct") {
    safeStoreAttribution(current);
    return current;
  }

  return stored || current;
};

const setHiddenValue = (formEl, fieldName, fieldValue) => {
  const field = formEl.elements.namedItem(fieldName);
  if (field && typeof field === "object" && "value" in field) {
    field.value = fieldValue;
  }
};

const applyLandingAttributionToForm = (formEl, attribution) => {
  setHiddenValue(formEl, "landingSource", attribution.source);
  setHiddenValue(formEl, "landingMedium", attribution.medium);
  setHiddenValue(formEl, "landingCampaign", attribution.campaign);
  setHiddenValue(formEl, "landingReferrer", attribution.referrer);
  setHiddenValue(formEl, "aiAssisted", attribution.aiAssisted);
};

const trackAiReferralVisit = (attribution) => {
  if (attribution.aiAssisted !== "true" || typeof window.va !== "function") {
    return;
  }

  try {
    const flag = sessionStorage.getItem("kh_ai_referral_logged");
    if (flag === "1") return;
    window.va("event", {
      name: "ai_referral_visit",
      data: {
        source: attribution.source,
        medium: attribution.medium,
        campaign: attribution.campaign || "none",
      },
    });
    sessionStorage.setItem("kh_ai_referral_logged", "1");
  } catch {
    // Ignore storage failures.
  }
};

const failField = (field, message) => {
  field.setCustomValidity(message);
  field.reportValidity();
  setStatus(message, "error");
};

const landingAttribution = getLandingAttribution();

if (form) {
  applyLandingAttributionToForm(form, landingAttribution);
}

trackAiReferralVisit(landingAttribution);

if (form && statusEl && submitButton) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameField = form.elements.namedItem("name");
    const emailField = form.elements.namedItem("email");
    const phoneField = form.elements.namedItem("phone");
    const preferredContactField = form.elements.namedItem("preferredContact");
    const goalsField = form.elements.namedItem("goals");
    const prayerRequestsField = form.elements.namedItem("prayerRequests");
    const companyField = form.elements.namedItem("company");
    const consentField = form.elements.namedItem("consent");

    if (
      !nameField ||
      !emailField ||
      !phoneField ||
      !preferredContactField ||
      !goalsField ||
      !prayerRequestsField ||
      !companyField ||
      !consentField
    ) {
      setStatus("Form is missing expected fields. Please reload and try again.", "error");
      return;
    }

    [
      nameField,
      emailField,
      phoneField,
      preferredContactField,
      goalsField,
      prayerRequestsField,
      companyField,
      consentField,
    ].forEach((field) => {
      if (typeof field.setCustomValidity === "function") {
        field.setCustomValidity("");
      }
    });

    nameField.value = normalizeWhitespace(nameField.value);
    emailField.value = normalizeWhitespace(emailField.value).toLowerCase();
    phoneField.value = normalizeWhitespace(phoneField.value);
    goalsField.value = normalizeWhitespace(goalsField.value);
    prayerRequestsField.value = normalizeWhitespace(prayerRequestsField.value);

    if (companyField.value.trim()) {
      setStatus("Application received. We will follow up with you soon.", "success");
      form.reset();
      return;
    }

    if (Date.now() - formLoadedAt < MIN_SECONDS_TO_SUBMIT * 1000) {
      setStatus("Please review your answers before submitting.", "error");
      return;
    }

    if (!NAME_PATTERN.test(nameField.value) || looksLikeSpam(nameField.value)) {
      failField(nameField, "Please enter your real full name.");
      return;
    }

    if (!EMAIL_PATTERN.test(emailField.value)) {
      failField(emailField, "Please enter a valid email address.");
      return;
    }

    if (phoneField.value) {
      if (!PHONE_PATTERN.test(phoneField.value)) {
        failField(phoneField, "Phone can only include numbers, spaces, and + ( ) - .");
        return;
      }

      const digitCount = getDigitCount(phoneField.value);
      if (digitCount < 10 || digitCount > 15) {
        failField(phoneField, "Please enter a valid phone number.");
        return;
      }
    }

    if (looksLikeSpam(goalsField.value) || getWordCount(goalsField.value) < 6) {
      failField(
        goalsField,
        "Please share a little more detail (at least 6 words, without links)."
      );
      return;
    }

    if (prayerRequestsField.value && looksLikeSpam(prayerRequestsField.value)) {
      failField(prayerRequestsField, "Please remove links or repeated characters.");
      return;
    }

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus("Please complete the required fields before submitting.", "error");
      return;
    }

    applyLandingAttributionToForm(form, landingAttribution);

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.consent = formData.get("consent") === "on";
    const endpoint = form.getAttribute("action") || "";

    if (!endpoint || endpoint.includes("YOUR_FORM_ID")) {
      setStatus("Form is not configured yet. Add your Formspree form ID.", "error");
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    setStatus("Sending your application...", "");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "Unable to send right now.");
      }

      form.reset();
      setStatus("Application received. We will follow up with you soon.", "success");
    } catch (error) {
      setStatus(
        "We could not send your form right now. Please try again in a few minutes.",
        "error"
      );
      console.error("Form submission failed:", error);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Submit Application";
    }
  });
}
