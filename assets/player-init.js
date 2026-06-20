(function () {
    function showStatus(shell, message) {
        const status = shell.querySelector('[data-player-status]');
        if (status) {
            status.textContent = message;
        }
    }

    function startPlayer(shell) {
        const video = shell.querySelector('video[data-video-src]');
        const cover = shell.querySelector('[data-player-cover]');

        if (!video) {
            return;
        }

        const source = video.getAttribute('data-video-src');
        if (!source) {
            showStatus(shell, '当前影片暂未配置播放源');
            return;
        }

        if (cover) {
            cover.classList.add('is-hidden');
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {
                    showStatus(shell, '请再次点击播放按钮开始播放');
                });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    showStatus(shell, '播放源连接异常，请刷新页面后重试');
                }
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {
                    showStatus(shell, '请再次点击播放按钮开始播放');
                });
            }, { once: true });
            return;
        }

        showStatus(shell, '当前浏览器不支持 HLS 播放，请使用 Chrome、Edge 或 Safari 打开');
    }

    const players = document.querySelectorAll('[data-player]');
    players.forEach(function (shell) {
        const button = shell.querySelector('[data-player-button]');
        if (button) {
            button.addEventListener('click', function () {
                startPlayer(shell);
            });
        }
    });
})();
