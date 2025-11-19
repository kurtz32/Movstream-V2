const API_KEY = 'ce92539c90889cc88a401b0a7f040bb7';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesContainer = document.getElementById('movies-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const loadMoreBtn = document.getElementById('load-more-btn');

let currentPage = 1;
let currentQuery = '';
let currentGenre = 'popular';
let currentCategory = 'movie';
let searchTimeout;

const genres = {
  'Horror': 27,
  'Action': 28,
  'Thriller': 53,
  'Western': 37,
  'Comedy': 35,
  'Drama': 18,
  'Fantasy': 14,
  'Adventure': 12,
  'Science fiction': 878,
  'Romance': 10749,
  'Mystery': 9648,
  'History': 36
};

// Generate star rating
function generateStars(rating) {
  const maxStars = 5;
  const starRating = rating / 2; // Since TMDB is out of 10, convert to 5 stars
  let stars = '';
  for (let i = 1; i <= maxStars; i++) {
    if (i <= starRating) {
      stars += '★';
    } else if (i - 0.5 <= starRating) {
      stars += '☆';
    } else {
      stars += '☆';
    }
  }
  return stars;
}


// Fetch popular on load
async function fetchPopular(page = 1, append = false) {
    try {
        const response = await fetch(`${BASE_URL}/${currentCategory}/popular?api_key=${API_KEY}&page=${page}`);
        const data = await response.json();
        displayMovies(data.results, append);
    } catch (error) {
        console.error('Error fetching popular:', error);
    }
}

// Fetch by genre
async function fetchByGenre(genreId, page = 1, append = false) {
    try {
        const response = await fetch(`${BASE_URL}/discover/${currentCategory}?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`);
        const data = await response.json();
        displayMovies(data.results, append);
    } catch (error) {
        console.error('Error fetching by genre:', error);
    }
}

// Search
async function search(query, page = 1, append = false) {
    try {
        const response = await fetch(`${BASE_URL}/search/${currentCategory}?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`);
        const data = await response.json();
        displayMovies(data.results, append);
    } catch (error) {
        console.error('Error searching:', error);
    }
}

// Fetch movie details
async function fetchMovieDetails(movieId) {
    try {
        const response = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`);
        const data = await response.json();
        displayMovieDetails(data);
    } catch (error) {
        console.error('Error fetching movie details:', error);
    }
}

// Display movies/TV in grid
function displayMovies(items, append = false) {
    if (!append) {
        moviesContainer.innerHTML = '';
    }
    items.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.classList.add('movie-card');
        const title = currentCategory === 'tv' ? item.name : item.title;
        const releaseDate = currentCategory === 'tv' ? item.first_air_date : item.release_date;
        const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
        const stars = generateStars(item.vote_average);
        const overview = item.overview ? item.overview.substring(0, 100) + '...' : 'No overview available.';
        itemCard.innerHTML = `
            <img src="${item.poster_path ? IMAGE_BASE_URL + item.poster_path : 'https://dummyimage.com/300x450/cccccc/000000&text=No+Image'}" alt="${title}" class="movie-poster">
            <div class="movie-info">
                <h3 class="movie-title">${title} (${releaseYear})</h3>
                <p class="movie-overview">${overview}</p>
            </div>
            <div class="movie-rating">${stars} ${item.vote_average.toFixed(1)}</div>
        `;
        itemCard.addEventListener('click', () => {
            const page = currentCategory === 'tv' ? 'tv.html' : 'movie.html';
            window.location.href = `${page}?id=${item.id}`;
        });
        moviesContainer.appendChild(itemCard);
    });
}



// Category buttons
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
        currentPage = 1;
        currentQuery = '';
        currentGenre = 'popular';
        document.querySelectorAll('.genre-btn').forEach(g => g.classList.remove('active'));
        document.querySelector('.genre-btn[data-genre="popular"]').classList.add('active');
        fetchPopular(currentPage);
    });
});

// Event listeners
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    currentPage = 1;
    currentQuery = query;
    currentGenre = 'search';
    if (query) {
        search(query, currentPage);
    } else {
        currentGenre = 'popular';
        fetchPopular(currentPage);
    }
});

searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        currentQuery = query;
        currentGenre = 'search';
        if (query) {
            search(query, currentPage);
        } else {
            currentGenre = 'popular';
            fetchPopular(currentPage);
        }
    }, 500); // Debounce 500ms
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Genre buttons
document.querySelectorAll('.genre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const genre = btn.dataset.genre;
        currentPage = 1;
        currentGenre = genre;
        currentQuery = '';
        if (genre === 'popular') {
            fetchPopular(currentPage);
        } else {
            const genreId = genres[genre];
            if (genreId) {
                fetchByGenre(genreId, currentPage);
            }
        }
    });
});

// Load more
loadMoreBtn.addEventListener('click', () => {
    currentPage++;
    if (currentQuery) {
        search(currentQuery, currentPage, true);
    } else if (currentGenre === 'popular') {
        fetchPopular(currentPage, true);
    } else {
        const genreId = genres[currentGenre];
        if (genreId) {
            fetchByGenre(genreId, currentPage, true);
        }
    }
});

// Initialize
fetchPopular();
