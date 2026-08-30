/* ================================================================
   Single-page navigation for the two-column academic layout

   Important layout detail:
   - About is the left column.
   - News begins at the top of the right column.
   - Because About and News share almost the same document Y position,
     News is intentionally NOT a navbar ScrollSpy target.
   - Navbar targets remain: About / Publications / Projects / Interest.
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

  function documentTop(element) {
    return element.getBoundingClientRect().top + window.scrollY;
  }

  function setActive(sectionId) {
    navLinks.forEach(link => {
      const active = link.getAttribute("href") === "#" + sectionId;
      link.classList.toggle("active", active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function scrollToElement(target, behavior) {
    if (!target) return;

    const top = Math.max(0, documentTop(target) - navHeight() - 8);

    window.scrollTo({
      top,
      behavior: behavior || (reducedMotion ? "auto" : "smooth")
    });
  }

  /* --------------------------------------------------------------
     Navbar click -> smooth scroll
     -------------------------------------------------------------- */
  navLinks.forEach(link => {
    link.addEventListener("click", function (event) {
      const selector = this.getAttribute("href");
      const target = selector ? document.querySelector(selector) : null;
      if (!target) return;

      event.preventDefault();
      scrollToElement(target);
      setActive(target.id);

      if (history.replaceState) {
        history.replaceState(null, "", "#" + target.id);
      }

      /* Close Bootstrap mobile menu after clicking. */
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
      scrollToElement(about);
      setActive("about");

      if (history.replaceState) {
        history.replaceState(null, "", "#about");
      }
    });
  }

  /* --------------------------------------------------------------
     ScrollSpy

     Before Publications reaches the reading marker, About remains
     active. This is the key fix for the two-column About + News top.
     -------------------------------------------------------------- */
  let ticking = false;

  function updateFromScroll() {
    if (!sections.length) {
      ticking = false;
      return;
    }

    const marker =
      window.scrollY +
      navHeight() +
      Math.min(150, window.innerHeight * 0.22);

    let current = sections[0]; // About by default.

    for (let i = 1; i < sections.length; i += 1) {
      if (documentTop(sections[i]) <= marker) {
        current = sections[i];
      } else {
        break;
      }
    }

    /* Ensure the final section can become active near page bottom. */
    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 6;

    if (atBottom) {
      current = sections[sections.length - 1] || current;
    }

    if (current) {
      setActive(current.id);
    }

    ticking = false;
  }

  function requestScrollSpyUpdate() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateFromScroll);
  }

  window.addEventListener("scroll", requestScrollSpyUpdate, {
    passive: true
  });

  window.addEventListener("resize", requestScrollSpyUpdate);

  /* --------------------------------------------------------------
     Initial hash alignment
     Supports #news as a direct URL even though News is not in navbar.
     -------------------------------------------------------------- */
  if (window.location.hash) {
    const target = document.querySelector(window.location.hash);

    if (target) {
      setTimeout(() => {
        scrollToElement(target, "auto");

        if (sections.includes(target)) {
          setActive(target.id);
        } else {
          /* #news belongs to the top About/News row. */
          setActive("about");
        }

        requestScrollSpyUpdate();
      }, 0);
    } else {
      updateFromScroll();
    }
  } else {
    updateFromScroll();
  }
});
