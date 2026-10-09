export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { messages, systemPrompt } = req.body;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) return res.status(500).json({ error: 'API key belum diset' });

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt || 'Kamu adalah asisten AI yang cerdas dan ramah.' },
                    ...messages
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });
        const data = await response.json();
        if (!response.ok) return res.status(response.status).json({ error: data.error?.message || 'Gagal memanggil AI' });
        const reply = data.choices?.[0]?.message?.content || 'Maaf, tidak ada respons.';
        res.status(200).json({ reply });
    } catch (error) {
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
}
