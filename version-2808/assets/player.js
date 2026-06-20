function initMoviePlayer(containerId, streamUrl) {
  var box = document.getElementById(containerId);
  if (!box) {
    return;
  }
  var video = box.querySelector("video");
  var overlay = box.querySelector(".player-overlay");
  var started = false;

  function bind() {
    if (started) {
      return;
    }
    started = true;
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        play();
      });
    } else {
      video.src = streamUrl;
      play();
    }
  }

  function play() {
    if (overlay) {
      overlay.classList.add("hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  if (overlay) {
    overlay.addEventListener("click", bind);
  }
  video.addEventListener("click", function () {
    if (!started) {
      bind();
    }
  });
  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("hidden");
    }
  });
}
