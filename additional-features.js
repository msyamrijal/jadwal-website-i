
// Fitur untuk membersihkan semua filter
document.addEventListener('DOMContentLoaded', () => {
    // Cari tombol hapus filter
    const clearFiltersButton = document.getElementById('clear-filters');
    if (clearFiltersButton) {
        clearFiltersButton.addEventListener('click', () => {
            // Reset semua filter ke nilai default
            document.getElementById('filter-institusi').value = '';
            document.getElementById('filter-mapel').value = '';
            document.getElementById('filter-peserta').value = '';
            document.getElementById('jadwal-search-results').innerHTML = '';

            // Terapkan filter yang sudah dibersihkan
            applyFilters();

            // Tampilkan notifikasi bahwa filter telah dibersihkan
            showNotification('Semua filter telah dihapus');
        });
    }

    // Fitur untuk toggle tampilan (tabel/kalender)
    const viewToggleButton = document.getElementById('view-toggle');
    if (viewToggleButton) {
        let isTableView = true;

        viewToggleButton.addEventListener('click', () => {
            isTableView = !isTableView;
            const viewText = viewToggleButton.querySelector('.view-text');

            if (isTableView) {
                viewText.textContent = 'Tampilan Tabel';
                showNotification('Beralih ke tampilan tabel');
                // Di sini Anda dapat menambahkan logika untuk menampilkan tampilan tabel
                // Misalnya dengan menampilkan elemen dengan ID 'table-section' dan menyembunyikan elemen kalender
            } else {
                viewText.textContent = 'Tampilan Kalender';
                showNotification('Beralih ke tampilan kalender');
                // Di sini Anda dapat menambahkan logika untuk menampilkan tampilan kalender
                // Misalnya dengan menampilkan elemen kalender dan menyembunyikan tabel
            }
        });
    }

    // Fungsi untuk menampilkan notifikasi
    function showNotification(message, duration = 3000) {
        const notification = document.getElementById('notification');
        const notificationMessage = notification.querySelector('.notification-message');

        // Set pesan notifikasi
        notificationMessage.textContent = message;

        // Tampilkan notifikasi
        notification.style.display = 'block';

        // Sembunyikan notifikasi setelah durasi tertentu
        setTimeout(() => {
            notification.style.display = 'none';
        }, duration);
    }

    // Fitur untuk animasi scroll yang lebih halus
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Fitur untuk menambahkan efek parallax pada header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;

        header.style.transform = `translateY(${parallax}px)`;
    });

    // Fitur untuk keyboard navigation yang lebih baik
    document.addEventListener('keydown', (e) => {
        // Tekan Esc untuk menutup menu dropdown atau hasil pencarian
        if (e.key === 'Escape') {
            const searchResults = document.getElementById('jadwal-search-results');
            if (searchResults && searchResults.style.display !== 'none') {
                searchResults.innerHTML = '';
                return;
            }

            const exportMenu = document.querySelector('.export-menu');
            if (exportMenu && exportMenu.style.display !== 'none') {
                exportMenu.style.display = 'none';
                return;
            }
        }

        // Tekan Ctrl/Cmd + K untuk fokus pada search input
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('filter-peserta');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    // Fitur untuk menambahkan loading state yang lebih informatif
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        // Tambahkan animasi yang lebih menarik untuk spinner
        const spinner = loadingIndicator.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.animation = 'spin 1s linear infinite, pulse 2s ease-in-out infinite alternate';
        }
    }

    // Fitur untuk menambahkan tombol kembali ke atas
    const scrollToTopButton = document.createElement('button');
    scrollToTopButton.className = 'scroll-to-top-button';
    scrollToTopButton.innerHTML = '↑';
    scrollToTopButton.setAttribute('aria-label', 'Kembali ke atas');
    scrollToTopButton.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--accent-color) 0%, var(--accent-light) 100%);
        color: var(--text-light);
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all var(--transition);
    `;

    document.body.appendChild(scrollToTopButton);

    // Tampilkan atau sembunyikan tombol kembali ke atas berdasarkan scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopButton.style.opacity = '1';
            scrollToTopButton.style.visibility = 'visible';
        } else {
            scrollToTopButton.style.opacity = '0';
            scrollToTopButton.style.visibility = 'hidden';
        }
    });

    // Kembali ke atas saat tombol diklik
    scrollToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Fitur untuk menambahkan animasi fade-in pada elemen saat muncul di viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Terapkan observer pada elemen yang ingin dianimasikan
    document.querySelectorAll('.table-section, .filter-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});
