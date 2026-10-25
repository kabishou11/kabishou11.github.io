(function () {
  var year = document.getElementById("y");
  if (year) year.textContent = String(new Date().getFullYear());

  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var sections = ["home", "about", "work", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function setActive() {
    var y = window.scrollY + 120;
    var current = sections[0] && sections[0].id;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= y) current = sec.id;
    });
    links.forEach(function (a) {
      var href = a.getAttribute("href") || "";
      a.classList.toggle("is-active", href === "#" + current);
    });
  }

  function setScrolled() {
    document.body.classList.toggle("is-scrolled", window.scrollY > 48);
  }

  window.addEventListener("scroll", setActive, { passive: true });
  window.addEventListener("scroll", setScrolled, { passive: true });
  setActive();
  setScrolled();

  initHero();
  initReveals();

  function zeroTitleMotion() {
    return { x: 0, y: 0, rotateX: 0, rotateY: 0, rotateZ: 0 };
  }

  function setTitleMotionVariables(element, motion) {
    element.style.setProperty("--title-x", motion.x + "px");
    element.style.setProperty("--title-y", motion.y + "px");
    element.style.setProperty("--title-rotate-x", motion.rotateX + "deg");
    element.style.setProperty("--title-rotate-y", motion.rotateY + "deg");
    element.style.setProperty("--title-rotate-z", motion.rotateZ + "deg");

    element.style.setProperty("--title-middle-x", motion.x * 0.08 + "px");
    element.style.setProperty("--title-middle-y", motion.y * 0.08 + "px");
    element.style.setProperty(
      "--title-middle-rotate-x",
      motion.rotateX * 0.08 + "deg"
    );
    element.style.setProperty(
      "--title-middle-rotate-y",
      motion.rotateY * 0.08 + "deg"
    );
    element.style.setProperty(
      "--title-middle-rotate-z",
      motion.rotateZ * 0.08 + "deg"
    );

    element.style.setProperty("--title-signature-x", motion.x * -0.18 + "px");
    element.style.setProperty("--title-signature-y", motion.y * -0.18 + "px");
    element.style.setProperty(
      "--title-signature-rotate-x",
      motion.rotateX * -0.18 + "deg"
    );
    element.style.setProperty(
      "--title-signature-rotate-y",
      motion.rotateY * -0.18 + "deg"
    );
    element.style.setProperty(
      "--title-signature-rotate-z",
      motion.rotateZ * -0.18 + "deg"
    );
  }

  function getResponsiveOrbRadius(width, height) {
    var orbSafeGap = 10;
    var preferredRadius = Math.min(170, Math.max(width * 0.11, 115));
    var mobileRadiusLimit = width <= 768 ? width * 0.35 : preferredRadius;
    var boundaryRadiusLimit = Math.max(
      0,
      Math.min(width / 2 - orbSafeGap, height / 2 - orbSafeGap)
    );
    return Math.min(preferredRadius, mobileRadiusLimit, boundaryRadiusLimit);
  }

  function clampOrbTarget(point, width, height, radius) {
    var orbSafeGap = 10;
    var inset = radius + orbSafeGap;
    return {
      x:
        width <= inset * 2
          ? width / 2
          : Math.max(inset, Math.min(point.x, width - inset)),
      y:
        height <= inset * 2
          ? height / 2
          : Math.max(inset, Math.min(point.y, height - inset))
    };
  }

  function initHero() {
    var frame = document.getElementById("home");
    if (!frame) return;

    var flipCard = frame.querySelector(".hero-flip");
    var frontFace = frame.querySelector(".hero-front");
    var aboutFace = frame.querySelector(".hero-about");
    var maskLayer = frame.querySelector(".hero-lens");
    if (!flipCard || !frontFace || !aboutFace || !maskLayer) return;

    var titleSmoothing = 0.12;
    var orbSmoothing = 0.1;
    var orbSizeSmoothing = 0.16;
    var animationId = null;
    var target = { x: -300, y: -300 };
    var position = { x: -300, y: -300 };
    var radius = 0;
    var targetRadius = 0;
    var titleTarget = zeroTitleMotion();
    var titleMotion = zeroTitleMotion();
    var isPointerInside = false;
    var hasPointerPosition = false;
    var reducedMotion = false;
    var canFollowPointer = false;
    var isFlipped = false;

    function resetLensAndTilt() {
      isPointerInside = false;
      hasPointerPosition = false;
      titleTarget = zeroTitleMotion();
      titleMotion = zeroTitleMotion();
      radius = 0;
      targetRadius = 0;
      setTitleMotionVariables(frontFace, titleMotion);
      maskLayer.style.opacity = "0";
      maskLayer.style.setProperty("--lens-radius", "0px");
    }

    function updateInteractionPreferences() {
      reducedMotion = reducedMotionQuery.matches;
      canFollowPointer = pointerQuery.matches && !reducedMotionQuery.matches;
      if (!canFollowPointer) {
        resetLensAndTilt();
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      }
    }

    var reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    var pointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );
    updateInteractionPreferences();
    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener("change", updateInteractionPreferences);
      pointerQuery.addEventListener("change", updateInteractionPreferences);
    } else if (reducedMotionQuery.addListener) {
      reducedMotionQuery.addListener(updateInteractionPreferences);
      pointerQuery.addListener(updateInteractionPreferences);
    }

    function drawMotion() {
      if (reducedMotion || !canFollowPointer) {
        setTitleMotionVariables(frontFace, zeroTitleMotion());
        maskLayer.style.opacity = "0";
        maskLayer.style.setProperty("--lens-radius", "0px");
        animationId = null;
        return;
      }

      var nextTargetRadius = isPointerInside ? targetRadius : 0;

      position.x += (target.x - position.x) * orbSmoothing;
      position.y += (target.y - position.y) * orbSmoothing;
      radius += (nextTargetRadius - radius) * orbSizeSmoothing;

      titleMotion.x += (titleTarget.x - titleMotion.x) * titleSmoothing;
      titleMotion.y += (titleTarget.y - titleMotion.y) * titleSmoothing;
      titleMotion.rotateX +=
        (titleTarget.rotateX - titleMotion.rotateX) * titleSmoothing;
      titleMotion.rotateY +=
        (titleTarget.rotateY - titleMotion.rotateY) * titleSmoothing;
      titleMotion.rotateZ +=
        (titleTarget.rotateZ - titleMotion.rotateZ) * titleSmoothing;

      setTitleMotionVariables(frontFace, titleMotion);
      maskLayer.style.setProperty("--lens-x", position.x + "px");
      maskLayer.style.setProperty("--lens-y", position.y + "px");
      maskLayer.style.setProperty("--lens-radius", Math.max(radius, 0) + "px");

      var stillMoving =
        Math.abs(target.x - position.x) > 0.2 ||
        Math.abs(target.y - position.y) > 0.2 ||
        Math.abs(nextTargetRadius - radius) > 0.2 ||
        Math.abs(titleTarget.x - titleMotion.x) > 0.02 ||
        Math.abs(titleTarget.y - titleMotion.y) > 0.02 ||
        Math.abs(titleTarget.rotateX - titleMotion.rotateX) > 0.02 ||
        Math.abs(titleTarget.rotateY - titleMotion.rotateY) > 0.02 ||
        Math.abs(titleTarget.rotateZ - titleMotion.rotateZ) > 0.02;

      if (stillMoving) {
        animationId = requestAnimationFrame(drawMotion);
      } else {
        if (!isPointerInside) {
          maskLayer.style.setProperty("--lens-radius", "0px");
        }
        animationId = null;
      }
    }

    function handlePointerMove(event) {
      if (
        isFlipped ||
        event.pointerType === "touch" ||
        !canFollowPointer ||
        reducedMotion
      ) {
        return;
      }

      var bounds = frame.getBoundingClientRect();
      var pointerPoint = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      };
      var nextRadius = getResponsiveOrbRadius(bounds.width, bounds.height);
      var nextPoint = clampOrbTarget(
        pointerPoint,
        bounds.width,
        bounds.height,
        nextRadius
      );
      var normalizedX = Math.max(
        -1,
        Math.min(1, (pointerPoint.x / bounds.width - 0.5) * 2)
      );
      var normalizedY = Math.max(
        -1,
        Math.min(1, (pointerPoint.y / bounds.height - 0.5) * 2)
      );

      if (!hasPointerPosition) {
        position = { x: nextPoint.x, y: nextPoint.y };
        radius = 0;
        hasPointerPosition = true;
      }

      target = nextPoint;
      targetRadius = nextRadius;
      titleTarget = {
        x: normalizedX * 10,
        y: normalizedY * 8,
        rotateX: normalizedY * 8,
        rotateY: normalizedX * -11,
        rotateZ: normalizedX * -4.2
      };
      isPointerInside = true;
      maskLayer.style.opacity = "1";

      if (animationId === null) {
        animationId = requestAnimationFrame(drawMotion);
      }
    }

    function handlePointerLeave() {
      isPointerInside = false;
      hasPointerPosition = false;
      titleTarget = zeroTitleMotion();
      maskLayer.style.opacity = "0";
      if (animationId === null) {
        animationId = requestAnimationFrame(drawMotion);
      }
    }

    function syncHeroChrome() {
      var covering = frame.getBoundingClientRect().bottom > 88;
      document.body.classList.toggle("hero-flipped", isFlipped && covering);
    }

    function toggleAbout() {
      isFlipped = !isFlipped;
      flipCard.classList.toggle("is-flipped", isFlipped);
      syncHeroChrome();
      frame.setAttribute("aria-pressed", isFlipped ? "true" : "false");
      frame.setAttribute(
        "aria-label",
        isFlipped ? "Return to Peter Zhu home" : "View about Peter Zhu"
      );
      if (isFlipped) {
        frontFace.setAttribute("inert", "");
        aboutFace.removeAttribute("inert");
        resetLensAndTilt();
        if (animationId !== null) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      } else {
        aboutFace.setAttribute("inert", "");
        frontFace.removeAttribute("inert");
      }
    }

    window.addEventListener("scroll", syncHeroChrome, { passive: true });
    window.addEventListener("resize", syncHeroChrome);
    syncHeroChrome();

    frame.addEventListener("pointermove", handlePointerMove);
    frame.addEventListener("pointerleave", handlePointerLeave);
    frame.addEventListener("click", function (event) {
      if (event.target.closest("a[href]")) return;
      toggleAbout();
    });
    frame.addEventListener("keydown", function (event) {
      if (event.target && event.target.closest && event.target.closest("a[href]")) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleAbout();
      }
    });

    Array.prototype.forEach.call(
      document.querySelectorAll('a[href="#home"]'),
      function (link) {
        link.addEventListener("click", function () {
          if (isFlipped) toggleAbout();
        });
      }
    );
  }

  function initReveals() {
    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      reduceMotion = false;
    }

    var revealEls = Array.prototype.slice.call(
      document.querySelectorAll(".reveal")
    );
    if (!revealEls.length) return;

    function showAll() {
      revealEls.forEach(function (el) {
        el.classList.add("is-in");
        el.classList.remove("is-waiting", "can-motion");
      });
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      showAll();
      return;
    }

    var io;
    try {
      io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            el.classList.add("is-in");
            el.classList.remove("is-waiting");
            io.unobserve(el);
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
      );
    } catch (err) {
      showAll();
      return;
    }

    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92) {
        el.classList.add("is-in");
      } else {
        el.classList.add("is-waiting");
      }
    });

    requestAnimationFrame(function () {
      revealEls.forEach(function (el) {
        if (!el.classList.contains("is-waiting")) return;
        el.classList.add("can-motion");
        io.observe(el);
      });
    });
  }
})();
