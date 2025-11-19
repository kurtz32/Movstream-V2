const API_KEY = 'ce92539c90889cc88a401b0a7f040bb7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const movieDetails = document.getElementById('movie-details');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Get movie ID and type from URL parameters
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        id: urlParams.get('id'),
        type: urlParams.get('type') || 'movie'
    };
}

// Fetch movie/TV details
async function fetchMovieDetails(id, type) {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
        const data = await response.json();
        displayMovieDetails(data, type);
        fetchMovieTrailer(id, type);
        fetchMovieCast(id, type);
    } catch (error) {
        console.error('Error fetching details:', error);
        movieDetails.innerHTML = '<p>Error loading details. Please try again later.</p>';
    }
}

// Fetch trailer
async function fetchMovieTrailer(id, type) {
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
        const data = await response.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        if (trailer) {
            displayMovieTrailer(trailer);
        } else {
            document.getElementById('play-trailer-btn').style.display = 'none';
            document.getElementById('movie-trailer').innerHTML = '<p>No trailer available.</p>';
        }
    } catch (error) {
        console.error('Error fetching trailer:', error);
        document.getElementById('movie-trailer').innerHTML = '<p>Error loading trailer. Please try again later.</p>';
    }
}

// Fetch cast
async function fetchMovieCast(id, type) {
    console.log('Fetching cast for ID:', id, type);
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`);
        const data = await response.json();
        console.log('Cast data:', data.cast);
        displayMovieCast(data.cast.slice(0, 10)); // Top 10 cast members
    } catch (error) {
        console.error('Error fetching cast:', error);
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

// Display movie/TV details
function displayMovieDetails(item, type) {
    const title = type === 'tv' ? item.name : item.title;
    const releaseDate = type === 'tv' ? item.first_air_date : item.release_date;
    const runtime = type === 'tv' ? `Seasons: ${item.number_of_seasons}` : `${item.runtime} minutes`;
    movieDetails.innerHTML = `
        <div class="movie-detail-container">
            <div class="poster-section">
                <img src="${IMAGE_BASE_URL}${item.poster_path}" alt="${title}" class="movie-detail-poster">
            </div>
            <div class="movie-detail-info">
                <h1 class="movie-detail-title">${title}</h1>
                <p class="movie-detail-release"><strong>Release Date:</strong> ${releaseDate}</p>
                <p class="movie-detail-rating"><strong>Rating:</strong> ⭐ ${item.vote_average.toFixed(1)} (${item.vote_count} votes)</p>
                <p class="movie-detail-genres"><strong>Genres:</strong> ${item.genres.map(genre => genre.name).join(', ')}</p>
                <p class="movie-detail-runtime"><strong>Runtime:</strong> ${runtime}</p>
                <h2>Overview</h2>
                <p class="movie-detail-overview">${item.overview}</p>
            </div>
            <button id="play-trailer-btn" class="play-btn">▶ Play</button>
        </div>
    `;

    // Add event listener to the play button
    const playBtn = document.getElementById('play-trailer-btn');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            window.location.href = `watch.html?id=${item.id}&type=${type}`;
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
const { id, type } = getMovieIdFromUrl();
if (id) {
    fetchMovieDetails(id, type);
} else {
    movieDetails.innerHTML = '<p>No item selected.</p>';
}
