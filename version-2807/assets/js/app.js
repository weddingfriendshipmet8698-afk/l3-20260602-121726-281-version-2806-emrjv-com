(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!toggle || !panel) return;
    toggle.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) {
        panel.removeAttribute('hidden');
        toggle.textContent = '×';
      } else {
        panel.setAttribute('hidden', '');
        toggle.textContent = '☰';
      }
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  function initHeroSlider() {
    var stage = document.querySelector('[data-hero-slider]');
    if (!stage) return;
    var slides = Array.prototype.slice.call(stage.querySelectorAll('.hero-slide'));
    var tabs = Array.prototype.slice.call(stage.querySelectorAll('.hero-tab'));
    if (!slides.length) return;
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      tabs.forEach(function (tab, i) {
        tab.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        show(Number(tab.getAttribute('data-hero-index')) || 0);
        start();
      });
    });

    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initMovieTools() {
    var grid = document.querySelector('[data-movie-grid]');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var input = document.querySelector('[data-local-search]');
    var sort = document.querySelector('[data-sort-select]');
    var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
    var empty = document.querySelector('[data-empty-state]');
    var currentFilter = '全部';
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) input.value = query;

    function includes(card, term) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      return !term || text.indexOf(term) !== -1;
    }

    function matchFilter(card, filter) {
      if (!filter || filter === '全部') return true;
      var text = (card.getAttribute('data-filter') || '').toLowerCase();
      return text.indexOf(filter.toLowerCase()) !== -1;
    }

    function value(card, key) {
      if (key === 'popular') return Number(card.getAttribute('data-views') || 0);
      if (key === 'likes') return Number(card.getAttribute('data-likes') || 0);
      if (key === 'year') return Number(String(card.getAttribute('data-year') || '').replace(/[^0-9]/g, '') || 0);
      if (key === 'title') return card.getAttribute('data-title') || '';
      return Number(card.getAttribute('data-year') || 0) + Number(card.getAttribute('data-views') || 0) / 1000000;
    }

    function apply() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var sortKey = sort ? sort.value : 'latest';
      var ordered = cards.slice().sort(function (a, b) {
        var av = value(a, sortKey);
        var bv = value(b, sortKey);
        if (sortKey === 'title') return String(av).localeCompare(String(bv), 'zh-Hans-CN');
        return bv - av;
      });
      var visible = 0;
      ordered.forEach(function (card) {
        grid.appendChild(card);
        var ok = includes(card, term) && matchFilter(card, currentFilter);
        card.classList.toggle('is-hidden', !ok);
        if (ok) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    if (input) input.addEventListener('input', apply);
    if (sort) sort.addEventListener('change', apply);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        currentFilter = chip.getAttribute('data-filter-chip') || '全部';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        apply();
      });
    });
    apply();
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    var minutes = Math.floor(seconds / 60);
    var rest = Math.floor(seconds % 60);
    return minutes + ':' + (rest < 10 ? '0' : '') + rest;
  }

  function initMoviePlayer(source) {
    var wrap = document.querySelector('.player-wrap');
    if (!wrap) return;
    var video = wrap.querySelector('video');
    var playButtons = Array.prototype.slice.call(wrap.querySelectorAll('[data-play-button]'));
    var muteButton = wrap.querySelector('[data-mute-button]');
    var fullButton = wrap.querySelector('[data-full-button]');
    var progressTrack = wrap.querySelector('[data-progress-track]');
    var progressBar = wrap.querySelector('[data-progress-bar]');
    var timeLabel = wrap.querySelector('[data-time-label]');
    var loaded = false;
    var hls = null;

    if (!video || !source) return;

    function loadSource() {
      if (loaded) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
      loaded = true;
    }

    function setPlaying(playing) {
      wrap.classList.toggle('is-playing', playing);
      playButtons.forEach(function (button) {
        button.textContent = playing ? '❚❚' : '▶';
      });
    }

    function togglePlay(event) {
      if (event) event.preventDefault();
      loadSource();
      if (video.paused) {
        video.play().catch(function () {});
      } else {
        video.pause();
      }
    }

    function updateProgress() {
      var duration = video.duration || 0;
      var current = video.currentTime || 0;
      var percent = duration ? Math.min(100, current / duration * 100) : 0;
      if (progressBar) progressBar.style.width = percent + '%';
      if (timeLabel) timeLabel.textContent = formatTime(current) + ' / ' + formatTime(duration);
    }

    playButtons.forEach(function (button) {
      button.addEventListener('click', togglePlay);
    });

    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () { setPlaying(true); });
    video.addEventListener('pause', function () { setPlaying(false); });
    video.addEventListener('ended', function () { setPlaying(false); });
    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateProgress);

    if (muteButton) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '🔇' : '🔊';
      });
    }

    if (fullButton) {
      fullButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (wrap.requestFullscreen) {
          wrap.requestFullscreen();
        }
      });
    }

    if (progressTrack) {
      progressTrack.addEventListener('click', function (event) {
        var box = progressTrack.getBoundingClientRect();
        var ratio = (event.clientX - box.left) / box.width;
        if (video.duration) video.currentTime = Math.max(0, Math.min(1, ratio)) * video.duration;
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) hls.destroy();
    });
  }

  window.initMoviePlayer = initMoviePlayer;

  ready(function () {
    initMobileMenu();
    initHeroSlider();
    initMovieTools();
  });
})();
