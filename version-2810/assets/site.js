(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  });

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    var scope = panel.parentElement;
    var list = scope.querySelector('[data-filter-list]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('[data-filter-card]')) : [];
    var searchInput = panel.querySelector('[data-search-input]');
    var yearFilter = panel.querySelector('[data-year-filter]');
    var genreFilter = panel.querySelector('[data-genre-filter]');
    var resetButton = panel.querySelector('[data-reset-filter]');
    var emptyState = scope.querySelector('[data-empty-state]');

    function applyFilters() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      var genre = genreFilter ? genreFilter.value : '';
      var visibleCount = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardGenre = card.getAttribute('data-genre') || '';
        var matched = true;

        if (keyword && haystack.indexOf(keyword) === -1) {
          matched = false;
        }
        if (year && cardYear.indexOf(year) === -1) {
          matched = false;
        }
        if (genre && cardGenre.indexOf(genre) === -1) {
          matched = false;
        }

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visibleCount === 0);
      }
    }

    [searchInput, yearFilter, genreFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (yearFilter) {
          yearFilter.value = '';
        }
        if (genreFilter) {
          genreFilter.value = '';
        }
        applyFilters();
      });
    }
  });

  document.querySelectorAll('[data-stream]').forEach(function (box) {
    var button = box.querySelector('[data-play-button]');
    var video = box.querySelector('video');
    var status = box.querySelector('[data-play-status]');
    var stream = box.getAttribute('data-stream');
    var started = false;

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function startPlayback() {
      if (!video || !stream) {
        setStatus('线路暂不可用');
        return;
      }

      if (!started) {
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setStatus('点击画面继续播放');
            });
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {
              setStatus('点击画面继续播放');
            });
          }, { once: true });
        } else {
          setStatus('请更换浏览器播放');
          return;
        }
        started = true;
      }

      if (button) {
        button.classList.add('is-hidden');
      }
      setStatus('正在播放');
      video.play().catch(function () {
        setStatus('点击画面继续播放');
      });
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }
  });
})();
