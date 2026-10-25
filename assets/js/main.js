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
})();
