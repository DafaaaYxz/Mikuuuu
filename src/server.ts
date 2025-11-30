import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { trainMiku, talkToMiku } from './brain';
import { createKey, verifyKey } from './keyManager';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public')));

// --- WEB UI ---
app.get('/', (req, res) => res.render('index'));

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    const reply = await talkToMiku(message);
    res.json({ reply });
});

app.post('/new-key', (req, res) => {
    const { name } = req.body;
    const key = createKey(name || "User");
    res.json({ key });
});

// --- PUBLIC API (Endpoint untuk orang lain) ---
app.post('/api/miku', async (req, res) => {
    const apiKey = req.headers['x-api-key'] as string;
    const { message } = req.body;

    if (!apiKey || !verifyKey(apiKey)) {
        return res.status(403).json({ 
            success: false, 
            message: "Maaf... siapa kamu? (API Key Salah/Tidak Ada)" 
        });
    }

    if (!message) return res.status(400).json({ error: "Pesan kosong" });

    const reply = await talkToMiku(message);
    
    res.json({
        success: true,
        bot: "Miku Nakano",
        response: reply
    });
});

// Jalankan Server setelah Training selesai
trainMiku().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🎧 Miku Server Online di Termux!`);
        console.log(`🌐 Web UI: http://localhost:${PORT}`);
        console.log(`🔌 API URL: http://localhost:${PORT}/api/miku`);
    });
});
