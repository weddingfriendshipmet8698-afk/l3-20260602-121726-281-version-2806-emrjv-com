(function () {
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 6200);
    }
  }

  var url = new URL(window.location.href);
  var query = (url.searchParams.get("q") || "").trim().toLowerCase();
  var sortValue = url.searchParams.get("sort") || "desc";
  var pageInput = document.getElementById("searchPageInput");
  var filterInput = document.getElementById("inlineFilter");
  var sortSelect = document.getElementById("yearSort");
  var grid = document.querySelector("[data-filter-grid]");

  if (pageInput && query) {
    pageInput.value = query;
  }
  if (sortSelect) {
    sortSelect.value = sortValue === "asc" ? "asc" : "desc";
  }

  function normalize(text) {
    return (text || "").toString().toLowerCase();
  }

  function applyFilter() {
    if (!grid) {
      return;
    }
    var local = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var needle = [query, local].filter(Boolean);
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-year"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.textContent
      ].map(normalize).join(" ");
      var matched = needle.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
      card.classList.toggle("is-hidden", !matched);
    });
  }

  function applySort() {
    if (!grid || !sortSelect) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    cards.sort(function (a, b) {
      var ay = Number(a.getAttribute("data-year") || 0);
      var by = Number(b.getAttribute("data-year") || 0);
      return sortSelect.value === "asc" ? ay - by : by - ay;
    });
    cards.forEach(function (card) {
      grid.appendChild(card);
    });
  }

  if (filterInput) {
    filterInput.addEventListener("input", applyFilter);
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      applySort();
      applyFilter();
    });
  }
  applySort();
  applyFilter();
})();
