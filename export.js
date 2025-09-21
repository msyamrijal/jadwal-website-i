
// Fungsi untuk mengekspor data jadwal ke CSV
function exportToCSV(data, filename = 'jadwal.csv') {
    if (!data || data.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }

    // Tentukan header CSV
    const headers = ['Tanggal', 'Mata Pelajaran', 'Institusi', 'Materi Diskusi'];

    // Tambahkan header peserta (maksimal 12 kolom)
    for (let i = 1; i <= 12; i++) {
        headers.push(`Peserta ${i}`);
    }

    // Buat konten CSV
    let csvContent = headers.join(',') + '\n';

    // Tambahkan data ke CSV
    data.forEach(row => {
        const rowData = [
            row.Tanggal || '',
            row['Mata_Pelajaran'] || '',
            row.Institusi || '',
            row['Materi Diskusi'] || ''
        ];

        // Tambahkan data peserta
        for (let i = 1; i <= 12; i++) {
            const pesertaKey = `Peserta ${i}`;
            rowData.push(row[pesertaKey] || '');
        }

        // Gabungkan dengan koma dan tambahkan ke konten
        csvContent += rowData.map(field => `"${field}"`).join(',') + '\n';
    });

    // Buat blob dari konten CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Buat link untuk download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Tambahkan link ke dokumen dan klik secara otomatis
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fungsi untuk mengekspor data jadwal ke JSON
function exportToJSON(data, filename = 'jadwal.json') {
    if (!data || data.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }

    // Buat blob dari konten JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });

    // Buat link untuk download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    // Tambahkan link ke dokumen dan klik secara otomatis
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Fungsi untuk mengekspor data jadwal ke PDF
function exportToPDF(data) {
    if (!data || data.length === 0) {
        alert('Tidak ada data untuk diekspor');
        return;
    }

    // Buat konten HTML untuk PDF
    let htmlContent = `
        <html>
        <head>
            <style>
                body { font-family: 'Inter', sans-serif; margin: 20px; }
                h1 { color: #0b435c; text-align: center; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: 600; }
                tr:nth-child(even) { background-color: #f9f9f9; }
                .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <h1>Daftar Jadwal</h1>
            <table>
                <thead>
                    <tr>
                        <th>Tanggal</th>
                        <th>Mata Pelajaran</th>
                        <th>Institusi</th>
                        <th>Materi Diskusi</th>
                        <th>Peserta</th>
                    </tr>
                </thead>
                <tbody>
    `;

    // Tambahkan data ke tabel
    data.forEach(row => {
        const pesertaList = Object.keys(row).filter(key => key.startsWith('Peserta ') && row[key])
            .map(key => row[key]).join(', ');

        htmlContent += `
            <tr>
                <td>${row.Tanggal || ''}</td>
                <td>${row['Mata_Pelajaran'] || ''}</td>
                <td>${row.Institusi || ''}</td>
                <td>${row['Materi Diskusi'] || ''}</td>
                <td>${pesertaList || ''}</td>
            </tr>
        `;
    });

    htmlContent += `
                </tbody>
            </table>
            <div class="footer">Diekspor dari Jadwalku - ${new Date().toLocaleDateString('id-ID')}</div>
        </body>
        </html>
    `;

    // Buka jendela baru dengan konten HTML
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Tunggu sedikit sebelum mencetak
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Fungsi untuk menginisialisasi fitur ekspor
function initializeExportFeature() {
    // Cari tombol ekspor
    const exportButton = document.getElementById('export-button');
    if (!exportButton) return;

    // Buat menu dropdown untuk pilihan format ekspor
    const exportMenu = document.createElement('div');
    exportMenu.className = 'export-menu';
    exportMenu.style.position = 'absolute';
    exportMenu.style.top = '100%';
    exportMenu.style.right = '0';
    exportMenu.style.backgroundColor = 'white';
    exportMenu.style.borderRadius = '8px';
    exportMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    exportMenu.style.padding = '8px 0';
    exportMenu.style.zIndex = '1000';
    exportMenu.style.display = 'none';
    exportMenu.style.minWidth = '150px';

    // Buat opsi ekspor CSV
    const csvOption = document.createElement('div');
    csvOption.className = 'export-option';
    csvOption.textContent = 'Ekspor ke CSV';
    csvOption.style.padding = '8px 16px';
    csvOption.style.cursor = 'pointer';
    csvOption.style.transition = 'background-color 0.2s';

    csvOption.addEventListener('mouseenter', () => {
        csvOption.style.backgroundColor = '#f1f5f9';
    });

    csvOption.addEventListener('mouseleave', () => {
        csvOption.style.backgroundColor = 'transparent';
    });

    csvOption.addEventListener('click', () => {
        exportToCSV(allData);
        exportMenu.style.display = 'none';
    });

    // Buat opsi ekspor JSON
    const jsonOption = document.createElement('div');
    jsonOption.className = 'export-option';
    jsonOption.textContent = 'Ekspor ke JSON';
    jsonOption.style.padding = '8px 16px';
    jsonOption.style.cursor = 'pointer';
    jsonOption.style.transition = 'background-color 0.2s';

    jsonOption.addEventListener('mouseenter', () => {
        jsonOption.style.backgroundColor = '#f1f5f9';
    });

    jsonOption.addEventListener('mouseleave', () => {
        jsonOption.style.backgroundColor = 'transparent';
    });

    jsonOption.addEventListener('click', () => {
        exportToJSON(allData);
        exportMenu.style.display = 'none';
    });

    // Buat opsi ekspor PDF
    const pdfOption = document.createElement('div');
    pdfOption.className = 'export-option';
    pdfOption.textContent = 'Ekspor ke PDF';
    pdfOption.style.padding = '8px 16px';
    pdfOption.style.cursor = 'pointer';
    pdfOption.style.transition = 'background-color 0.2s';

    pdfOption.addEventListener('mouseenter', () => {
        pdfOption.style.backgroundColor = '#f1f5f9';
    });

    pdfOption.addEventListener('mouseleave', () => {
        pdfOption.style.backgroundColor = 'transparent';
    });

    pdfOption.addEventListener('click', () => {
        exportToPDF(allData);
        exportMenu.style.display = 'none';
    });

    // Tambahkan opsi ke menu
    exportMenu.appendChild(csvOption);
    exportMenu.appendChild(jsonOption);
    exportMenu.appendChild(pdfOption);

    // Tambahkan menu ke tombol ekspor
    exportButton.style.position = 'relative';
    exportButton.appendChild(exportMenu);

    // Toggle menu saat tombol diklik
    exportButton.addEventListener('click', (e) => {
        e.preventDefault();
        exportMenu.style.display = exportMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Sembunyikan menu saat klik di luar
    document.addEventListener('click', (e) => {
        if (!exportButton.contains(e.target)) {
            exportMenu.style.display = 'none';
        }
    });
}

// Inisialisasi fitur ekspor saat DOM dimuat
document.addEventListener('DOMContentLoaded', () => {
    initializeExportFeature();
});
