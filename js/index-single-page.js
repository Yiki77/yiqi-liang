/* ================================================================
   Single-page navigation:
   1. Click nav item -> smooth-scroll to its section
   2. Manual scrolling -> active nav item follows the current section

   This version is safe for the new two-column layout, where
   News / Publications / Projects / Interest are nested in the
   right-hand content column.
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

  /* Important for nested sections: always calculate document Y. */
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

  /* Click -> smooth scroll */
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
      scrollToSection(about);
      setActive("about");

      if (history.replaceState) {
        history.replaceState(null, "", "#about");
      }
    });
  }

  /* ScrollSpy */
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

    /* Near the bottom, make sure the last section can become active. */
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
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

  /* Align #news / #publications / #projects etc. under fixed nav. */
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target && sections.includes(target)) {
      setTimeout(() => {
        scrollToSection(target, "auto");
        setActive(target.id);
      }, 0);
    }
  }
});
