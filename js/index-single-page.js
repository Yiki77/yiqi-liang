/* ================================================================
   Yiqi Liang — single-page navigation + publication filters
   1. Click nav item -> smooth-scroll to its section
   2. Manual scrolling -> active nav item follows the current section
   3. Publications -> filter by Point Cloud / Sketching / HCI
   ================================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const nav = document.getElementById("mainNav");
  const navLinks = Array.from(document.querySelectorAll("#mainNav .section-nav"));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function navHeight() {
    return nav ? nav.getBoundingClientRect().height : 0;
  }

  function documentTop(element) {
    return element.getBoundingClientRect().top + window.pageYOffset;
  }

  function setActive(sectionId) {
    navLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + sectionId
      );
    });
  }

  function scrollToElement(target, behavior) {
    const top = documentTop(target) - navHeight() + 1;
    window.scrollTo({ top, behavior: behavior || (reducedMotion ? "auto" : "smooth") });
  }

  /* Click -> smooth scroll */
  navLinks.forEach(link => {
    link.addEventListener("click", function (event) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      scrollToElement(target);
      setActive(target.id);

      if (history.replaceState) {
        history.replaceState(null, "", "#" + target.id);
      }

      if (window.jQuery && jQuery("#navbarResponsive").hasClass("show")) {
        jQuery("#navbarResponsive").collapse("hide");
      }
    });
  });

  /* Brand -> About */
  const brand = document.querySelector("#mainNav .navbar-brand");
  if (brand) {
    brand.addEventListener("click", function (event) {
      const about = document.getElementById("about");
      if (!about) return;
      event.preventDefault();
      scrollToElement(about);
      setActive("about");
      if (history.replaceState) history.replaceState(null, "", "#about");
    });
  }

  /* ScrollSpy */
  let ticking = false;

  function updateFromScroll() {
    const marker = window.scrollY + navHeight() + Math.min(180, window.innerHeight * 0.26);
    let current = sections[0] || null;

    sections.forEach(section => {
      if (documentTop(section) <= marker) current = section;
    });

    if (current) setActive(current.id);
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(updateFromScroll);
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener("resize", updateFromScroll);
  updateFromScroll();

  /* Align hash target under the fixed nav on first load. News remains
     directly linkable even though it is not a navbar item. */
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        scrollToElement(target, "auto");
        if (sections.includes(target)) setActive(target.id);
      }, 0);
    }
  }

  /* Publication category filters */
  const filterButtons = Array.from(document.querySelectorAll(".publication-filter"));
  const publicationRows = Array.from(document.querySelectorAll(".publication-row[data-category]"));

  function applyPublicationFilter(filter) {
    publicationRows.forEach(row => {
      const visible = filter === "all" || row.dataset.category === filter;
      row.classList.toggle("is-filtered-out", !visible);
      row.setAttribute("aria-hidden", visible ? "false" : "true");
    });

    filterButtons.forEach(button => {
      const active = button.dataset.filter === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", function () {
      applyPublicationFilter(this.dataset.filter || "all");
    });
  });

  applyPublicationFilter("all");
});
