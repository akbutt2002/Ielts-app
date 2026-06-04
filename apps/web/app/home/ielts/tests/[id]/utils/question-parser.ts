import { type IeltsTestRecord } from '@kit/ielts';
import type React from 'react';

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

  if (!trimmed || isPureRangeLine(trimmed)) {
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

    if (!/[a-z]/.test(firstChar)) {
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
    /^[A-H](?:[.)])?(?:\s+.+)?$/i.test(trimmedLine) ||
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
    previousInstructionLines.some((entry) => /^List of Headings$/i.test(entry))
  ) {
    return false;
  }

  if (
    previousInstructionLines.some((entry) => /^List of People$/i.test(entry))
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
    /^(?:Read|Look|Complete|Choose|Write|Do|Match|Label|Find|For|In boxes?|Questions?|NB)\b/i.test(
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
  const sourceBlocks =
    partBlocks.length > 0
      ? partBlocks
      : ((test?.questions ?? []) as QuestionBlock[]);
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
  return /^[ivxlcdm]+$/.test(line.trim());
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
      /^[A-D](?:[.)])?\s+\S/.test(line) ||
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

      if (
        questionRangePattern.test(upcomingLine) ||
        /^List of Headings$/i.test(upcomingLine) ||
        /^Opinions$/i.test(upcomingLine) ||
        /^List of People$/i.test(upcomingLine) ||
        /^(TRUE|FALSE|NOT GIVEN|YES|NO)$/i.test(upcomingLine) ||
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
    /Complete the (?:notes|flow[- ]?chart) below\.?/i.test(block.rawText)
  );
}

export function isStructuredSummaryBlock(block: ParsedQuestionBlock) {
  return (
    block.choices.length === 0 &&
    /Complete the summary below\.?/i.test(block.rawText)
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
  return line.replace(/^[â€¢â—â–ªâ—¦\-â€“âˆ’]+\s*/, '').trim();
}

export function isBulletLikeLine(line: string) {
  return /^[â€¢â—â–ªâ—¦\-â€“âˆ’]\s*/.test(line.trim());
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

  if (normalizedLine.length > 48 || normalizedLine.split(/\s+/).length > 8) {
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
    /^boxes?\s+\d+(?:\s*(?:to|-|\u2013|\u2014)\s*\d+)?(?:\s+on your answer sheet\.?)?$/i.test(
      normalizedLine,
    ) ||
    /^on your answer sheet\.?$/i.test(normalizedLine)
  );
}

export function findStructuredInstructionEndIndex(rawLines: string[]) {
  return rawLines.findIndex((line) =>
    /(?:for each answer|on your answer sheet)\.?$/i.test(line),
  );
}

export function tokenizeStructuredLines(
  contentLines: string[],
  questionNumbers: number[],
) {
  const questionNumberSet = new Set(questionNumbers);
  const usedQuestionNumbers = new Set<number>();
  const fragments: string[] = [];

  for (const line of contentLines) {
    if (!line) {
      continue;
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

  const instructionText = rawLines
    .slice(0, instructionEndIndex + 1)
    .filter((line) => !isStructuredNoteOverflowInstructionLine(line))
    .join('\n');
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
    isStructuredNoteOverflowInstructionLine(contentLines[0] ?? '')
  ) {
    overflowInstructionLines.push(contentLines.shift() ?? '');
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
