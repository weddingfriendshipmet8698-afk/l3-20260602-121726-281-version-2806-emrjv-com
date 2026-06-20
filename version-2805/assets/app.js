(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  var menuButton = qs('.menu-toggle');
  var mobileNav = qs('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      menuButton.classList.toggle('is-open');
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dot', hero);
    var prev = qs('.hero-prev', hero);
    var next = qs('.hero-next', hero);
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startHero() {
      stopHero();
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stopHero() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        startHero();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startHero();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startHero();
      });
    }

    hero.addEventListener('mouseenter', stopHero);
    hero.addEventListener('mouseleave', startHero);
    startHero();
  }

  qsa('[data-local-filter]').forEach(function (panel) {
    var input = qs('.local-filter-input', panel);
    var year = qs('.local-filter-year', panel);
    var grid = panel.nextElementSibling;
    var cards = grid ? qsa('.movie-card', grid) : [];

    function runFilter() {
      var text = normalize(input ? input.value : '');
      var selectedYear = year ? year.value : '';
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type')
        ].join(' '));
        var matchesText = !text || haystack.indexOf(text) >= 0;
        var matchesYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        card.hidden = !(matchesText && matchesYear);
      });
    }

    if (input) {
      input.addEventListener('input', runFilter);
    }
    if (year) {
      year.addEventListener('change', runFilter);
    }
  });

  function cardTemplate(item) {
    var tags = (item.tags || []).slice(0, 4).join(' ');
    return [
      '<a class="movie-card" href="' + item.url + '" data-title="' + escapeHtml(item.title) + '" data-tags="' + escapeHtml(tags) + '">',
      '<span class="poster-wrap">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '<span class="year-badge">' + escapeHtml(item.year) + '</span>',
      '</span>',
      '<span class="movie-card-body">',
      '<strong>' + escapeHtml(item.title) + '</strong>',
      '<span>' + escapeHtml(item.summary) + '</span>',
      '<em>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</em>',
      '</span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  var searchRoot = qs('[data-search-page]');
  if (searchRoot && window.MOVIE_SEARCH_INDEX) {
    var searchInput = qs('#site-search-input');
    var categorySelect = qs('#search-category');
    var yearSelect = qs('#search-year');
    var resetButton = qs('#search-reset');
    var results = qs('#search-results');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var years = Array.from(new Set(window.MOVIE_SEARCH_INDEX.map(function (item) {
      return item.year;
    }).filter(Boolean))).sort().reverse().slice(0, 24);

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearSelect.appendChild(option);
    });

    if (searchInput) {
      searchInput.value = initialQuery;
    }

    function runSearch() {
      var text = normalize(searchInput ? searchInput.value : '');
      var category = categorySelect ? categorySelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var source = window.MOVIE_SEARCH_INDEX.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.summary,
          item.region,
          item.type,
          item.category,
          (item.tags || []).join(' ')
        ].join(' '));
        var matchesText = !text || haystack.indexOf(text) >= 0;
        var matchesCategory = !category || item.category === category;
        var matchesYear = !year || item.year === year;
        return matchesText && matchesCategory && matchesYear;
      }).slice(0, 72);
      if (results) {
        results.innerHTML = source.map(cardTemplate).join('');
      }
    }

    if (searchInput) {
      searchInput.addEventListener('input', runSearch);
    }
    if (categorySelect) {
      categorySelect.addEventListener('change', runSearch);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', runSearch);
    }
    if (resetButton) {
      resetButton.addEventListener('click', function () {
        if (searchInput) {
          searchInput.value = '';
        }
        if (categorySelect) {
          categorySelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        runSearch();
      });
    }
    runSearch();
  }

  window.initMoviePlayer = function (streamUrl) {
    var video = qs('.movie-video');
    var coverButton = qs('.play-cover');
    if (!video || !streamUrl) {
      return;
    }

    var attached = false;
    var hlsInstance = null;

    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function setPlaying(isPlaying) {
      if (coverButton) {
        coverButton.classList.toggle('is-hidden', isPlaying);
      }
    }

    function play() {
      attach();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setPlaying(false);
        });
      }
    }

    attach();

    if (coverButton) {
      coverButton.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });

    video.addEventListener('play', function () {
      setPlaying(true);
    });

    video.addEventListener('pause', function () {
      setPlaying(false);
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
