/**
    * Fetches Spotify token
    * @returns {Promise<string>} The access token
*/
async function getSpotifyToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
        },
        body: 'grant_type=client_credentials'
    });
    const data = await response.json();
    return data.access_token;
}

/**
    * Searches for a song using the Spotify API
    * @param {string} query - The song name
    * @returns {Promise<object|null>} The song data
*/
async function searchSong(query) {
    const token = await getSpotifyToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    if (!data.tracks || !data.tracks.items || data.tracks.items.length === 0) {
        console.error("No tracks found:", data);
        return null;
    }
    const track = data.tracks.items[0];
    const genre = await getArtistGenre(track.artists[0]?.id, token);
    return { ...track, genre };
}

/**
    * Retrieves the genre of an artist from the Spotify API
    * @param {string} artistId - The artist's Spotify ID
    * @param {string} token - The Spotify access token
    * @returns {Promise<string>} The genre of the artist
*/
async function getArtistGenre(artistId, token) {
    if (!artistId) {
        return "Unknown";
    }
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.genres?.length > 0 ? data.genres[0] : "Unknown";
}

/**
    * Fetches AI-generated song recommendations based on a song title
    * @param {string} songTitle - The song title
    * @param {string} artist - The artist
    * @returns {Promise<string[]>} A list of recommended songs
*/
async function getAIMusicRecommendations(songTitle, artist) {
    document.getElementById('recommendations').innerHTML = '<p>Loading recommendations...</p>';

    const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ songTitle, artist })
    });

    const data = await response.json();
    document.getElementById('recommendations').innerHTML = data.choices[0].message.content.trim().split('\n')
        .map(song => `<li>${song}</li>`).join('');
}

/**
    * Handles the search button listener
*/
document.getElementById('search-btn').addEventListener('click', async () => {
    const query = document.getElementById('search-input').value;
    const song = await searchSong(query);
    if (song) {
        document.getElementById('song-info').innerHTML = `<h3>${song.name} by ${song.artists[0].name}</h3>
        <p>Album: ${song.album.name}</p>
        <p>Genre: ${song.genre}</p>`;
        await getAIMusicRecommendations(song.name, song.artists[0].name);
    } else {
        document.getElementById('song-info').innerHTML = 'No song found';
    }
});
