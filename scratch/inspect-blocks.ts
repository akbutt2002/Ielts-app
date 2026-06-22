import fs from 'fs';

const dataPath = 'c:/Users/akbut/Ielts-app/packages/features/ielts/src/lib/ielts_listening.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const test = data.find((t) => t.title === 'Cambridge 16 Listening Test 1');
if (!test) {
  console.log('Test not found!');
  process.exit(1);
}

console.log('Parts in test:', test.parts?.length);
test.parts?.forEach((part, partIdx) => {
  console.log(`Part ${partIdx + 1}:`);
  const blocks = part.blocks ?? part.questions ?? [];
  blocks.forEach((block, blockIdx) => {
    console.log(`  Block ${blockIdx + 1}:`);
    console.log(`    header: "${block.header}"`);
    console.log(`    question_numbers:`, block.question_numbers);
    console.log(`    choices count:`, block.choices?.length);
    if (partIdx === 2 && blockIdx === 0) {
      console.log(`    FULL TEXT:\n"""\n${block.text}\n"""`);
    } else {
      console.log(`    text snippet: "${block.text?.slice(0, 100).replace(/\r?\n/g, ' ')}"`);
    }
  });
});
