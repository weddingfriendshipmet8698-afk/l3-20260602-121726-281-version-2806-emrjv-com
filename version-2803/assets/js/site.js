(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.querySelector('[data-nav-links]');

    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        nav.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      function restart() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          restart();
        });
      });

      show(0);
      restart();
    }

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var category = panel.querySelector('[data-category-filter]');
      var year = panel.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

      function applyFilter() {
        var keyword = input ? input.value.trim().toLowerCase() : '';
        var categoryValue = category ? category.value : '';
        var yearValue = year ? year.value : '';

        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || '').toLowerCase();
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var visible = true;

          if (keyword && text.indexOf(keyword) === -1) {
            visible = false;
          }

          if (categoryValue && cardCategory !== categoryValue) {
            visible = false;
          }

          if (yearValue && cardYear !== yearValue) {
            visible = false;
          }

          card.style.display = visible ? '' : 'none';
        });
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      if (category) {
        category.addEventListener('change', applyFilter);
      }

      if (year) {
        year.addEventListener('change', applyFilter);
      }
    });
  });
})();
