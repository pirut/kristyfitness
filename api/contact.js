const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value) => String(value ?? "").trim();

const escapeHtml = (value) =>
  clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const parseBody = (input) => {
  if (!input) return {};
  if (typeof input === "object") return input;

  try {
    return JSON.parse(input);
  } catch {
    return {};
  }
};

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const data = parseBody(req.body);

  // Honeypot: bots usually fill hidden fields.
  if (clean(data.company)) {
    res.status(200).json({ ok: true });
    return;
  }

  const name = clean(data.name);
  const email = clean(data.email);
  const phone = clean(data.phone);
  const preferredContact = clean(data.preferredContact);
  const goals = clean(data.goals);
  const prayerRequests = clean(data.prayerRequests);
  const consent = Boolean(data.consent);

  if (!name || !email || !preferredContact || !goals || !consent) {
    res.status(400).json({ error: "Missing required fields." });
    return;
  }

  if (!EMAIL_PATTERN.test(email)) {
    res.status(400).json({ error: "Please enter a valid email address." });
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  if (!resendApiKey || !fromEmail || !toEmail) {
    res.status(500).json({ error: "Email service is not configured." });
    return;
  }

  const subject = `New Kingdom Health Application: ${name}`;
  const textBody = [
    "New Kingdom Health application received.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Preferred Contact: ${preferredContact}`,
    "",
    "What are you hoping God restores in this season?",
    goals,
    "",
    "Prayer requests or notes:",
    prayerRequests || "None",
  ].join("\n");

  const htmlBody = `
    <h2>New Kingdom Health application received</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
    <p><strong>Preferred Contact:</strong> ${escapeHtml(preferredContact)}</p>
    <hr />
    <p><strong>What are you hoping God restores in this season?</strong></p>
    <p>${escapeHtml(goals).replaceAll("\n", "<br />")}</p>
    <p><strong>Prayer requests or notes:</strong></p>
    <p>${escapeHtml(prayerRequests || "None").replaceAll("\n", "<br />")}</p>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        reply_to: email,
        subject,
        text: textBody,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.text();
      res.status(502).json({
        error: "Email provider rejected request.",
        details: errorPayload.slice(0, 300),
      });
      return;
    }

    res.status(200).json({ ok: true });
  } catch {
    res.status(502).json({ error: "Could not reach email provider." });
  }
};
