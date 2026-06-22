import fs from 'fs';
import path from 'path';
import { normalizeSchemaQuestionBlocks, parseQuestionBlock } from '../apps/web/app/home/ielts/tests/[id]/utils/question-parser';

const dataPath = 'c:/Users/akbut/Ielts-app/packages/features/ielts/src/lib/ielts_listening.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

const test = data.find((t) => t.title === 'Cambridge 16 Listening Test 1');

// Replicate test-page.tsx visibleQuestionBlocks
const sourceBlocks = normalizeSchemaQuestionBlocks(test, true);
const parsedQuestionBlocks = sourceBlocks.map((qBlock) => parseQuestionBlock(qBlock));

const visibleQuestionBlocks = parsedQuestionBlocks; // isListening is true

// Replicate test-page.tsx displayQuestionGroups
const groups = [];
let currentGroup = [];
let currentGroupLastQuestion = 0;
let currentGroupIsStructured = false;

const isStructuredGroupStarter = (block) => false; // Listening doesn't have structured note blocks start
const getBlockLastQuestion = (block) => block.questionNumbers[block.questionNumbers.length - 1] ?? 0;

const canAppendToCurrentGroup = (next) => {
  if (currentGroup.length === 0 || currentGroupIsStructured) {
    return false;
  }
  const nextFirstQuestion = next.questionNumbers[0] ?? 0;
  const currentGroupAllQuestions = currentGroup.flatMap((b) => b.questionNumbers);
  return (
    (nextFirstQuestion === currentGroupLastQuestion + 1 ||
      currentGroupAllQuestions.includes(nextFirstQuestion)) &&
    !next.instructions.trim() &&
    !next.contentHeading?.trim() &&
    !isStructuredGroupStarter(next)
  );
};

const pushCurrentGroup = () => {
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }
};

visibleQuestionBlocks.forEach((block) => {
  if (currentGroup.length === 0) {
    currentGroup = [block];
    currentGroupLastQuestion = getBlockLastQuestion(block);
    currentGroupIsStructured = isStructuredGroupStarter(block);
    return;
  }
  if (canAppendToCurrentGroup(block)) {
    currentGroup.push(block);
    currentGroupLastQuestion = getBlockLastQuestion(block);
    return;
  }
  pushCurrentGroup();
  currentGroup = [block];
  currentGroupLastQuestion = getBlockLastQuestion(block);
  currentGroupIsStructured = isStructuredGroupStarter(block);
});
pushCurrentGroup();

console.log('Total groups in page:', groups.length);
groups.forEach((group, idx) => {
  const [primaryBlock, ...continuationBlocks] = group;
  const groupedQuestionNumbers = Array.from(
    new Set(
      [primaryBlock, ...continuationBlocks].flatMap(
        (block) => block.questionNumbers ?? [],
      ),
    ),
  ).sort((a, b) => a - b);
  const groupFirstQuestion = groupedQuestionNumbers[0] ?? 0;
  const groupLastQuestion = groupedQuestionNumbers[groupedQuestionNumbers.length - 1] ?? 0;
  
  const isListeningTest4TrainingProgrammesBlock = false;
  const pairedChoiceQuestionNumbers = isListeningTest4TrainingProgrammesBlock
    ? [11, 12]
    : primaryBlock.questionNumbers;

  const isListening18Test3Q1to4 = false;
  const isListening18Test3Q5to10 = false;
  const isListening17Test2Q8to10 = false;
  const shouldRenderGeneral18Test3RoadDiagram = false;
  
  const isListeningTest4MarathonQuestionBlock = false;
  const isListeningTest2ShoeProjectQuestionBlock = false;

  const isPairedListeningChoiceBlock =
    true && // isListening
    !isListeningTest4MarathonQuestionBlock &&
    !isListeningTest2ShoeProjectQuestionBlock &&
    pairedChoiceQuestionNumbers.length === 2 &&
    (primaryBlock.choices?.length ?? 0) > 0;

  console.log(`Group ${idx + 1}: firstQ=${groupFirstQuestion}, lastQ=${groupLastQuestion}`);
  console.log(`  primaryBlock header: "${primaryBlock.header}"`);
  console.log(`  primaryBlock questionNumbers: ${primaryBlock.questionNumbers}`);
  console.log(`  primaryBlock choices count:`, primaryBlock.choices?.length);
  console.log(`  isPairedListeningChoiceBlock:`, isPairedListeningChoiceBlock);
  console.log(`  pairedChoiceQuestionNumbers:`, pairedChoiceQuestionNumbers);
});
