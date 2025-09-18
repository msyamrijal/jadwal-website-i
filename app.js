// Variabel global untuk menyimpan event prompt instalasi
let deferredPrompt;

/**
 * Fungsi untuk mendaftarkan Service Worker.
 */
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker berhasil didaftarkan dengan scope:', registration.scope);

          // Listener untuk mendeteksi service worker baru yang sedang menunggu
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Tampilkan notifikasi pembaruan jika elemennya ada
                const updateNotification = document.getElementById('update-notification');
                if (updateNotification) {
                  updateNotification.style.display = 'block';
                  const updateButton = document.getElementById('update-button');
                  if (updateButton) {
                    updateButton.addEventListener('click', () => {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                    });
                  }
                }
              }
            });
          });
        })
        .catch(error => {
          console.error('Pendaftaran Service Worker gagal:', error);
        });

      // Listener untuk me-reload halaman setelah service worker baru aktif
      let refreshing;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        window.location.reload();
        refreshing = true;
      });
    });
  }
}

/**
 * Fungsi untuk menangani logika instalasi PWA.
 */
function setupPWA() {
  const installButton = document.getElementById('install-button');
  // Sembunyikan tombol secara default
  installButton.style.display = 'none';

  window.addEventListener('beforeinstallprompt', (e) => {
    // Mencegah browser menampilkan prompt instalasi default
    e.preventDefault();
    // Simpan event agar bisa dipicu nanti.
    deferredPrompt = e;
    // Tampilkan tombol instalasi kustom kita
    installButton.style.display = 'block';
  });

  installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    // Tampilkan prompt instalasi
    deferredPrompt.prompt();
    // Tunggu pengguna merespons
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Respons pengguna: ${outcome}`);
    // Event hanya bisa digunakan sekali, jadi kita reset
    deferredPrompt = null;
    // Sembunyikan tombol setelah prompt ditampilkan
    installButton.style.display = 'none';
  });
}