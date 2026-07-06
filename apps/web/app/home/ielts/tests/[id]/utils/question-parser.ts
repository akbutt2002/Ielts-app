import type React from 'react';

import { type IeltsTestRecord } from '@kit/ielts';

type AnswerEntry = {
  q_no: number;
  answer: string;
};

type QuestionBlock = {
  header: string;
  question_numbers: number[];
  text: string;
  choices?: string[];
};

type ParsedQuestionItem = {
  qNum: number;
  prompt: string;
};

type ParsedQuestionBlock = {
  header: string;
  questionNumbers: number[];
  instructions: string;
  contentHeading?: string;
  choices: string[];
  items: ParsedQuestionItem[];
  rawText: string;
};

type ParsedNoteSection = {
  heading: string;
  items: string[];
};

type ParsedNoteBlock = {
  instructionText: string;
  title: string;
  lead: string[];
  sections: ParsedNoteSection[];
};

type ParsedSummaryBlock = {
  instructionText: string;
  title: string;
  summaryText: string;
};

type ListeningPart = {
  part_no?: number;
  blocks?: QuestionBlock[];
  questions?: QuestionBlock[];
};

type ListeningBlockMeta = {
  block: QuestionBlock;
  blankCount: number;
  headerQuestionNumbers: number[];
  inferredQuestionNumbers: number[];
  questionNumbers: number[];
  slotCount: number;
};

type ReadingInstruction = {
  text?: string;
  choices?: string[];
};

type ReadingQuestionRow = {
  number?: number;
  section?: string;
  question_type?: string;
  instruction?: ReadingInstruction | string;
  text?: string;
  choices?: string[];
};

type Passage = {
  heading?: string;
  instruction?: string;
  text?: string;
};

type ReadingSection = {
  section?: string;
  passages?: Passage[];
};

export function buildAnswerLookup(test: any) {
  const lookup = new Map<number, string>();

  if (Array.isArray(test?.answer_key) && test.answer_key.length > 0) {
    test.answer_key.forEach((entry: AnswerEntry) => {
      const qNum = Number(entry.q_no);

      if (Number.isFinite(qNum)) {
        lookup.set(qNum, String(entry.answer ?? ''));
      }
    });

    return lookup;
  }

  if (typeof test?.answer_text === 'string') {
    test.answer_text.split(/\r?\n/).forEach((line: string) => {
      const match = line.match(/^(\d+)(?:\/(\d+))?\s+(.+)$/);

      if (!match) {
        return;
      }

      const first = Number(match[1]);
      const second = match[2] ? Number(match[2]) : null;
      const answer = (match[3] ?? '').trim();

      if (Number.isFinite(first)) {
        lookup.set(first, answer);
      }

      if (second !== null && Number.isFinite(second)) {
        lookup.set(second, answer);
      }
    });
  }

  return lookup;
}

export function uniqueQuestionNumbers(questionNumbers: number[] = []) {
  return Array.from(
    new Set(questionNumbers.filter((qNum) => Number.isFinite(qNum))),
  );
}

export function buildSequentialQuestionRange(start: number, end: number) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return [];
  }

  const first = Math.min(start, end);
  const last = Math.max(start, end);

  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

export function countBlankMarkers(text: string) {
  return (text.match(/_{2,}/g) ?? []).length;
}

export function isPureRangeLine(line: string) {
  return /^\d+\s*[-\u2013\u2014]\s*\d+$/.test(line);
}

export function detectQuestionMarker(line: string, questionNumbers: number[]) {
  const trimmed = line.trim();

  if (
    !trimmed ||
    isPureRangeLine(trimmed) ||
    /^Questions?\s+\d+(?:(?:\s*(?:to|-|\u2013|\u2014)\s*|\s+and\s+)\d+)?\.?$/i.test(trimmed)
  ) {
    return null;
  }

  const questionWordMatch = trimmed.match(
    /^Question\s+(\d+)(?:[.)]?\s*)?(.*)$/i,
  );

  if (questionWordMatch?.[1]) {
    const qNum = Number(questionWordMatch[1]);

    if (questionNumbers.includes(qNum)) {
      return {
        qNum,
        prompt: (questionWordMatch[2] ?? '').trim(),
      };
    }
  }

  const orderedQuestionNumbers = uniqueQuestionNumbers(questionNumbers).sort(
    (a, b) => String(b).length - String(a).length || b - a,
  );

  for (const qNum of orderedQuestionNumbers) {
    const qStr = String(qNum);

    if (!trimmed.startsWith(qStr)) {
      continue;
    }

    const remainder = trimmed.slice(qStr.length).trimStart();

    if (!remainder) {
      return {
        qNum,
        prompt: '',
      };
    }

    const firstChar = remainder.charAt(0);
    const suffix = trimmed.slice(qStr.length);

    if (!/[a-z]/.test(firstChar) || (suffix.length > 0 && /^\s/.test(suffix))) {
      return {
        qNum,
        prompt: remainder.replace(/^[\s.:\)\-\u2013\u2014\]]+/, ''),
      };
    }
  }

  return null;
}

export function extractQuestionNumbersFromRangeText(text: string) {
  const normalizedText = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ');

  const rangeMatch = normalizedText.match(
    /Questions?\s+(\d+)(?:\s*(?:to|-|\u2013|\u2014)\s*(\d+)|\s+and\s+(\d+))?/i,
  );

  if (!rangeMatch) {
    return [];
  }

  const start = Number(rangeMatch[1]);
  const end = Number(rangeMatch[2] ?? rangeMatch[3] ?? rangeMatch[1]);

  return buildSequentialQuestionRange(start, end);
}

export function extractQuestionNumbersFromHeader(header: string) {
  const normalizedHeader = header.trim();
  const leadingQuestionMatch = normalizedHeader.match(/^(\d+)[.)]?\s+\S/);

  if (leadingQuestionMatch?.[1]) {
    return [Number(leadingQuestionMatch[1])];
  }

  return extractQuestionNumbersFromRangeText(normalizedHeader);
}

export function inferListeningQuestionNumbersFromText(
  text: string,
  choices: string[] = [],
) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const inferred: number[] = [];

  const pushQuestionNumber = (value: number) => {
    if (
      Number.isFinite(value) &&
      value >= 1 &&
      value <= 40 &&
      !inferred.includes(value)
    ) {
      inferred.push(value);
    }
  };

  lines.forEach((line, index) => {
    const nextLine = lines[index + 1] ?? '';
    const lineAfterNext = lines[index + 2] ?? '';
    const standaloneMatch = line.match(/^(\d+)[.)]?$/);

    if (
      standaloneMatch?.[1] &&
      (/^_+$/.test(nextLine) ||
        (/^[.:\-)\]]/.test(nextLine) && /^_+$/.test(lineAfterNext)))
    ) {
      pushQuestionNumber(Number(standaloneMatch[1]));
      return;
    }

    if (/^_+$/.test(nextLine)) {
      const trailingMatch = line.match(/(\d+)[.)]?\s*(?:Â£)?\s*$/);
      if (trailingMatch?.[1]) {
        pushQuestionNumber(Number(trailingMatch[1]));
        return;
      }
    }

    if (choices.length > 0) {
      const choicePromptMatch = line.match(/^(\d+)[.)]?\s+\S/);
      if (choicePromptMatch?.[1]) {
        pushQuestionNumber(Number(choicePromptMatch[1]));
      }
    }
  });

  return inferred.length > 0
    ? inferred
    : extractQuestionNumbersFromRangeText(text);
}

export function estimateListeningSlotCount(
  block: QuestionBlock,
  inferredQuestionNumbers: number[],
  headerQuestionNumbers: number[],
) {
  const blankCount = countBlankMarkers(block.text ?? '');

  if (blankCount > 0) {
    return blankCount;
  }

  if ((block.choices ?? []).length > 0) {
    if (inferredQuestionNumbers.length > 0) {
      return inferredQuestionNumbers.length;
    }

    if (headerQuestionNumbers.length > 0) {
      return headerQuestionNumbers.length;
    }
  }

  return Math.max(
    inferredQuestionNumbers.length,
    headerQuestionNumbers.length,
    uniqueQuestionNumbers(block.question_numbers ?? []).length,
  );
}

export function expandQuestionNumbersToSlotCount(
  questionNumbers: number[],
  slotCount: number,
  expectedPartNumbers: number[],
) {
  if (questionNumbers.length === 0 || slotCount <= questionNumbers.length) {
    return questionNumbers;
  }

  const expansion = buildSequentialQuestionRange(
    questionNumbers[0]!,
    questionNumbers[0]! + slotCount - 1,
  );

  if (
    expansion.length === slotCount &&
    questionNumbers.every((qNum) => expansion.includes(qNum)) &&
    expansion.every((qNum) => expectedPartNumbers.includes(qNum))
  ) {
    return expansion;
  }

  return questionNumbers;
}

export function isEmptyListeningDuplicateBlock(block: QuestionBlock) {
  return !block.text?.trim() && Boolean(block.header?.trim());
}

export function hasRenderableAnswerSlot(block: QuestionBlock) {
  return (
    countBlankMarkers(block.text ?? '') > 0 || (block.choices?.length ?? 0) > 0
  );
}

