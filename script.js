// =================================================================
// SKRIP JAVASCRIPT UTAMA (script.js)
// VERSI FINAL DENGAN MENU FILM DAN FORMAT SALIN BARU
// =================================================================

// --- KONFIGURASI ---
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyQ-ysMvNu9ogUcqcyv3hM9qtJ-O6DOQULiHma9IbVU3r6TQ1NHaTLaHTx_PGGGgbgS/exec'; 

// --- ELEMEN DOM UNIVERSAL ---
const loadingIndicator = document.getElementById('loadingIndicator');
const noResults = document.getElementById('noResults');
const navAkun = document.getElementById('nav-akun');
const navGame = document.getElementById('nav-game');
const navFilm = document.getElementById('nav-film');
const viewAkun = document.getElementById('view-akun');
const viewGame = document.getElementById('view-game');
const viewFilm = document.getElementById('view-film');
const mainContent = document.getElementById('main-content');

// --- ELEMEN DOM SPESIFIK AKUN ---
const akunTableBody = document.getElementById('akun-table-body');
const addAccountForm = document.getElementById('add-account-form');
const searchInputAkun = document.getElementById('searchInput-akun');
const refreshBtnAkun = document.getElementById('refresh-btn-akun');

// --- ELEMEN DOM SPESIFIK GAME ---
const gameTableBody = document.getElementById('game-table-body');
const selectAllCheckboxGame = document.getElementById('select-all-checkbox-game');
const actionBarGame = document.getElementById('action-bar-game');
const selectedCountGameSpan = document.getElementById('selected-count-game');
const copySelectedBtnGame = document.getElementById('copy-selected-btn-game');
const searchInputGame = document.getElementById('searchInput-game');
const refreshBtnGame = document.getElementById('refresh-btn-game');

// --- ELEMEN DOM SPESIFIK FILM ---
const filmTableBody = document.getElementById('film-table-body');
const selectAllCheckboxFilm = document.getElementById('select-all-checkbox-film');
const actionBarFilm = document.getElementById('action-bar-film');
const selectedCountFilmSpan = document.getElementById('selected-count-film');
const copySelectedBtnFilm = document.getElementById('copy-selected-btn-film');
const searchInputFilm = document.getElementById('searchInput-film');
const refreshBtnFilm = document.getElementById('refresh-btn-film');

// --- STATE APLIKASI ---
let allAkunData = [], allGameData = [], allFilmData = [];
let selectedGames = new Set(), selectedFilms = new Set();
let currentView = 'akun';

// --- FUNGSI UTAMA & NAVIGASI ---
document.addEventListener('DOMContentLoaded', () => {
    if (WEB_APP_URL.includes('PASTE_URL_BARU_ANDA_DI_SINI')) {
        Swal.fire('Konfigurasi Belum Selesai', 'Harap masukkan URL Web App Anda di file script.js.', 'error');
        return;
    }
    setupEventListeners();
    showView('akun');
});

function setupEventListeners() {
    navAkun.addEventListener('click', () => showView('akun'));
    navGame.addEventListener('click', () => showView('game'));
    navFilm.addEventListener('click', () => showView('film'));
    
    // Listeners Akun
    addAccountForm.addEventListener('submit', handleAddAccount);
    searchInputAkun.addEventListener('input', () => renderAkunTable(allAkunData.filter(acc => acc.email.toLowerCase().includes(searchInputAkun.value.toLowerCase()))));
    akunTableBody.addEventListener('click', handleAkunTableClick);
    refreshBtnAkun.addEventListener('click', () => fetchData('akun'));

    // Listeners Game
    copySelectedBtnGame.addEventListener('click', handleBulkCopyGame);
    gameTableBody.addEventListener('change', handleGameCheckboxChange);
    selectAllCheckboxGame.addEventListener('change', handleSelectAllGames);
    searchInputGame.addEventListener('input', () => renderGameTable(allGameData.filter(game => game.game.toLowerCase().includes(searchInputGame.value.toLowerCase()))));
    refreshBtnGame.addEventListener('click', () => fetchData('game'));

    // Listeners Film
    copySelectedBtnFilm.addEventListener('click', handleBulkCopyFilm);
    filmTableBody.addEventListener('change', handleFilmCheckboxChange);
    selectAllCheckboxFilm.addEventListener('change', handleSelectAllFilms);
    searchInputFilm.addEventListener('input', () => renderFilmTable(allFilmData.filter(film => film.film.toLowerCase().includes(searchInputFilm.value.toLowerCase()))));
    refreshBtnFilm.addEventListener('click', () => fetchData('film'));
}

