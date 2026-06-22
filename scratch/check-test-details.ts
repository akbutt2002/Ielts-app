import fs from 'fs';
import path from 'path';

const dataPath = 'c:/Users/akbut/Ielts-app/packages/features/ielts/src/lib/ielts_listening.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const test = data.find(t => t.title === 'Cambridge 16 Listening Test 1');
console.log('test_type:', test.test_type);
console.log('isListening flag would be:', test.test_type === 'listening');
