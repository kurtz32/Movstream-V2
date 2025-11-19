const API_KEY = 'ce92539c90889cc88a401b0a7f040bb7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const movieDetails = document.getElementById('movie-details');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Get TV ID from URL parameters
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch TV details
async function fetchMovieDetails(tvId) {
    try {
        const response = await fetch(`${BASE_URL}/tv/${tvId}?api_key=${API_KEY}`);
        const data = await response.json();
        displayMovieDetails(data);
        fetchMovieTrailer(tvId);
        fetchMovieCast(tvId);
    } catch (error) {
        console.error('Error fetching TV details:', error);
        movieDetails.innerHTML = '<p>Error loading TV details. Please try again later.</p>';
    }
}

// Fetch TV trailer
async function fetchMovieTrailer(tvId) {
    try {
        const response = await fetch(`${BASE_URL}/tv/${tvId}/videos?api_key=${API_KEY}`);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
            displayMovieTrailer(trailer);
        } else {
            document.getElementById('play-trailer-btn').style.display = 'none';
            document.getElementById('movie-trailer').innerHTML = '<p>No trailer available.</p>';
        }
    } catch (error) {
        console.error('Error fetching TV trailer:', error);
        document.getElementById('movie-trailer').innerHTML = '<p>Error loading trailer. Please try again later.</p>';
    }
}

// Fetch TV cast
async function fetchMovieCast(tvId) {
    console.log('Fetching cast for TV ID:', tvId);
    try {
        const response = await fetch(`${BASE_URL}/tv/${tvId}/credits?api_key=${API_KEY}`);
        const data = await response.json();
        console.log('Cast data:', data.cast);
        displayMovieCast(data.cast.slice(0, 10)); // Top 10 cast members
    } catch (error) {
        console.error('Error fetching TV cast:', error);
        document.getElementById('movie-cast').innerHTML = '<p>Error loading cast information. Please try again later.</p>';
    }
}

// Display movie trailer
function displayMovieTrailer(trailer) {
    const trailerContainer = document.getElementById('movie-trailer');
    trailerContainer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>
    `;
}

// Display movie cast
function displayMovieCast(cast) {
    console.log('Displaying cast:', cast);
    const castContainer = document.getElementById('movie-cast');
    if (cast.length === 0) {
        castContainer.innerHTML = '<p>No cast information available.</p>';
        return;
    }
    castContainer.innerHTML = cast.map(actor => `
        <div class="cast-card">
            <img src="${actor.profile_path ? IMAGE_BASE_URL + actor.profile_path : 'https://dummyimage.com/100x150/cccccc/000000&text=No+Image'}" alt="${actor.name}" class="cast-photo">
            <p class="cast-name">${actor.name}</p>
            <p class="cast-character">${actor.character}</p>
        </div>
    `).join('');
}

// Display TV details
function displayMovieDetails(tv) {
    movieDetails.innerHTML = `
        <div class="movie-detail-container">
            <div class="poster-section">
                <img src="${IMAGE_BASE_URL}${tv.poster_path}" alt="${tv.name}" class="movie-detail-poster">
            </div>
            <div class="movie-detail-info">
                <h1 class="movie-detail-title">${tv.name}</h1>
                <p class="movie-detail-release"><strong>First Air Date:</strong> ${tv.first_air_date}</p>
                <p class="movie-detail-rating"><strong>Rating:</strong> ⭐ ${tv.vote_average.toFixed(1)} (${tv.vote_count} votes)</p>
                <p class="movie-detail-genres"><strong>Genres:</strong> ${tv.genres.map(genre => genre.name).join(', ')}</p>
                <p class="movie-detail-runtime"><strong>Seasons:</strong> ${tv.number_of_seasons}</p>
                <h2>Overview</h2>
                <p class="movie-detail-overview">${tv.overview}</p>
            </div>
            <button id="play-trailer-btn" class="play-btn">▶ Play</button>
        </div>
    `;

    // Add event listener to the play button
    const playBtn = document.getElementById('play-trailer-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            window.location.href = `watch-tv.html?id=${tv.id}`;
        });
    }
}

// Search movies (redirect to index.html with search)
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    } else {
        window.location.href = 'index.html';
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Play trailer button event handled in displayMovieDetails

// Initialize
const tvId = getMovieIdFromUrl();
if (tvId) {
    fetchMovieDetails(tvId);
} else {
    movieDetails.innerHTML = '<p>No TV show selected.</p>';
}