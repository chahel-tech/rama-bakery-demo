(function () {
  const { useEffect, useMemo, useRef, useState } = React;
  const h = React.createElement;

  const defaultContent = {
    siteName: "Rama's Bakery",
    tagline: "Fresh Homemade Cakes in Sector 102 Gurgaon",
    heroTitle: "Fresh. Homemade. Made with Love.",
    heroSubtitle: "Custom cakes, pure ghee cookies and celebration treats for every occasion.",
    phone: "7016765102",
    whatsapp: "917016765102",
    instagram: "https://www.instagram.com/ramaskitchenbakery/",
    locationText: "Sector 102, Gurgaon",
    mapQuery: "sector 102 gurgaon",
    aboutTitle: "About Rama's Bakery",
    aboutText: "Rama’s Bakery brings you freshly baked homemade cakes and cookies made with love and quality ingredients. We specialise in customised birthday cakes, celebration cakes and delicious baked treats for every occasion in Sector 102 Gurgaon.",
    specialityTitle: "Our Speciality",
    specialities: [
      "Fresh Homemade Cakes",
      "Pure Ghee Cookies",
      "Healthy Cakes (No Maida No Sugar)",
      "Customised Birthday Cakes",
      "Taste the Love of Maa in Every Bite"
    ],
    logoImage: "assets/images/logo.png",
    heroImage: "assets/images/bg.jpeg",
    menuImage: "assets/images/menu.jpeg",
    contactImage: "assets/images/contact.png",
    cakeImages: [
      "assets/images/cake1.jpeg",
      "assets/images/cake2.jpeg",
      "assets/images/cake3.jpeg",
      "assets/images/cake4.jpeg",
      "assets/images/cake5.jpeg",
      "assets/images/cake6.jpeg",
      "assets/images/cake7.jpeg",
      "assets/images/cake8.jpeg",
      "assets/images/cake9.jpeg",
      "assets/images/cake10.jpeg"
    ],
    freshBakeImages: ["assets/images/c1.jpeg", "assets/images/c2.jpeg", "assets/images/c3.jpeg"]
  };

  const api = {
    content: "api/content.php",
    login: "api/login.php",
    logout: "api/logout.php",
    session: "api/session.php",
    upload: "api/upload.php"
  };

  const DEFAULT_AUTO_LOGOUT_SECONDS = 15 * 60;
  const AUTO_LOGOUT_WARNING_SECONDS = 60;

  function formatSeconds(seconds) {
    const safe = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safe / 60);
    const secs = safe % 60;
    if (minutes <= 0) return `${secs}s`;
    return `${minutes}m ${String(secs).padStart(2, "0")}s`;
  }

  function apiErrorMessage(defaultMessage) {
    if (window.location.protocol === "file:") {
      return "Admin needs PHP hosting. Do not open index.html directly from Downloads. Upload it to GoDaddy/cPanel or run it on a local PHP server.";
    }
    return defaultMessage || "Admin API is not reachable. Check that the api folder is uploaded and PHP is enabled on hosting.";
  }

  async function readJsonResponse(res, fallbackMessage) {
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (error) {
      throw new Error(apiErrorMessage(fallbackMessage || "Server returned non-JSON response. Check PHP and hosting setup."));
    }
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || fallbackMessage || "Request failed.");
    }
    return data;
  }

  function normalizeContent(data) {
    return {
      ...defaultContent,
      ...(data || {}),
      specialities: Array.isArray(data && data.specialities) ? data.specialities : defaultContent.specialities,
      cakeImages: Array.isArray(data && data.cakeImages) ? data.cakeImages : defaultContent.cakeImages,
      freshBakeImages: Array.isArray(data && data.freshBakeImages) ? data.freshBakeImages : defaultContent.freshBakeImages
    };
  }

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function listToText(value) {
    return Array.isArray(value) ? value.join("\n") : "";
  }

  function textToList(value) {
    return String(value || "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }


  async function uploadFileToServer(file) {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Only JPG, JPEG and PNG images are allowed.");
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("Image must be smaller than 10 MB.");
    }

    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(api.upload, { method: "POST", body: formData });
    const data = await readJsonResponse(res, "Upload failed. Check /assets/uploads folder permission.");
    if (!data.path) {
      throw new Error("Upload completed but image path was missing.");
    }
    return data.path;
  }

  function StatusMessage({ type, children }) {
    if (!children) return null;
    return h("div", { className: `status ${type || ""}`.trim() }, children);
  }

  function Modal({ image, alt, onClose }) {
    useEffect(() => {
      document.body.classList.add("modal-open");
      const onKey = (event) => event.key === "Escape" && onClose();
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.classList.remove("modal-open");
        window.removeEventListener("keydown", onKey);
      };
    }, [onClose]);

    return h(
      "div",
      { className: "modal-backdrop", onClick: onClose },
      h(
        "div",
        { className: "modal-card", onClick: (event) => event.stopPropagation() },
        h("button", { className: "modal-close", type: "button", onClick: onClose, "aria-label": "Close" }, "×"),
        h("img", { src: image, alt: alt || "Preview" })
      )
    );
  }

  function Header({ content, onMenu }) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);
    const navItems = [
      ["Home", "#home"],
      ["Cakes", "#cakes"],
      ["Fresh Bakes", "#fresh-bakes"],
      ["Contact", "#contact"]
    ];

    return h(
      "div",
      { className: "topbar" },
      h(
        "div",
        { className: "container navbar" },
        h(
          "a",
          { className: "brand", href: "#home", onClick: close },
          h("img", { src: content.logoImage, alt: content.siteName }),
          h("span", null, content.siteName, h("small", null, content.tagline))
        ),
        h("button", { className: "mobile-menu", type: "button", onClick: () => setOpen(!open), "aria-label": "Open menu" }, open ? "×" : "☰"),
        h(
          "ul",
          { className: `navlinks ${open ? "open" : ""}` },
          navItems.map(([label, href]) =>
            h("li", { key: label }, h("a", { href, onClick: close }, label))
          ),
          h("li", null, h("button", { type: "button", onClick: () => { close(); onMenu(); } }, "Menu")),
          h("li", null, h("a", { href: "#admin", onClick: close }, "Admin"))
        )
      )
    );
  }

  function Hero({ content }) {
    const wa = `https://wa.me/${digits(content.whatsapp || content.phone)}?text=${encodeURIComponent("Hi Rama's Bakery, I want to order a cake.")}`;
    return h(
      "section",
      { id: "home", className: "hero" },
      h("img", { className: "hero-bg", src: content.heroImage, alt: "Bakery background" }),
      h(
        "div",
        { className: "container hero-content" },
        h(
          "div",
          { className: "hero-copy" },
          h("div", { className: "hero-kicker" }, "🍰 Homemade Bakery"),
          h("h1", null, content.heroTitle),
          h("p", null, content.heroSubtitle),
          h(
            "div",
            { className: "hero-actions" },
            h("a", { className: "btn", href: wa, target: "_blank", rel: "noreferrer" }, "Order on WhatsApp"),
            h("a", { className: "btn light", href: "#cakes" }, "See Cakes")
          ),
          h(
            "div",
            { className: "stats-row" },
            h("div", { className: "stat-card" }, h("strong", null, "Custom"), h("span", null, "Birthday cakes")),
            h("div", { className: "stat-card" }, h("strong", null, "Fresh"), h("span", null, "Homemade bakes")),
            h("div", { className: "stat-card" }, h("strong", null, "Sector 102"), h("span", null, "Gurgaon"))
          )
        ),
        h("div", { className: "hero-logo-card" }, h("img", { src: content.logoImage, alt: content.siteName }))
      )
    );
  }

  function Cakes({ content }) {
    return h(
      "section",
      { id: "cakes", className: "section" },
      h(
        "div",
        { className: "container" },
        h("h2", { className: "section-title" }, "Fresh Homemade Cakes"),
        h("p", { className: "section-subtitle" }, "Beautiful cakes made for birthdays, celebrations and sweet memories."),
        h(
          "div",
          { className: "grid gallery-grid" },
          content.cakeImages.map((src, index) => h("div", { className: "photo-card", key: `${src}-${index}` }, h("img", { src, alt: `Cake ${index + 1}` })))
        )
      )
    );
  }

  function About({ content }) {
    const image = content.cakeImages && content.cakeImages[1] ? content.cakeImages[1] : content.heroImage;
    return h(
      "section",
      { className: "section section-soft" },
      h(
        "div",
        { className: "container about-card" },
        h("img", { src: image, alt: "Cake from Rama's Bakery" }),
        h(
          "div",
          { className: "about-text" },
          h("h2", null, content.aboutTitle),
          h("p", null, content.aboutText),
          h("a", { className: "btn", href: `tel:${digits(content.phone)}` }, `Call ${content.phone}`)
        )
      )
    );
  }

  function Speciality({ content }) {
    return h(
      "section",
      { className: "section" },
      h(
        "div",
        { className: "container" },
        h("h2", { className: "section-title" }, content.specialityTitle),
        h("p", { className: "section-subtitle" }, "Quality ingredients, homemade taste and custom designs for every celebration."),
        h(
          "div",
          { className: "speciality-grid" },
          content.specialities.map((item, index) =>
            h("div", { className: "speciality-card", key: `${item}-${index}` }, h("span", { className: "icon" }, "✓"), h("p", null, item))
          )
        )
      )
    );
  }

  function MenuSection({ content, onMenu }) {
    return h(
      "section",
      { id: "menu", className: "section section-soft" },
      h(
        "div",
        { className: "container menu-card" },
        h("img", { src: content.menuImage, alt: "Rama's Bakery menu" }),
        h(
          "div",
          { className: "menu-copy" },
          h("h2", null, "Bakery Menu"),
          h("p", null, "Explore cakes, cookies and homemade bakery items. Tap the button to view the full menu card clearly."),
          h("button", { className: "btn", type: "button", onClick: onMenu }, "View Full Menu")
        )
      )
    );
  }

  function FreshBakes({ content }) {
    return h(
      "section",
      { id: "fresh-bakes", className: "section" },
      h(
        "div",
        { className: "container" },
        h("h2", { className: "section-title" }, "Fresh Bakes"),
        h("p", { className: "section-subtitle" }, "Cookies, treats and freshly baked items made with care."),
        h(
          "div",
          { className: "grid fresh-grid" },
          content.freshBakeImages.map((src, index) => h("div", { className: "photo-card", key: `${src}-${index}` }, h("img", { src, alt: `Fresh bake ${index + 1}` })))
        )
      )
    );
  }

  function Contact({ content }) {
    const wa = `https://wa.me/${digits(content.whatsapp || content.phone)}?text=${encodeURIComponent("Hi Rama's Bakery, I want to order a cake.")}`;
    const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(content.mapQuery || content.locationText)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    return h(
      "section",
      { id: "contact", className: "section section-soft" },
      h(
        "div",
        { className: "container contact-grid" },
        h(
          "div",
          { className: "contact-card" },
          h("h2", null, "Contact / Order"),
          h("p", { className: "section-subtitle", style: { textAlign: "left", margin: "0 0 16px" } }, "Call or WhatsApp to place your custom cake order."),
          h(
            "div",
            { className: "contact-list" },
            h("a", { href: `tel:${digits(content.phone)}` }, "📞 ", content.phone),
            h("a", { href: wa, target: "_blank", rel: "noreferrer" }, "💬 WhatsApp Order"),
            h("span", null, "📍 ", content.locationText),
            content.instagram ? h("a", { href: content.instagram, target: "_blank", rel: "noreferrer" }, "📷 Instagram") : null
          ),
          h("img", { src: content.contactImage, alt: "Contact card" })
        ),
        h("div", { className: "map-card" }, h("iframe", { title: "Rama's Bakery location", src: mapSrc, loading: "lazy", referrerPolicy: "no-referrer-when-downgrade" }))
      )
    );
  }

  function Footer({ content }) {
    const wa = `https://wa.me/${digits(content.whatsapp || content.phone)}`;
    return h(
      "footer",
      { className: "footer" },
      h(
        "div",
        { className: "container footer-grid" },
        h("div", null, h("h3", null, content.siteName), h("p", null, content.tagline), h("p", null, "© 2026 Rama's Bakery. All rights reserved.")),
        h("div", null, h("h4", null, "Quick Links"), h("div", { className: "footer-links" }, h("a", { href: "#home" }, "Home"), h("a", { href: "#cakes" }, "Cakes"), h("a", { href: "#fresh-bakes" }, "Fresh Bakes"), h("a", { href: "#admin" }, "Admin Panel"))),
        h("div", null, h("h4", null, "Contact"), h("div", { className: "footer-links" }, h("a", { href: `tel:${digits(content.phone)}` }, content.phone), h("a", { href: wa, target: "_blank", rel: "noreferrer" }, "WhatsApp"), content.instagram ? h("a", { href: content.instagram, target: "_blank", rel: "noreferrer" }, "Instagram") : null))
      )
    );
  }

  function Site({ content }) {
    const [modal, setModal] = useState(null);
    const wa = `https://wa.me/${digits(content.whatsapp || content.phone)}?text=${encodeURIComponent("Hi Rama's Bakery, I want to order a cake.")}`;
    return h(
      React.Fragment,
      null,
      h(Header, { content, onMenu: () => setModal({ image: content.menuImage, alt: "Menu card" }) }),
      h(Hero, { content }),
      h(Cakes, { content }),
      h(About, { content }),
      h(Speciality, { content }),
      h(MenuSection, { content, onMenu: () => setModal({ image: content.menuImage, alt: "Menu card" }) }),
      h(FreshBakes, { content }),
      h(Contact, { content }),
      h(Footer, { content }),
      h("a", { className: "whatsapp-float", href: wa, target: "_blank", rel: "noreferrer" }, "💬 Order on WhatsApp"),
      modal ? h(Modal, { image: modal.image, alt: modal.alt, onClose: () => setModal(null) }) : null
    );
  }

  function Login({ onLogin, notice }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState("");
    const [statusType, setStatusType] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
      event.preventDefault();
      setLoading(true);
      setStatus("");
      try {
        const res = await fetch(api.login, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
        const data = await readJsonResponse(res, "Login failed. Check username, password and PHP API.");
        setStatusType("success");
        setStatus("Login successful.");
        onLogin();
      } catch (err) {
        setStatusType("error");
        setStatus(err.message || "Login failed.");
      } finally {
        setLoading(false);
      }
    }

    return h(
      "div",
      { className: "login-box" },
      h(
        "form",
        { className: "login-card", onSubmit: handleSubmit },
        h("h1", null, "Admin Login"),
        h("p", null, "Login to update bakery content, images and contact details."),
        h("div", { className: "field" }, h("label", null, "Username"), h("input", { value: username, onChange: (e) => setUsername(e.target.value), autoComplete: "username", required: true })),
        h("div", { className: "field", style: { marginTop: "14px" } }, h("label", null, "Password"), h("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), autoComplete: "current-password", required: true })),
        h("div", { className: "admin-actions" }, h("button", { className: "btn", type: "submit", disabled: loading }, loading ? "Checking..." : "Login"), h("a", { className: "btn secondary", href: "#home" }, "Back to Website")),
        h("p", { className: "hint" }, "Admin access only. Change the default password in api/config.php before giving this website to the client."),
        h(StatusMessage, { type: notice ? "error" : "" }, notice),
        h(StatusMessage, { type: statusType }, status)
      )
    );
  }

  function Field({ label, value, onChange, textarea, full, placeholder }) {
    return h(
      "div",
      { className: `field ${full ? "full" : ""}`.trim() },
      h("label", null, label),
      textarea
        ? h("textarea", { value, placeholder, onChange: (event) => onChange(event.target.value) })
        : h("input", { value, placeholder, onChange: (event) => onChange(event.target.value) })
    );
  }

  function ImagePreview({ title, images }) {
    return h(
      "div",
      { className: "field full" },
      h("label", null, title),
      h("div", { className: "preview-strip" }, (images || []).slice(0, 12).map((src, index) => h("img", { src, alt: `${title} ${index + 1}`, key: `${src}-${index}` })))
    );
  }

  function UploadButton({ label, onUploaded, multiple }) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");

    async function handleFiles(event) {
      const files = Array.from(event.target.files || []);
      if (!files.length || busy) return;
      setBusy(true);
      setMessage("");
      try {
        const paths = [];
        for (const file of files) {
          paths.push(await uploadFileToServer(file));
        }
        onUploaded(paths);
        setMessage(paths.length > 1 ? `${paths.length} images uploaded. Click Save Changes to publish.` : "Image uploaded. Click Save Changes to publish.");
      } catch (err) {
        setMessage(err.message || "Upload failed.");
      } finally {
        setBusy(false);
        event.target.value = "";
      }
    }

    const isError = Boolean(message && !message.includes("uploaded"));
    return h(
      "div",
      { className: "upload-control" },
      h(
        "label",
        { className: `btn secondary small upload-label ${busy ? "disabled" : ""}`.trim() },
        h("span", { className: "upload-button-text" }, busy ? "Uploading..." : label),
        h("input", { type: "file", accept: "image/jpeg,image/png,.jpg,.jpeg,.png", multiple: Boolean(multiple), onChange: handleFiles, disabled: busy })
      ),
      message ? h("span", { className: `mini-status ${isError ? "error" : ""}`.trim() }, message) : null
    );
  }

  function ImageSingleManager({ label, value, onChange, help }) {
    return h(
      "div",
      { className: "field image-manager" },
      h(
        "div",
        { className: "image-manager-head" },
        h("div", null, h("label", null, label), help ? h("p", { className: "hint" }, help) : null),
        h(UploadButton, { label: value ? "Upload / Replace" : "Upload Image", onUploaded: (paths) => onChange(paths[0]) })
      ),
      h(
        "div",
        { className: "image-current" },
        value ? h("img", { src: value, alt: label }) : h("div", { className: "empty-image" }, "No image"),
        h("div", { className: "image-meta" }, h("strong", null, "Current image"), h("span", null, value || "Not selected"))
      ),
      h(
        "details",
        { className: "advanced-path" },
        h("summary", null, "Advanced: edit image path manually"),
        h("input", { value: value || "", placeholder: "assets/uploads/image.jpg", onChange: (event) => onChange(event.target.value) })
      )
    );
  }

  function ImageListManager({ label, images, onChange, help }) {
    const current = Array.isArray(images) ? images : [];

    function replaceAt(index, paths) {
      if (!paths || !paths[0]) return;
      const next = current.slice();
      next[index] = paths[0];
      onChange(next);
    }

    function removeAt(index) {
      onChange(current.filter((_, itemIndex) => itemIndex !== index));
    }

    function moveAt(index, direction) {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= current.length) return;
      const next = current.slice();
      const temp = next[index];
      next[index] = next[nextIndex];
      next[nextIndex] = temp;
      onChange(next);
    }

    return h(
      "div",
      { className: "field full image-list-manager" },
      h(
        "div",
        { className: "image-manager-head" },
        h("div", null, h("label", null, label), help ? h("p", { className: "hint" }, help) : null),
        h(UploadButton, { label: "Add Photos", multiple: true, onUploaded: (paths) => onChange(current.concat(paths)) })
      ),
      current.length
        ? h(
            "div",
            { className: "admin-image-grid" },
            current.map((src, index) =>
              h(
                "div",
                { className: "admin-image-item", key: `${src}-${index}` },
                h("img", { src, alt: `${label} ${index + 1}` }),
                h("div", { className: "image-item-meta" }, h("strong", null, `Image ${index + 1}`), h("span", null, src)),
                h(
                  "div",
                  { className: "image-item-actions" },
                  h(UploadButton, { label: "Change", onUploaded: (paths) => replaceAt(index, paths) }),
                  h("button", { className: "mini-btn", type: "button", onClick: () => moveAt(index, -1), disabled: index === 0, title: "Move up" }, "Up"),
                  h("button", { className: "mini-btn", type: "button", onClick: () => moveAt(index, 1), disabled: index === current.length - 1, title: "Move down" }, "Down"),
                  h("button", { className: "mini-btn danger", type: "button", onClick: () => removeAt(index) }, "Delete")
                )
              )
            )
          )
        : h("div", { className: "empty-state" }, "No images yet. Click Add Photos."),
      h(
        "details",
        { className: "advanced-path" },
        h("summary", null, "Advanced: edit all image paths manually"),
        h("textarea", { value: listToText(current), placeholder: "assets/uploads/cake.jpg", onChange: (event) => onChange(textToList(event.target.value)) })
      )
    );
  }

  function AdminDashboard({ content, setContent, onLogout, remainingSeconds, timeoutSeconds, idleNotice }) {
    const [form, setForm] = useState(() => ({
      ...content,
      specialitiesText: listToText(content.specialities),
      cakeImagesText: listToText(content.cakeImages),
      freshBakeImagesText: listToText(content.freshBakeImages)
    }));
    const [status, setStatus] = useState("");
    const [statusType, setStatusType] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
      setForm({
        ...content,
        specialitiesText: listToText(content.specialities),
        cakeImagesText: listToText(content.cakeImages),
        freshBakeImagesText: listToText(content.freshBakeImages)
      });
    }, [content]);

    const update = (key, value) => setForm((old) => ({ ...old, [key]: value }));
    const updateCakeImages = (items) => update("cakeImagesText", listToText(items));
    const updateFreshBakeImages = (items) => update("freshBakeImagesText", listToText(items));

    const preparedContent = useMemo(() => {
      const next = { ...form };
      next.specialities = textToList(form.specialitiesText);
      next.cakeImages = textToList(form.cakeImagesText);
      next.freshBakeImages = textToList(form.freshBakeImagesText);
      delete next.specialitiesText;
      delete next.cakeImagesText;
      delete next.freshBakeImagesText;
      return normalizeContent(next);
    }, [form]);

    async function saveContent(event) {
      event.preventDefault();
      setSaving(true);
      setStatus("");
      try {
        const res = await fetch(api.content, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preparedContent)
        });
        const data = await readJsonResponse(res, "Could not save content. Check /data folder permission.");
        const saved = normalizeContent(data.content || preparedContent);
        setContent(saved);
        setStatusType("success");
        setStatus("Saved successfully. Open website to see updated changes.");
      } catch (err) {
        setStatusType("error");
        setStatus(err.message || "Save failed.");
      } finally {
        setSaving(false);
      }
    }

    return h(
      "div",
      { className: "admin-page" },
      h(
        "div",
        { className: "admin-shell" },
        h(
          "div",
          { className: "admin-top" },
          h("div", null, h("h1", null, "Rama's Bakery Admin"), h("p", { className: "hint" }, "Photos are now at the top. Client can upload JPG, JPEG or PNG directly, then click Save Changes."), h("p", { className: "session-hint" }, `Security: auto logout after ${Math.round((timeoutSeconds || DEFAULT_AUTO_LOGOUT_SECONDS) / 60)} minutes of no activity${remainingSeconds <= AUTO_LOGOUT_WARNING_SECONDS ? ` — ${formatSeconds(remainingSeconds)} left` : ""}.`)),
          h("div", { className: "admin-actions", style: { marginTop: 0 } }, h("a", { className: "btn secondary small", href: "#home" }, "View Website"), h("button", { className: "btn small", type: "button", onClick: () => onLogout("Logged out safely.") }, "Logout"))
        ),
        h(
          "div",
          { className: "admin-card guide-card" },
          h("h2", null, "Easy Client Image Manager"),
          h(
            "div",
            { className: "guide-grid" },
            h("div", null, h("strong", null, "1. Start with photos"), h("p", null, "Upload buttons are now shown first, before text fields.")),
            h("div", null, h("strong", null, "2. Replace / Delete"), h("p", null, "Use Upload / Replace, Delete, Up and Down buttons under each photo.")),
            h("div", null, h("strong", null, "3. Publish"), h("p", null, "After upload, click Save Changes. Then View Website."))
          )
        ),
        h(StatusMessage, { type: "error" }, idleNotice),
        h(
          "form",
          { onSubmit: saveContent },
          h(
            "div",
            { className: "admin-card upload-first-card" },
            h("div", { className: "section-head-row" }, h("div", null, h("h2", null, "Start Here: Upload / Change Photos"), h("p", { className: "hint" }, "This is the first section for the client. No path typing needed. Supported formats: JPG, JPEG and PNG.")), h("button", { className: "btn small", type: "submit", disabled: saving }, saving ? "Saving..." : "Save Image Changes")),
            h(
              "div",
              { className: "admin-grid" },
              h(ImageSingleManager, { label: "Logo Image", value: form.logoImage || "", onChange: (v) => update("logoImage", v), help: "Click Upload / Replace to change the logo." }),
              h(ImageSingleManager, { label: "Hero Background Image", value: form.heroImage || "", onChange: (v) => update("heroImage", v), help: "Click Upload / Replace to change the top banner image." }),
              h(ImageSingleManager, { label: "Menu Image", value: form.menuImage || "", onChange: (v) => update("menuImage", v), help: "Click Upload / Replace to change the menu photo." }),
              h(ImageSingleManager, { label: "Contact Card Image", value: form.contactImage || "", onChange: (v) => update("contactImage", v), help: "Click Upload / Replace to change the contact section image." }),
              h(ImageListManager, { label: "Cake Gallery Images", images: preparedContent.cakeImages, onChange: updateCakeImages, help: "Click Add Photos for new cake photos. Use Upload / Replace, Delete, Up and Down." }),
              h(ImageListManager, { label: "Fresh Bake Images", images: preparedContent.freshBakeImages, onChange: updateFreshBakeImages, help: "Click Add Photos for cookies and fresh bake photos." })
            ),
            h(StatusMessage, { type: statusType }, status)
          ),
          h(
            "div",
            { className: "admin-card" },
            h("h2", null, "Main Content"),
            h(
              "div",
              { className: "admin-grid" },
              h(Field, { label: "Site Name", value: form.siteName || "", onChange: (v) => update("siteName", v) }),
              h(Field, { label: "Tagline", value: form.tagline || "", onChange: (v) => update("tagline", v) }),
              h(Field, { label: "Hero Title", value: form.heroTitle || "", onChange: (v) => update("heroTitle", v), full: true }),
              h(Field, { label: "Hero Subtitle", value: form.heroSubtitle || "", onChange: (v) => update("heroSubtitle", v), textarea: true, full: true }),
              h(Field, { label: "Phone", value: form.phone || "", onChange: (v) => update("phone", v) }),
              h(Field, { label: "WhatsApp Number with country code", value: form.whatsapp || "", onChange: (v) => update("whatsapp", v) }),
              h(Field, { label: "Instagram URL", value: form.instagram || "", onChange: (v) => update("instagram", v), full: true }),
              h(Field, { label: "Location Text", value: form.locationText || "", onChange: (v) => update("locationText", v) }),
              h(Field, { label: "Google Map Search Query", value: form.mapQuery || "", onChange: (v) => update("mapQuery", v) })
            )
          ),
          h(
            "div",
            { className: "admin-card" },
            h("h2", null, "About & Specialities"),
            h(
              "div",
              { className: "admin-grid" },
              h(Field, { label: "About Title", value: form.aboutTitle || "", onChange: (v) => update("aboutTitle", v), full: true }),
              h(Field, { label: "About Text", value: form.aboutText || "", onChange: (v) => update("aboutText", v), textarea: true, full: true }),
              h(Field, { label: "Speciality Title", value: form.specialityTitle || "", onChange: (v) => update("specialityTitle", v), full: true }),
              h(Field, { label: "Specialities - one per line", value: form.specialitiesText || "", onChange: (v) => update("specialitiesText", v), textarea: true, full: true })
            )
          ),
          h(
            "div",
            { className: "admin-actions save-bar" },
            h("button", { className: "btn", type: "submit", disabled: saving }, saving ? "Saving..." : "Save Changes"),
            h("button", { className: "btn secondary", type: "button", onClick: () => setContent(preparedContent) }, "Preview Without Saving"),
            h("a", { className: "btn light", href: "#home" }, "View Website")
          ),
          h(StatusMessage, { type: statusType }, status)
        )
      )
    );
  }

  function AdminPage({ content, setContent }) {
    const [checking, setChecking] = useState(true);
    const [authed, setAuthed] = useState(false);
    const [timeoutSeconds, setTimeoutSeconds] = useState(DEFAULT_AUTO_LOGOUT_SECONDS);
    const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_AUTO_LOGOUT_SECONDS);
    const [idleNotice, setIdleNotice] = useState("");
    const [loginNotice, setLoginNotice] = useState("");
    const lastActivityRef = useRef(Date.now());

    function markActivity() {
      lastActivityRef.current = Date.now();
      setIdleNotice("");
    }

    async function checkSession(refresh) {
      try {
        const res = await fetch(api.session, { method: refresh ? "POST" : "GET", cache: "no-store" });
        const data = await readJsonResponse(res, "Could not check admin session.");
        setAuthed(Boolean(data.loggedIn));
        setTimeoutSeconds(Number(data.timeoutSeconds) || DEFAULT_AUTO_LOGOUT_SECONDS);
        setRemainingSeconds(Number(data.remainingSeconds) || 0);
        if (!data.loggedIn && data.expired) {
          setLoginNotice("Auto logout done because admin was inactive. Please login again.");
        }
        return data;
      } catch (err) {
        setAuthed(false);
        return { loggedIn: false };
      } finally {
        setChecking(false);
      }
    }

    async function logout(reason) {
      try {
        await fetch(api.logout, { method: "POST" });
      } catch (err) {}
      setAuthed(false);
      setLoginNotice(reason || "Logged out safely.");
    }

    useEffect(() => {
      checkSession(false);
    }, []);

    useEffect(() => {
      if (!authed) return undefined;

      lastActivityRef.current = Date.now();
      setRemainingSeconds(timeoutSeconds);

      const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
      events.forEach((eventName) => window.addEventListener(eventName, markActivity, { passive: true }));

      let lastHeartbeatAt = 0;
      const timer = window.setInterval(async () => {
        const idleForSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
        const left = Math.max(0, timeoutSeconds - idleForSeconds);
        setRemainingSeconds(left);

        if (left <= 0) {
          window.clearInterval(timer);
          await logout(`Auto logout done after ${Math.round(timeoutSeconds / 60)} minutes of no activity.`);
          return;
        }

        if (left <= AUTO_LOGOUT_WARNING_SECONDS) {
          setIdleNotice(`No activity detected. Auto logout in ${formatSeconds(left)}.`);
        } else {
          setIdleNotice("");
        }

        const activeRecently = idleForSeconds < 60;
        const heartbeatDue = Date.now() - lastHeartbeatAt > 60 * 1000;
        if (activeRecently && heartbeatDue) {
          lastHeartbeatAt = Date.now();
          const data = await checkSession(true);
          if (!data.loggedIn) {
            window.clearInterval(timer);
            setLoginNotice("Auto logout done because server session expired. Please login again.");
          }
        }
      }, 1000);

      return () => {
        window.clearInterval(timer);
        events.forEach((eventName) => window.removeEventListener(eventName, markActivity));
      };
    }, [authed, timeoutSeconds]);

    if (checking) {
      return h("div", { className: "login-box" }, h("div", { className: "login-card" }, h("h1", null, "Checking login...")));
    }

    if (!authed) {
      return h(Login, { onLogin: () => { setLoginNotice(""); setAuthed(true); lastActivityRef.current = Date.now(); setRemainingSeconds(timeoutSeconds); }, notice: loginNotice });
    }

    return h(AdminDashboard, {
      content,
      setContent,
      onLogout: logout,
      remainingSeconds,
      timeoutSeconds,
      idleNotice
    });
  }

  function App() {
    const [content, setContent] = useState(defaultContent);
    const [route, setRoute] = useState(window.location.hash === "#admin" ? "admin" : "site");

    useEffect(() => {
      async function loadContent() {
        try {
          const res = await fetch(api.content, { cache: "no-store" });
          const text = await res.text();
          const data = text ? JSON.parse(text) : {};
          setContent(normalizeContent(data));
        } catch (err) {
          console.warn(apiErrorMessage("Content API not reachable. Showing default website content."), err);
          setContent(defaultContent);
        }
      }
      loadContent();
    }, []);

    useEffect(() => {
      const onHash = () => setRoute(window.location.hash === "#admin" ? "admin" : "site");
      window.addEventListener("hashchange", onHash);
      return () => window.removeEventListener("hashchange", onHash);
    }, []);

    return route === "admin" ? h(AdminPage, { content, setContent }) : h(Site, { content });
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
