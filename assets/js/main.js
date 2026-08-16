(function () {
  "use strict";
  var data = window.PORTFOLIO_CONTENT || {};

  function byId(id) { return document.getElementById(id); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function isNonEmptyString(v) { return typeof v === "string" && v.trim().length > 0; }
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setHref(id, href, opts) {
    var el = byId(id);
    if (!el) return;
    var hideIfMissing = !opts || opts.hideIfMissing !== false;
    if (!href) {
      if (hideIfMissing) el.style.display = "none";
      return;
    }
    el.href = href;
  }

  function setText(id, text) {
    var el = byId(id);
    if (!el) return;
    el.textContent = text || "";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  var ICONS = {
    "arrow-right-up": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M6 18L18 6M18 15V6H9\"/>",
    "hamburger-menu": "<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-width=\"1.5\"><path d=\"M20 7L4 7\"/><path d=\"M20 12L4 12\"/><path d=\"M20 17L4 17\"/></g>",
    "arrow-down": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M12 4L12 20M6 14L12 20L18 14\"/>",
    "letter": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z\"/><path stroke-linecap=\"round\" d=\"M6 8L8.1589 9.79908C9.99553 11.3296 10.9139 12.0949 12 12.0949C13.0861 12.0949 14.0045 11.3296 15.8411 9.79908L18 8\"/></g>",
    "server": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2 17C2 15.1144 2 14.1716 2.58579 13.5858C3.17157 13 4.11438 13 6 13H18C19.8856 13 20.8284 13 21.4142 13.5858C22 14.1716 22 15.1144 22 17C22 18.8856 22 19.8284 21.4142 20.4142C20.8284 21 19.8856 21 18 21H6C4.11438 21 3.17157 21 2.58579 20.4142C2 19.8284 2 18.8856 2 17Z\"/><path d=\"M2 6C2 4.11438 2 3.17157 2.58579 2.58579C3.17157 2 4.11438 2 6 2H18C19.8856 2 20.8284 2 21.4142 2.58579C22 3.17157 22 4.11438 22 6C22 7.88562 22 8.82843 21.4142 9.41421C20.8284 10 19.8856 10 18 10H6C4.11438 10 3.17157 10 2.58579 9.41421C2 8.82843 2 7.88562 2 6Z\"/><path stroke-linecap=\"round\" d=\"M11 6H18\"/><path stroke-linecap=\"round\" d=\"M6 6H8\"/><path stroke-linecap=\"round\" d=\"M11 17H18\"/><path stroke-linecap=\"round\" d=\"M6 17H8\"/></g>",
    "code-square": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"M15.5 9L15.6716 9.17157C17.0049 10.5049 17.6716 11.1716 17.6716 12C17.6716 12.8284 17.0049 13.4951 15.6716 14.8284L15.5 15\"/><path stroke-linecap=\"round\" d=\"M13.2939 7.17041L11.9998 12L10.7058 16.8297\"/><path stroke-linecap=\"round\" d=\"M8.50019 9L8.32861 9.17157C6.99528 10.5049 6.32861 11.1716 6.32861 12C6.32861 12.8284 6.99528 13.4951 8.32861 14.8284L8.50019 15\"/><path d=\"M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z\"/></g>",
    "widget-5": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M13.5 15.5C13.5 13.6144 13.5 12.6716 14.0858 12.0858C14.6716 11.5 15.6144 11.5 17.5 11.5C19.3856 11.5 20.3284 11.5 20.9142 12.0858C21.5 12.6716 21.5 13.6144 21.5 15.5V17.5C21.5 19.3856 21.5 20.3284 20.9142 20.9142C20.3284 21.5 19.3856 21.5 17.5 21.5C15.6144 21.5 14.6716 21.5 14.0858 20.9142C13.5 20.3284 13.5 19.3856 13.5 17.5V15.5Z\"/><path d=\"M2 8.5C2 10.3856 2 11.3284 2.58579 11.9142C3.17157 12.5 4.11438 12.5 6 12.5C7.88562 12.5 8.82843 12.5 9.41421 11.9142C10 11.3284 10 10.3856 10 8.5V6.5C10 4.61438 10 3.67157 9.41421 3.08579C8.82843 2.5 7.88562 2.5 6 2.5C4.11438 2.5 3.17157 2.5 2.58579 3.08579C2 3.67157 2 4.61438 2 6.5V8.5Z\"/><path d=\"M13.5 5.5C13.5 4.56812 13.5 4.10218 13.6522 3.73463C13.8552 3.24458 14.2446 2.85523 14.7346 2.65224C15.1022 2.5 15.5681 2.5 16.5 2.5H18.5C19.4319 2.5 19.8978 2.5 20.2654 2.65224C20.7554 2.85523 21.1448 3.24458 21.3478 3.73463C21.5 4.10218 21.5 4.56812 21.5 5.5C21.5 6.43188 21.5 6.89782 21.3478 7.26537C21.1448 7.75542 20.7554 8.14477 20.2654 8.34776C19.8978 8.5 19.4319 8.5 18.5 8.5H16.5C15.5681 8.5 15.1022 8.5 14.7346 8.34776C14.2446 8.14477 13.8552 7.75542 13.6522 7.26537C13.5 6.89782 13.5 6.43188 13.5 5.5Z\"/><path d=\"M2 18.5C2 19.4319 2 19.8978 2.15224 20.2654C2.35523 20.7554 2.74458 21.1448 3.23463 21.3478C3.60218 21.5 4.06812 21.5 5 21.5H7C7.93188 21.5 8.39782 21.5 8.76537 21.3478C9.25542 21.1448 9.64477 20.7554 9.84776 20.2654C10 19.8978 10 19.4319 10 18.5C10 17.5681 10 17.1022 9.84776 16.7346C9.64477 16.2446 9.25542 15.8552 8.76537 15.6522C8.39782 15.5 7.93188 15.5 7 15.5H5C4.06812 15.5 3.60218 15.5 3.23463 15.6522C2.74458 15.8552 2.35523 16.2446 2.15224 16.7346C2 17.1022 2 17.5681 2 18.5Z\"/></g>",
    "shield-check": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M3 10.4167C3 7.21907 3 5.62028 3.37752 5.08241C3.75503 4.54454 5.25832 4.02996 8.26491 3.00079L8.83772 2.80472C10.405 2.26824 11.1886 2 12 2C12.8114 2 13.595 2.26824 15.1623 2.80472L15.7351 3.00079C18.7417 4.02996 20.245 4.54454 20.6225 5.08241C21 5.62028 21 7.21907 21 10.4167C21 10.8996 21 11.4234 21 11.9914C21 17.6294 16.761 20.3655 14.1014 21.5273C13.38 21.8424 13.0193 22 12 22C10.9807 22 10.62 21.8424 9.89856 21.5273C7.23896 20.3655 3 17.6294 3 11.9914C3 11.4234 3 10.8996 3 10.4167Z\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M9.5 12.4L10.9286 14L14.5 10\"/></g>",
    "users-group-rounded": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><circle cx=\"9\" cy=\"6\" r=\"4\"/><path stroke-linecap=\"round\" d=\"M15 9C16.6569 9 18 7.65685 18 6C18 4.34315 16.6569 3 15 3\"/><ellipse cx=\"9\" cy=\"17\" rx=\"7\" ry=\"4\"/><path stroke-linecap=\"round\" d=\"M18 14C19.7542 14.3847 21 15.3589 21 16.5C21 17.5293 19.9863 18.4229 18.5 18.8704\"/></g>",
    "monitor-smartphone": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"M11 17H8C5.17157 17 3.75736 17 2.87868 16.1213C2 15.2426 2 13.8284 2 11V10C2 6.22876 2 4.34315 3.17157 3.17157C4.34315 2 6.22876 2 10 2H15.5C17.8346 2 19.0019 2 19.8856 2.47231C20.5833 2.84525 21.1548 3.4167 21.5277 4.11441C22 4.99805 22 6.16537 22 8.5\"/><path d=\"M14 15C14 13.1144 14 12.1716 14.5858 11.5858C15.1716 11 16.1144 11 18 11C19.8856 11 20.8284 11 21.4142 11.5858C22 12.1716 22 13.1144 22 15V18C22 19.8856 22 20.8284 21.4142 21.4142C20.8284 22 19.8856 22 18 22C16.1144 22 15.1716 22 14.5858 21.4142C14 20.8284 14 19.8856 14 18V15Z\"/><path stroke-linecap=\"round\" d=\"M19 20H17\"/><path stroke-linecap=\"round\" d=\"M11 22H8\"/><path stroke-linecap=\"round\" d=\"M11 22V17\"/><path stroke-linecap=\"round\" d=\"M11 13H2\"/></g>",
    "server-square": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M2 11C2 7.22876 2 5.34315 3.17157 4.17157C4.34315 3 6.22876 3 10 3H14C17.7712 3 19.6569 3 20.8284 4.17157C22 5.34315 22 7.22876 22 11V13C22 16.7712 22 18.6569 20.8284 19.8284C19.6569 21 17.7712 21 14 21H10C6.22876 21 4.34315 21 3.17157 19.8284C2 18.6569 2 16.7712 2 13V11Z\"/><path d=\"M2 12H22\"/><path stroke-linecap=\"round\" d=\"M13.5 16.5H18\"/><path stroke-linecap=\"round\" d=\"M13.5 7.5L18 7.5\"/><path stroke-linecap=\"round\" d=\"M6 17.5L6 15.5\"/><path stroke-linecap=\"round\" d=\"M6 8.5L6 6.5\"/><path stroke-linecap=\"round\" d=\"M9 17.5L9 15.5\"/><path stroke-linecap=\"round\" d=\"M9 8.5L9 6.5\"/></g>",
    "settings": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M13.7654 2.15224C13.3978 2 12.9319 2 12 2C11.0681 2 10.6022 2 10.2346 2.15224C9.74457 2.35523 9.35522 2.74458 9.15223 3.23463C9.05957 3.45834 9.0233 3.7185 9.00911 4.09799C8.98826 4.65568 8.70226 5.17189 8.21894 5.45093C7.73564 5.72996 7.14559 5.71954 6.65219 5.45876C6.31645 5.2813 6.07301 5.18262 5.83294 5.15102C5.30704 5.08178 4.77518 5.22429 4.35436 5.5472C4.03874 5.78938 3.80577 6.1929 3.33983 6.99993C2.87389 7.80697 2.64092 8.21048 2.58899 8.60491C2.51976 9.1308 2.66227 9.66266 2.98518 10.0835C3.13256 10.2756 3.3397 10.437 3.66119 10.639C4.1338 10.936 4.43789 11.4419 4.43786 12C4.43783 12.5581 4.13375 13.0639 3.66118 13.3608C3.33965 13.5629 3.13248 13.7244 2.98508 13.9165C2.66217 14.3373 2.51966 14.8691 2.5889 15.395C2.64082 15.7894 2.87379 16.193 3.33973 17C3.80568 17.807 4.03865 18.2106 4.35426 18.4527C4.77508 18.7756 5.30694 18.9181 5.83284 18.8489C6.07289 18.8173 6.31632 18.7186 6.65204 18.5412C7.14547 18.2804 7.73556 18.27 8.2189 18.549C8.70224 18.8281 8.98826 19.3443 9.00911 19.9021C9.02331 20.2815 9.05957 20.5417 9.15223 20.7654C9.35522 21.2554 9.74457 21.6448 10.2346 21.8478C10.6022 22 11.0681 22 12 22C12.9319 22 13.3978 22 13.7654 21.8478C14.2554 21.6448 14.6448 21.2554 14.8477 20.7654C14.9404 20.5417 14.9767 20.2815 14.9909 19.902C15.0117 19.3443 15.2977 18.8281 15.781 18.549C16.2643 18.2699 16.8544 18.2804 17.3479 18.5412C17.6836 18.7186 17.927 18.8172 18.167 18.8488C18.6929 18.9181 19.2248 18.7756 19.6456 18.4527C19.9612 18.2105 20.1942 17.807 20.6601 16.9999C21.1261 16.1929 21.3591 15.7894 21.411 15.395C21.4802 14.8691 21.3377 14.3372 21.0148 13.9164C20.8674 13.7243 20.6602 13.5628 20.3387 13.3608C19.8662 13.0639 19.5621 12.558 19.5621 11.9999C19.5621 11.4418 19.8662 10.9361 20.3387 10.6392C20.6603 10.4371 20.8675 10.2757 21.0149 10.0835C21.3378 9.66273 21.4803 9.13087 21.4111 8.60497C21.3592 8.21055 21.1262 7.80703 20.6602 7C20.1943 6.19297 19.9613 5.78945 19.6457 5.54727C19.2249 5.22436 18.693 5.08185 18.1671 5.15109C17.9271 5.18269 17.6837 5.28136 17.3479 5.4588C16.8545 5.71959 16.2644 5.73002 15.7811 5.45096C15.2977 5.17191 15.0117 4.65566 14.9909 4.09794C14.9767 3.71848 14.9404 3.45833 14.8477 3.23463C14.6448 2.74458 14.2554 2.35523 13.7654 2.15224Z\"/></g>",
    "check-circle": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><path stroke-linecap=\"round\" stroke-linejoin=\"round\" d=\"M8.5 12.5L10.5 14.5L15.5 9.5\"/></g>",
    "alt-arrow-down": "<path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\" d=\"M19 9L12 15L5 9\"/>",
    "star": "<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" d=\"M9.15316 5.40838C10.4198 3.13613 11.0531 2 12 2C12.9469 2 13.5802 3.13612 14.8468 5.40837L15.1745 5.99623C15.5345 6.64193 15.7144 6.96479 15.9951 7.17781C16.2757 7.39083 16.6251 7.4699 17.3241 7.62805L17.9605 7.77203C20.4201 8.32856 21.65 8.60682 21.9426 9.54773C22.2352 10.4886 21.3968 11.4691 19.7199 13.4299L19.2861 13.9372C18.8096 14.4944 18.5713 14.773 18.4641 15.1177C18.357 15.4624 18.393 15.8341 18.465 16.5776L18.5306 17.2544C18.7841 19.8706 18.9109 21.1787 18.1449 21.7602C17.3788 22.3417 16.2273 21.8115 13.9243 20.7512L13.3285 20.4768C12.6741 20.1755 12.3469 20.0248 12 20.0248C11.6531 20.0248 11.3259 20.1755 10.6715 20.4768L10.0757 20.7512C7.77268 21.8115 6.62118 22.3417 5.85515 21.7602C5.08912 21.1787 5.21588 19.8706 5.4694 17.2544L5.53498 16.5776C5.60703 15.8341 5.64305 15.4624 5.53586 15.1177C5.42868 14.773 5.19043 14.4944 4.71392 13.9372L4.2801 13.4299C2.60325 11.4691 1.76482 10.4886 2.05742 9.54773C2.35002 8.60682 3.57986 8.32856 6.03954 7.77203L6.67589 7.62805C7.37485 7.4699 7.72433 7.39083 8.00494 7.17781C8.28555 6.96479 8.46553 6.64194 8.82547 5.99623L9.15316 5.40838Z\"/>",
    "document-text": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z\"/><path stroke-linecap=\"round\" d=\"M8 12H16\"/><path stroke-linecap=\"round\" d=\"M8 8H16\"/><path stroke-linecap=\"round\" d=\"M8 16H13\"/></g>",
    "document": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z\"/><path stroke-linecap=\"round\" d=\"M8 10H16\"/><path stroke-linecap=\"round\" d=\"M8 14H13\"/></g>",
    "database": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path stroke-linecap=\"round\" d=\"M4 18V6\"/><path stroke-linecap=\"round\" d=\"M20 6V18\"/><path d=\"M12 10C16.4183 10 20 8.20914 20 6C20 3.79086 16.4183 2 12 2C7.58172 2 4 3.79086 4 6C4 8.20914 7.58172 10 12 10Z\"/><path d=\"M20 12C20 14.2091 16.4183 16 12 16C7.58172 16 4 14.2091 4 12\"/><path d=\"M20 18C20 20.2091 16.4183 22 12 22C7.58172 22 4 20.2091 4 18\"/></g>"
  };

  function iconSvg(name, opts) {
    opts = opts || {};
    var size = opts.width || 16;
    var color = opts.color || "currentColor";
    var cls = opts.className ? ' class="' + opts.className + '"' : "";
    var attrs = opts.attrs ? " " + opts.attrs : "";
    var inner = ICONS[name] || "";
    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" style="color:' + color + ';flex-shrink:0;display:inline-block;vertical-align:middle;"' + cls + attrs + ">" + inner + "</svg>";
  }

  // ---- GA4 event helper: safe no-op until gtag() is actually wired in <head> ----
  function trackEvent(name, params) {
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", name, params || {});
      }
    } catch (e) {
      /* never let analytics break the page */
    }
  }
  window.__trackEvent = trackEvent;

  // ---- render: header / hero / about / contact / footer basics ----
  function renderBasics() {
    setHref("nav-resume-link", data.links && data.links.resume);
    setHref("mobile-resume-link", data.links && data.links.resume);

    setText("hero-tagline", data.tagline);

    var since = 2021;
    var aboutText = (data.about || []).join(" ");
    var sinceMatch = aboutText.match(/since (\d{4})/);
    if (sinceMatch) since = parseInt(sinceMatch[1], 10);
    setText("stat-since", String(since));

    setText("stat-projects", String((data.projects || []).length));

    var clientCompanies = {};
    (data.experience || []).forEach(function (exp) {
      if (exp.company && exp.company !== "Freelance Web Developer") {
        clientCompanies[exp.company] = true;
      }
    });
    var clientCount = Object.keys(clientCompanies).length;
    setText("stat-clients", clientCount ? clientCount + "+" : "—");

    var stackStrip = byId("stack-strip");
    if (stackStrip && Array.isArray(data.skills)) {
      var top = data.skills.slice(0, 7);
      stackStrip.innerHTML = top.map(function (s) { return "<span>" + escapeHtml(s) + "</span>"; }).join("");
    }

    var aboutContainer = byId("about-paragraphs");
    if (aboutContainer && Array.isArray(data.about)) {
      aboutContainer.innerHTML = data.about.map(function (p) { return "<p>" + escapeHtml(p) + "</p>"; }).join("");
    }

    var photo = byId("about-photo");
    if (photo && data.profileImage) photo.src = data.profileImage;
    setText("about-name", data.name);
    setText("about-title", data.title);

    setText("footer-credit", "© " + new Date().getFullYear() + " " + (data.name || ""));
    setHref("footer-github-link", data.links && data.links.github);
    setHref("footer-linkedin-link", data.links && data.links.linkedin);

    setHref("contact-github-link", data.links && data.links.github);
    setHref("contact-linkedin-link", data.links && data.links.linkedin);
    setHref("contact-resume-link", data.links && data.links.resume);
    setHref("contact-cv-link", data.links && data.links.cv);
    setText("contact-availability", data.availabilityNote);

    var emailLink = byId("contact-email-link");
    var emailText = byId("contact-email-text");
    if (emailLink && data.email) {
      emailLink.href = "mailto:" + data.email;
      if (emailText) emailText.textContent = data.email;
    }

    if (data.name || data.title) {
      document.title = (data.name ? data.name + " | " : "") + (data.title || "");
    }
  }

  // ---- render: skills ----
  var SKILL_GROUP_META = {
    "Languages & Core": {
      icon: "monitor-smartphone",
      description: "The languages I write day to day, across the browser and the server."
    },
    "Frameworks & Backend": {
      icon: "server-square",
      description: "Where the actual application logic and data layer live."
    },
    "Workflow, Integrations & Delivery": {
      icon: "settings",
      description: "Everything around the code — deployment, tracking, third-party APIs, and client handoff."
    }
  };

  function renderSkills() {
    var container = byId("skills-groups");
    if (!container || !Array.isArray(data.skillGroups)) return;
    container.innerHTML = data.skillGroups.map(function (group) {
      var meta = SKILL_GROUP_META[group.label] || { icon: "widget-5", description: "" };
      var pills = (group.items || []).map(function (item) {
        return '<span class="rounded-full border border-[#0B0B0C]/10 bg-white px-3 py-1 text-xs text-[#3C3C43]">' + escapeHtml(item) + "</span>";
      }).join("");
      return (
        '<div data-fade class="grid md:grid-cols-12 gap-4 py-7">' +
          '<div class="md:col-span-4 flex items-center gap-3">' +
            iconSvg(meta.icon, { width: 20, color: "#2B50F6" }) +
            '<h3 class="text-lg tracking-tight font-medium" style="font-family:\'Inter Tight\',sans-serif;">' + escapeHtml(group.label) + "</h3>" +
          "</div>" +
          '<p class="md:col-span-4 text-sm leading-relaxed text-[#63636B]">' + escapeHtml(meta.description) + "</p>" +
          '<div class="md:col-span-4 flex flex-wrap gap-2">' + pills + "</div>" +
        "</div>"
      );
    }).join("");
  }

  // ---- render: projects + "were you impressed?" engagement logic ----
  var impressedShown = false;
  var openedProjectIndexes = {};
  var IMPRESSED_THRESHOLD = 3; // distinct projects opened before the prompt can appear

  function renderProjects() {
    var container = byId("projects-grid");
    if (!container || !Array.isArray(data.projects)) return;

    container.innerHTML = data.projects.map(function (project, index) {
      var tags = (project.tech || []).slice(0, 4).map(function (t) {
        return '<span class="rounded-md bg-[#0B0B0C]/[.05] px-2 py-1 text-xs text-[#54545C]">' + escapeHtml(t) + "</span>";
      }).join("");

      var highlights = (project.highlights || []).map(function (h) {
        return (
          '<li class="flex gap-2">' +
            iconSvg("check-circle", { width: 16, color: "#2B50F6", className: "mt-0.5 shrink-0" }) +
            escapeHtml(h) +
          "</li>"
        );
      }).join("");

      var imageBlock = project.image
        ? (
          '<div class="relative overflow-hidden">' +
            '<img src="' + escapeHtml(project.image) + '" alt="Screenshot of ' + escapeHtml(project.name) + '" class="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" loading="lazy">' +
            '<span class="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs tracking-tight text-[#3C3C43]">' + escapeHtml(project.status || "") + "</span>" +
          "</div>"
        )
        : (
          '<div class="relative aspect-[16/10] w-full flex items-center justify-center" style="background:linear-gradient(150deg,rgba(43,80,246,.18),rgba(11,11,12,.06));">' +
            '<span class="rounded-full bg-white/90 px-3 py-1 text-xs tracking-tight text-[#3C3C43]">' + escapeHtml(project.status || "") + "</span>" +
          "</div>"
        );

      var links = "";
      if (isNonEmptyString(project.liveUrl)) {
        links += '<a href="' + escapeHtml(project.liveUrl) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs font-medium text-[#2B50F6] hover:opacity-70">Live ' + iconSvg('arrow-right-up', { width: 12 }) + '</a>';
      }
      if (isNonEmptyString(project.repoUrl)) {
        links += '<a href="' + escapeHtml(project.repoUrl) + '" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-xs font-medium text-[#2B50F6] hover:opacity-70">Code ' + iconSvg('arrow-right-up', { width: 12 }) + '</a>';
      }

      return (
        '<article data-tilt data-project-index="' + index + '" class="group rounded-[28px]" style="background:linear-gradient(150deg,rgba(43,80,246,.28),rgba(255,255,255,.15) 45%,rgba(11,11,12,.09));padding:1px;transform-style:preserve-3d;">' +
          '<div class="h-full overflow-hidden rounded-[27px]" style="background:rgba(255,255,255,.85);backdrop-filter:blur(14px);">' +
            imageBlock +
            '<div class="p-6">' +
              '<h3 class="text-xl tracking-tight font-medium" style="font-family:\'Inter Tight\',sans-serif;">' + escapeHtml(project.name) + "</h3>" +
              '<p class="mt-2 text-sm leading-relaxed text-[#63636B]">' + escapeHtml(project.summary || "") + "</p>" +
              '<div class="mt-4 flex flex-wrap gap-2">' + tags + "</div>" +
              (links ? '<div class="mt-4 flex items-center gap-4">' + links + "</div>" : "") +
              '<div data-detail class="mt-5 border-t border-[#0B0B0C]/8 pt-0 text-sm leading-relaxed text-[#54545C]">' +
                '<ul class="space-y-2 pt-5">' + highlights + "</ul>" +
              "</div>" +
              '<button data-open class="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#2B50F6] transition-opacity hover:opacity-70" aria-expanded="false">' +
                "<span data-label>Open case</span>" +
                iconSvg("alt-arrow-down", { width: 16, attrs: "data-chev" }) +
              "</button>" +
            "</div>" +
          "</div>" +
        "</article>"
      );
    }).join("");

    qsa("[data-open]", container).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var article = btn.closest("[data-project-index]");
        var detail = btn.parentElement.querySelector("[data-detail]");
        var chev = btn.querySelector("[data-chev]");
        var label = btn.querySelector("[data-label]");
        var willOpen = !detail.classList.contains("is-open");
        detail.classList.toggle("is-open", willOpen);
        if (chev) chev.classList.toggle("is-open", willOpen);
        if (label) label.textContent = willOpen ? "Close case" : "Open case";
        btn.setAttribute("aria-expanded", String(willOpen));

        if (willOpen && article) {
          registerProjectOpen(article.getAttribute("data-project-index"));
        }

        // The revealed detail content sits below this button, so on a tall
        // card the expansion can land entirely below the fold and look like
        // the click did nothing. Bring the button (and whatever just opened
        // above it) into view once the box has finished resizing.
        var reduceMotion = prefersReducedMotion();
        window.setTimeout(
          function () {
            btn.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
          },
          willOpen && !reduceMotion ? 360 : 0
        );
      });
    });
  }

  function registerProjectOpen(indexStr) {
    if (impressedShown) return;
    if (openedProjectIndexes[indexStr]) return;
    openedProjectIndexes[indexStr] = true;
    var distinctOpened = Object.keys(openedProjectIndexes).length;
    trackEvent("project_case_opened", { project_index: indexStr, distinct_opened: distinctOpened });

    if (distinctOpened >= IMPRESSED_THRESHOLD) {
      showImpressedPrompt();
    }
  }

  function showImpressedPrompt() {
    if (impressedShown) return;
    impressedShown = true;
    var el = byId("impressed-prompt");
    if (!el) return;
    el.classList.remove("hidden");
    if (!prefersReducedMotion()) {
      el.classList.add("is-hidden-state");
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.classList.remove("is-hidden-state"); });
      });
    }
    trackEvent("impressed_prompt_shown", {});
  }

  function wireImpressedPrompt() {
    var yesBtn = byId("impressed-yes");
    var dismissBtn = byId("impressed-dismiss");
    var promptEl = byId("impressed-prompt");

    if (yesBtn) {
      yesBtn.addEventListener("click", function () {
        trackEvent("impressed_prompt_yes", {});
        if (promptEl) promptEl.classList.add("hidden");
        var contact = byId("contact");
        if (contact) contact.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
      });
    }
    if (dismissBtn) {
      dismissBtn.addEventListener("click", function () {
        trackEvent("impressed_prompt_dismiss", {});
        if (promptEl) promptEl.classList.add("hidden");
      });
    }
  }

  // ---- render: experience timeline ----
  function renderExperience() {
    var container = byId("experience-list");
    if (!container || !Array.isArray(data.experience)) return;

    container.innerHTML = data.experience.map(function (exp, index) {
      var highlights = (exp.highlights || []).map(function (h) {
        return (
          '<li class="flex gap-2">' +
            iconSvg("check-circle", { width: 16, color: "#2B50F6", className: "mt-0.5 shrink-0" }) +
            escapeHtml(h) +
          "</li>"
        );
      }).join("");

      var isLast = index === data.experience.length - 1;

      return (
        '<div data-fade class="relative pl-10 ' + (isLast ? "" : "pb-10") + '">' +
          (isLast ? "" : '<span class="absolute left-[7px] top-6 bottom-0 w-px bg-[#0B0B0C]/10" aria-hidden="true"></span>') +
          '<span class="absolute left-0 top-1.5 grid h-[15px] w-[15px] place-items-center rounded-full" style="background:#2B50F6;box-shadow:0 0 0 4px rgba(43,80,246,.15);" aria-hidden="true"></span>' +
          '<div class="rounded-[24px]" style="background:linear-gradient(150deg,rgba(43,80,246,.22),rgba(255,255,255,.15) 45%,rgba(11,11,12,.08));padding:1px;">' +
            '<div class="rounded-[23px] p-6" style="background:rgba(255,255,255,.85);backdrop-filter:blur(12px);">' +
              '<div class="flex flex-wrap items-baseline justify-between gap-2">' +
                '<h3 class="text-lg tracking-tight font-medium" style="font-family:\'Inter Tight\',sans-serif;">' + escapeHtml(exp.role || "") + "</h3>" +
                '<span class="text-xs uppercase tracking-[.14em] text-[#8A8A92]">' + escapeHtml(exp.period || "") + "</span>" +
              "</div>" +
              '<p class="mt-1 text-sm font-medium text-[#2B50F6]">' + escapeHtml(exp.company || "") + "</p>" +
              '<ul class="mt-4 space-y-2 text-sm leading-relaxed text-[#54545C]">' + highlights + "</ul>" +
            "</div>" +
          "</div>" +
        "</div>"
      );
    }).join("");
  }

  // ---- interactions: mobile menu ----
  function wireMobileMenu() {
    var btn = byId("menuBtn");
    var menu = byId("mobileMenu");
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      var isOpen = !menu.classList.contains("hidden");
      menu.classList.toggle("hidden", isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
    qsa("a", menu).forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.add("hidden");
        btn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- interactions: hero 3D parallax ----
  function wireHeroParallax() {
    if (prefersReducedMotion()) return;
    var stage = byId("heroStage");
    var obj = byId("heroObject");
    if (!stage || !obj) return;

    stage.addEventListener("mousemove", function (e) {
      var rect = stage.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      obj.style.transform = "rotateY(" + (x * 10) + "deg) rotateX(" + (y * -10) + "deg)";
    });
    stage.addEventListener("mouseleave", function () {
      obj.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  }

  // ---- interactions: project tilt ----
  function wireProjectTilt() {
    if (prefersReducedMotion()) return;
    document.addEventListener("mousemove", function (e) {
      var target = e.target.closest && e.target.closest("[data-tilt]");
      if (!target) return;
      var rect = target.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width - 0.5;
      var y = (e.clientY - rect.top) / rect.height - 0.5;
      target.style.transform = "rotateY(" + (x * 4) + "deg) rotateX(" + (y * -4) + "deg)";
    });
    document.addEventListener("mouseout", function (e) {
      var target = e.target.closest && e.target.closest("[data-tilt]");
      if (target && !target.contains(e.relatedTarget)) {
        target.style.transform = "rotateY(0deg) rotateX(0deg)";
      }
    });
  }

  // ---- interactions: GSAP scroll reveals ----
  function wireScrollReveals() {
    if (typeof window.gsap === "undefined") return;
    if (prefersReducedMotion()) return;
    if (window.gsap.registerPlugin && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }

    qsa("[data-fade]").forEach(function (el) {
      window.gsap.fromTo(
        el,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true }
        }
      );
    });

    qsa("[data-split]").forEach(function (el) {
      window.gsap.fromTo(
        el,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true }
        }
      );
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderBasics();
    renderSkills();
    renderProjects();
    renderExperience();
    wireImpressedPrompt();
    wireMobileMenu();
    wireHeroParallax();
    wireProjectTilt();
    wireScrollReveals();
  });
})();
