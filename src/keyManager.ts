import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const keysPath = path.join(__dirname, '../keys.json');

// Inisialisasi file jika belum ada
if (!fs.existsSync(keysPath)) {
    fs.writeFileSync(keysPath, JSON.stringify([]));
}

interface ApiKey {
    key: string;
    owner: string;
    count: number;
}

export const createKey = (owner: string): string => {
    const keys: ApiKey[] = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
    const newKey = `miku-${uuidv4().substring(0, 8)}`; // Key pendek: miku-a1b2c3d4
    
    keys.push({ key: newKey, owner, count: 0 });
    fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2));
    
    return newKey;
};

export const verifyKey = (key: string): boolean => {
    const keys: ApiKey[] = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
    const foundIndex = keys.findIndex(k => k.key === key);
    
    if (foundIndex !== -1) {
        keys[foundIndex].count += 1;
        fs.writeFileSync(keysPath, JSON.stringify(keys, null, 2)); // Update usage
        return true;
    }
    return false;
};
