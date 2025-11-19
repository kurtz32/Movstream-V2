const API_KEY = 'ce92539c90889cc88a401b0a7f040bb7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const movieDetails = document.getElementById('movie-details');
const sourcesList = document.getElementById('sources-list');
const videoEmbed = document.getElementById('video-embed');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const seasonSelect = document.getElementById('season-select');
const episodeSelect = document.getElementById('episode-select');

let imdbId = null;
let selectedSeason = 1;
let selectedEpisode = 1;

// Get ID from URL parameters
function getMovieIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Fetch details
async function fetchMovieDetails(id) {
    const type = 'tv';
    try {
        const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
        const data = await response.json();
        displayMovieDetails(data, type);
        // Fetch IMDB ID for TV
        const externalResponse = await fetch(`${BASE_URL}/${type}/${id}/external_ids?api_key=${API_KEY}`);
        const externalData = await externalResponse.json();
        imdbId = externalData.imdb_id;
    } catch (error) {
        console.error('Error fetching details:', error);
        movieDetails.innerHTML = '<p>Error loading details. Please try again later.</p>';
    }
}

// Display details
function displayMovieDetails(item, type) {
    const title = type === 'tv' ? item.name : item.title;
    const releaseDate = type === 'tv' ? item.first_air_date : item.release_date;
    const runtime = type === 'tv' ? `Seasons: ${item.number_of_seasons}` : `${item.runtime} minutes`;
    movieDetails.innerHTML = `
        <div class="movie-detail-container">
            <div class="poster-section">
                <img src="${item.poster_path ? IMAGE_BASE_URL + item.poster_path : 'https://dummyimage.com/300x450/cccccc/000000&text=No+Image'}" alt="${title}" class="movie-detail-poster">
            </div>
            <div class="movie-detail-info">
                <h1 class="movie-detail-title">${title}</h1>
                <p class="movie-detail-release"><strong>First Air Date:</strong> ${releaseDate}</p>
                <p class="movie-detail-rating"><strong>Rating:</strong> ⭐ ${item.vote_average.toFixed(1)} (${item.vote_count} votes)</p>
                <p class="movie-detail-genres"><strong>Genres:</strong> ${item.genres.map(genre => genre.name).join(', ')}</p>
                <p class="movie-detail-runtime"><strong>Runtime:</strong> ${runtime}</p>
                <h2>Overview</h2>
                <p class="movie-detail-overview">${item.overview}</p>
            </div>
        </div>
    `;

    // Populate seasons
    if (type === 'tv' && item.seasons) {
        seasonSelect.innerHTML = '<option value="">Select Season</option>';
        item.seasons.forEach(season => {
            if (season.season_number > 0) {
                const option = document.createElement('option');
                option.value = season.season_number;
                option.textContent = `Season ${season.season_number}`;
                seasonSelect.appendChild(option);
            }
        });
    }
}

