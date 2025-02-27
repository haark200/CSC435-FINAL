export default async function handler(req, res) {
    if (!req.body.songTitle || !req.body.artist) {
        return res.status(400).json({ error: "Missing song title or artist" });
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                { role: "system", content: "You are an AI that recommends songs based on similarity to a given song." },
                { role: "user", content: `Suggest 5 songs similar to '${req.body.songTitle}' by '${req.body.artist}', but do not include the same song.` }
            ],
            max_tokens: 100
        })
    });

    const data = await response.json();
    res.status(200).json(data);
}
