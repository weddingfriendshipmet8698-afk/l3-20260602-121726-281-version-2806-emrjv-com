(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const mobileNav = document.querySelector('[data-mobile-nav]');

    if (navToggle && mobileNav) {
        navToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    const coverImages = document.querySelectorAll('img[data-cover]');
    coverImages.forEach(function (img) {
        img.addEventListener('error', function () {
            img.classList.add('image-missing');
            img.removeAttribute('src');
        });
    });

    const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
    let activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeSlide);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    const filterForm = document.querySelector('[data-filter-form]');
    const filterInput = document.querySelector('[data-filter-input]');
    const regionSelect = document.querySelector('[data-filter-region]');
    const yearSelect = document.querySelector('[data-filter-year]');
    const filterCards = Array.from(document.querySelectorAll('.filter-card'));
    const filterCount = document.querySelector('[data-filter-count]');
    const emptyState = document.querySelector('[data-empty-state]');

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function applyFilters() {
        if (!filterCards.length) {
            return;
        }

        const query = normalize(filterInput && filterInput.value);
        const region = normalize(regionSelect && regionSelect.value);
        const year = normalize(yearSelect && yearSelect.value);
        let visibleCount = 0;

        filterCards.forEach(function (card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.genre,
                card.dataset.year,
                card.dataset.category,
                card.textContent
            ].join(' '));
            const matchQuery = !query || haystack.indexOf(query) !== -1;
            const matchRegion = !region || normalize(card.dataset.region).indexOf(region) !== -1;
            const matchYear = !year || normalize(card.dataset.year) === year;
            const matched = matchQuery && matchRegion && matchYear;

            card.style.display = matched ? '' : 'none';
            if (matched) {
                visibleCount += 1;
            }
        });

        if (filterCount) {
            filterCount.textContent = '当前显示 ' + visibleCount + ' 部';
        }
        if (emptyState) {
            emptyState.classList.toggle('is-visible', visibleCount === 0);
        }
    }

    if (filterForm) {
        filterForm.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });
    }

    [filterInput, regionSelect, yearSelect].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('q');
    if (queryParam && filterInput) {
        filterInput.value = queryParam;
    }
    applyFilters();
})();
