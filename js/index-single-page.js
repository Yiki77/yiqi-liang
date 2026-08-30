/* ================================================================
   Single-page navigation + publication filters
   1. Click nav item -> smooth-scroll to its section
   2. Manual scrolling -> active nav item follows the current section
   3. Publication pills filter the publication list
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

  function scrollToSection(target, behavior) {
    const top = documentTop(target) - navHeight() + 1;
    window.scrollTo({
      top,
      behavior: behavior || (reducedMotion ? "auto" : "smooth")
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", function (event) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      scrollToSection(target);
      setActive(target.id);

      if (history.replaceState) {
        history.replaceState(null, "", "#" + target.id);
      }

      if (window.jQuery && jQuery("#navbarResponsive").hasClass("show")) {
        jQuery("#navbarResponsive").collapse("hide");
      }
    });
  });

  const brand = document.querySelector("#mainNav .navbar-brand");
  if (brand) {
    brand.addEventListener("click", function (event) {
      const about = document.getElementById("about");
      if (!about) return;

      event.preventDefault();
      scrollToSection(about);
      setActive("about");

      if (history.replaceState) {
        history.replaceState(null, "", "#about");
      }
    });
  }

  let ticking = false;

  function updateFromScroll() {
    const marker =
      window.scrollY +
      navHeight() +
      Math.min(180, window.innerHeight * 0.26);

    let current = sections[0];

    sections.forEach(section => {
      if (documentTop(section) <= marker) {
        current = section;
      }
    });

    if (
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4
    ) {
      current = sections[sections.length - 1] || current;
    }

    if (current) setActive(current.id);
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(updateFromScroll);
        ticking = true;
      }
    },
    { passive: true }
  );

  window.addEventListener("resize", updateFromScroll);
  updateFromScroll();

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(() => {
        scrollToSection(target, "auto");
        if (sections.includes(target)) {
          setActive(target.id);
        }
      }, 0);
    }
  }

  /* Publication filters */
  const filterButtons = Array.from(
    document.querySelectorAll(".publication-filter")
  );
  const publicationRows = Array.from(
    document.querySelectorAll(".publication-row")
  );

  function applyPublicationFilter(filter) {
    publicationRows.forEach(row => {
      const category = row.getAttribute("data-category");
      const visible = filter === "all" || category === filter;
      row.classList.toggle("is-hidden", !visible);
    });

    filterButtons.forEach(button => {
      const isActive = button.getAttribute("data-filter") === filter;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", function () {
      applyPublicationFilter(this.getAttribute("data-filter"));
    });
  });

  applyPublicationFilter("all");
});
