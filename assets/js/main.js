(function () {
  "use strict";

  var content = window.PORTFOLIO_CONTENT;

  if (!content) {
    console.error("PORTFOLIO_CONTENT is missing. Check assets/js/content.js.");
    return;
  }

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function byId(id) {
    return document.getElementById(id);
  }

  function qs(selector, parent) {
    return (parent || document).querySelector(selector);
  }

  function qsa(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  function setText(id, value, fallback) {
    var el = byId(id);
    if (!el) return;
    el.textContent = value || fallback || "";
  }

  function setVisible(el, isVisible) {
    if (!el) return;
    el.hidden = !isVisible;
    if (el.parentElement && el.parentElement.tagName === "LI") {
      el.parentElement.hidden = !isVisible;
    }
  }

  function setHref(id, href, options) {
    var el = byId(id);
    if (!el) return;

    var hideIfMissing = !options || options.hideIfMissing !== false;

    if (!href) {
      if (hideIfMissing) {
        setVisible(el, false);
      }
      return;
    }

    setVisible(el, true);
    el.setAttribute("href", href);
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function makeMailto(email) {
    return isNonEmptyString(email) ? "mailto:" + email : "";
  }

  function setEmailLink(id, email) {
    var el = byId(id);
    if (!el) return;
    if (!isNonEmptyString(email)) {
      setVisible(el, false);
      return;
    }
    setVisible(el, true);
    el.href = makeMailto(email);
    if (el.id === "about-email-link") {
      el.textContent = email;
    }
  }

  function setOptionalText(id, value, fallback) {
    var el = byId(id);
    if (!el) return;
    if (!isNonEmptyString(value)) {
      el.textContent = fallback || "";
      return;
    }
    el.textContent = value;
  }

  function renderHeroName(name) {
    var el = byId("hero-name");
    if (!el) return;

    var rawName = isNonEmptyString(name) ? name.trim() : "Kevin [Your Last Name]";
    var bracketMatch = rawName.match(/^(.*?)(\s\[[^\]]+\])$/);

    if (bracketMatch) {
      el.innerHTML =
        escapeHtml(bracketMatch[1]) +
        ' <span class="hero-name-accent">' +
        escapeHtml(bracketMatch[2].trim()) +
        "</span>";
      return;
    }

    var parts = rawName.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      el.textContent = rawName;
      return;
    }

    var last = parts.pop();
    el.innerHTML =
      escapeHtml(parts.join(" ")) +
      ' <span class="hero-name-accent">' +
      escapeHtml(last) +
      "</span>";
  }

  function setupTypedHeroText(data) {
    var target = byId("hero-typed-text");
    if (!target) return;

    var phrases = Array.isArray(data.typedRoles)
      ? data.typedRoles.filter(isNonEmptyString)
      : [];

    if (!phrases.length && isNonEmptyString(data.title)) {
      phrases = [data.title];
    }

    if (!phrases.length) {
      target.textContent = "Web Development";
      return;
    }

    if (prefersReducedMotion || phrases.length === 1) {
      target.textContent = phrases[0];
      return;
    }

    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;

    function tick() {
      var currentPhrase = phrases[phraseIndex];
      if (!currentPhrase) return;

      if (isDeleting) {
        charIndex = Math.max(0, charIndex - 1);
      } else {
        charIndex = Math.min(currentPhrase.length, charIndex + 1);
      }

      target.textContent = currentPhrase.slice(0, charIndex);

      var nextDelay = isDeleting ? 55 : 85;

      if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        nextDelay = 1100;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        nextDelay = 220;
      }

      window.setTimeout(tick, nextDelay);
    }

    target.textContent = "";
    window.setTimeout(tick, 300);
  }

  function renderAbout(aboutParagraphs) {
    var container = byId("about-copy");
    if (!container) return;

    var items = Array.isArray(aboutParagraphs) && aboutParagraphs.length
      ? aboutParagraphs
      : ["Add 2-3 short paragraphs here describing your experience and the kind of role you want next."];

    container.innerHTML = "";
    items.forEach(function (paragraph) {
      if (!isNonEmptyString(paragraph)) return;
      var p = document.createElement("p");
      p.textContent = paragraph;
      container.appendChild(p);
    });
  }

  function createChip(label, className) {
    var span = document.createElement("span");
    span.className = className || "skill-chip";
    span.textContent = label;
    return span;
  }

  function renderSkills(data) {
    var groupsContainer = byId("skills-groups");
    var listContainer = byId("skills-list");
    if (!groupsContainer || !listContainer) return;

    var skillGroups = Array.isArray(data.skillGroups) ? data.skillGroups : [];
    var flatSkills = Array.isArray(data.skills) ? data.skills : [];

    groupsContainer.innerHTML = "";
    listContainer.innerHTML = "";

    var hasValidGroups = skillGroups.some(function (group) {
      return group && isNonEmptyString(group.label) && Array.isArray(group.items) && group.items.length > 0;
    });

    if (hasValidGroups) {
      listContainer.hidden = true;
      groupsContainer.hidden = false;

      skillGroups.forEach(function (group) {
        if (!group || !isNonEmptyString(group.label) || !Array.isArray(group.items) || !group.items.length) {
          return;
        }

        var card = document.createElement("section");
        card.className = "skill-group reveal";
        card.setAttribute("aria-label", group.label);

        var heading = document.createElement("h3");
        heading.textContent = group.label;
        card.appendChild(heading);

        var row = document.createElement("div");
        row.className = "skill-chip-list";

        group.items.forEach(function (item) {
          if (!isNonEmptyString(item)) return;
          row.appendChild(createChip(item, "skill-chip"));
        });

        card.appendChild(row);
        groupsContainer.appendChild(card);
      });
      return;
    }

    groupsContainer.hidden = true;
    listContainer.hidden = false;
    listContainer.classList.add("reveal");

    flatSkills.forEach(function (skill) {
      if (!isNonEmptyString(skill)) return;
      listContainer.appendChild(createChip(skill, "skill-chip"));
    });
  }

  function buildProjectPlaceholder(projectName) {
    var div = document.createElement("div");
    div.className = "project-placeholder";
    div.setAttribute("aria-hidden", "true");
    div.textContent = projectName ? projectName + " Preview" : "Project Preview";
    return div;
  }

  function attachProjectMedia(mediaEl, project) {
    var hasImage = isNonEmptyString(project.image);
    if (!hasImage) {
      mediaEl.appendChild(buildProjectPlaceholder(project.name));
      return;
    }

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "project-media-trigger";
    trigger.setAttribute("aria-label", "Open larger preview for " + project.name);
    trigger.setAttribute("data-project-image-trigger", "");
    trigger.setAttribute("data-lightbox-src", project.image);
    trigger.setAttribute("data-lightbox-alt", project.name + " screenshot preview");
    trigger.setAttribute("data-lightbox-caption", project.name);

    var img = document.createElement("img");
    img.src = project.image;
    img.alt = project.name + " preview";
    img.loading = "lazy";
    img.width = 800;
    img.height = 500;

    img.addEventListener("error", function () {
      trigger.remove();
      mediaEl.appendChild(buildProjectPlaceholder(project.name));
    });

    var hint = document.createElement("span");
    hint.className = "project-media-zoom-hint";
    hint.textContent = "Tap to zoom";

    trigger.appendChild(img);
    trigger.appendChild(hint);
    mediaEl.appendChild(trigger);
  }

  function createExternalLink(label, href) {
    var link = document.createElement("a");
    link.className = "text-link";
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;
    return link;
  }

  function createProjectStatusBadge(statusText) {
    if (!isNonEmptyString(statusText)) return null;

    var badge = document.createElement("p");
    var lower = statusText.toLowerCase();
    var variant = "status-neutral";

    if (lower.indexOf("progress") !== -1) {
      variant = "status-progress";
    } else if (lower.indexOf("internal") !== -1 || lower.indexOf("private") !== -1) {
      variant = "status-private";
    } else if (lower.indexOf("finished") !== -1 || lower.indexOf("launch") !== -1 || lower.indexOf("live") !== -1) {
      variant = "status-finished";
    }

    badge.className = "project-status " + variant;
    badge.textContent = statusText;
    return badge;
  }

  function createProjectLinkNote(project) {
    var hasRepo = isNonEmptyString(project.repoUrl);
    var hasLive = isNonEmptyString(project.liveUrl);

    if (hasRepo || hasLive) return null;

    var status = isNonEmptyString(project.status) ? project.status.toLowerCase() : "";
    var message = "Link available on request.";

    if (status.indexOf("internal") !== -1 || status.indexOf("private") !== -1) {
      message = "Private/internal client work. Demo details available on request.";
    } else if (status.indexOf("progress") !== -1) {
      message = "In progress. Demo or walkthrough available on request.";
    } else if (status.indexOf("launch") !== -1) {
      message = "Pending launch. Public link will be added after release.";
    }

    var note = document.createElement("p");
    note.className = "project-link-note";
    note.textContent = message;
    return note;
  }

  function renderProjects(projects) {
    var grid = byId("projects-grid");
    if (!grid) return;

    grid.innerHTML = "";
    var items = Array.isArray(projects) ? projects.slice(0, 3) : [];

    items.forEach(function (project) {
      if (!project || !isNonEmptyString(project.name)) return;

      var card = document.createElement("article");
      card.className = "project-card reveal";

      var media = document.createElement("div");
      media.className = "project-media";
      attachProjectMedia(media, project);

      var body = document.createElement("div");
      body.className = "project-body";

      var statusBadge = createProjectStatusBadge(project.status);

      var heading = document.createElement("h3");
      heading.textContent = project.name;

      var summary = document.createElement("p");
      summary.className = "project-summary";
      summary.textContent = isNonEmptyString(project.summary)
        ? project.summary
        : "Add a short outcome-focused summary for this project.";

      var tags = document.createElement("div");
      tags.className = "tag-row";
      (Array.isArray(project.tech) ? project.tech : []).forEach(function (techItem) {
        if (!isNonEmptyString(techItem)) return;
        var tag = document.createElement("span");
        tag.className = "tag";
        tag.textContent = techItem;
        tags.appendChild(tag);
      });

      var highlights = document.createElement("ul");
      highlights.className = "project-highlights";
      var highlightItems = Array.isArray(project.highlights) && project.highlights.length
        ? project.highlights
        : ["Add 2-3 bullets describing impact, implementation, and ownership."];
      highlightItems.slice(0, 3).forEach(function (point) {
        if (!isNonEmptyString(point)) return;
        var li = document.createElement("li");
        li.textContent = point;
        highlights.appendChild(li);
      });

      var links = document.createElement("div");
      links.className = "project-links";
      if (isNonEmptyString(project.repoUrl)) {
        links.appendChild(createExternalLink("Code", project.repoUrl));
      }
      if (isNonEmptyString(project.liveUrl)) {
        links.appendChild(createExternalLink("Live", project.liveUrl));
      }

      var linkNote = createProjectLinkNote(project);

      if (statusBadge) {
        body.appendChild(statusBadge);
      }
      body.appendChild(heading);
      body.appendChild(summary);
      if (tags.childElementCount) {
        body.appendChild(tags);
      }
      if (highlights.childElementCount) {
        body.appendChild(highlights);
      }
      if (links.childElementCount) {
        body.appendChild(links);
      }
      if (linkNote) {
        body.appendChild(linkNote);
      }

      card.appendChild(media);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  function renderExperience(experience) {
    var section = byId("experience");
    var list = byId("experience-list");
    var navLink = byId("nav-experience-link");
    if (!section || !list) return;

    var items = Array.isArray(experience) ? experience : [];
    if (!items.length) {
      section.hidden = true;
      setVisible(navLink, false);
      list.innerHTML = "";
      return;
    }

    section.hidden = false;
    setVisible(navLink, true);
    list.innerHTML = "";

    items.forEach(function (item) {
      if (!item || !isNonEmptyString(item.company)) return;

      var article = document.createElement("article");
      article.className = "experience-item reveal";

      var header = document.createElement("div");
      header.className = "experience-item-header";

      var titleWrap = document.createElement("div");
      var title = document.createElement("h3");
      title.textContent = item.company;
      var role = document.createElement("p");
      role.className = "experience-role";
      role.textContent = isNonEmptyString(item.role) ? item.role : "Role";
      titleWrap.appendChild(title);
      titleWrap.appendChild(role);

      var period = document.createElement("p");
      period.className = "experience-period";
      period.textContent = isNonEmptyString(item.period) ? item.period : "";

      header.appendChild(titleWrap);
      header.appendChild(period);
      article.appendChild(header);

      var highlights = Array.isArray(item.highlights) ? item.highlights : [];
      if (highlights.length) {
        var ul = document.createElement("ul");
        ul.className = "experience-highlights";
        highlights.forEach(function (point) {
          if (!isNonEmptyString(point)) return;
          var li = document.createElement("li");
          li.textContent = point;
          ul.appendChild(li);
        });
        if (ul.childElementCount) {
          article.appendChild(ul);
        }
      }

      list.appendChild(article);
    });
  }

  function setupNav() {
    var toggle = qs("[data-nav-toggle]");
    var navList = qs("[data-nav-list]");
    var navLinks = qsa("[data-nav-link]");

    if (!toggle || !navList) return;

    function setOpen(nextOpen) {
      navList.classList.toggle("is-open", nextOpen);
      toggle.setAttribute("aria-expanded", String(nextOpen));
      document.body.classList.toggle("menu-open", nextOpen);
    }

    toggle.addEventListener("click", function () {
      var isOpen = navList.classList.contains("is-open");
      setOpen(!isOpen);
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 760) {
          setOpen(false);
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 760) {
        setOpen(false);
      }
    });
  }

  function setupActiveNav() {
    var navLinks = qsa(".nav-link[data-nav-link]");
    var navMap = {};

    navLinks.forEach(function (link) {
      if (!link.hash) return;
      navMap[link.hash.slice(1)] = link;
    });

    var sections = qsa("main [data-section]").filter(function (section) {
      return navMap[section.id];
    });

    if (!sections.length) return;

    function activate(id) {
      navLinks.forEach(function (link) {
        var isActive = link.hash === "#" + id;
        link.classList.toggle("is-active", isActive);
        if (isActive) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (entries) {
          var visible = entries
            .filter(function (entry) {
              return entry.isIntersecting;
            })
            .sort(function (a, b) {
              return b.intersectionRatio - a.intersectionRatio;
            });

          if (visible.length) {
            activate(visible[0].target.id);
          }
        },
        {
          rootMargin: "-25% 0px -55% 0px",
          threshold: [0.2, 0.5, 0.75]
        }
      );

      sections.forEach(function (section) {
        observer.observe(section);
      });
      return;
    }

    activate(sections[0].id);
  }

  function setupRevealAnimations() {
    var items = qsa(".reveal");
    if (!items.length) return;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12
      }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  function setupProjectImageLightbox() {
    var lightbox = byId("project-image-lightbox");
    var lightboxImage = byId("project-lightbox-image");
    var lightboxCaption = byId("project-lightbox-caption");
    var closeButton = byId("project-lightbox-close");
    var grid = byId("projects-grid");

    if (!lightbox || !lightboxImage || !lightboxCaption || !closeButton || !grid) {
      return;
    }

    var lastTrigger = null;

    function closeLightbox() {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      if (lastTrigger && lastTrigger.isConnected) {
        lastTrigger.focus();
      }
    }

    function openLightbox(trigger) {
      var src = trigger.getAttribute("data-lightbox-src");
      if (!isNonEmptyString(src)) return;

      lastTrigger = trigger;
      lightboxImage.src = src;
      lightboxImage.alt = trigger.getAttribute("data-lightbox-alt") || "Project screenshot preview";
      lightboxCaption.textContent = trigger.getAttribute("data-lightbox-caption") || "";
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      closeButton.focus();
    }

    grid.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-project-image-trigger]");
      if (!trigger) return;
      openLightbox(trigger);
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target.hasAttribute("data-lightbox-close")) {
        closeLightbox();
      }
    });

    closeButton.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !lightbox.hidden) {
        closeLightbox();
      }
    });
  }

  function populateStaticFields(data) {
    setText("brand-name", data.name || "Kevin Portfolio");
    setText(
      "hero-tagline",
      data.tagline,
      "I build reliable web applications and tools with a focus on usability and maintainable code."
    );
    setText("hero-focus", data.focus, "Building user-facing applications and backend integrations.");
    setOptionalText("hero-location-pill", data.location, "United States");
    setOptionalText("about-role", data.title, "Software Engineer");
    setOptionalText("about-location", data.location, "United States");
    setOptionalText("availability-note", data.availabilityNote, "Open to opportunities.");
    setText("footer-name", data.name || "Kevin Portfolio");

    if (isNonEmptyString(data.title) && isNonEmptyString(data.name)) {
      document.title = data.name + " | " + data.title;
    }

    var metaTitle = qs('meta[property="og:title"]');
    if (metaTitle && isNonEmptyString(document.title)) {
      metaTitle.setAttribute("content", document.title);
    }

    var metaDescription = qs('meta[name="description"]');
    var ogDescription = qs('meta[property="og:description"]');
    if (isNonEmptyString(data.tagline)) {
      var desc = data.tagline;
      if (metaDescription) metaDescription.setAttribute("content", desc);
      if (ogDescription) ogDescription.setAttribute("content", desc);
    }
  }

  function populateLinks(data) {
    var links = data.links || {};
    var email = data.email || "";

    setHref("nav-resume-link", links.resume);
    setHref("hero-github-link", links.github);
    setHref("hero-linkedin-link", links.linkedin);
    setHref("hero-resume-link", links.resume);
    setHref("contact-github-link", links.github);
    setHref("contact-linkedin-link", links.linkedin);
    setHref("contact-resume-link", links.resume);

    setEmailLink("hero-email-link", email);
    setEmailLink("about-email-link", email);
    setEmailLink("contact-email-link", email);

    var profileImage = byId("profile-image");
    if (profileImage) {
      if (isNonEmptyString(data.profileImage)) {
        profileImage.src = data.profileImage;
        profileImage.alt = (data.name || "Portfolio owner") + " profile photo";
      } else {
        profileImage.src = "assets/img/profile-placeholder.png";
        profileImage.alt = "Placeholder profile portrait";
      }
    }

    var ogImage = qs('meta[property="og:image"]');
    if (ogImage) {
      var firstProject = Array.isArray(data.projects) && data.projects.length ? data.projects[0] : null;
      var ogSource = firstProject && isNonEmptyString(firstProject.image)
        ? firstProject.image
        : "assets/img/project-1-placeholder.svg";
      ogImage.setAttribute("content", ogSource);
    }

    var ogImageAlt = qs('meta[property="og:image:alt"]');
    if (ogImageAlt) {
      var imageAltProject = Array.isArray(data.projects) && data.projects.length ? data.projects[0] : null;
      var altText = imageAltProject && isNonEmptyString(imageAltProject.name)
        ? imageAltProject.name + " screenshot preview"
        : "Portfolio project screenshot preview";
      ogImageAlt.setAttribute("content", altText);
    }
  }

  function renderEverything() {
    populateStaticFields(content);
    renderHeroName(content.name);
    setupTypedHeroText(content);
    populateLinks(content);
    renderAbout(content.about);
    renderProjects(content.projects);
    renderSkills(content);
    renderExperience(content.experience);
    setupNav();
    setupActiveNav();
    setupRevealAnimations();
    setupProjectImageLightbox();

    setText("hero-availability-pill", content.availabilityPill, "Open to opportunities");
    setText("footer-year", String(new Date().getFullYear()));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderEverything);
  } else {
    renderEverything();
  }
})();
