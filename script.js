const SUPABASE_URL = "https://ppjezzfhwsartggywzyp.supabase.co";
const SUPABASE_KEY = "sb_publishable_ChDY37tmdQzyKO_xUe_kEw_D5zTO4og";

let movies = JSON.parse(localStorage.getItem('userMovies')) || [];
let genres = JSON.parse(localStorage.getItem('userGenres')) || ['Драма', 'Комедия', 'Фантастика'];
let currentFormRating = 0;
const defaultPoster = "https://unsplash.com";

function switchPage(pageId, titleText) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    document.getElementById('pageTitle').textContent = titleText;
    document.getElementById('headerPlusBtn').style.display = (pageId === 'homePage') ? 'flex' : 'none';
    document.getElementById('navHome').classList.toggle('active', pageId === 'homePage' || pageId === 'detailsPage');
    document.getElementById('navFav').classList.toggle('active', pageId === 'favoritesPage');
    document.getElementById('navGenres').classList.toggle('active', pageId === 'genresPage');
    if (pageId === 'homePage') renderMoviesGrid('moviesGrid', movies);
    if (pageId === 'genresPage') renderGenresList();
    if (pageId === 'favoritesPage') renderMoviesGrid('favoritesGrid', movies.filter(m => m.favorite));
}

function getStarsHtml(rating) {
    let html = '';
    for(let i=1; i<=5; i++) { html += i <= rating ? '★' : '☆'; }
    return html;
}

