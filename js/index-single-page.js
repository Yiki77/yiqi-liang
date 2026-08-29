
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


/* ================================================================
   Soft brush-stroke mouse trail
   ================================================================ */

(function () {
  const canvas = document.getElementById("cursorStrokeCanvas");
  if (!canvas) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarsePointer = window.matchMedia("(hover: none), (pointer: coarse)");

  if (reducedMotion.matches || coarsePointer.matches) {
    canvas.style.display = "none";
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;

  const points = [];
  const maxAge = 420;       // milliseconds: short, elegant trail
  const minDistance = 2.5;  // avoids excessive points
  let lastPoint = null;
  let rafId = null;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  function addPoint(x, y, time) {
    if (lastPoint) {
      const dx = x - lastPoint.x;
      const dy = y - lastPoint.y;
      const distance = Math.hypot(dx, dy);

      if (distance < minDistance) return;

      const dt = Math.max(1, time - lastPoint.time);
      const speed = distance / dt;

      // Slow movement feels more like a pressed brush; fast movement gets finer.
      const width = Math.max(1.5, Math.min(5.5, 5.2 - speed * 5.2));

      points.push({
        x,
        y,
        time,
        width
      });
    } else {
      points.push({
        x,
        y,
        time,
        width: 3.2
      });
    }

    lastPoint = { x, y, time };
  }

  function draw(now) {
    ctx.clearRect(0, 0, width, height);

    while (points.length && now - points[0].time > maxAge) {
      points.shift();
    }

    if (points.length > 1) {
      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];

        const age = now - p1.time;
        const life = Math.max(0, 1 - age / maxAge);

        if (life <= 0) continue;

        // Small spatial variation makes the line feel less like a perfect UI stroke.
        const wobbleX = Math.sin(i * 1.73) * 0.35;
        const wobbleY = Math.cos(i * 1.37) * 0.35;

        const mx = (p0.x + p1.x) * 0.5 + wobbleX;
        const my = (p0.y + p1.y) * 0.5 + wobbleY;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.quadraticCurveTo(mx, my, p1.x, p1.y);

        // Same family as the site/nav green, but translucent enough to stay academic.
        ctx.strokeStyle = `rgba(72, 115, 90, ${0.34 * life})`;
        ctx.lineWidth = p1.width * (0.72 + life * 0.28);
        ctx.stroke();
      }
    }

    if (points.length) {
      rafId = requestAnimationFrame(draw);
    } else {
      rafId = null;
    }
  }

  window.addEventListener("pointermove", function (event) {
    if (event.pointerType && event.pointerType !== "mouse") return;

    const now = performance.now();
    addPoint(event.clientX, event.clientY, now);

    if (!rafId) {
      rafId = requestAnimationFrame(draw);
    }
  }, { passive: true });

  window.addEventListener("pointerleave", function () {
    lastPoint = null;
  }, { passive: true });

  window.addEventListener("blur", function () {
    points.length = 0;
    lastPoint = null;
    ctx.clearRect(0, 0, width, height);
  });

  window.addEventListener("resize", resizeCanvas, { passive: true });

  resizeCanvas();
})();
