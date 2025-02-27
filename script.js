/**
    * Searches for a song using Spotify API
    * @param {string} query - The song name to search for
    * @returns {Promise<object|null>} The song data
*/
async function searchSong(query) {
    const response = await fetch(`/api/spotify?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    
    if (data.tracks.items.length > 0) {
        const track = data.tracks.items[0];
        const genre = await getArtistGenre(track.artists[0].id);
        return { ...track, genre };
    }
    return null;
}

/**
    * Retrieves the genre of an artist from the Spotify API
    * @param {string} artistId - The artist's Spotify ID
    * @returns {Promise<string>} The genre of the artist
*/
async function getArtistGenre(artistId) {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`);
    const data = await response.json();
    return data.genres.length > 0 ? data.genres[0] : 'Unknown';
}

/**
    * Fetches AI-generated song recommendations based on selected song
    * @param {string} songTitle - The song title
    * @param {string} artist - The artist
    * @returns {Promise<void>} Updates the UI with recommended songs
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
    * Search button event handler
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