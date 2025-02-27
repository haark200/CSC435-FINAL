export default async function handler(req, res) {
    if (!req.query.q) {
        return res.status(400).json({ error: "Missing query parameter" });
    }

    const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
    const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

    // Get access token
    const authResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
        },
        body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Fetch song from Spotify
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(req.query.q)}&type=track&limit=1`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    const data = await response.json();
    res.status(200).json(data);
}
