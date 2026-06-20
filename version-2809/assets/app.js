(function () {
  function select(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function setupMenu() {
    var button = select('.menu-toggle');
    var panel = select('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupPageFilters() {
    selectAll('[data-filter-panel]').forEach(function (panel) {
      var root = panel.parentElement;
      var grid = select('[data-filter-grid]', root);
      var empty = select('.empty-state', root);
      var input = select('.page-filter', panel);
      var year = select('.year-filter', panel);
      var region = select('.region-filter', panel);
      if (!grid) {
        return;
      }
      var cards = selectAll('.movie-card', grid);
      var apply = function () {
        var query = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var regionValue = normalize(region && region.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(' '));
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesYear = !yearValue || normalize(card.dataset.year) === yearValue;
          var matchesRegion = !regionValue || normalize(card.dataset.region) === regionValue;
          var show = matchesQuery && matchesYear && matchesRegion;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      };
      [input, year, region].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayer() {
    selectAll('.player-shell').forEach(function (shell) {
      var video = select('video', shell);
      var overlay = select('.player-overlay', shell);
      var source = shell.getAttribute('data-player-source');
      var prepared = false;
      if (!video || !source) {
        return;
      }
      var prepare = function () {
        if (prepared) {
          return;
        }
        prepared = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      };
      var play = function () {
        prepare();
        shell.classList.add('is-playing');
        video.controls = true;
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function () {
            shell.classList.remove('is-playing');
          });
        }
      };
      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
    });
  }

  function cardTemplate(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card" data-title="' + escapeHtml(movie.title) + '" data-region="' + escapeHtml(movie.region) + '" data-year="' + escapeHtml(movie.year) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(movie.tags.join(' ')) + '">',
      '<a class="movie-poster" href="' + movie.url + '">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="poster-badge">' + escapeHtml(movie.year) + '</span>',
      '<span class="poster-type">' + escapeHtml(movie.type) + '</span>',
      '</a>',
      '<div class="movie-card-body">',
      '<a class="movie-card-title" href="' + movie.url + '">' + escapeHtml(movie.title) + '</a>',
      '<p>' + escapeHtml(movie.description) + '</p>',
      '<div class="movie-meta-row"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '<div class="movie-tags">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setupSearchPage() {
    var results = select('#search-results');
    if (!results || !window.MOVIE_DATA) {
      return;
    }
    var input = select('.search-live-input');
    var category = select('.search-category');
    var year = select('.search-year');
    var empty = select('#search-empty');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var years = Array.from(new Set(window.MOVIE_DATA.map(function (movie) {
      return movie.year;
    }).filter(Boolean))).sort().reverse();
    years.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      year.appendChild(option);
    });
    if (input) {
      input.value = initialQuery;
    }
    var render = function () {
      var query = normalize(input && input.value);
      var categoryValue = normalize(category && category.value);
      var yearValue = normalize(year && year.value);
      var matches = window.MOVIE_DATA.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          movie.tags.join(' '),
          movie.description
        ].join(' '));
        var okQuery = !query || haystack.indexOf(query) !== -1;
        var okCategory = !categoryValue || normalize(movie.category) === categoryValue;
        var okYear = !yearValue || normalize(movie.year) === yearValue;
        return okQuery && okCategory && okYear;
      }).slice(0, 96);
      results.innerHTML = matches.map(cardTemplate).join('');
      if (empty) {
        empty.hidden = matches.length !== 0;
      }
    };
    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupPageFilters();
    setupPlayer();
    setupSearchPage();
  });
}());