function renderMoviesGrid(gridId, list) {
    const grid = document.getElementById(gridId);
    grid.innerHTML = '';
    if(list.length === 0) {
        grid.innerHTML = `<p style="color:#8d8d99; text-align:center; grid-column:1/-1; padding:20px;">Список пуст 🎬</p>`;
        return;
    }
    list.forEach(movie => {
        const card = document.createElement('div');
        card.className = `movie-card ${movie.favorite ? 'is-fav' : ''}`;
        card.onclick = () => showDetails(movie.id);
        card.innerHTML = `
            <img class="movie-poster" src="${movie.poster || defaultPoster}">
            <div class="card-fav-badge">❤️</div>
            <div class="movie-info">
                <div class="movie-title">${movie.title}</div>
                <div class="movie-meta">${movie.year || '—'} • ${movie.genre || 'Общий'}</div>
                <div class="card-stars">${getStarsHtml(movie.rating || 0)}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderGenresList() {
    const listElement = document.getElementById('genreList');
    listElement.innerHTML = '';
    genres.forEach((genre, index) => {
        const li = document.createElement('li');
        li.className = 'genre-item';
        li.innerHTML = `<span>${genre}</span><button class="genre-edit-btn" onclick="openGenreModal(${index})">✏️</button>`;
        listElement.appendChild(li);
    });
    updateGenreSelect();
}

function addGenre() {
    const input = document.getElementById('genreInput');
    const val = input.value.trim();
    if(val && !genres.includes(val)) {
        genres.push(val);
        localStorage.setItem('userGenres', JSON.stringify(genres));
        input.value = '';
        renderGenresList();
    }
}

function openGenreModal(index) {
    document.getElementById('editGenreIndex').value = index;
    document.getElementById('editGenreInput').value = genres[index];
    document.getElementById('genreModal').classList.add('active');
}
function closeGenreModal() { document.getElementById('genreModal').classList.remove('active'); }

function saveGenreChanges() {
    const index = document.getElementById('editGenreIndex').value;
    const oldName = genres[index];
    const newName = document.getElementById('editGenreInput').value.trim();
    if(!newName) return;
    genres[index] = newName;
    movies.forEach(m => { if(m.genre === oldName) m.genre = newName; });
    localStorage.setItem('userGenres', JSON.stringify(genres));
    localStorage.setItem('userMovies', JSON.stringify(movies));
    closeGenreModal();
    renderGenresList();
}

function deleteGenreFromModal() {
    const index = document.getElementById('editGenreIndex').value;
    const oldName = genres[index];
    if(confirm(`Удалить жанр "${oldName}"? У фильмов этот жанр сбросится.`)) {
        genres.splice(index, 1);
        movies.forEach(m => { if(m.genre === oldName) m.genre = ''; });
        localStorage.setItem('userGenres', JSON.stringify(genres));
        localStorage.setItem('userMovies', JSON.stringify(movies));
        closeGenreModal();
        renderGenresList();
    }
}

function updateGenreSelect() {
    const select = document.getElementById('formGenreSelect');
    select.innerHTML = '<option value="">Без жанра</option>';
    genres.forEach(g => { select.innerHTML += `<option value="${g}">${g}</option>`; });
}

function setFormRating(rating) {
    currentFormRating = rating;
    const spans = document.querySelectorAll('#formRatingStars span');
    spans.forEach((span, i) => { span.classList.toggle('active', i < rating); });
}

function openModal(editMovieId = null) {
    updateGenreSelect();
    const modal = document.getElementById('addMovieModal');
    const deleteBtn = document.getElementById('formDeleteBtn');
    if(editMovieId) {
        const movie = movies.find(m => m.id === editMovieId);
        document.getElementById('modalHeadline').textContent = "Редактировать фильм";
        document.getElementById('formMovieId').value = movie.id;
        document.getElementById('formTitle').value = movie.title;
        document.getElementById('formYear').value = movie.year;
        document.getElementById('formGenreSelect').value = movie.genre;
        document.getElementById('formPoster').value = movie.poster;
        document.getElementById('formDesc').value = movie.desc;
        setFormRating(movie.rating || 0);
        deleteBtn.style.display = 'block';
    } else {
        document.getElementById('modalHeadline').textContent = "Новый фильм";
        document.getElementById('formMovieId').value = '';
        document.getElementById('formTitle').value = '';
        document.getElementById('formYear').value = '';
        document.getElementById('formGenreSelect').value = '';
        document.getElementById('formPoster').value = '';
        document.getElementById('formDesc').value = '';
        setFormRating(0);
        deleteBtn.style.display = 'none';
    }
    modal.classList.add('active');
}

function closeModal() { document.getElementById('addMovieModal').classList.remove('active'); }

function saveMovie() {
    const title = document.getElementById('formTitle').value.trim();
    if (!title) { alert("Укажите наименование фильма!"); return; }
    const id = document.getElementById('formMovieId').value;
    if(id) {
        const movie = movies.find(m => m.id == id);
        movie.title = title;
        movie.year = document.getElementById('formYear').value.trim();
        movie.genre = document.getElementById('formGenreSelect').value;
        movie.poster = document.getElementById('formPoster').value.trim();
        movie.desc = document.getElementById('formDesc').value.trim();
        movie.rating = currentFormRating;
    } else {
        movies.push({
            id: Date.now(), title: title,
            year: document.getElementById('formYear').value.trim(),
            genre: document.getElementById('formGenreSelect').value,
            poster: document.getElementById('formPoster').value.trim(),
            desc: document.getElementById('formDesc').value.trim(),
            rating: currentFormRating, favorite: false
        });
    }
    localStorage.setItem('userMovies', JSON.stringify(movies));
    closeModal();
    if(id) { showDetails(Number(id)); } else { switchPage('homePage', 'Все фильмы'); }
}

function deleteMovieFromForm() {
    const id = document.getElementById('formMovieId').value;
    if(id && confirm("Удалить фильм из коллекции?")) {
        movies = movies.filter(m => m.id != id);
        localStorage.setItem('userMovies', JSON.stringify(movies));
        closeModal();
        switchPage('homePage', 'Все фильмы');
    }
}

function showDetails(id) {
    const movie = movies.find(m => m.id === id);
    if(!movie) return;
    switchPage('detailsPage', 'О фильме');
    document.getElementById('movieEditBtn').onclick = () => openModal(movie.id);
    const container = document.getElementById('detailsContainer');
    container.className = `details-container ${movie.favorite ? 'is-fav' : ''}`;
    container.innerHTML = `
        <div class="details-flex">
            <img class="details-poster" src="${movie.poster || defaultPoster}">
            <div class="details-content">
                <div class="details-top-row">
                    <h2 class="details-title">${movie.title}</h2>
                    <button class="heart-btn" onclick="toggleFav(${movie.id})">${movie.favorite ? '❤️' : '🤍'}</button>
                </div>
                <span class="details-tag">📅 Год: ${movie.year || '—'}</span>
                <span class="details-tag">🎭 Жанр: ${movie.genre || '—'}</span>
                <span class="details-tag" style="color:#fba94c">⭐ Рейтинг: ${getStarsHtml(movie.rating || 0)}</span>
                <p class="details-desc">${movie.desc || 'Описание отсутствует.'}</p>
            </div>
        </div>
    `;
}

function toggleFav(id) {
    const movie = movies.find(m => m.id === id);
    if(movie) {
        movie.favorite = !movie.favorite;
        localStorage.setItem('userMovies', JSON.stringify(movies));
        showDetails(id);
    }
}

renderMoviesGrid('moviesGrid', movies);
