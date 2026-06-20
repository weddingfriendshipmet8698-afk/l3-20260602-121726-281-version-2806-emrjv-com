(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    var video = document.querySelector('[data-player-video]');
    var start = document.querySelector('[data-player-start]');
    var overlay = document.querySelector('[data-player-overlay]');
    var status = document.querySelector('[data-player-status]');

    if (!video || !start) {
      return;
    }

    var source = video.getAttribute('data-src');
    var initialized = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function initializePlayer() {
      if (!source) {
        setStatus('播放源未配置。');
        return;
      }

      if (!initialized) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });

          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }

        initialized = true;
      }

      if (overlay) {
        overlay.classList.add('hidden');
      }

      setStatus('正在加载播放源，请稍候。');

      var playPromise = video.play();

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          setStatus('播放中。');
        }).catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放器播放。');
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }

    start.addEventListener('click', initializePlayer);
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
      setStatus('播放中。');
    });
  });
})();
