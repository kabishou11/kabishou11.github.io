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

  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  var reduceMotion = false;
  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    reduceMotion = false;
  }

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
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
})();