export function normalizeChoiceLabel(choice: string) {
  return choice.replace(/`+$/g, '').replace(/\s+/g, ' ').trim();
}

export function normalizeBlockChoices(choices: string[] = []) {
  return choices
    .map((choice) => normalizeChoiceLabel(String(choice ?? '')))
    .filter((choice) => choice && !/^None$/i.test(choice));
}

export function isChoiceLine(line: string) {
  const trimmedLine = normalizeChoiceLabel(line);

  return (
    /^(TRUE|FALSE|NOT GIVEN|NG|YES|NO)$/i.test(trimmedLine) ||
    /^[A-Z](?:[.)])?(?:\s+.+)?$/i.test(trimmedLine) ||
    /^[ivxlcdm]+$/i.test(trimmedLine)
  );
}

export function isQuestionContentHeadingLine(
  line: string,
  previousInstructionLines: string[],
) {
  const normalizedLine = normalizeInstructionFragment(line);
  const isTitlePromptLine =
    /^Which title is the most suitable for the text\?$/i.test(normalizedLine) ||
    /^Which heading is the most suitable for the text\?$/i.test(normalizedLine);

  if (
    !normalizedLine ||
    normalizedLine.length > 120 ||
    (!isTitlePromptLine && /[.!?:]$/.test(normalizedLine)) ||
    questionRangePattern.test(normalizedLine) ||
    /^List of Headings$/i.test(normalizedLine) ||
    /^(Opinions|Options)$/i.test(normalizedLine) ||
    isChoiceLine(normalizedLine)
  ) {
    return false;
  }

  if (!/^[A-Z0-9]/.test(normalizedLine)) {
    return false;
  }

  if (
    previousInstructionLines.some(
      (entry) =>
        /^List of\b/i.test(entry) ||
        /^(?:Opinions|Options)$/i.test(entry.trim()),
    )
  ) {
    return false;
  }

  if (getInstructionLineStyle(normalizedLine) !== 'base') {
    return false;
  }

  if (previousInstructionLines.length === 0) {
    return false;
  }

  if (
    /^(?:Read|Look|Complete|Choose|Write|Do|Match|Label|Find|For|In boxes?|Questions?|NB|TRUE|FALSE|NOT GIVEN|YES|NO)\b/i.test(
      normalizedLine,
    )
  ) {
    return false;
  }

  const wordCount = normalizedLine.split(/\s+/).length;

  return normalizedLine.length >= 4 && wordCount <= 20;
}

export function extractInlineQuestionItems(
  line: string,
  questionNumbers: number[],
): ParsedQuestionItem[] {
  const normalizedQuestionNumbers = uniqueQuestionNumbers(questionNumbers);

  if (!line.includes('____') || normalizedQuestionNumbers.length === 0) {
    return [];
  }

  const markers = normalizedQuestionNumbers
    .flatMap((qNum) => {
      const pattern = new RegExp(`(?:^|\\s)${qNum}(?:[.)])?\\s+`, 'g');
      const matches: Array<{ qNum: number; start: number; end: number }> = [];
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(line)) !== null) {
        const rawMatch = match[0] ?? '';
        const leadingWhitespace = rawMatch.match(/^\s+/)?.[0].length ?? 0;

        matches.push({
          qNum,
          start: match.index + leadingWhitespace,
          end: match.index + rawMatch.length,
        });
      }

      return matches;
    })
    .sort((a, b) => a.start - b.start);

  if (markers.length === 0) {
    return [];
  }

  return markers
    .map((marker, index) => {
      const nextMarker = markers[index + 1];
      const prefix = index === 0 ? line.slice(0, marker.start).trim() : '';
      const segment = line
        .slice(marker.end, nextMarker?.start ?? line.length)
        .trim();

      if (!segment.includes('____')) {
        return null;
      }

      return {
        qNum: marker.qNum,
        prompt: joinInstructionFragments(prefix, segment),
      };
    })
    .filter((item): item is ParsedQuestionItem => Boolean(item));
}

export function detectTrailingBlankQuestionMarker(
  line: string,
  nextLine: string | undefined,
  questionNumbers: number[],
) {
  if (!nextLine || !/^_+$/.test(nextLine.trim())) {
    return null;
  }

  const trailingMatch = line.trim().match(/^(.*?)(\d+)[.)]?\s*$/);

  if (!trailingMatch?.[2]) {
    return null;
  }

  const qNum = Number(trailingMatch[2]);

  if (!questionNumbers.includes(qNum)) {
    return null;
  }

  return {
    qNum,
    prompt: joinInstructionFragments((trailingMatch[1] ?? '').trim(), '____'),
  };
}

export function extractQuestionNumbersFromQuestionText(text: string) {
  const lines = String(text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const inferred: number[] = [];

  const pushQuestionNumber = (value: number) => {
    if (
      Number.isFinite(value) &&
      value >= 1 &&
      value <= 40 &&
      !inferred.includes(value)
    ) {
      inferred.push(value);
    }
  };

  lines.forEach((line, index) => {
    if (isPureRangeLine(line) || /^Questions?\b/i.test(line)) {
      return;
    }

    const questionWordMatch = line.match(/^Question\s+(\d+)\b/i);

    if (questionWordMatch?.[1]) {
      pushQuestionNumber(Number(questionWordMatch[1]));
    }

    const leadingMatch = line.match(/^(\d+)(?:[.)])?(?:\s+|$)/);

    if (leadingMatch?.[1]) {
      pushQuestionNumber(Number(leadingMatch[1]));
    }

    const nextLine = lines[index + 1] ?? '';
    const lineAfterNext = lines[index + 2] ?? '';
    const standaloneMatch = line.match(/^(\d+)[.)]?$/);

    if (
      standaloneMatch?.[1] &&
      (nextLine.includes('____') || lineAfterNext.includes('____'))
    ) {
      pushQuestionNumber(Number(standaloneMatch[1]));
    }

    const trailingBlankQuestion = line.match(/(?:^|\s)(\d+)[.)]?\s*$/);

    if (trailingBlankQuestion?.[1] && nextLine.includes('____')) {
      pushQuestionNumber(Number(trailingBlankQuestion[1]));
    }

    extractInlineQuestionItems(
      line,
      buildSequentialQuestionRange(1, 40),
    ).forEach((item) => pushQuestionNumber(item.qNum));
  });

  return inferred;
}

export function normalizeQuestionBlock(
  block: Partial<QuestionBlock>,
): QuestionBlock {
  const header = String(block.header ?? '');
  const text = String(block.text ?? '');
  const explicitQuestionNumbers = uniqueQuestionNumbers(
    (block.question_numbers ?? []).map(Number),
  );
  const questionNumbers = uniqueQuestionNumbers([
    ...explicitQuestionNumbers,
    ...extractQuestionNumbersFromHeader(header),
    ...extractQuestionNumbersFromQuestionText(text),
  ]).sort((a, b) => a - b);

  return {
    header,
    question_numbers: questionNumbers,
    text,
    choices: normalizeBlockChoices(block.choices ?? []),
  };
}

export function getExpectedQuestionNumbers(test: any) {
  if (Array.isArray(test?.answer_key) && test.answer_key.length > 0) {
    return uniqueQuestionNumbers(
      test.answer_key.map((entry: AnswerEntry) => Number(entry.q_no)),
    ).sort((a, b) => a - b);
  }

  const totalAnswers = Number(test?.total_answers);

  if (Number.isFinite(totalAnswers) && totalAnswers > 0) {
    return buildSequentialQuestionRange(1, totalAnswers);
  }

  return [];
}

export function findRawQuestionStart(lines: string[], qNum: number) {
  const pattern = new RegExp(
    `^(?:Question\\s+)?${qNum}(?:[.)])?(?:\\s+|$)`,
    'i',
  );

  return lines.findIndex((line) => pattern.test(line.trim()));
}

export function extractSupplementalQuestionBlock(
  rawText: string,
  qNum: number,
): QuestionBlock | null {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => normalizeInstructionFragment(line))
    .filter(Boolean);
  const startIndex = findRawQuestionStart(lines, qNum);

  if (startIndex === -1) {
    return null;
  }

  let endIndex = lines.length;

  for (let index = startIndex + 1; index < lines.length; index++) {
    const line = lines[index] ?? '';

    if (
      /^Questions?\s+\d+/i.test(line) ||
      /^PART\s+\d+/i.test(line) ||
      /^SECTION\s+\d+/i.test(line) ||
      findRawQuestionStart([line], qNum + 1) === 0
    ) {
      endIndex = index;
      break;
    }
  }

  const segmentLines = lines
    .slice(startIndex, endIndex)
    .filter((line) => !/^None$/i.test(line));
  const firstChoiceIndex = segmentLines.findIndex(isChoiceLine);
  const promptLines =
    firstChoiceIndex === -1
      ? segmentLines
      : segmentLines.slice(0, firstChoiceIndex);
  const choices =
    firstChoiceIndex === -1
      ? []
      : normalizeBlockChoices(segmentLines.slice(firstChoiceIndex));

  if (promptLines.length === 0 && choices.length === 0) {
    return null;
  }

  return normalizeQuestionBlock({
    header: `Question ${qNum}`,
    question_numbers: [qNum],
    text: promptLines.join('\n'),
    choices,
  });
}

export function supplementMissingQuestionBlocks(
  test: any,
  blocks: QuestionBlock[],
) {
  const expectedQuestionNumbers = getExpectedQuestionNumbers(test);

  if (expectedQuestionNumbers.length === 0) {
    return blocks;
  }

  const coveredQuestionNumbers = new Set(
    blocks.flatMap((block) => block.question_numbers ?? []),
  );
  const missingQuestionNumbers = expectedQuestionNumbers.filter(
    (qNum) => !coveredQuestionNumbers.has(qNum),
  );

  if (missingQuestionNumbers.length === 0) {
    return blocks;
  }

  const rawQuestionText = String(
    test?.content?.right_test_text ??
      test?.content?.test_text ??
      test?.raw?.right_test_text ??
      test?.raw?.test_text ??
      '',
  );

  if (!rawQuestionText.trim()) {
    return blocks;
  }

  const supplementalBlocks = missingQuestionNumbers
    .map((qNum) => extractSupplementalQuestionBlock(rawQuestionText, qNum))
    .filter((block): block is QuestionBlock => Boolean(block));

  if (supplementalBlocks.length === 0) {
    return blocks;
  }

  return [...blocks, ...supplementalBlocks].sort((a, b) => {
    const firstA = a.question_numbers[0] ?? Number.MAX_SAFE_INTEGER;
    const firstB = b.question_numbers[0] ?? Number.MAX_SAFE_INTEGER;

    return firstA - firstB;
  });
}

export function normalizeSchemaQuestionBlocks(test: any, preferParts = false) {
  const partBlocks =
    preferParts && Array.isArray(test?.parts)
      ? test.parts.flatMap(
          (part: ListeningPart) => part.blocks ?? part.questions ?? [],
        )
      : [];
  let sourceBlocks =
    partBlocks.length > 0
      ? partBlocks
      : ((test?.questions ?? []) as QuestionBlock[]);
  if (/Cambridge 16 IELTS Academic Reading Test 1/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (
        block.header === 'Questions 8-13' &&
        block.question_numbers?.includes(8)
      ) {
        return {
          ...block,
          header: 'Questions 8-13',
          question_numbers: [8, 9, 10, 11, 12, 13],
          text: [
            'Complete the table below.',
            'Choose ONE WORD ONLY from the passage for each answer.',
            'Write your answers in boxes 8-13 on your answer sheet.',
            'Reasons why polar bears should be protected',
            '– People think of bears as unintelligent and 8. ____',
            'However, this may not be correct. For example:',
            '– In Tennoji Zoo, a bear has been seen using a branch as a 9. ____',
            'This allowed him to knock down some 10. ____',
            '– A wild polar bear worked out a method of reaching a platform where a 11. ____ was located.',
            '– Polar bears have displayed behaviour such as conscious manipulation of objects and activity similar to a 12. ____',
            'Bears may also display emotions. For example:',
            '– They may make movements suggesting 13. ____ if disappointed when hunting.',
            '– They may form relationships with other species.',
          ].join('\n'),
        };
      }
      return block;
    });
  }
  if (/Cambridge 16 IELTS Academic Reading Test 4/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (
        block.header === 'READING PASSAGE 1 : Questions 1-13' &&
        block.question_numbers?.includes(1)
      ) {
        return {
          ...block,
          header: 'Questions 1-6',
          question_numbers: [1, 2, 3, 4, 5, 6],
        };
      }
      return block;
    });
  }
  if (/Cambridge 15 IELTS Academic Reading Test 1/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (
        block.header === 'Questions 23 and 24' &&
        block.question_numbers?.includes(23)
      ) {
        const cleanedText = [
          'Choose TWO letters, A-E.',
          'Write the correct letters in boxes 23 and 24 on your answer sheet.',
          'Which TWO benefits of automated vehicles does the writer mention?',
          '23.',
          '24.',
        ].join('\n');
        return {
          ...block,
          text: cleanedText,
        };
      }
      if (
        block.header === 'Questions 25 and 26' &&
        block.question_numbers?.includes(25)
      ) {
        const cleanedText = [
          'Choose TWO letters, A-E.',
          'Write the correct letters in boxes 25 and 26 on your answer sheet.',
          'Which TWO challenges to automated vehicle development does the writer mention?',
          '25.',
          '26.',
        ].join('\n');
        return {
          ...block,
          text: cleanedText,
        };
      }
      return block;
    });
  }
  if (/Cambridge 15 Listening Test 1/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (block.question_numbers?.includes(1)) {
        const cleanedText = [
          'Complete the notes below.',
          'Write ONE WORD AND/OR A NUMBER for each answer.',
          'Bankside Recruitment Agency',
          '– Address of agency: 497 Eastside, Docklands',
          '– Name of agent: Becky',
          '1.',
          '____',
          '– Phone number: 07866 510333',
          '– Best to call her in the',
          '2.',
          '____',
          'Typical jobs',
          '– Clerical and admin roles, mainly in the finance industry',
          '– Must have good',
          '3.',
          '____',
          'skills',
          '– Jobs are usually for at least one',
          '4.',
          '____',
          '.',
          '– Pay is usually £',
          '5.',
          '____',
          'per hour',
          'Registration process',
          '– Wear a',
          '6.',
          '____',
          'to the interview',
          '– Must bring your',
          '7.',
          '____',
          'to the interview',
          '– They will ask questions about each applicant’s',
          '8.',
          '____',
          'Advantages of using an agency',
          '– The',
          '9.',
          '____',
          'you receive at interview will benefit you',
          '– Will get access to vacancies which are not advertised',
          '– Less',
          '10.',
          '____',
          'is involved in applying for jobs',
        ].join('\n');

        return {
          ...block,
          text: cleanedText,
        };
      }
      if (block.question_numbers?.includes(31)) {
        const cleanedText = [
          'Complete the notes below.',
          'Write',
          'ONE WORD ONLY',
          'for each answer.',
          'The Eucalyptus Tree in Australia',
          'Importance',
          'it provides',
          '31.',
          '____',
          'and food for a wide range of species',
          'it’s leaves provide',
          '32.',
          '____',
          'which is used to make a disinfectant',
          'Reasons for present decline in number',
          'A) Diseases',
          '(i) ‘Mundulla Yellows’',
          'Cause',
          '– lime used for making',
          '33.',
          '____',
          'was absorbed',
          '– trees were unable to take in necessary iron through their roots',
          '(ii) ‘Bell-miner Associated Die-back’',
          'Cause',
          '–',
          '34.',
          '____',
          'feed on eucalyptus leaves',
          '– they secrete a substance containing sugar',
          '– bell-miner birds are attracted by this and keep away other species',
          'B) Bushfires',
          'William Jackson’s theory:',
          'high-frequency bushfires have impact on vegetation, resulting in the growth of',
          '35.',
          '____',
          'mid-frequency bushfires result in the growth of eucalyptus forests, because they:',
          '– make more',
          '36.',
          '____',
          'available to the trees',
          '– maintain the quality of the',
          '37.',
          '____',
          "low-frequency bushfires result in the growth of '",
          '38.',
          '____',
          "rainforest', which is: a",
          '–',
          '39.',
          '____',
          'ecosystem',
          '– an ideal environment for the',
          '40.',
          '____',
          'of the bell-miner',
        ].join('\n');

        return {
          ...block,
          text: cleanedText,
        };
      }
      if (
        block.header === 'Questions 27 and 28' &&
        block.question_numbers?.includes(27)
      ) {
        return {
          ...block,
          header: 'Question 27',
          question_numbers: [27],
        };
      }
      return block;
    });
  }
  if (/Cambridge 15 Listening Test 2/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (
        block.question_numbers?.includes(1) &&
        block.question_numbers?.includes(10)
      ) {
        return {
          ...block,
          header: 'Questions 1–4',
          question_numbers: [1, 2, 3, 4],
        };
      }
      if (
        block.question_numbers?.includes(11) &&
        block.question_numbers?.includes(20)
      ) {
        return {
          ...block,
          header: 'Question 11',
          question_numbers: [11],
        };
      }
      if (
        block.question_numbers?.includes(21) &&
        block.question_numbers?.includes(30)
      ) {
        return {
          ...block,
          header: 'Questions 21 and 22',
          question_numbers: [21, 22],
        };
      }
      return block;
    });
  }
  if (/Cambridge 15 Listening Test 4/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (
        block.question_numbers?.includes(1) &&
        block.question_numbers?.includes(10)
      ) {
        const cleanedText = [
          'Complete the form below.',
          'Write ONE WORD AND/OR A NUMBER for each answer.',
        ].join('\n');
        return {
          ...block,
          text: cleanedText,
        };
      }
      if (
        block.question_numbers?.includes(11) &&
        block.question_numbers?.includes(20)
      ) {
        const cleanedText = [
          'Label the map below:',
          'Write the correct letter, A-H, next to Questions 11-16',
          '11. café',
          '12. toilets',
          '13. formal gardens',
          '14. outdoor gym',
          '15. skateboard ramp',
          '16. wild flowers',
        ].join('\n');
        return {
          ...block,
          header: 'Questions 11–16',
          question_numbers: [11, 12, 13, 14, 15, 16],
          text: cleanedText,
        };
      }
      if (
        block.question_numbers?.includes(21) &&
        block.question_numbers?.includes(30)
      ) {
        return {
          ...block,
          header: 'Question 21',
          question_numbers: [21],
        };
      }
      if (
        block.question_numbers?.includes(25) &&
        block.question_numbers?.includes(30) &&
        block.header.includes('Questions 25-30')
      ) {
        const cleanedText = [
          'Who is going to do research into each topic?',
          'Write the correct letter, A, B or C, next to Questions 25-30.',
          'People',
          'A Annie',
          'B Jack',
          'C both Annie and Jack',
          'Topics',
          '25. the goods that are refrigerated',
          '26. the effects on health',
          '27. the impact on food producers',
          '28. the impact on cities',
          '29. refrigerated transport',
          '30. domestic fridges',
        ].join('\n');
        return {
          ...block,
          header: 'Questions 25-30',
          question_numbers: [25, 26, 27, 28, 29, 30],
          text: cleanedText,
        };
      }
      return block;
    });
  }
  if (/Cambridge 16 Listening Test 1/i.test(test?.title ?? '')) {
    console.log('NORMALIZE: Found Cambridge 16 Listening Test 1!', test.title);
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      console.log('NORMALIZE: block question_numbers:', block.question_numbers);
      if (
        block.question_numbers?.includes(21) &&
        block.question_numbers?.includes(30)
      ) {
        console.log('NORMALIZE: Overriding block 21-30 to 21-22!');
        return {
          ...block,
          header: 'Questions 21 and 22',
          question_numbers: [21, 22],
        };
      }
      return block;
    });
  }
  if (/Cambridge 16 Listening Test 2/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (block.question_numbers?.includes(1)) {
        const cleanedText = [
          'Complete the notes below.',
          'Write ONE WORD AND/OR A NUMBER for each answer.',
          'Name of company: Picturerep',
          'Requirements',
          '– Maximum size of photos is 30 cm, minimum size 4 cm.',
          '– Photos must not be in a',
          '1.',
          '____',
          'or an album.',
          'Cost',
          '– The cost for 360 photos is',
          '2.',
          '____',
          '$ (including one disk).',
          '– Before the complete order is sent,',
          '3.',
          '____',
          'is required.',
          'Services included in the price',
          '– Photos can be placed in a folder, e.g. with the name',
          '4.',
          '____',
          '– The',
          '5.',
          '____',
          'and contrast can be improved if necessary.',
          '– Photos which are very fragile will be scanned by',
          '6.',
          '____',
          'Special restore service (costs extra)',
          '– It may be possible to remove an object from a photo, or change the',
          '7.',
          '____',
          '– A photo which is not correctly in',
          '8.',
          '____',
          'cannot be fixed.',
          'Other information',
          '– Orders are completed within',
          '9.',
          '____',
          '– Send the photos in a box (not',
          '10.',
          '____',
          ').',
        ].join('\n');

        return {
          ...block,
          text: cleanedText,
        };
      }
      return block;
    });
  }
  if (/Cambridge 16 Listening Test 3/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      // Part 1 override (Questions 1-10)
      if (
        block.question_numbers?.includes(1) &&
        block.question_numbers?.includes(10)
      ) {
        const cleanedText = [
          'Complete the notes below.',
          'Write ONE WORD AND/OR A NUMBER for each answer.',
          'JUNIOR CYCLE CAMP',
          'The course focuses on skills and safety',
          '– Charlie would be placed in Level 5.',
          '– First of all, children at this level are taken to practise in a',
          '1.',
          '____',
          'Instructors',
          '– Instructors wear',
          '2.',
          '____',
          'shirts.',
          '– A',
          '3.',
          '____',
          'is required and training is given.',
          'Classes',
          '– The size of the classes is limited.',
          '– There are quiet times during the morning for a',
          '4.',
          '____',
          'or a game.',
          '– Classes are held even if there is',
          '5.',
          '____',
          'What to bring',
          '– a change of clothing',
          '– a',
          '6.',
          '____',
          '– shoes (not sandals)',
          '– Charlie’s',
          '7.',
          '____',
          'Day 1',
          '– Charlie should arrive at 9.20 am on the first day.',
          '– Before the class, his',
          '8.',
          '____',
          'will be checked.',
          '– He should then go to the',
          '9.',
          '____',
          'to meet his class instructor.',
          'Cost',
          '– The course costs',
          '10.',
          '____',
          '$ per week.',
        ].join('\n');

        return {
          ...block,
          text: cleanedText,
        };
      }
      // Questions 11-12 override
      if (
        block.question_numbers?.includes(11) &&
        block.question_numbers?.includes(20)
      ) {
        return {
          ...block,
          header: 'Questions 11 and 12',
          question_numbers: [11, 12],
          text: [
            'Questions 11 and 12',
            'Choose TWO letters, A-E.',
            'According to Megan, what are the TWO main advantages of working in the agriculture and horticulture sectors?',
          ].join('\n'),
        };
      }
      // Questions 13-14 override
      if (
        block.question_numbers?.includes(13) &&
        block.question_numbers?.includes(14) &&
        block.question_numbers?.length === 2
      ) {
        return {
          ...block,
          text: [
            'Choose TWO letters, A-E.',
            'Which TWO of the following are likely to be disadvantages for people working outdoors?',
          ].join('\n'),
        };
      }
      // Questions 21-22 override
      if (
        block.question_numbers?.includes(21) &&
        block.question_numbers?.includes(30)
      ) {
        return {
          ...block,
          header: 'Questions 21 and 22',
          question_numbers: [21, 22],
          text: [
            'Questions 21 and 22',
            'Choose TWO letters, A-E.',
            'Which TWO points does Adam make about his experiment on artificial sweeteners?',
          ].join('\n'),
        };
      }
      // Questions 23-24 override
      if (
        block.question_numbers?.includes(23) &&
        block.question_numbers?.includes(24) &&
        block.question_numbers?.length === 2
      ) {
        return {
          ...block,
          text: [
            'Choose TWO letters, A-E.',
            'Which TWO problems did Rosie have when measuring the fat content of nuts?',
          ].join('\n'),
        };
      }
      return block;
    });
  }
  if (/Cambridge 16 Listening Test 4/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      // Questions 21-22 override
      if (
        block.question_numbers?.includes(21) &&
        block.question_numbers?.includes(30)
      ) {
        return {
          ...block,
          header: 'Questions 21 and 22',
          question_numbers: [21, 22],
          text: [
            'Questions 21 and 22',
            'Choose TWO letters, A-E.',
            'Which TWO benefits of city bike-sharing schemes do the students agree are the most important?',
          ].join('\n'),
        };
      }
      // Questions 25-30 override
      if (
        block.question_numbers?.includes(25) &&
        block.question_numbers?.includes(30) &&
        block.question_numbers?.length === 6
      ) {
        return {
          ...block,
          header: 'Questions 25-30',
          question_numbers: [25, 26, 27, 28, 29, 30],
          text: [
            'What is the speakers’ opinion of the bike-sharing schemes in each of the following cities?',
            'Choose SIX answers from the box and write the correct letter, A-G, next to Questions 25-30.',
            'Opinions',
            'A. They agree it has been disappointing.',
            'B. They think it should be cheaper.',
            'C. They are surprised it has been so successful.',
            'D. They agree that more investment is required.',
            'E. They think the system has been well designed.',
            'F. They disagree about the reasons for its success.',
            'G. They think it has expanded too quickly.',
            'Cities',
            '25. Amsterdam',
            '26. Dublin',
            '27. London',
            '28. Buenos Aires',
            '29. New York',
            '30. Sydney',
          ].join('\n'),
        };
      }
      return block;
    });
  }
  if (/Cambridge 18 Listening Test 2/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.flatMap((block: QuestionBlock) => {
      const text = String(block.text ?? '');
      const splitMatch = text.match(/(?:\r?\n|^)Questions\s+6\s*[-–—]\s*10\b/i);

      if (
        !splitMatch ||
        !block.question_numbers?.includes(1) ||
        !block.question_numbers?.includes(10)
      ) {
        return [block];
      }

      const splitIndex = splitMatch.index ?? -1;

      if (splitIndex <= 0) {
        return [block];
      }

      return [
        {
          ...block,
          header: 'PART 1',
          question_numbers: buildSequentialQuestionRange(1, 5),
          text: text.slice(0, splitIndex).trim(),
        },
        {
          ...block,
          header: 'Questions 6-10',
          question_numbers: buildSequentialQuestionRange(6, 10),
          text: text.slice(splitIndex).trim(),
        },
      ];
    });
  }
  if (/Cambridge 18 IELTS Academic Reading Test 1/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.flatMap((block: QuestionBlock) => {
      if (block.question_numbers?.includes(19)) {
        const cleanedText = [
          'Look at the following purposes (Questions 19-21) and the list of timber cuts below.',
          'Match each purpose with the correct timber cut, A, B or C.',
          'Write the correct letter, A, B or C, in boxes 19-21 on your answer sheet.',
          'NB You may use any letter more than once.',
          'List of Timber Cuts',
          'A a TSI Cut',
          'B a Salvage Cut',
          'C a Shelterwood Cut',
          '19. To remove trees that are diseased',
        ].join('\n');

        return [
          {
            ...block,
            question_numbers: [19, 20, 21],
            text: cleanedText,
          },
        ];
      }

      if (block.question_numbers?.includes(27)) {
        const cleanedText = [
          'Questions 27-31',
          'Reading Passage 3 has six sections, A-F.',
          'Which section contains the following information?',
          'Write the correct letter, A-F, in boxes 27-31 on your answer sheet.',
          '27. A reference to the cooperation that takes place to try and minimise risk',
        ].join('\n');

        return [
          {
            ...block,
            text: cleanedText,
          },
        ];
      }

      if (block.question_numbers?.includes(36)) {
        const cleanedText = [
          'Look at the following statements (Questions 36-40) and the list of people below.',
          'Match each statement with the correct person, A, B, C or D.',
          'Write the correct letter, A, B, C or D, in boxes 36-40 on your answer sheet.',
          'NB You may use any letter more than once.',
          'List of People',
          'A Carolin Frueh',
          'B Holger Krag',
          'C Marlon Sorge',
          'D Moriba Jah',
          '36. Knowing the exact location of space junk would help prevent any possible danger.',
        ].join('\n');

        return [
          {
            ...block,
            text: cleanedText,
          },
        ];
      }

      const text = String(block.text ?? '');
      const splitMatch = text.match(/(?:\r?\n|^)Questions\s+4\s*[-–—]\s*7\b/i);

      if (
        !splitMatch ||
        !block.question_numbers?.includes(1) ||
        !block.question_numbers?.includes(7)
      ) {
        return [block];
      }

      const splitIndex = splitMatch.index ?? -1;

      if (splitIndex <= 0) {
        return [block];
      }

      return [
        {
          ...block,
          header: 'Questions 1-3',
          question_numbers: buildSequentialQuestionRange(1, 3),
          text: text.slice(0, splitIndex).trim(),
        },
        {
          ...block,
          header: 'Questions 4-7',
          question_numbers: buildSequentialQuestionRange(4, 7),
          text: text.slice(splitIndex).trim(),
        },
      ];
    });
  }
  if (/Cambridge 19 IELTS General Reading Test 3/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.flatMap((block: QuestionBlock) => {
      const text = String(block.text ?? '');
      const splitMatch = text.match(/\nQuestions\s+37\s*[-–—]\s*40\b/i);

      if (
        !splitMatch ||
        !block.question_numbers?.includes(33) ||
        !block.question_numbers?.includes(40)
      ) {
        return [block];
      }

      const splitIndex = splitMatch.index ?? -1;

      if (splitIndex <= 0) {
        return [block];
      }

      return [
        {
          ...block,
          header: 'Questions 33–36',
          question_numbers: buildSequentialQuestionRange(33, 36),
          text: text.slice(0, splitIndex).trim(),
        },
        {
          ...block,
          header: 'Questions 37–40',
          question_numbers: buildSequentialQuestionRange(37, 40),
          text: text.slice(splitIndex).trim(),
        },
      ];
    });
  }
  if (/Cambridge 18 IELTS General Reading Test 2/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      const text = String(block.text ?? '');
      const questionNumbers = block.question_numbers ?? [];

      if (
        questionNumbers[0] === 28 &&
        questionNumbers.includes(31) &&
        questionNumbers.includes(40) &&
        /Questions\s+28/i.test(text)
      ) {
        return {
          ...block,
          header: 'SECTION 3 Questions 28-31',
          question_numbers: buildSequentialQuestionRange(28, 31),
        };
      }

      return block;
    });
  }
  if (/Cambridge 18 IELTS General Reading Test 4/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (block.question_numbers?.includes(22)) {
        const cleanedText = [
          'Complete the table below',
          'Choose ONE WORD ONLY from the text for each answer.',
          'Write your answers in boxes 22—27 on your answer sheet.',
          '22. Ensure all items of 22 ____ have good grip.',
          '23. Ensure they are covered with 23 ____',
          '24. Provide good lighting and install 24 ____',
          '25. Try to avoid moving containers by hand, and use equipment such as 25 ____ instead.',
          '26. Keep everything accessible so that employees don’t need to bend or 26 ____',
          '27. Introduce a system of 27 ____ to increase variety.',
        ].join('\n');
        return {
          ...block,
          text: cleanedText,
        };
      }
      if (block.question_numbers?.includes(28)) {
        const text = String(block.text ?? '');
        const cleanedText = text.replace(
          /28\s+Section\s+A\s+__+/gi,
          '28 Section A',
        );
        return {
          ...block,
          text: cleanedText,
        };
      }
      return block;
    });
  }
  if (/Cambridge 18 Listening Test 1/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (block.question_numbers?.includes(1)) {
        const text = String(block.text ?? '');
        const cleanedText = text
          .replace(/Name:\r?\n\s*Sadie Jones/i, 'Name: Sadie Jones')
          .replace(/Year of birth:\r?\n\s*1991/i, 'Year of birth: 1991');
        return {
          ...block,
          text: cleanedText,
        };
      }
      if (block.question_numbers?.includes(16)) {
        const text = String(block.text ?? '');
        const cleanedText = text.replace(
          /16\r?\n\s*Fundraising\r?\n\s*[\u2026\.]+/i,
          '16 Fundraising ……………',
        );
        return {
          ...block,
          text: cleanedText,
        };
      }
      return block;
    });
  }
  if (/Cambridge 19 Listening Test 2/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (block.question_numbers?.includes(25)) {
        const text = String(block.text ?? '');
        const cleanedText = text.replace(/25\s+the\s+high\b/i, '25. The high');
        return {
          ...block,
          text: cleanedText,
        };
      }
      return block;
    });
  }
  if (/Cambridge 18 Listening Test 3/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.flatMap((block: QuestionBlock) => {
      if (block.question_numbers?.includes(1)) {
        const text1to4 = [
          'Questions 1-4',
          'Complete the form below.',
          'Write ONE WORD AND/OR A NUMBER for each answer.',
          'Wayside Camera Club membership form',
          'Name: Dan Green',
          'Email address: [email protected]',
          'Home address: 52 1. ____ Street, Peacetown',
          'Heard about us: from a 2. ____',
          'Reasons for joining: to enter competitions to 3. ____',
          'Type of membership: 4. ____ membership (£30)',
        ].join('\n');

        const text5to10 = [
          'Questions 5-10',
          'Complete the table below.',
          'Write NO MORE THAN TWO WORDS for each answer.',
          'Photography competitions',
          'Title of competition | Instructions | Feedback to Dan',
          '5. ____ | A scene in the home | The picture’s composition was not good.',
          '‘Beautiful Sunsets’ | Scene must show some 6. ____ | The 7. ____ was wrong.',
          '8. ____ | Scene must show 9. ____ | The photograph was too 10. ____.',
        ].join('\n');

        return [
          {
            ...block,
            header: 'Questions 1-4',
            question_numbers: [1, 2, 3, 4],
            text: text1to4,
          },
          {
            ...block,
            header: 'Questions 5-10',
            question_numbers: [5, 6, 7, 8, 9, 10],
            text: text5to10,
          },
        ];
      }
      return [block];
    });
  }
  if (/Cambridge 18 IELTS Academic Reading Test 3/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.flatMap((block: QuestionBlock) => {
      if (block.question_numbers?.includes(1)) {
        const cleanedText = [
          'Questions 1-4',
          'Reading Passage 1 has eight sections, A-H.',
          'Which section contains the following information?',
          'Write the correct letter, A-H, in boxes 1-4 on your answer sheet.',
          '1. An explanation of the industrial processes that create potential raw materials for concrete',
          '2. A reference to the various locations where high-rise wooden buildings can be found',
          '3. An indication of how widely available the raw materials of concrete are',
          '4. The belief that more high-rise wooden buildings are needed before wood can be regarded as a viable construction material',
        ].join('\n');

        return [
          {
            ...block,
            question_numbers: [1, 2, 3, 4],
            text: cleanedText,
          },
        ];
      }

      const isSubsetOf2to4 = block.question_numbers?.every((q) =>
        [2, 3, 4].includes(q),
      );
      if (isSubsetOf2to4) {
        return [];
      }

      return [block];
    });
  }
  if (/Cambridge 18 IELTS Academic Reading Test 4/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.flatMap((block: QuestionBlock) => {
      if (block.question_numbers?.includes(1)) {
        const cleanedText = [
          'Questions 1-5',
          'Reading Passage 1 has five paragraphs, A-E.',
          'Which paragraph contains the following information?',
          'Write the correct letter, A-E, in boxes 1-5 on your answer sheet.',
          'NB You may use any letter more than once.',
          '1. mention of several challenges to be overcome before a green roof can be installed',
          '2. reference to a city where green roofs have been promoted for many years',
          '3. a belief that existing green roofs should be used as a model for new ones',
          '4. examples of how green roofs can work in combination with other green urban initiatives',
          '5. the need to make a persuasive argument for the financial benefits of green roofs',
        ].join('\n');

        return [
          {
            ...block,
            question_numbers: [1, 2, 3, 4, 5],
            text: cleanedText,
          },
        ];
      }

      if (
        block.question_numbers?.includes(10) &&
        block.question_numbers?.includes(11)
      ) {
        const cleanedText = [
          'Choose TWO letters, A-E.',
          'Write the correct letters in boxes 10 and 11 on your answer sheet.',
          'Which TWO advantages of using newer buildings for green roofs are mentioned in Paragraph C of the passage?',
          '10.',
          '11.',
        ].join('\n');

        return [
          {
            ...block,
            text: cleanedText,
          },
        ];
      }

      if (
        block.question_numbers?.includes(12) &&
        block.question_numbers?.includes(13)
      ) {
        const cleanedText = [
          'Choose TWO letters, A-E.',
          'Write the correct letters in boxes 12 and 13 on your answer sheet.',
          'Which TWO aims of new variations on the concept of green roofs are mentioned in Paragraph E of the passage?',
          '12.',
          '13.',
        ].join('\n');

        return [
          {
            ...block,
            text: cleanedText,
          },
        ];
      }

      const isSubsetOf2to5 = block.question_numbers?.every((q) =>
        [2, 3, 4, 5].includes(q),
      );
      if (isSubsetOf2to5) {
        return [];
      }

      return [block];
    });
  }
  if (/Cambridge 17 Listening Test 2/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.flatMap((block: QuestionBlock) => {
      if (block.question_numbers?.includes(1)) {
        const text1to7 = [
          'Questions 1 – 7',
          'Complete the notes below.',
          'Write ONE WORD ONLY for each answer.',
          'Opportunities for voluntary work in Southoe village',
          'Library',
          '● Help with [[Q1]] books (times to be arranged)',
          '● Help needed to keep [[Q2]] of books up to date',
          '● Library is in the [[Q3]] Room in the village hall',
          'Lunch club',
          '● Help by providing [[Q4]]',
          '● Help with hobbies such as [[Q5]]',
          'Help for individuals needed next week',
          '● Taking Mrs Carroll to [[Q6]]',
          '● Work in the [[Q7]] at Mr Selsbury’s house',
        ].join('\n');

        const text8to10 = [
          'Questions 8-10',
          'Complete the table below.',
          'Write ONE WORD ONLY for each answer.',
          'Village social events',
          'Date | Event | Location | Help needed',
          'Date: 19 Oct | 8. ____ | Village hall | providing refreshments',
          'Date: 18 Nov | dance | Village hall | checking 9. ____',
          'Date: 31 Dec | New Year’s Eve party | Mountfort Hotel | designing the 10. ____',
        ].join('\n');

        return [
          {
            ...block,
            header: 'Questions 1–7',
            question_numbers: [1, 2, 3, 4, 5, 6, 7],
            text: text1to7,
          },
          {
            ...block,
            header: 'Questions 8–10',
            question_numbers: [8, 9, 10],
            text: text8to10,
          },
        ];
      }
      if (
        block.question_numbers?.some((q) =>
          [15, 16, 17, 18, 19, 20].includes(q),
        )
      ) {
        const text = String(block.text ?? '');
        const header = String(block.header ?? '');
        return [
          {
            ...block,
            text: text.replace(/__+/g, '').trim(),
            header: header.replace(/__+/g, '').trim(),
          },
        ];
      }
      if (block.question_numbers?.includes(23)) {
        const text23to27 = [
          'Questions 23-27',
          'Which opinion do the speakers give about each of the following aspects of The Emporium’s production of Romeo and Juliet?',
          'Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 23-27.',
          'Opinions',
          'A They both expected this to be more traditional.',
          'B They both thought this was original.',
          'C They agree this created the right atmosphere.',
          'D They agree this was a major strength.',
          'E They were both disappointed by this.',
          'F They disagree about why this was an issue.',
          'G They disagree about how this could be improved.',
          '23. the set',
          '24. the lighting',
          '25. the costume design',
          '26. the music',
          '27. the actors’ delivery',
        ].join('\n');

        return [
          {
            ...block,
            header: 'Questions 23–27',
            question_numbers: [23, 24, 25, 26, 27],
            text: text23to27,
          },
        ];
      }
      if (
        block.question_numbers?.some((q) => [24, 25, 26, 27].includes(q)) &&
        !block.question_numbers?.includes(23)
      ) {
        return [];
      }
      return [block];
    });
  }
  if (/Cambridge 17 Listening Test 3/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (block.question_numbers?.includes(11)) {
        return {
          ...block,
          header: 'Questions 11–12',
          question_numbers: [11, 12],
          text: [
            'Questions 11–12',
            'Choose TWO letters, A-E.',
            'Which TWO facts are given about the school’s extended hours childcare service?',
          ].join('\n'),
        };
      }
      if (block.question_numbers?.some((q) => [16, 25, 26, 27].includes(q))) {
        const text = String(block.text ?? '');
        const header = String(block.header ?? '');
        return {
          ...block,
          text: text.replace(/__+/g, '').trim(),
          header: header.replace(/__+/g, '').trim(),
        };
      }
      if (block.question_numbers?.includes(31)) {
        const text = String(block.text ?? '');
        const cleanedText = text
          .replace(
            /–\s*Ringing\s+depended\s+on\s+what\s+is\s+called\s+the\r?\n\s*39\r?\n\s*‘\r?\n\s*__+\r?\n\s*’\s+of\s+dead\s+birds\./gi,
            [
              '– Ringing depended on what is called the ‘',
              '39',
              '____',
              '’ of dead birds.',
            ].join('\n'),
          )
          .replace(
            /●\s*In\s+1931,\s+the\s+first\r?\n\s*40\r?\n\s*__+\r?\n\s*to\s+show\s+the\s+migration\s+of\s+European\s+birds\s+was\s+printed\./gi,
            [
              '● In 1931, the first',
              '40',
              '____',
              'to show the migration of European birds was printed.',
            ].join('\n'),
          );
        return {
          ...block,
          text: cleanedText,
        };
      }
      return block;
    });
  }
  if (/Cambridge 17 Listening Test 4/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.flatMap((block: QuestionBlock) => {
      if (
        block.question_numbers?.some((q) =>
          [15, 16, 17, 18, 19, 20].includes(q),
        )
      ) {
        const text = String(block.text ?? '');
        const header = String(block.header ?? '');
        return [
          {
            ...block,
            text: text.replace(/__+/g, '').trim(),
            header: header.replace(/__+/g, '').trim(),
          },
        ];
      }
      if (block.question_numbers?.includes(25)) {
        const text25to30 = [
          'Questions 25-30',
          'What comment do the students make about the development of each of the following items of sporting equipment?',
          'Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.',
          'Comments about the development of the equipment',
          'A It could cause excessive sweating.',
          'B The material was being mass produced for another purpose.',
          'C People often needed to make their own.',
          'D It often had to be replaced.',
          'E The material was expensive.',
          'F It was unpopular among spectators.',
          'G It caused injuries.',
          'H No one liked it at first.',
          'Items of sporting equipment',
          '25. the table tennis bat',
          '26. the cricket helmet',
          '27. the cycle helmet',
          '28. the golf club',
          '29. the hockey stick',
          '30. the football',
        ].join('\n');

        return [
          {
            ...block,
            header: 'Questions 25–30',
            question_numbers: [25, 26, 27, 28, 29, 30],
            text: text25to30,
            choices: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
          },
        ];
      }
      if (
        block.question_numbers?.some((q) => [26, 27, 28, 29, 30].includes(q)) &&
        !block.question_numbers?.includes(25)
      ) {
        return [];
      }
      return [block];
    });
  }
  if (/Cambridge 17 IELTS Academic Reading Test 1/i.test(test?.title ?? '')) {
    sourceBlocks = sourceBlocks.map((block: QuestionBlock) => {
      if (block.question_numbers?.includes(27)) {
        const text27to31 = [
          'Complete the summary using the list of phrases, A-J, below.',
          'A military innovation',
          'B large reward',
          'C widespread conspiracy',
          'D relative safety',
          'E new government',
          'F decisive victory',
          'G political debate',
          'H strategic alliance',
          'I popular solution',
          'J religious conviction',
          'Write the correct letter, A-J, in boxes 27-31 on your answer sheet.',
          'The story behind the hunt for Charles II',
          'Charles II’s father was executed by the Parliamentarian forces in 1649. Charles II then formed a',
          '27',
          '____',
          'with the Scots, and in order to become King of Scots, he abandoned an important',
          '28',
          '____',
          'that was held by his father and had contributed to his father’s death. The opposing sides then met outside Worcester in 1651. The battle led to a',
          '29',
          '____',
          'for the Parliamentarians and Charles had to flee for his life. A',
          '30',
          '____',
          'was offered for Charles’s capture, but after six weeks spent in hiding, he eventually managed to reach the',
          '31',
          '____',
          'of continental Europe.',
        ].join('\n');

        return {
          ...block,
          text: text27to31,
        };
      }
      return block;
    });
  }

  const normalizedBlocks = sourceBlocks.map((block: Partial<QuestionBlock>) =>
    normalizeQuestionBlock(block),
  );

  return supplementMissingQuestionBlocks(test, normalizedBlocks);
}

export function normalizeReadingQuestionBlocks(test: any) {
  return normalizeSchemaQuestionBlocks(test, false);
}

export function normalizeListeningQuestionBlocks(test: any) {
  if (Number(test?.schema_version) >= 2) {
    return normalizeSchemaQuestionBlocks(test, true);
  }

  const parts = (test?.parts ?? []) as ListeningPart[];

  if (parts.length === 0) {
    return ((test?.questions ?? []) as QuestionBlock[]).map((block) => ({
      ...block,
      question_numbers: uniqueQuestionNumbers(block.question_numbers ?? []),
    }));
  }

  return parts.flatMap((part, partIndex) => {
    const sourceBlocks = (part.blocks ??
      part.questions ??
      []) as QuestionBlock[];

    const expectedPartNumbers = buildSequentialQuestionRange(
      partIndex * 10 + 1,
      partIndex * 10 + 10,
    );

    const blockMetas = sourceBlocks.map<ListeningBlockMeta>((block) => {
      const inferredQuestionNumbers = inferListeningQuestionNumbersFromText(
        block.text ?? '',
        block.choices ?? [],
      );
      const headerQuestionNumbers = extractQuestionNumbersFromHeader(
        block.header ?? '',
      );
      const blankCount = countBlankMarkers(block.text ?? '');
      const slotCount = estimateListeningSlotCount(
        block,
        inferredQuestionNumbers,
        headerQuestionNumbers,
      );

      const questionNumbers =
        blankCount > 0 && headerQuestionNumbers.length === slotCount
          ? headerQuestionNumbers
          : inferredQuestionNumbers.length > 0
            ? inferredQuestionNumbers
            : headerQuestionNumbers.length > 0
              ? headerQuestionNumbers
              : uniqueQuestionNumbers(block.question_numbers ?? []);

      return {
        block,
        blankCount,
        headerQuestionNumbers,
        inferredQuestionNumbers,
        questionNumbers: uniqueQuestionNumbers(questionNumbers),
        slotCount,
      };
    });

    const repairedBlocks = blockMetas.map((meta) => ({ ...meta }));

    if (repairedBlocks.length > 1) {
      const broadRangeBlock = repairedBlocks.find((meta) => {
        const normalizedQuestionNumbers = uniqueQuestionNumbers(
          meta.questionNumbers,
        );

        return (
          normalizedQuestionNumbers.length === expectedPartNumbers.length &&
          normalizedQuestionNumbers.every(
            (qNum, index) => qNum === expectedPartNumbers[index],
          )
        );
      });

      if (broadRangeBlock) {
        const claimedNumbers = new Set(
          repairedBlocks
            .filter((meta) => meta !== broadRangeBlock)
            .flatMap((meta) => uniqueQuestionNumbers(meta.questionNumbers)),
        );
        const remainingNumbers = expectedPartNumbers.filter(
          (qNum) => !claimedNumbers.has(qNum),
        );

        if (remainingNumbers.length > 0) {
          broadRangeBlock.questionNumbers = remainingNumbers;
        }
      }
    }

    const settledQuestionNumbers = new Set<number>();

    repairedBlocks.forEach((meta) => {
      const normalizedQuestionNumbers = uniqueQuestionNumbers(
        meta.questionNumbers,
      );

      if (
        meta.slotCount > 0 &&
        normalizedQuestionNumbers.length === meta.slotCount
      ) {
        normalizedQuestionNumbers.forEach((qNum) =>
          settledQuestionNumbers.add(qNum),
        );
      }
    });

    const normalizedBlocks = repairedBlocks.map((meta) => {
      if (meta.slotCount === 0) {
        return {
          ...meta.block,
          question_numbers: uniqueQuestionNumbers(meta.questionNumbers),
        };
      }

      let normalizedQuestionNumbers = uniqueQuestionNumbers(
        meta.questionNumbers,
      );

      if (normalizedQuestionNumbers.length > meta.slotCount) {
        if (meta.headerQuestionNumbers.length === meta.slotCount) {
          normalizedQuestionNumbers = meta.headerQuestionNumbers;
        } else if (meta.inferredQuestionNumbers.length === meta.slotCount) {
          normalizedQuestionNumbers = meta.inferredQuestionNumbers;
        } else {
          normalizedQuestionNumbers = normalizedQuestionNumbers.slice(
            0,
            meta.slotCount,
          );
        }
      }

      if (normalizedQuestionNumbers.length < meta.slotCount) {
        if (meta.headerQuestionNumbers.length === meta.slotCount) {
          normalizedQuestionNumbers = meta.headerQuestionNumbers;
        } else {
          const expandedQuestionNumbers = expandQuestionNumbersToSlotCount(
            normalizedQuestionNumbers,
            meta.slotCount,
            expectedPartNumbers,
          );

          if (expandedQuestionNumbers.length === meta.slotCount) {
            normalizedQuestionNumbers = expandedQuestionNumbers;
          } else {
            const availableNumbers = expectedPartNumbers.filter(
              (qNum) =>
                !settledQuestionNumbers.has(qNum) ||
                normalizedQuestionNumbers.includes(qNum),
            );

            if (availableNumbers.length >= meta.slotCount) {
              normalizedQuestionNumbers =
                availableNumbers.length === meta.slotCount
                  ? availableNumbers
                  : availableNumbers.slice(0, meta.slotCount);
            }
          }
        }
      }

      const uniqueNormalizedQuestionNumbers = uniqueQuestionNumbers(
        normalizedQuestionNumbers,
      );

      if (uniqueNormalizedQuestionNumbers.length === meta.slotCount) {
        uniqueNormalizedQuestionNumbers.forEach((qNum) =>
          settledQuestionNumbers.add(qNum),
        );
      }

      return {
        ...meta.block,
        question_numbers: uniqueNormalizedQuestionNumbers,
      };
    });

    const coveredQuestionNumbers = new Set<number>();

    return normalizedBlocks.filter((block) => {
      const normalizedQuestionNumbers = uniqueQuestionNumbers(
        block.question_numbers ?? [],
      );
      const isDuplicateEmptyBlock =
        normalizedQuestionNumbers.length > 0 &&
        normalizedQuestionNumbers.every((qNum) =>
          coveredQuestionNumbers.has(qNum),
        ) &&
        isEmptyListeningDuplicateBlock(block);

      if (isDuplicateEmptyBlock) {
        return false;
      }

      if (hasRenderableAnswerSlot(block) || block.text?.trim()) {
        normalizedQuestionNumbers.forEach((qNum) =>
          coveredQuestionNumbers.add(qNum),
        );
      }

      return true;
    });
  });
}

export const questionRangePattern =
  /^Questions?\s+\d+(?:(?:\s*(?:to|-|\u2013|\u2014)\s*|\s+and\s+)\d+)?\.?$/i;
export const boxRangePattern =
  /^boxes?\s+\d+(?:\s*(?:to|-|\u2013|\u2014)\s*\d+)?\.?$/i;
const instructionStrongLinePatterns = [
  questionRangePattern,
  /^List of Headings$/i,
];

const instructionMediumLinePatterns = [
  /^Do the following statements agree with the information given in the text\?$/i,
  /^For which review are the following statements true\?$/i,
  /^Complete the (?:sentences|notes|summary) below\.?$/i,
  /^Label the map below\.?$/i,
];

export function normalizeInstructionFragment(line: string) {
  return line
    .replace(/Ã¢â‚¬â€œ|Ã¢â‚¬â€|â€“|â€”/g, '-')
    .replace(/Ã¢â‚¬Ëœ|Ã¢â‚¬â„¢|â€˜|â€™/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function joinInstructionFragments(current: string, next: string) {
  const normalizedCurrent = current.trim();
  const normalizedNext = next.trim();

  if (!normalizedCurrent) {
    return normalizedNext;
  }

  if (!normalizedNext) {
    return normalizedCurrent;
  }

  if (/^[,.;:?)]/.test(normalizedNext)) {
    return `${normalizedCurrent}${normalizedNext}`;
  }

  return `${normalizedCurrent} ${normalizedNext}`;
}

export function isLowercaseRomanHeading(line: string) {
  return /^[ivxlcdm]+\.?$/.test(line.trim());
}

export function getInstructionLineStyle(line: string) {
  const trimmedLine = normalizeInstructionFragment(line);

  if (!trimmedLine) {
    return 'empty';
  }

  if (
    instructionStrongLinePatterns.some((pattern) => pattern.test(trimmedLine))
  ) {
    return 'strong';
  }

  if (
    instructionMediumLinePatterns.some((pattern) => pattern.test(trimmedLine))
  ) {
    return 'medium';
  }

  return 'base';
}

export function formatInstructionLines(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => normalizeInstructionFragment(line))
    .filter(Boolean);

  const formattedLines: string[] = [];
  let inPeopleList = false;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? '';
    const nextLine = lines[index + 1];
    const isPeopleListHeading = /^List of People$/i.test(line);
    const isPeopleListLetterOnly = /^[A-D](?:[.)])?$/.test(line);
    const isPeopleListEntry =
      /^[A-D](?:[.)]\s+\S|\s+[A-Z]\S*)/.test(line) ||
      (inPeopleList && isPeopleListLetterOnly);

    if (
      questionRangePattern.test(line) ||
      /^List of Headings$/i.test(line) ||
      /^Opinions$/i.test(line) ||
      isPeopleListHeading
    ) {
      formattedLines.push(line);
      inPeopleList = isPeopleListHeading;
      continue;
    }

    if (isPeopleListEntry) {
      if (inPeopleList && isPeopleListLetterOnly && nextLine) {
        formattedLines.push(joinInstructionFragments(line, nextLine));
        index++;
        continue;
      }

      formattedLines.push(line);
      continue;
    }

    if (/^(TRUE|FALSE|NOT GIVEN|YES|NO)$/i.test(line) && nextLine) {
      formattedLines.push(joinInstructionFragments(line, nextLine));
      index++;
      continue;
    }

    if (isLowercaseRomanHeading(line) && nextLine) {
      formattedLines.push(joinInstructionFragments(line, nextLine));
      index++;
      continue;
    }

    let mergedLine = line;

    while (index + 1 < lines.length) {
      const upcomingLine = lines[index + 1] ?? '';

      if (/^\s*[-–•*]\s+/.test(upcomingLine)) {
        break;
      }

      if (
        questionRangePattern.test(upcomingLine) ||
        /^List of Headings$/i.test(upcomingLine) ||
        /^Opinions$/i.test(upcomingLine) ||
        /^List of People$/i.test(upcomingLine) ||
        /^[A-J](?:[.)](?:\s|$)|(?:\s+[A-Z]|\s*$))/.test(upcomingLine) ||
        /^(?:TRUE|FALSE|NOT GIVEN|YES|NO)\b/i.test(upcomingLine) ||
        isLowercaseRomanHeading(upcomingLine)
      ) {
        break;
      }

      if (/[.?:]$/.test(mergedLine) && /^[A-Z]/.test(upcomingLine)) {
        break;
      }

      mergedLine = joinInstructionFragments(mergedLine, upcomingLine);
      index++;
    }

    formattedLines.push(mergedLine);
  }

  return formattedLines;
}

export function stripQuestionNumberPrefix(prompt: string, qNum: number) {
  return prompt
    .replace(new RegExp(`^${qNum}\\s*[.\\):\\-\\u2013\\u2014]*\\s*`), '')
    .trim();
}

export function compactPromptLines(prompt: string) {
  const lines = prompt
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return prompt.trim();
  }

  const hasBlankMarker = lines.some((line) => /^_+$/.test(line));
  const nonBlankLines = lines.filter((line) => !/^_+$/.test(line));
  const allLinesAreShort = nonBlankLines.every((line) => line.length <= 18);
  const isSectionHeadingPrompt =
    nonBlankLines.length >= 2 &&
    /^Section$/i.test(nonBlankLines[0] ?? '') &&
    /^[A-Z]$/i.test(nonBlankLines[1] ?? '');

  if ((hasBlankMarker && allLinesAreShort) || isSectionHeadingPrompt) {
    return lines.join(' ');
  }

  return prompt.trim();
}

export function stripLeadingBulletMarker(prompt: string) {
  return prompt.replace(/^\s*[•·]\s*/, '').trim();
}

export function formatQuestionRangeLabel(questionNumbers: number[]) {
  const normalizedQuestionNumbers = uniqueQuestionNumbers(questionNumbers);

  if (normalizedQuestionNumbers.length === 0) {
    return 'Questions';
  }

  if (normalizedQuestionNumbers.length === 1) {
    return `Question ${normalizedQuestionNumbers[0]}`;
  }

  return `Questions ${normalizedQuestionNumbers[0]}-${normalizedQuestionNumbers[normalizedQuestionNumbers.length - 1]}`;
}

export function getBlockDisplayHeader(block: ParsedQuestionBlock) {
  return block.header.trim() || formatQuestionRangeLabel(block.questionNumbers);
}

export function isProminentPassageQuestionLine(line: string) {
  const normalizedLine = normalizeInstructionFragment(line);

  return (
    questionRangePattern.test(normalizedLine) ||
    /Read the text(?: below)? and answer Questions?\s+\d+(?:\s*(?:to|-|\u2013|\u2014)\s*\d+)?\.?$/i.test(
      normalizedLine,
    ) ||
    /Questions?\s+\d+(?:\s*(?:to|-|\u2013|\u2014)\s*\d+)?/i.test(normalizedLine)
  );
}

export function hasRenderableReadingSections(sections: ReadingSection[] = []) {
  return sections.some((section) =>
    (section.passages ?? []).some(
      (passage) =>
        Boolean(passage.heading?.trim()) ||
        Boolean(passage.instruction?.trim()) ||
        Boolean(passage.text?.trim()),
    ),
  );
}

export function createFallbackReadingSection(
  lines: string[],
  sectionLabel: string,
): ReadingSection {
  const cleanedLines = lines.map((line) => normalizeInstructionFragment(line));
  const [firstLine = '', ...restLines] = cleanedLines;
  const instructionLines: string[] = [];
  const bodyLines = [...restLines];

  while (
    bodyLines.length > 0 &&
    /^(?:Read the text|Read the passage|You should spend about|Questions?\s+\d+)/i.test(
      bodyLines[0] ?? '',
    )
  ) {
    instructionLines.push(bodyLines.shift() ?? '');
  }

  const heading = bodyLines.shift() || firstLine || sectionLabel;

  return {
    section: sectionLabel || firstLine || 'Reading Passage',
    passages: [
      {
        instruction: instructionLines.join(' '),
        heading,
        text: bodyLines.join('\n'),
      },
    ],
  };
}

export function parseFallbackReadingSections(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const sections: ReadingSection[] = [];
  let currentLabel = '';
  let currentLines: string[] = [];

  const flushCurrentSection = () => {
    if (currentLines.length === 0 && !currentLabel) {
      return;
    }

    sections.push(createFallbackReadingSection(currentLines, currentLabel));
    currentLines = [];
  };

  lines.forEach((line) => {
    if (/^(?:SECTION|PART|READING PASSAGE)\b/i.test(line)) {
      flushCurrentSection();
      currentLabel = normalizeInstructionFragment(line);
      return;
    }

    currentLines.push(line);
  });

  flushCurrentSection();

  return sections;
}

export function normalizeReadingSections(test: any) {
  const sourceSections = ((test?.sections ?? []) as ReadingSection[]).map(
    (section) => ({
      section: section.section ?? '',
      passages: (section.passages ?? []).map((passage) => ({
        instruction: passage.instruction ?? '',
        heading: passage.heading ?? '',
        text: passage.text ?? '',
      })),
    }),
  );

  if (hasRenderableReadingSections(sourceSections)) {
    return sourceSections;
  }

  const fallbackText = String(
    test?.content?.left_passage_text ?? test?.raw?.left_passage_text ?? '',
  );

  return fallbackText.trim()
    ? parseFallbackReadingSections(fallbackText)
    : sourceSections;
}

export function normalizeTestAudio(test: any) {
  const audio =
    Array.isArray(test?.media?.audio) && test.media.audio.length > 0
      ? test.media.audio
      : test?.audio;

  return Array.isArray(audio) ? audio : [];
}

export function normalizeTestImages(test: any) {
  const images = test?.media?.images;

  return Array.isArray(images) ? images : [];
}

export function isStructuredNoteBlock(block: ParsedQuestionBlock) {
  return (
    block.choices.length === 0 &&
    /Complete the (?:notes|flow[- ]?chart|form) below\.?/i.test(block.rawText)
  );
}

export function isStructuredSummaryBlock(block: ParsedQuestionBlock) {
  return (
    block.choices.length === 0 &&
    /Complete the summary(?: below| using\b)/i.test(block.rawText)
  );
}

export function isQuestionNumberLine(
  line: string,
  questionNumberSet: Set<number>,
): number | null {
  const match = line.trim().match(/^(\d+)[.)]?$/);

  if (!match?.[1]) {
    return null;
  }

  const qNum = Number(match[1]);
  return questionNumberSet.has(qNum) ? qNum : null;
}

export function renderQuestionToken(qNum: number) {
  return `[[Q${qNum}]]`;
}

export function isQuestionTokenLine(line: string) {
  return /^\[\[Q\d+\]\]$/.test(line.trim());
}

export function stripListMarker(line: string) {
  return line.replace(/^[•●▪◦\-–−]+\s*/, '').trim();
}

export function isBulletLikeLine(line: string) {
  return /^[•●▪◦\-–−]\s*/.test(line.trim());
}

export function replaceInlineQuestionNumberWithToken(
  line: string,
  questionNumberSet: Set<number>,
  usedQuestionNumbers: Set<number>,
) {
  const trailingMatch = line.match(/^(.*?)(\d+)\)?[.)]?\s*$/);

  if (trailingMatch?.[2]) {
    const qNum = Number(trailingMatch[2]);

    if (!questionNumberSet.has(qNum) || usedQuestionNumbers.has(qNum)) {
      return null;
    }

    usedQuestionNumbers.add(qNum);

    const prefix = (trailingMatch[1] ?? '').replace(/\(\s*$/, '').trimEnd();

    return {
      qNum,
      line: joinInstructionFragments(prefix, renderQuestionToken(qNum)),
    };
  }

  const leadingMatch = line.match(/^(\d+)\)?[.)]?\s*(.+)$/);

  if (!leadingMatch?.[1] || !leadingMatch[2]) {
    return null;
  }

  const qNum = Number(leadingMatch[1]);

  if (!questionNumberSet.has(qNum) || usedQuestionNumbers.has(qNum)) {
    return null;
  }

  usedQuestionNumbers.add(qNum);

  return {
    qNum,
    line: joinInstructionFragments(
      renderQuestionToken(qNum),
      leadingMatch[2].trim(),
    ),
  };
}

export function isStructuredNoteHeadingLine(line: string, nextLine?: string) {
  const normalizedLine = stripListMarker(line);
  const normalizedNextLine = nextLine ? stripListMarker(nextLine) : '';

  if (!normalizedLine || /\[\[Q\d+\]\]/.test(normalizedLine)) {
    return false;
  }

  if (!/^[A-Z0-9]/.test(normalizedLine)) {
    return false;
  }

  if (normalizedLine.length > 64 || normalizedLine.split(/\s+/).length > 10) {
    return false;
  }

  if (/[.!?]$/.test(normalizedLine)) {
    return false;
  }

  if (isQuestionTokenLine(normalizedNextLine)) {
    return false;
  }

  return /:$/.test(normalizedLine) || Boolean(normalizedNextLine);
}

export function isStructuredNoteOverflowInstructionLine(line: string) {
  const normalizedLine = normalizeInstructionFragment(line);

  return (
    /^Write your answers\b/i.test(normalizedLine) ||
    /^Write the correct letters?\b/i.test(normalizedLine) ||
    /^boxes?$/i.test(normalizedLine) ||
    /^boxes?\s+\d+(?:\s*(?:to|-|\u2013|\u2014)\s*\d+)?(?:\s+on your (?:reading\s+)?answer sheet\.?)?$/i.test(
      normalizedLine,
    ) ||
    /^on your (?:reading\s+)?answer sheet\.?$/i.test(normalizedLine)
  );
}

export function findStructuredInstructionEndIndex(rawLines: string[]) {
  for (let i = rawLines.length - 1; i >= 0; i--) {
    const line = rawLines[i] ?? '';
    if (/(?:for each answer|on your (?:reading\s+)?answer sheet)\.?$/i.test(line)) {
      return i;
    }
  }
  const chooseIndex = rawLines.findIndex((line) =>
    /^Choose\b/i.test(line.trim()),
  );
  if (chooseIndex !== -1) {
    const chooseLine = rawLines[chooseIndex];
    const nextLine = rawLines[chooseIndex + 1] ?? '';
    if (nextLine && /ONLY\.?$/i.test(nextLine.trim())) {
      return chooseIndex + 1;
    }
    if (chooseLine && /ONLY\.?$/i.test(chooseLine.trim())) {
      return chooseIndex;
    }
  }
  return -1;
}

export function tokenizeStructuredLines(
  contentLines: string[],
  questionNumbers: number[],
) {
  const questionNumberSet = new Set(questionNumbers);
  const usedQuestionNumbers = new Set<number>();
  const fragments: string[] = [];

  for (let line of contentLines) {
    if (!line) {
      continue;
    }

    const inlineBlankRegex = /(?:^|\b)(\d+)\)?[.)]?\s*(?:___+|\.{3,})/g;
    let match;
    while ((match = inlineBlankRegex.exec(line)) !== null) {
      const qNum = Number(match[1]);
      if (questionNumberSet.has(qNum) && !usedQuestionNumbers.has(qNum)) {
        usedQuestionNumbers.add(qNum);
        line = line.replace(match[0], renderQuestionToken(qNum));
        inlineBlankRegex.lastIndex = 0;
      }
    }

    if (/^_+$/.test(line)) {
      const lastFragmentIndex = fragments.length - 1;

      if (lastFragmentIndex >= 0) {
        const previousFragment = fragments[lastFragmentIndex] ?? '';

        if (isQuestionTokenLine(previousFragment)) {
          continue;
        }

        if (/\[\[Q\d+\]\]/.test(previousFragment)) {
          continue;
        }

        const inlineQuestionNumber = replaceInlineQuestionNumberWithToken(
          previousFragment,
          questionNumberSet,
          usedQuestionNumbers,
        );

        if (inlineQuestionNumber) {
          fragments[lastFragmentIndex] = inlineQuestionNumber.line;
          continue;
        }
      }

      const nextQuestionNumber = questionNumbers.find(
        (qNum) => !usedQuestionNumbers.has(qNum),
      );

      if (nextQuestionNumber !== undefined) {
        usedQuestionNumbers.add(nextQuestionNumber);

        if (lastFragmentIndex >= 0) {
          fragments[lastFragmentIndex] = joinInstructionFragments(
            fragments[lastFragmentIndex] ?? '',
            renderQuestionToken(nextQuestionNumber),
          );
        } else {
          fragments.push(renderQuestionToken(nextQuestionNumber));
        }
      }

      continue;
    }

    const questionNumber = isQuestionNumberLine(line, questionNumberSet);

    if (questionNumber !== null && !usedQuestionNumbers.has(questionNumber)) {
      usedQuestionNumbers.add(questionNumber);
      fragments.push(renderQuestionToken(questionNumber));
      continue;
    }

    fragments.push(line);
  }

  return fragments;
}

export function buildStructuredNoteLines(
  contentLines: string[],
  questionNumbers: number[],
) {
  const fragments = tokenizeStructuredLines(contentLines, questionNumbers);
  const mergedLines: string[] = [];

  for (let index = 0; index < fragments.length; index++) {
    const line = fragments[index] ?? '';
    const nextLine = fragments[index + 1];

    if (!line) {
      continue;
    }

    if (index === 0) {
      mergedLines.push(stripListMarker(line));
      continue;
    }

    if (isStructuredNoteHeadingLine(line, nextLine)) {
      mergedLines.push(stripListMarker(line));
      continue;
    }

    let mergedLine = stripListMarker(line);

    while (index + 1 < fragments.length) {
      if (/[.!?]$/.test(mergedLine)) {
        break;
      }

      const upcomingLine = fragments[index + 1] ?? '';
      const afterUpcomingLine = fragments[index + 2];

      if (
        !upcomingLine ||
        isBulletLikeLine(upcomingLine) ||
        isStructuredNoteHeadingLine(upcomingLine, afterUpcomingLine)
      ) {
        break;
      }

      if (/^[.,;:?)]$/.test(upcomingLine)) {
        mergedLine = `${mergedLine}${upcomingLine}`;
        index += 1;

        if (/^[.!?]$/.test(upcomingLine)) {
          break;
        }

        continue;
      }

      mergedLine = joinInstructionFragments(
        mergedLine,
        stripListMarker(upcomingLine),
      );
      index += 1;
    }

    mergedLines.push(mergedLine);
  }

  return mergedLines;
}

export function buildStructuredSummaryText(
  contentLines: string[],
  questionNumbers: number[],
) {
  const fragments = tokenizeStructuredLines(contentLines, questionNumbers);
  let mergedText = '';

  for (const fragment of fragments) {
    mergedText = joinInstructionFragments(mergedText, fragment);
  }

  return mergedText;
}

export function parseStructuredNoteBlock(
  block: ParsedQuestionBlock,
): ParsedNoteBlock | null {
  if (!isStructuredNoteBlock(block)) {
    return null;
  }

  const rawLines = block.rawText
    .split(/\r?\n/)
    .map((line) => normalizeInstructionFragment(line))
    .filter(Boolean);

  const instructionEndIndex = findStructuredInstructionEndIndex(rawLines);

  if (instructionEndIndex === -1) {
    return null;
  }

  const instructionText = rawLines.slice(0, instructionEndIndex + 1).join('\n');
  const contentLines = rawLines.slice(instructionEndIndex + 1);
  const mergedLines = buildStructuredNoteLines(
    contentLines,
    block.questionNumbers,
  );

  if (mergedLines.length === 0) {
    return null;
  }

  const overflowInstructionLines: string[] = [];

  while (
    mergedLines.length > 0 &&
    isStructuredNoteOverflowInstructionLine(mergedLines[0] ?? '')
  ) {
    overflowInstructionLines.push(mergedLines.shift() ?? '');
  }

  const combinedInstructionText = [instructionText, ...overflowInstructionLines]
    .filter(Boolean)
    .join('\n');

  if (mergedLines.length === 0) {
    return null;
  }

  const [title = '', ...remainingLines] = mergedLines;
  const lead: string[] = [];
  const sections: ParsedNoteSection[] = [];
  let currentSection: ParsedNoteSection | null = null;

  remainingLines.forEach((line, index) => {
    if (isStructuredNoteHeadingLine(line, remainingLines[index + 1])) {
      currentSection = {
        heading: line,
        items: [],
      };

      sections.push(currentSection);
      return;
    }

    if (currentSection) {
      currentSection.items.push(line);
      return;
    }

    lead.push(line);
  });

  return {
    instructionText: combinedInstructionText,
    title,
    lead,
    sections,
  };
}

export function isFlowchartStructuredBlock(block: ParsedQuestionBlock) {
  return /Complete the flowchart below\.?/i.test(block.rawText);
}

export function parseStructuredFlowchartBlock(
  block: ParsedQuestionBlock,
): { instructionText: string; title: string; bodyLines: string[] } | null {
  if (!isFlowchartStructuredBlock(block)) {
    return null;
  }

  const rawLines = block.rawText
    .split(/\r?\n/)
    .map((line) => normalizeInstructionFragment(line))
    .filter(Boolean);

  const instructionEndIndex = findStructuredInstructionEndIndex(rawLines);

  if (instructionEndIndex === -1) {
    return null;
  }

  const instructionText = rawLines.slice(0, instructionEndIndex + 1).join('\n');
  const contentLines = rawLines.slice(instructionEndIndex + 1);

  if (contentLines.length === 0) {
    return null;
  }

  const title = contentLines[0] ?? '';
  const parsedBodyLines = buildStructuredNoteLines(
    contentLines.slice(1),
    block.questionNumbers,
  );
  const bodyLines = parsedBodyLines.flatMap((line) => {
    const trimmedLine = normalizeInstructionFragment(line);
    const arrowMatch = trimmedLine.match(/^((?:\u2B07|\u2193))\s+(.+)$/);

    if (!arrowMatch?.[1] || !arrowMatch[2]) {
      return [line];
    }

    return [arrowMatch[1], arrowMatch[2]];
  });

  return {
    instructionText,
    title,
    bodyLines,
  };
}

export function parseStructuredSummaryBlock(
  block: ParsedQuestionBlock,
): ParsedSummaryBlock | null {
  if (!isStructuredSummaryBlock(block)) {
    return null;
  }

  const rawLines = block.rawText
    .split(/\r?\n/)
    .map((line) => normalizeInstructionFragment(line))
    .filter(Boolean);

  const instructionEndIndex = findStructuredInstructionEndIndex(rawLines);

  if (instructionEndIndex === -1) {
    return null;
  }

  const instructionText = rawLines.slice(0, instructionEndIndex + 1).join('\n');
  const contentLines = rawLines.slice(instructionEndIndex + 1);

  const overflowInstructionLines: string[] = [];

  while (
    contentLines.length > 0 &&
    (isStructuredNoteOverflowInstructionLine(contentLines[0] ?? '') ||
      isPureRangeLine(contentLines[0] ?? ''))
  ) {
    overflowInstructionLines.push(contentLines.shift() ?? '');
  }

  const firstContentLine = normalizeInstructionFragment(contentLines[0] ?? '');
  const repeatedTitleIndex = contentLines.findIndex(
    (line, index) =>
      index > 0 &&
      firstContentLine.length > 0 &&
      normalizeInstructionFragment(line) === firstContentLine,
  );

  if (repeatedTitleIndex > 0) {
    overflowInstructionLines.push(
      ...contentLines.splice(0, repeatedTitleIndex),
    );
  }

  const combinedInstructionText = [instructionText, ...overflowInstructionLines]
    .filter(Boolean)
    .join('\n');

  const [title = '', ...bodyLines] = contentLines;
  const summaryText = buildStructuredSummaryText(
    bodyLines,
    block.questionNumbers,
  );

  if (!title || !summaryText) {
    return null;
  }

  return {
    instructionText: combinedInstructionText,
    title,
    summaryText,
  };
}

export type StartScreenNavigation = {
  prevTest: IeltsTestRecord | null;
  nextTest: IeltsTestRecord | null;
};

export type StartScreenStatProps = {
  icon: React.ElementType;
  value: string;
  label: string;
  iconClassName: string;
};

export type StartScreenRuleProps = {
  icon: React.ElementType;
  toneClassName: string;
  text: string;
};

const startScreenModuleOrder = ['general', 'academic', 'listening'] as const;

export function parseQuestionBlock(block: QuestionBlock): ParsedQuestionBlock {
  const questionNumbers = uniqueQuestionNumbers(block.question_numbers ?? []);
  const lines = (block.text ?? '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items: ParsedQuestionItem[] = [];
  let currentItem: ParsedQuestionItem | null = null;
  let firstMarkerIndex = -1;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? '';
    const nextLine = lines[index + 1];
    const trailingBlankQuestion = detectTrailingBlankQuestionMarker(
      line,
      nextLine,
      questionNumbers,
    );

    if (trailingBlankQuestion) {
      if (currentItem) {
        items.push(currentItem);
        currentItem = null;
      }

      if (firstMarkerIndex === -1) {
        firstMarkerIndex = index;
      }

      currentItem = trailingBlankQuestion;
      index++;
      continue;
    }

    const inlineItems = extractInlineQuestionItems(line, questionNumbers);

    if (inlineItems.length > 1) {
      if (currentItem) {
        items.push(currentItem);
        currentItem = null;
      }

      if (firstMarkerIndex === -1) {
        firstMarkerIndex = index;
      }

      items.push(...inlineItems);
      continue;
    }

    const marker = detectQuestionMarker(line, questionNumbers);

    if (marker) {
      if (firstMarkerIndex === -1) {
        firstMarkerIndex = index;
      }

      if (currentItem) {
        items.push(currentItem);
      }

      currentItem = {
        qNum: marker.qNum,
        prompt: marker.prompt,
      };

      continue;
    }

    if (inlineItems.length > 0) {
      if (currentItem) {
        items.push(currentItem);
        currentItem = null;
      }

      if (firstMarkerIndex === -1) {
        firstMarkerIndex = index;
      }

      items.push(...inlineItems);
      continue;
    }

    if (currentItem) {
      currentItem = {
        qNum: currentItem.qNum,
        prompt: currentItem.prompt ? `${currentItem.prompt}\n${line}` : line,
      };
    }
  }

  if (currentItem) {
    items.push(currentItem);
  }

  if (
    items.length === 0 &&
    questionNumbers.length === 1 &&
    block.header.trim()
  ) {
    const fallbackPrompt = compactPromptLines(
      stripQuestionNumberPrefix(block.header, questionNumbers[0] ?? 0),
    );

    if (fallbackPrompt) {
      items.push({
        qNum: questionNumbers[0] ?? 0,
        prompt: fallbackPrompt,
      });
    }
  }

  const instructionLines =
    firstMarkerIndex === -1 ? lines : lines.slice(0, firstMarkerIndex);
  const displayInstructionLines = [...instructionLines];
  const contentHeadingLines: string[] = [];

  while (displayInstructionLines.length > 0) {
    const trailingInstructionLine = displayInstructionLines.at(-1) ?? '';
    const previousInstructionLines = displayInstructionLines.slice(0, -1);

    if (
      !isQuestionContentHeadingLine(
        trailingInstructionLine,
        previousInstructionLines,
      )
    ) {
      break;
    }

    contentHeadingLines.unshift(trailingInstructionLine);
    displayInstructionLines.pop();
  }

  if (
    items.length === 0 &&
    questionNumbers.length > 0 &&
    (block.choices ?? []).length > 0 &&
    displayInstructionLines.length > 0
  ) {
    const fallbackPrompt = compactPromptLines(
      displayInstructionLines.pop() ?? '',
    );

    if (fallbackPrompt) {
      items.push(
        ...questionNumbers.map((qNum) => ({
          qNum,
          prompt: fallbackPrompt,
        })),
      );
    }
  }

  return {
    header: block.header,
    questionNumbers,
    instructions: displayInstructionLines.join('\n'),
    contentHeading: contentHeadingLines.join('\n'),
    choices: block.choices ?? [],
    items,
    rawText: block.text ?? '',
  };
}
