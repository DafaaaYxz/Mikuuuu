import { NlpManager } from 'node-nlp';
import fs from 'fs';
import path from 'path';

const datasetPath = path.join(__dirname, '../dataset.json');
const manager = new NlpManager({ languages: ['id'], forceNER: true });

// Fungsi Melatih AI
export const trainMiku = async () => {
    console.log("🎧 Miku sedang belajar (Training AI)...");
    
    const fileData = fs.readFileSync(datasetPath, 'utf8');
    const corpus = JSON.parse(fileData);

    corpus.data.forEach((group: any) => {
        group.utterances.forEach((utt: string) => manager.addDocument('id', utt, group.intent));
        group.answers.forEach((ans: string) => manager.addAnswer('id', group.intent, ans));
    });

    await manager.train();
    manager.save();
    console.log("✅ Miku siap berbicara!");
};

// Fungsi Chat
export const talkToMiku = async (message: string) => {
    const response = await manager.process('id', message);
    
    // Jika AI bingung (confidence rendah), berikan jawaban default Miku
    if (!response.answer || response.score < 0.5) {
        return getRandomDefaultResponse();
    }

    return response.answer;
};

function getRandomDefaultResponse() {
    const defaults = [
        "Umm... maaf, aku kurang paham maksudmu...",
        "Ah... aku melamun tadi. Bisa ulangi?",
        "Itu... agak sulit dimengerti bagiku.",
        "Mmm... (Miku menatapmu bingung)",
        "Maaf... aku hanya memikirkan sejarah tadi."
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}
