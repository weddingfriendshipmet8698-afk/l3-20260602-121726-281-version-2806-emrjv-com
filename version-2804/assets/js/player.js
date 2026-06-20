(function () {
  function startPlayer(box) {
    var video = box.querySelector('video');

    if (!video) {
      return;
    }

    var streamUrl = video.getAttribute('data-play');

    if (!streamUrl) {
      return;
    }

    function play() {
      var attempt;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.src) {
          video.src = streamUrl;
        }
        attempt = video.play();
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!video.hlsReady) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          video.hlsReady = true;
          video.hlsInstance = hls;
        }
        attempt = video.play();
      } else {
        if (!video.src) {
          video.src = streamUrl;
        }
        attempt = video.play();
      }

      box.classList.add('is-playing');

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    var button = box.querySelector('[data-play-button]');

    if (button) {
      button.addEventListener('click', play);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(startPlayer);
  });
})();
