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

const setStatus = (message, type) => {
  statusEl.textContent = message;
  statusEl.className = `form-status ${type}`;
};

if (form && statusEl && submitButton) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      setStatus("Please complete the required fields before submitting.", "error");
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.consent = formData.get("consent") === "on";

    submitButton.disabled = true;
    submitButton.textContent = "Submitting...";
    setStatus("Sending your application...", "");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
