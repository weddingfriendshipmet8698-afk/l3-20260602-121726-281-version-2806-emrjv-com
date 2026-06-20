(function () {
    const box = document.querySelector('[data-player]');

    if (!box) {
        return;
    }

    const video = box.querySelector('video');
    const cover = box.querySelector('.play-cover');
    const button = box.querySelector('.play-cover button');
    const source = box.getAttribute('data-src');
    let loaded = false;

    function attach() {
        if (loaded || !video || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls();
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function play() {
        attach();
        if (cover) {
            cover.classList.add('is-hidden');
        }
        video.setAttribute('controls', 'controls');
        const started = video.play();
        if (started && typeof started.catch === 'function') {
            started.catch(function () {
                if (cover) {
                    cover.classList.remove('is-hidden');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', play);
    }

    if (cover) {
        cover.addEventListener('click', play);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    }
})();