function showView(viewName) {
    currentView = viewName;
    viewAkun.style.display = 'none';
    viewGame.style.display = 'none';
    viewFilm.style.display = 'none';
    actionBarGame.style.display = 'none';
    actionBarFilm.style.display = 'none';
    mainContent.style.paddingBottom = '0';
    
    navAkun.classList.remove('active');
    navGame.classList.remove('active');
    navFilm.classList.remove('active');

    const shouldFetch = (viewName === 'akun' && allAkunData.length === 0) || 
                      (viewName === 'game' && allGameData.length === 0) ||
                      (viewName === 'film' && allFilmData.length === 0);

    if (viewName === 'akun') {
        viewAkun.style.display = 'block';
        navAkun.classList.add('active');
    } else if (viewName === 'game') {
        viewGame.style.display = 'block';
        navGame.classList.add('active');
    } else if (viewName === 'film') {
        viewFilm.style.display = 'block';
        navFilm.classList.add('active');
    }
    
    if (shouldFetch) fetchData(viewName);
}

async function fetchData(view) {
    loadingIndicator.style.display = 'block';
    noResults.style.display = 'none';
    if (view === 'akun') akunTableBody.innerHTML = '';
    if (view === 'game') gameTableBody.innerHTML = '';
    if (view === 'film') filmTableBody.innerHTML = '';
    
    try {
        const response = await fetch(`${WEB_APP_URL}?view=${view}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.status === 'error') throw new Error(data.message);

        if (view === 'akun') {
            allAkunData = data;
            renderAkunTable(allAkunData);
        } else if (view === 'game') {
            allGameData = data;
            renderGameTable(allGameData);
        } else if (view === 'film') {
            allFilmData = data;
            renderFilmTable(allFilmData);
        }
    } catch (error) {
        Swal.fire('Gagal Mengambil Data!', error.message, 'error');
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

async function postData(view, action, payload) {
    try {
        const response = await fetch(WEB_APP_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ view, action, payload })
        });
        if (!response.ok) return false;
        const result = await response.json();
        return result.status === 'success';
    } catch (error) {
        console.error('POST Error:', error);
        return false;
    }
}


// --- LOGIKA SPESIFIK MENU AKUN ---
function renderAkunTable(akunList) {
    akunTableBody.innerHTML = '';
    noResults.style.display = 'none';
    if (akunList.length === 0) {
        noResults.style.display = 'block';
        noResults.textContent = searchInputAkun.value ? "Pencarian tidak ditemukan." : "Data akun kosong.";
        return;
    }
    
    const sorted = [...akunList].sort((a, b) => (a.status === 'TERSEDIA' && b.status !== 'TERSEDIA') ? -1 : 1);
    
    sorted.forEach(acc => {
        const isAvailable = acc.status === 'TERSEDIA';
        const row = document.createElement('tr');
        row.className = isAvailable ? '' : 'row-tersalin';
        // PERUBAHAN: Menambahkan atribut data-label di setiap <td>
        row.innerHTML = `
            <td data-label="Status"><span class="badge rounded-pill status-badge ${isAvailable ? 'bg-success-subtle text-success-emphasis' : 'bg-danger-subtle text-danger-emphasis'}">${isAvailable ? 'TERSEDIA' : 'N0'}</span></td>
            <td data-label="Email">${acc.email}</td>
            <td data-label="Waktu Disalin" class="timestamp">${acc.timestamp ? new Date(acc.timestamp).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : '-'}</td>
            <td data-label="Aksi"><div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" data-action="copy" data-email="${acc.email}" data-password="${acc.password}" ${!isAvailable ? 'disabled' : ''}><i class="bi bi-clipboard"></i> Salin</button>
                <button class="btn btn-outline-secondary" data-action="undo" data-email="${acc.email}" ${isAvailable ? 'disabled' : ''}><i class="bi bi-arrow-counterclockwise"></i> Undo</button>
            </div></td>`;
        akunTableBody.appendChild(row);
    });
}

async function handleAkunTableClick(e) {
    const button = e.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    const email = button.dataset.email;

    if (action === 'copy') {
        const clipboardText = `Terimakasih sudah membeli di toko kami.\n\nEmail: ${email}\nPassword: ${button.dataset.password}\n\n*Akun akan hilang setelah 7 Hari Jadi tolong jangan menyimpan apapun di akun.`;
        await navigator.clipboard.writeText(clipboardText);
        const success = await postData('akun', 'updateStatus', { email });
        if (success) { 
            Swal.fire({ title: 'Tersalin!', icon: 'success', timer: 1500, showConfirmButton: false }); 
            fetchData('akun'); 
        } else {
            Swal.fire('Gagal!', 'Gagal memperbarui status di server.', 'error');
        }
    } else if (action === 'undo') {
        const result = await Swal.fire({ title: 'Anda Yakin?', text: `Status untuk ${email} akan dikembalikan.`, icon: 'warning', showConfirmButton: true });
        if (result.isConfirmed) {
            const success = await postData('akun', 'resetStatus', { email });
            if (success) { fetchData('akun'); } 
            else { Swal.fire('Gagal!', 'Gagal mereset status di server.', 'error'); }
        }
    }
}

async function handleAddAccount(e) {
    e.preventDefault();
    const email = document.getElementById('new-email').value.trim();
    const password = document.getElementById('new-password').value.trim();
    if (!email || !password) return;
    const success = await postData('akun', 'addAccount', { email, password });
    if (success) { e.target.reset(); fetchData('akun'); } 
    else { Swal.fire('Gagal!', 'Tidak dapat menambahkan akun.', 'error'); }
}


// --- LOGIKA SPESIFIK MENU GAME ---
function renderGameTable(gameList) {
    gameTableBody.innerHTML = '';
    noResults.style.display = 'none';
    if (gameList.length === 0) {
        noResults.style.display = 'block';
        noResults.textContent = searchInputGame.value ? "Pencarian tidak ditemukan." : "Data game kosong.";
        return;
    }
    gameList.forEach(game => {
        const row = document.createElement('tr');
        // PERUBAHAN: Menambahkan atribut data-label di setiap <td>
        row.innerHTML = `
            <td data-label="Pilih"><input class="form-check-input game-checkbox" type="checkbox" value="${game.id}"></td>
            <td data-label="Game" class="fw-medium">${game.game}</td>
            <td data-label="Link"><a href="${game.link}" target="_blank" class="text-decoration-none">${game.link.substring(0, 40)}...</a></td>
            <td data-label="Jumlah Salin" class="text-center fw-bold">${game.jumlahSalin}</td>`;
        gameTableBody.appendChild(row);
    });
}
function updateGameActionBar() {
    const count = selectedGames.size;
    selectedCountGameSpan.textContent = count;
    if (count > 0) {
        actionBarGame.style.display = 'block';
        mainContent.style.paddingBottom = '80px';
    } else {
        actionBarGame.style.display = 'none';
        mainContent.style.paddingBottom = '0';
    }
}
function handleGameCheckboxChange(e) {
    if (e.target.classList.contains('game-checkbox')) {
        const gameId = parseInt(e.target.value);
        if (e.target.checked) selectedGames.add(gameId); else selectedGames.delete(gameId);
        selectAllCheckboxGame.checked = (allGameData.length > 0 && selectedGames.size === allGameData.length);
        updateGameActionBar();
    }
}
function handleSelectAllGames(e) {
    selectedGames.clear();
    const checkboxes = gameTableBody.querySelectorAll('.game-checkbox');
    if (e.target.checked) {
        checkboxes.forEach(cb => { cb.checked = true; selectedGames.add(parseInt(cb.value)); });
    } else {
        checkboxes.forEach(cb => { cb.checked = false; });
    }
    updateGameActionBar();
}
async function handleBulkCopyGame() {
    if (selectedGames.size === 0) return;
    const gamesToCopy = allGameData.filter(game => selectedGames.has(game.id));
    let clipboardText = `Terimakasih sudah membeli di toko kami.\n\n` +
        gamesToCopy.map(g => `Game : ${g.game}\nLink : ${g.link}`).join('\n//////////\n') +
        `\n\n*Berikut Game dan Link nya, Bisa liat Tutorial Dibawah jika masih belum menegerti.\n✅Cara Extrak Dan Install : https://drive.google.com/file/d/1mjcUYW79ZX2ko7wpFID1NpZnH-gzuXzT/view?usp=drive_link`;
    await navigator.clipboard.writeText(clipboardText);
    const success = await postData('game', 'incrementCounts', { ids: Array.from(selectedGames) });
    if (success) {
        Swal.fire({ title: 'Berhasil Disalin!', icon: 'success', timer: 2000, showConfirmButton: false });
        selectedGames.clear();
        selectAllCheckboxGame.checked = false;
        fetchData('game');
    } else {
        Swal.fire('Gagal!', 'Gagal memperbarui data di server.', 'error');
    }
}

// --- LOGIKA SPESIFIK MENU FILM (BARU) ---
function renderFilmTable(filmList) {
    filmTableBody.innerHTML = '';
    noResults.style.display = 'none';
    if (filmList.length === 0) {
        noResults.style.display = 'block';
        noResults.textContent = searchInputFilm.value ? "Pencarian tidak ditemukan." : "Data film kosong.";
        return;
    }
    filmList.forEach(film => {
        const row = document.createElement('tr');
        // PERUBAHAN: Menambahkan atribut data-label di setiap <td>
        row.innerHTML = `
            <td data-label="Pilih"><input class="form-check-input film-checkbox" type="checkbox" value="${film.id}"></td>
            <td data-label="Film" class="fw-medium">${film.film}</td>
            <td data-label="Link"><a href="${film.link}" target="_blank" class="text-decoration-none">${film.link.substring(0, 40)}...</a></td>
            <td data-label="Jumlah Salin" class="text-center fw-bold">${film.jumlahSalin}</td>`;
        filmTableBody.appendChild(row);
    });
}
function updateFilmActionBar() {
    const count = selectedFilms.size;
    selectedCountFilmSpan.textContent = count;
    if (count > 0) {
        actionBarFilm.style.display = 'block';
        mainContent.style.paddingBottom = '80px';
    } else {
        actionBarFilm.style.display = 'none';
        mainContent.style.paddingBottom = '0';
    }
}
function handleFilmCheckboxChange(e) {
    if (e.target.classList.contains('film-checkbox')) {
        const filmId = parseInt(e.target.value);
        if (e.target.checked) selectedFilms.add(filmId); else selectedFilms.delete(filmId);
        selectAllCheckboxFilm.checked = (allFilmData.length > 0 && selectedFilms.size === allFilmData.length);
        updateFilmActionBar();
    }
}
function handleSelectAllFilms(e) {
    selectedFilms.clear();
    const checkboxes = filmTableBody.querySelectorAll('.film-checkbox');
    if (e.target.checked) {
        checkboxes.forEach(cb => { cb.checked = true; selectedFilms.add(parseInt(cb.value)); });
    } else {
        checkboxes.forEach(cb => { cb.checked = false; });
    }
    updateFilmActionBar();
}
async function handleBulkCopyFilm() {
    if (selectedFilms.size === 0) return;
    const filmsToCopy = allFilmData.filter(film => selectedFilms.has(film.id));
    let clipboardText = `Terimakasih sudah membeli di toko kami.\n\n` +
        filmsToCopy.map(f => `Film : ${f.film}\nLink : ${f.link}`).join('\n//////////\n') +
        `\n\n*Berikut Film dan Link nya, Jika ada kendala bisa hubungi admin!`;
    await navigator.clipboard.writeText(clipboardText);
    const success = await postData('film', 'incrementCounts', { ids: Array.from(selectedFilms) });
    if (success) {
        Swal.fire({ title: 'Berhasil Disalin!', icon: 'success', timer: 2000, showConfirmButton: false });
        selectedFilms.clear();
        selectAllCheckboxFilm.checked = false;
        fetchData('film');
    } else {
        Swal.fire('Gagal!', 'Gagal memperbarui data di server.', 'error');
    }
}