(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        var joiner = target.indexOf("?") === -1 ? "?" : "&";
        window.location.href = target + joiner + "q=" + encodeURIComponent(value);
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase();
  }

  function setupCatalogFilters() {
    var input = document.querySelector("[data-live-search]");
    var typeFilter = document.querySelector("[data-filter-type]");
    var yearFilter = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length) {
      return;
    }
    function filter() {
      var query = normalize(input ? input.value : "");
      var typeValue = normalize(typeFilter ? typeFilter.value : "");
      var yearValue = normalize(yearFilter ? yearFilter.value : "");
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.dataset.tags
        ].join(" "));
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesType = !typeValue || normalize(card.dataset.type).indexOf(typeValue) !== -1;
        var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
        var showCard = matchesQuery && matchesType && matchesYear;
        card.style.display = showCard ? "" : "none";
        if (showCard) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }
    [input, typeFilter, yearFilter].forEach(function (control) {
      if (control) {
        control.addEventListener("input", filter);
        control.addEventListener("change", filter);
      }
    });
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q");
    if (initial && input) {
      input.value = initial;
    }
    filter();
  }

  ready(function () {
    setupNavigation();
    setupSearchForms();
    setupHero();
    setupCatalogFilters();
  });
})();