// Sources array for TV
const sources = [
    // { name: 'Vidzee', url: 'https://player.vidzee.wtf/embed/tv/{id}', status: 'Active' },
    // { name: 'VidRock', url: 'https://player.vidrock.com/embed/tv/{id}', status: 'Click to switch' },
    // { name: 'VidSrc.wtf (API 1)', url: 'https://player.vidsrc.wtf/embed/tv/{id}', status: 'Click to switch' },
    // { name: 'VidSrc.wtf (API 2)', url: 'https://player.vidsrc.wtf/embed/tv/{id}?server=2', status: 'Click to switch' },
    // { name: 'VidSrc.wtf (API 3)', url: 'https://player.vidsrc.wtf/embed/tv/{id}?server=3', status: 'Click to switch' },
    // { name: 'Vidnest', url: 'https://player.vidnest.com/embed/tv/{id}', status: 'Click to switch' },
    // { name: 'SmashyStream', url: 'https://player.smashy.stream/tv/{id}', status: 'Click to switch' },
    // { name: '111Movies', url: 'https://player.111movies.com/embed/tv/{id}', status: 'Click to switch' },
    // { name: 'Videasy', url: 'https://player.videasy.net/tv/{id}', status: 'Click to switch' },
    // { name: 'VidLink', url: 'https://player.vidlink.pro/embed/tv/{id}', status: 'Click to switch' },
    // { name: 'VidFast', url: 'https://player.vidfast.co/embed/tv/{id}', status: 'Click to switch' },
    // { name: 'Embed.su', url: 'https://player.embed.su/embed/tv/{id}', status: 'Click to switch' },
    { name: '2Embed', url: 'https://2embed.cc/embed/{id}', status: 'Click to switch' },
    // { name: 'MoviesAPI', url: 'https://player.moviesapi.com/tv/{id}', status: 'Click to switch' },
    // { name: 'AutoEmbed', url: 'https://player.autoembed.to/embed/tv/{id}', status: 'Click to switch' },
    // { name: 'MultiEmbed', url: 'https://multiembed.mov/directstream.php?video_id={id}', status: 'Click to switch' },
    { name: 'VidSrc.xyz', url: 'https://vidsrc.xyz/embed/tv/{id}', status: 'Active' },
    // { name: 'PrimeWire', url: 'https://player.primewire.mx/embed/tv/{id}', status: 'Click to switch' },
    // { name: 'WarezCDN', url: 'https://player.warezcdn.com/embed/tv/{id}', status: 'Click to switch' },
    // { name: 'SuperFlix', url: 'https://player.superflix.net/embed/tv/{id}', status: 'Click to switch' },
    // { name: 'VidStream', url: 'https://player.vidstream.pro/embed/tv/{id}', status: 'Click to switch' }
];

// Display sources list
function displaySources(id, type) {
    sourcesList.innerHTML = sources.map(source => {
        const itemId = (type === 'tv' && imdbId) ? imdbId : id;
        return `
        <div class="source-item ${source.status === 'Active' ? 'active' : ''}" data-url="${source.url.replace('{id}', itemId)}">
            <span>${source.name}</span>
            <span>${source.status}</span>
        </div>
    `;
    }).join('');

    // Add event listeners
    document.querySelectorAll('.source-item').forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all
            document.querySelectorAll('.source-item').forEach(i => i.classList.remove('active'));
            // Add to clicked
            item.classList.add('active');
            // Embed video
            const url = item.dataset.url;
            embedVideo(url);
        });
    });

    // Initially embed the active one
    const activeItem = document.querySelector('.source-item.active');
    if (activeItem) {
        const url = activeItem.dataset.url;
        embedVideo(url);
    }
}

// Embed video
function embedVideo(url) {
    videoEmbed.innerHTML = `<iframe src="${url}" allowfullscreen></iframe>`;
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

// Season select
seasonSelect.addEventListener('change', async () => {
    const seasonNumber = seasonSelect.value;
    if (seasonNumber) {
        selectedSeason = seasonNumber;
        episodeSelect.innerHTML = '<option value="">Select Episode</option>';
        try {
            const response = await fetch(`${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`);
            const seasonData = await response.json();
            seasonData.episodes.forEach(episode => {
                const option = document.createElement('option');
                option.value = episode.episode_number;
                option.textContent = `Episode ${episode.episode_number}: ${episode.name}`;
                episodeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching episodes:', error);
        }
    }
});

// Episode select
episodeSelect.addEventListener('change', () => {
    const episodeNumber = episodeSelect.value;
    if (episodeNumber) {
        selectedEpisode = episodeNumber;
        // Re-embed with new season/episode
        const activeItem = document.querySelector('.source-item.active');
        if (activeItem) {
            let url = activeItem.dataset.url;
            url += `?s=${selectedSeason}&e=${selectedEpisode}`;
            embedVideo(url);
        }
    }
});

// Initialize
const id = getMovieIdFromUrl();
if (id) {
    fetchMovieDetails(id).then(() => {
        displaySources(id, 'tv');
    });
} else {
    movieDetails.innerHTML = '<p>No TV show selected.</p>';
}