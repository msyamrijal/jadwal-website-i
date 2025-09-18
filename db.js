// URL Spreadsheet Anda
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcEUYNKssh36NHW_Rk7D89EFDt-ZWFdKxQI32L_Q1exbwNhHuGHWKh_W8VFSA8E58vjhVrumodkUv9/pub?gid=0&single=true&output=csv';

// --- FUNGSI PENGAMBILAN DATA --- //

async function fetchScheduleData() {
  try {
    const response = await fetch(SPREADSHEET_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error("Gagal mengambil atau mem-parsing data spreadsheet:", error);
    throw error; // Lemparkan kembali error agar bisa ditangani oleh pemanggil
  }
}

/**
 * Fungsi parsing CSV yang andal, mampu menangani koma di dalam kolom
 * yang diapit oleh tanda kutip (e.g., "nilai, dengan, koma").
 * @param {string} text Teks mentah dari file CSV.
 * @returns {Array<Object>} Array of objects yang merepresentasikan data.
 */
 function parseCSV(text) {
    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return [];

    // Helper untuk mem-parsing satu baris dengan benar
    const parseRow = (rowStr) => {
        const fields = [];
        // Regex untuk menemukan kolom, baik yang diapit kutip maupun tidak
        const fieldRegex = /(?:"([^"]*(?:""[^"]*)*)"|([^,]*))(,|$)/g;
        let currentMatch;

        // Loop melalui semua kecocokan dalam satu baris
        while ((currentMatch = fieldRegex.exec(rowStr))) {
            // Ambil nilai dari grup yang cocok: grup 1 untuk quoted, grup 2 untuk unquoted
            let value = currentMatch[1] !== undefined 
                ? currentMatch[1].replace(/""/g, '"') // Un-escape double quotes
                : currentMatch[2];
            fields.push(value.trim());
            if (currentMatch[3] === '') break; // Jika akhir baris, berhenti
        }
        return fields;
    };

    const header = parseRow(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue; // Lewati baris kosong
        const row = parseRow(lines[i]);
        const obj = {};
        header.forEach((h, index) => obj[h.trim()] = row[index] || '');
        data.push(obj);
    }
    return data;
 }

function parseDateFromString(dateStr) {
    if (!dateStr) return null;
    // Format: "MM/DD/YYYY HH:mm:ss" (from Google Sheets CSV)
    const parts = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4}) (\d{1,2}):(\d{2}):(\d{2})/);
    if (!parts) {
        // Fallback for "DD/MM/YYYY HH:mm" if the above doesn't match (e.g., for manual input or different sheet)
        const fallbackParts = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})/);
        if (fallbackParts) {
            // parts[1]=DD, parts[2]=MM, parts[3]=YYYY, parts[4]=HH, parts[5]=mm
            return new Date(fallbackParts[3], fallbackParts[2] - 1, fallbackParts[1], fallbackParts[4], fallbackParts[5]);
        }
        return null;
    }
    // parts[1]=MM, parts[2]=DD, parts[3]=YYYY, parts[4]=HH, parts[5]=mm, parts[6]=ss
    return new Date(parts[3], parts[1] - 1, parts[2], parts[4], parts[5], parts[6]);
}


// --- FUNGSI DATABASE (INDEXEDDB) --- //

const DB_NAME = 'jadwalDB';
const SCHEDULE_STORE = 'schedules';
const REKAP_STORE = 'rekap';
const RAW_SCHEDULE_STORE = 'raw_schedules'; // Store baru untuk data mentah

function openDB() {
  return idb.openDB(DB_NAME, 2, { // Naikkan versi DB untuk upgrade
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains(SCHEDULE_STORE)) {
        db.createObjectStore(SCHEDULE_STORE, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(REKAP_STORE)) {
        // Menggunakan 'name' sebagai keyPath untuk rekap, karena unik
        db.createObjectStore(REKAP_STORE, { keyPath: 'name' });
      }
      // Buat object store baru untuk data mentah di versi 2
      if (oldVersion < 2 && !db.objectStoreNames.contains(RAW_SCHEDULE_STORE)) {
        db.createObjectStore(RAW_SCHEDULE_STORE);
      }
    },
  });
}

async function saveSchedules(data) {
  const db = await openDB(); // Fungsi ini sekarang akan digunakan oleh rekap.js
  const tx = db.transaction(SCHEDULE_STORE, 'readwrite');
  await tx.store.clear(); // Hapus data lama
  for (const item of data) {
    await tx.store.put(item);
  }
  await tx.done;
  console.log("Jadwal baru berhasil disimpan ke IndexedDB.");
}

async function saveRawSchedules(data) {
    const db = await openDB();
    const tx = db.transaction(RAW_SCHEDULE_STORE, 'readwrite');
    await tx.store.clear(); // Hapus semua data lama
    // Simpan data baru sebagai satu entri dengan kunci 'all'
    await tx.store.put(data, 'all');
    await tx.done;
    console.log("Data jadwal mentah berhasil disimpan ke IndexedDB.");
}

async function getSchedules() {
  const db = await openDB();
  return await db.getAll(SCHEDULE_STORE);
}

async function getRawSchedules() {
    const db = await openDB();
    return await db.get(RAW_SCHEDULE_STORE, 'all');
}

async function saveRekap(summaryData) {
    const db = await openDB();
    const tx = db.transaction(REKAP_STORE, 'readwrite');
    await tx.store.clear();
    for (const name in summaryData) {
        // Pastikan formatnya { name: 'nama', schedules: [...] }
        await tx.store.put({ name: name, schedules: summaryData[name] });
    }
    await tx.done;
    console.log("Rekap baru berhasil disimpan ke IndexedDB.");
}

async function getRekap() {
    const db = await openDB();
    const allRekap = await db.getAll(REKAP_STORE);
    // Ubah kembali dari array of objects ke format summary object
    const summary = {};
    allRekap.forEach(item => {
        summary[item.name] = item.schedules;
    });
    return summary;
}
