(function () {
    const toggle = document.querySelector('.menu-toggle');
    const panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('.hero-slide'));
        const dots = Array.from(document.querySelectorAll('.hero-dot'));
        let index = 0;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 5200);
        }
    }

    const filterInput = document.querySelector('.filter-input');
    const filterYear = document.querySelector('.filter-year');
    const cards = Array.from(document.querySelectorAll('.movie-card[data-text]'));
    const noResult = document.querySelector('.no-result');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }

        const keyword = normalize(filterInput ? filterInput.value : '');
        const year = filterYear ? filterYear.value : '';
        let visible = 0;

        cards.forEach(function (card) {
            const text = normalize(card.getAttribute('data-text'));
            const cardYear = card.getAttribute('data-year') || '';
            const matchedKeyword = !keyword || text.includes(keyword);
            const matchedYear = !year || cardYear === year;
            const matched = matchedKeyword && matchedYear;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });

        if (noResult) {
            noResult.classList.toggle('visible', visible === 0);
        }
    }

    if (filterInput || filterYear) {
        if (filterInput) {
            filterInput.addEventListener('input', filterCards);
        }
        if (filterYear) {
            filterYear.addEventListener('change', filterCards);
        }

        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q && filterInput) {
            filterInput.value = q;
        }
        filterCards();
    }
})();
