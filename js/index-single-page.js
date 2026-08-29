/* ================================================================
   Yiqi Liang — Single-page navigation + subtle sketch interactions
   ================================================================ */

document.addEventListener("DOMContentLoaded", function () {
  const nav = document.getElementById("mainNav");
  const navLinks = Array.from(
    document.querySelectorAll("#mainNav .section-nav")
  );

  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

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

  /* --------------------------------------------------------------
     Click navigation -> smooth scroll
     -------------------------------------------------------------- */

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
        top,
        behavior: reducedMotion ? "auto" : "smooth"
      });

      setActive(target.id);

      if (history.replaceState) {
        history.replaceState(null, "", "#" + target.id);
      }

      if (
        window.jQuery &&
        jQuery("#navbarResponsive").hasClass("show")
      ) {
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

      const top =
        about.getBoundingClientRect().top +
        window.pageYOffset -
        navHeight() +
        1;

      window.scrollTo({
        top,
        behavior: reducedMotion ? "auto" : "smooth"
      });

      setActive("about");

      if (history.replaceState) {
        history.replaceState(null, "", "#about");
      }
    });
  }

  /* --------------------------------------------------------------
     ScrollSpy
     -------------------------------------------------------------- */

  let ticking = false;

  function updateFromScroll() {
    const marker =
      window.scrollY +
      navHeight() +
      Math.min(180, window.innerHeight * 0.26);

    let current = sections[0];

    sections.forEach(section => {
      if (section.offsetTop <= marker) {
        current = section;
      }
    });

    if (current) {
      setActive(current.id);
    }

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

  /* --------------------------------------------------------------
     Hash alignment on first load
     -------------------------------------------------------------- */

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);

    if (target && sections.includes(target)) {
      setTimeout(() => {
        const top =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          navHeight() +
          1;

        window.scrollTo({
          top,
          behavior: "auto"
        });
      }, 0);
    }
  }

  /* --------------------------------------------------------------
     Very subtle sketch-card press feedback.
     No cursor trail / no canvas drawing.
     -------------------------------------------------------------- */

  if (!reducedMotion) {
    const cards = document.querySelectorAll(".portfolio-card");

    cards.forEach(card => {
      card.addEventListener("pointerdown", () => {
        card.style.transition = "transform 90ms ease";
        card.style.transform = "translateY(1px) rotate(0.15deg)";
      });

      card.addEventListener("pointerup", () => {
        card.style.transition = "";
        card.style.transform = "";
      });

      card.addEventListener("pointerleave", () => {
        card.style.transition = "";
        card.style.transform = "";
      });
    });
  }
});
