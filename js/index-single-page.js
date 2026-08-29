
/* ================================================================
   Single-page navigation:
   1. Click nav item -> smooth-scroll to its section
   2. Manual scrolling -> active nav item follows the current section
   ================================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const nav = document.getElementById("mainNav");
  const navLinks = Array.from(document.querySelectorAll("#mainNav .section-nav"));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function navHeight() {
    return nav ? nav.getBoundingClientRect().height : 0;
  }

  function setActive(sectionId) {
    navLinks.forEach(link => {
      link.classList.toggle(
        "active",
        link.getAttribute("href") === "#" + sectionId
      );
    });
  }

  /* Click -> smooth scroll */
  navLinks.forEach(link => {
    link.addEventListener("click", function (event) {
      const target = document.querySelector(this.getAttribute("href"));
      if (!target) return;

      event.preventDefault();

      const top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight() +
        1;

      window.scrollTo({
        top: top,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth"
      });

      setActive(target.id);

      if (history.replaceState) {
        history.replaceState(null, "", "#" + target.id);
      }

      /* Close Bootstrap mobile menu after clicking */
      if (window.jQuery && jQuery("#navbarResponsive").hasClass("show")) {
        jQuery("#navbarResponsive").collapse("hide");
      }
    });
  });

  /* Brand goes to About */
  const brand = document.querySelector("#mainNav .navbar-brand");
  if (brand) {
    brand.addEventListener("click", function (event) {
      const about = document.getElementById("about");
      if (!about) return;
      event.preventDefault();
      const top =
        about.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight() +
        1;
      window.scrollTo({ top, behavior: "smooth" });
      setActive("about");
      if (history.replaceState) history.replaceState(null, "", "#about");
    });
  }

  /*
   * ScrollSpy.
   * We intentionally use a midpoint slightly below the navigation bar,
   * so the active item changes naturally as a new section enters view.
   */
  let ticking = false;

  function updateFromScroll() {
    const marker = window.scrollY + navHeight() + Math.min(180, window.innerHeight * 0.26);
    let current = sections[0];

    sections.forEach(section => {
      if (section.offsetTop <= marker) current = section;
    });

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

  /* If page was opened with #publications etc., align it under fixed nav. */
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target && sections.includes(target)) {
      setTimeout(() => {
        const top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          navHeight() +
          1;
        window.scrollTo({ top, behavior: "auto" });
      }, 0);
    }
  }
});
