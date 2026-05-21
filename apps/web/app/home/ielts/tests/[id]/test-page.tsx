'use client';

import React, { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Headphones,
  HelpCircle,
  Layers3,
  Play,
  Trophy,
  X,
} from 'lucide-react';

import { type IeltsTestRecord, getAllIeltsTests, slugify } from '@kit/ielts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';
import { ModeToggle } from '@kit/ui/mode-toggle';
import { PageBody, PageHeader } from '@kit/ui/page';
import { SidebarTrigger, useSidebar } from '@kit/ui/shadcn-sidebar';
import { cn } from '@kit/ui/utils';

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

function uniqueQuestionNumbers(questionNumbers: number[] = []) {
  return Array.from(
    new Set(questionNumbers.filter((qNum) => Number.isFinite(qNum))),
  );
}

function buildSequentialQuestionRange(start: number, end: number) {
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return [];
  }

  const first = Math.min(start, end);
  const last = Math.max(start, end);

  return Array.from({ length: last - first + 1 }, (_, index) => first + index);
}

function countBlankMarkers(text: string) {
  return (text.match(/_{2,}/g) ?? []).length;
}

function isPureRangeLine(line: string) {
  return /^\d+\s*[-\u2013\u2014]\s*\d+$/.test(line);
}

function detectQuestionMarker(line: string, questionNumbers: number[]) {
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

function extractQuestionNumbersFromRangeText(text: string) {
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

function extractQuestionNumbersFromHeader(header: string) {
  const normalizedHeader = header.trim();
  const leadingQuestionMatch = normalizedHeader.match(/^(\d+)[.)]?\s+\S/);

  if (leadingQuestionMatch?.[1]) {
    return [Number(leadingQuestionMatch[1])];
  }

  return extractQuestionNumbersFromRangeText(normalizedHeader);
}

function inferListeningQuestionNumbersFromText(
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

function estimateListeningSlotCount(
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

function expandQuestionNumbersToSlotCount(
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

function isEmptyListeningDuplicateBlock(block: QuestionBlock) {
  return !block.text?.trim() && Boolean(block.header?.trim());
}

function hasRenderableAnswerSlot(block: QuestionBlock) {
  return (
    countBlankMarkers(block.text ?? '') > 0 || (block.choices?.length ?? 0) > 0
  );
}

function normalizeChoiceLabel(choice: string) {
  return choice.replace(/`+$/g, '').replace(/\s+/g, ' ').trim();
}

function normalizeBlockChoices(choices: string[] = []) {
  return choices
    .map((choice) => normalizeChoiceLabel(String(choice ?? '')))
    .filter((choice) => choice && !/^None$/i.test(choice));
}

function isChoiceLine(line: string) {
  const trimmedLine = normalizeChoiceLabel(line);

  return (
    /^(TRUE|FALSE|NOT GIVEN|NG|YES|NO)$/i.test(trimmedLine) ||
    /^[A-H](?:[.)])?(?:\s+.+)?$/i.test(trimmedLine) ||
    /^[ivxlcdm]+$/i.test(trimmedLine)
  );
}

function isQuestionContentHeadingLine(
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

function extractInlineQuestionItems(
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

function detectTrailingBlankQuestionMarker(
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

function extractQuestionNumbersFromQuestionText(text: string) {
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

function normalizeQuestionBlock(block: Partial<QuestionBlock>): QuestionBlock {
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

function getExpectedQuestionNumbers(test: any) {
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

function findRawQuestionStart(lines: string[], qNum: number) {
  const pattern = new RegExp(
    `^(?:Question\\s+)?${qNum}(?:[.)])?(?:\\s+|$)`,
    'i',
  );

  return lines.findIndex((line) => pattern.test(line.trim()));
}

function extractSupplementalQuestionBlock(
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

function supplementMissingQuestionBlocks(test: any, blocks: QuestionBlock[]) {
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

function normalizeSchemaQuestionBlocks(test: any, preferParts = false) {
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

function normalizeReadingQuestionBlocks(test: any) {
  return normalizeSchemaQuestionBlocks(test, false);
}

function normalizeListeningQuestionBlocks(test: any) {
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

function parseQuestionBlock(block: QuestionBlock): ParsedQuestionBlock {
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

function normalizeAnswerText(value: string) {
  return value
    .normalize('NFKC')
    .replace(/[\u2018\u2019\u0060]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^a-z0-9]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function splitAnswerVariants(answer: string) {
  return answer
    .split(/\s*\/\s*|\s+or\s+/i)
    .map((part) => part.replace(/\([^)]*\)/g, '').trim())
    .filter(Boolean);
}

function getChoiceAnswerValue(option: string) {
  const trimmedOption = option.trim();
  const letterMatch = trimmedOption.match(/^([A-H])(?:[\s.)\-â€“â€”:]|$)/i);

  if (letterMatch?.[1]) {
    return letterMatch[1].toUpperCase();
  }

  return trimmedOption;
}

function buildAnswerLookup(test: any) {
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

function answerMatches(userAnswer: string, correctAnswer: string) {
  const normalizedUserAnswer = normalizeAnswerText(userAnswer ?? '');

  if (!normalizedUserAnswer) {
    return false;
  }

  const variants = splitAnswerVariants(correctAnswer);

  if (variants.length === 0) {
    return normalizeAnswerText(correctAnswer) === normalizedUserAnswer;
  }

  return variants.some(
    (variant) => normalizeAnswerText(variant) === normalizedUserAnswer,
  );
}

const questionRangePattern =
  /^Questions?\s+\d+(?:(?:\s*(?:to|-|\u2013|\u2014)\s*|\s+and\s+)\d+)?\.?$/i;
const boxRangePattern =
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

function normalizeInstructionFragment(line: string) {
  return line
    .replace(/Ã¢â‚¬â€œ|Ã¢â‚¬â€|â€“|â€”/g, '-')
    .replace(/Ã¢â‚¬Ëœ|Ã¢â‚¬â„¢|â€˜|â€™/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function joinInstructionFragments(current: string, next: string) {
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

function isLowercaseRomanHeading(line: string) {
  return /^[ivxlcdm]+$/.test(line.trim());
}

function getInstructionLineStyle(line: string) {
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

function formatInstructionLines(text: string) {
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

function stripQuestionNumberPrefix(prompt: string, qNum: number) {
  return prompt
    .replace(new RegExp(`^${qNum}\\s*[.\\):\\-\\u2013\\u2014]*\\s*`), '')
    .trim();
}

function compactPromptLines(prompt: string) {
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

function formatQuestionRangeLabel(questionNumbers: number[]) {
  const normalizedQuestionNumbers = uniqueQuestionNumbers(questionNumbers);

  if (normalizedQuestionNumbers.length === 0) {
    return 'Questions';
  }

  if (normalizedQuestionNumbers.length === 1) {
    return `Question ${normalizedQuestionNumbers[0]}`;
  }

  return `Questions ${normalizedQuestionNumbers[0]}-${normalizedQuestionNumbers[normalizedQuestionNumbers.length - 1]}`;
}

function getBlockDisplayHeader(block: ParsedQuestionBlock) {
  return block.header.trim() || formatQuestionRangeLabel(block.questionNumbers);
}

function isProminentPassageQuestionLine(line: string) {
  const normalizedLine = normalizeInstructionFragment(line);

  return (
    questionRangePattern.test(normalizedLine) ||
    /Read the text(?: below)? and answer Questions?\s+\d+(?:\s*(?:to|-|\u2013|\u2014)\s*\d+)?\.?$/i.test(
      normalizedLine,
    ) ||
    /Questions?\s+\d+(?:\s*(?:to|-|\u2013|\u2014)\s*\d+)?/i.test(normalizedLine)
  );
}

function hasRenderableReadingSections(sections: ReadingSection[] = []) {
  return sections.some((section) =>
    (section.passages ?? []).some(
      (passage) =>
        Boolean(passage.heading?.trim()) ||
        Boolean(passage.instruction?.trim()) ||
        Boolean(passage.text?.trim()),
    ),
  );
}

function createFallbackReadingSection(
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

function parseFallbackReadingSections(rawText: string) {
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

function normalizeReadingSections(test: any) {
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

function normalizeTestAudio(test: any) {
  const audio =
    Array.isArray(test?.media?.audio) && test.media.audio.length > 0
      ? test.media.audio
      : test?.audio;

  return Array.isArray(audio) ? audio : [];
}

function normalizeTestImages(test: any) {
  const images = test?.media?.images;

  return Array.isArray(images) ? images : [];
}

function isStructuredNoteBlock(block: ParsedQuestionBlock) {
  return (
    block.choices.length === 0 &&
    /Complete the (?:notes|flow[- ]?chart) below\.?/i.test(block.rawText)
  );
}

function isStructuredSummaryBlock(block: ParsedQuestionBlock) {
  return (
    block.choices.length === 0 &&
    /Complete the summary below\.?/i.test(block.rawText)
  );
}

function isQuestionNumberLine(
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

function renderQuestionToken(qNum: number) {
  return `[[Q${qNum}]]`;
}

function isQuestionTokenLine(line: string) {
  return /^\[\[Q\d+\]\]$/.test(line.trim());
}

function stripListMarker(line: string) {
  return line.replace(/^[â€¢â—â–ªâ—¦\-â€“âˆ’]+\s*/, '').trim();
}

function isBulletLikeLine(line: string) {
  return /^[â€¢â—â–ªâ—¦\-â€“âˆ’]\s*/.test(line.trim());
}

function replaceInlineQuestionNumberWithToken(
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

function isStructuredNoteHeadingLine(line: string, nextLine?: string) {
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

function isStructuredNoteOverflowInstructionLine(line: string) {
  const normalizedLine = normalizeInstructionFragment(line);

  return (
    /^Write your answers\b/i.test(normalizedLine) ||
    /^boxes?\s+\d+(?:\s*(?:to|-|\u2013|\u2014)\s*\d+)?(?:\s+on your answer sheet\.?)?$/i.test(
      normalizedLine,
    ) ||
    /^on your answer sheet\.?$/i.test(normalizedLine)
  );
}

function findStructuredInstructionEndIndex(rawLines: string[]) {
  return rawLines.findIndex((line) =>
    /(?:for each answer|on your answer sheet)\.?$/i.test(line),
  );
}

function tokenizeStructuredLines(
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

function buildStructuredNoteLines(
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

function buildStructuredSummaryText(
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

function parseStructuredNoteBlock(
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

function isFlowchartStructuredBlock(block: ParsedQuestionBlock) {
  return /Complete the flowchart below\.?/i.test(block.rawText);
}

function parseStructuredFlowchartBlock(
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

function parseStructuredSummaryBlock(
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

type StartScreenNavigation = {
  prevTest: IeltsTestRecord | null;
  nextTest: IeltsTestRecord | null;
};

type StartScreenStatProps = {
  icon: React.ElementType;
  value: string;
  label: string;
  iconClassName: string;
};

type StartScreenRuleProps = {
  icon: React.ElementType;
  toneClassName: string;
  text: string;
};

const startScreenModuleOrder = ['general', 'academic', 'listening'] as const;

function extractCambridgeBookNumber(title: string) {
  const match = title.match(/Cambridge\s+(\d+)/i);

  return match?.[1] ? Number(match[1]) : null;
}

function stripCambridgePrefix(title: string) {
  return title.replace(/^Cambridge\s+\d+\s+(?:IELTS\s+)?/i, '').trim();
}

function resolveTestModuleKey(record: IeltsTestRecord) {
  const title = String(record.title ?? '').toLowerCase();
  const testType = String(record.test_type ?? '').toLowerCase();

  if (title.includes('listening') || testType === 'listening') {
    return 'listening' as const;
  }

  if (title.includes('academic reading')) {
    return 'academic' as const;
  }

  return 'general' as const;
}

function extractTestNumber(title: string) {
  const match = title.match(/Test\s+(\d+)/i);

  return match?.[1] ? Number(match[1]) : 0;
}

function buildStartScreenNavigation(
  test: IeltsTestRecord,
): StartScreenNavigation {
  const bookNumber = extractCambridgeBookNumber(test.title);

  if (bookNumber === null) {
    return {
      prevTest: null,
      nextTest: null,
    };
  }

  const currentSlug = slugify(test.title);
  const bookTests = getAllIeltsTests()
    .filter((record) => extractCambridgeBookNumber(record.title) === bookNumber)
    .sort((left, right) => {
      const leftModuleIndex = startScreenModuleOrder.indexOf(
        resolveTestModuleKey(left),
      );
      const rightModuleIndex = startScreenModuleOrder.indexOf(
        resolveTestModuleKey(right),
      );

      return (
        leftModuleIndex - rightModuleIndex ||
        extractTestNumber(left.title) - extractTestNumber(right.title) ||
        left.title.localeCompare(right.title)
      );
    });

  const currentIndex = bookTests.findIndex(
    (record) => slugify(record.title) === currentSlug,
  );

  return {
    prevTest: currentIndex > 0 ? (bookTests[currentIndex - 1] ?? null) : null,
    nextTest:
      currentIndex >= 0 && currentIndex < bookTests.length - 1
        ? (bookTests[currentIndex + 1] ?? null)
        : null,
  };
}

function buildStartScreenDetails(test: IeltsTestRecord) {
  return {
    displayTitle: stripCambridgePrefix(test.title),
    moduleKey: resolveTestModuleKey(test),
    navigation: buildStartScreenNavigation(test),
    bookNumber: extractCambridgeBookNumber(test.title),
  };
}

function StartScreenStatCard({
  icon: Icon,
  value,
  label,
  iconClassName,
}: StartScreenStatProps) {
  return (
    <div className="border-border/60 rounded-[22px] border bg-white/90 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c8c5f7] hover:shadow-[0_18px_40px_-24px_rgba(109,95,212,0.35)] dark:border-[#2a2a2a] dark:bg-[#17172a]/85 dark:hover:border-[#4d4970] dark:hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]">
      <div
        className={cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-[13px] border shadow-sm',
          iconClassName,
        )}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="mt-3">
        <div className="text-[22px] leading-none font-black tracking-tight text-[#0f0f1a] dark:text-[#f5f3ff]">
          {value}
        </div>
        <div className="mt-1 text-[8px] font-black tracking-[0.22em] text-[#7b789a] uppercase dark:text-[#a8a1c9]">
          {label}
        </div>
      </div>
    </div>
  );
}

function StartScreenRuleRow({
  icon: Icon,
  toneClassName,
  text,
}: StartScreenRuleProps) {
  return (
    <div className="flex items-start gap-3 rounded-[18px] border border-[#eeeaf9] bg-[#fbfaff] px-4 py-3 dark:border-[#2a2a2a] dark:bg-[#141428]/85">
      <span
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-[13px] border shadow-sm',
          toneClassName,
        )}
      >
        <Icon className="h-3 w-3" />
      </span>

      <p className="text-[12px] leading-6 text-[#0f0f1a]/88 dark:text-[#e7e3ff]/88">
        {text}
      </p>
    </div>
  );
}

export default function TestPage({ test }: { test: IeltsTestRecord }) {
  const isListening = test?.test_type === 'listening';
  const router = useRouter();
  const { open: sidebarOpen } = useSidebar();

  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreRingAnimated, setScoreRingAnimated] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(3600);
  const startScreen = useMemo(() => buildStartScreenDetails(test), [test]);
  const startScreenHero = useMemo(() => {
    switch (startScreen.moduleKey) {
      case 'listening':
        return {
          label: 'Listening',
          icon: Headphones,
          className:
            'border-[#F6D2A2] bg-[#FAEEDA] text-[#633806] dark:border-[#F6D2A2]/40 dark:bg-[#FAEEDA]/10 dark:text-[#FAEEDA]',
        };
      case 'academic':
        return {
          label: 'Academic reading',
          icon: BookOpen,
          className:
            'border-[#C8C5F7] bg-[#EEEDFE] text-[#3C3489] dark:border-[#C8C5F7]/40 dark:bg-[#EEEDFE]/10 dark:text-[#EEEDFE]',
        };
      default:
        return {
          label: 'General reading',
          icon: BookOpen,
          className:
            'border-[#B5D4F4] bg-[#E6F1FB] text-[#0C447C] dark:border-[#B5D4F4]/40 dark:bg-[#E6F1FB]/10 dark:text-[#E6F1FB]',
        };
    }
  }, [startScreen.moduleKey]);
  const startScreenNavigation = startScreen.navigation;
  const previousTestHref = startScreenNavigation.prevTest
    ? `/home/ielts/tests/${slugify(startScreenNavigation.prevTest.title)}`
    : null;
  const nextTestHref = startScreenNavigation.nextTest
    ? `/home/ielts/tests/${slugify(startScreenNavigation.nextTest.title)}`
    : null;

  const answerLookup = useMemo(() => buildAnswerLookup(test), [test]);
  const sourceQuestionBlocks = useMemo<QuestionBlock[]>(
    () =>
      isListening
        ? normalizeListeningQuestionBlocks(test)
        : normalizeReadingQuestionBlocks(test),
    [isListening, test],
  );
  const readingSections = useMemo(() => normalizeReadingSections(test), [test]);
  const readingPassages = useMemo(() => {
    let passageNumber = 1;

    return readingSections.flatMap((section) =>
      (section.passages ?? []).map((passage) => ({
        passageNumber: passageNumber++,
        passage,
      })),
    );
  }, [readingSections]);
  const listeningAudio = useMemo(() => normalizeTestAudio(test), [test]);
  const listeningImages = useMemo(() => normalizeTestImages(test), [test]);
  const parsedQuestionBlocks = useMemo<ParsedQuestionBlock[]>(
    () => sourceQuestionBlocks.map((qBlock) => parseQuestionBlock(qBlock)),
    [sourceQuestionBlocks],
  );
  const visibleQuestionBlocks = useMemo(() => {
    if (isListening) {
      return parsedQuestionBlocks;
    }

    const coveredQuestionNumbers = new Set<number>();

    return parsedQuestionBlocks.flatMap((block) => {
      const visibleItems = block.items.filter(
        (item) => !coveredQuestionNumbers.has(item.qNum),
      );

      if (visibleItems.length === 0) {
        return [];
      }

      visibleItems.forEach((item) => coveredQuestionNumbers.add(item.qNum));

      return [
        {
          ...block,
          questionNumbers: uniqueQuestionNumbers(
            visibleItems.map((item) => item.qNum),
          ),
          items: visibleItems,
        },
      ];
    });
  }, [isListening, parsedQuestionBlocks]);
  const displayQuestionGroups = useMemo<ParsedQuestionBlock[][]>(() => {
    if (visibleQuestionBlocks.length === 0) {
      return [];
    }

    const groups: ParsedQuestionBlock[][] = [];
    let currentGroup: ParsedQuestionBlock[] = [];
    let currentGroupLastQuestion = 0;
    let currentGroupIsStructured = false;

    const isStructuredGroupStarter = (block: ParsedQuestionBlock) =>
      Boolean(parseStructuredNoteBlock(block)) ||
      Boolean(parseStructuredSummaryBlock(block));

    const getBlockLastQuestion = (block: ParsedQuestionBlock) =>
      block.questionNumbers[block.questionNumbers.length - 1] ?? 0;

    const canAppendToCurrentGroup = (next: ParsedQuestionBlock) => {
      if (currentGroup.length === 0 || currentGroupIsStructured) {
        return false;
      }

      const nextFirstQuestion = next.questionNumbers[0] ?? 0;

      return (
        nextFirstQuestion === currentGroupLastQuestion + 1 &&
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

    return groups;
  }, [visibleQuestionBlocks]);
  const visibleQuestionNumbers = useMemo(
    () =>
      uniqueQuestionNumbers(
        sourceQuestionBlocks.flatMap((block) => block.question_numbers ?? []),
      ),
    [sourceQuestionBlocks],
  );
  const scoredQuestionNumbers = useMemo(
    () => visibleQuestionNumbers.filter((qNum) => answerLookup.has(qNum)),
    [answerLookup, visibleQuestionNumbers],
  );
  const totalQuestions =
    scoredQuestionNumbers.length ||
    visibleQuestionNumbers.length ||
    test?.total_answers ||
    answerLookup.size ||
    40;
  const answeredQuestionCount = visibleQuestionNumbers.filter((qNum) =>
    Boolean((userAnswers[qNum] ?? '').trim()),
  ).length;
  const isAllAnswered =
    visibleQuestionNumbers.length > 0
      ? answeredQuestionCount >= visibleQuestionNumbers.length
      : Object.keys(userAnswers).length >= totalQuestions;
  const isTestLocked = isSubmitted || timeLeft === 0;

  useEffect(() => {
    if (!isStarted || isSubmitted) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isStarted, isSubmitted]);

  useEffect(() => {
    if (isStarted && timeLeft === 0 && !isSubmitted) {
      setIsSubmitted(true);
    }
  }, [isStarted, isSubmitted, timeLeft]);

  useEffect(() => {
    if (isSubmitted) {
      setShowScoreModal(true);
    }
  }, [isSubmitted]);

  useEffect(() => {
    if (!showScoreModal) {
      setScoreRingAnimated(false);
      return;
    }

    setScoreRingAnimated(false);

    const animationFrame = window.requestAnimationFrame(() => {
      setScoreRingAnimated(true);
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [showScoreModal]);

  const calculateScore = () => {
    let score = 0;

    const questionNumbersToScore =
      scoredQuestionNumbers.length > 0
        ? scoredQuestionNumbers
        : Array.from(answerLookup.keys());

    questionNumbersToScore.forEach((qNum) => {
      const correctAnswer = answerLookup.get(qNum) ?? '';

      if (answerMatches(userAnswers[qNum] ?? '', correctAnswer)) {
        score++;
      }
    });

    return score;
  };

  const getBandScore = (score: number) => {
    if (score >= 39) return 9;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8;
    if (score >= 32) return 7.5;
    if (score >= 30) return 7;
    if (score >= 27) return 6.5;
    if (score >= 23) return 6;
    if (score >= 19) return 5.5;
    if (score >= 15) return 5;
    if (score >= 13) return 4.5;
    if (score >= 10) return 4;
    return 0;
  };

  const scoreTargetBands = [
    { band: 4.0, minimumCorrectAnswers: 10 },
    { band: 5.0, minimumCorrectAnswers: 15 },
    { band: 6.0, minimumCorrectAnswers: 23 },
    { band: 7.0, minimumCorrectAnswers: 30 },
    { band: 8.0, minimumCorrectAnswers: 35 },
    { band: 9.0, minimumCorrectAnswers: 39 },
  ] as const;

  function getPerformanceLabel(bandScore: number) {
    if (bandScore >= 8.5) return 'Exceptional performance';
    if (bandScore >= 7) return 'Strong performance';
    if (bandScore >= 5.5) return 'Good performance';
    if (bandScore >= 4) return 'Needs improvement';
    return 'Keep practicing';
  }

  function getNextTargetBand(score: number) {
    const lastTarget = scoreTargetBands[scoreTargetBands.length - 1];

    if (!lastTarget) {
      return {
        band: 0,
        needed: 0,
      };
    }

    const target =
      scoreTargetBands.find(
        ({ minimumCorrectAnswers }) => score < minimumCorrectAnswers,
      ) ?? lastTarget;

    return {
      band: target.band,
      needed: Math.max(0, target.minimumCorrectAnswers - score),
    };
  }

  function formatBandValue(value: number) {
    return value.toFixed(1);
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCorrectAnswer = (qNum: number) => answerLookup.get(qNum) ?? '';

  const renderAnswerStatusIcon = (isCorrect: boolean) => (
    <span
      className={`inline-flex h-5 w-5 items-center justify-center rounded-full border ${
        isCorrect
          ? 'border-green-500/30 bg-green-500/10 text-green-600'
          : 'border-destructive/30 bg-destructive/10 text-destructive'
      }`}
    >
      {isCorrect ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    </span>
  );

  const renderInstructionText = (text: string) => {
    const lines = formatInstructionLines(text);

    const highlightPattern =
      /(Questions?\s+\d+(?:(?:\s*(?:to|-)\s*|\s+and\s+)\d+)?|boxes?\s+\d+(?:\s*(?:to|-)\s*\d+)?|\bONE WORD(?: AND\/OR A NUMBER)?\b|\bNOT GIVEN\b|\bTRUE\b|\bFALSE\b|\bYES\b|\bNO\b|\bTWO\b|\bSIX\b|\b[A-H](?:\s*-\s*[A-H])\b|\b[ivxlcdm]+(?:\s*-\s*[ivxlcdm]+)\b|\b[A-H]\b(?:\s*,\s*\b[A-H]\b)*(?:\s+or\s+\b[A-H]\b))/gi;

    const renderInstructionLine = (line: string) => {
      const parts = line.split(highlightPattern);

      return parts.map((part, index) => {
        if (!part) {
          return null;
        }

        const normalizedPart = normalizeInstructionFragment(part);
        const isHighlighted =
          normalizedPart.length > 0 &&
          (questionRangePattern.test(normalizedPart) ||
            boxRangePattern.test(normalizedPart) ||
            /^(ONE WORD(?: AND\/OR A NUMBER)?|NOT GIVEN|TRUE|FALSE|YES|NO|TWO|SIX)$/i.test(
              normalizedPart,
            ) ||
            /^[A-H](?:\s*-\s*[A-H])$/i.test(normalizedPart) ||
            /^[ivxlcdm]+(?:\s*-\s*[ivxlcdm]+)$/i.test(normalizedPart) ||
            /^\b[A-H]\b(?:\s*,\s*\b[A-H]\b)*(?:\s+or\s+\b[A-H]\b)$/i.test(
              normalizedPart,
            ));

        return (
          <span
            key={`${normalizedPart}-${index}`}
            className={
              isHighlighted ? 'text-foreground font-semibold' : undefined
            }
          >
            {part}
          </span>
        );
      });
    };

    const renderPeopleListLine = (line: string) => {
      const peopleMatch = line.match(/^([A-D])(?:[.)])?\s+(.+)$/);

      if (!peopleMatch?.[1] || !peopleMatch[2]) {
        return renderInstructionLine(line);
      }

      const [, letter, remainder] = peopleMatch;

      return (
        <>
          <strong className="text-foreground font-bold">{letter}</strong>{' '}
          <span>{remainder}</span>
        </>
      );
    };

    return (
      <div className="space-y-1.5">
        {lines.map((line, index) => {
          const style = getInstructionLineStyle(line);
          const isPeopleListLine = /^[A-D](?:[.)])?\s+\S/.test(line);

          return (
            <p
              key={index}
              className={
                style === 'strong'
                  ? 'text-foreground text-[13px] leading-relaxed font-semibold'
                  : style === 'medium'
                    ? 'text-foreground text-[14px] leading-relaxed'
                    : 'text-foreground/80 text-[14px] leading-relaxed'
              }
            >
              {isPeopleListLine
                ? renderPeopleListLine(line)
                : renderInstructionLine(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderInstructionCard = ({
    block,
    text,
    className = '',
  }: {
    block: ParsedQuestionBlock;
    text: string;
    className?: string;
  }) => (
    <div
      className={`group border-border/60 bg-muted/20 relative overflow-hidden rounded-2xl border p-6 shadow-sm ${className}`}
    >
      <div className="bg-foreground absolute top-0 bottom-0 left-0 w-1.5" />

      <div className="mb-6 flex items-center gap-3">
        <div className="border-foreground/10 bg-foreground/5 rounded-lg border p-2">
          <BookOpen className="text-foreground h-4 w-4" />
        </div>

        <h3 className="text-foreground text-[11px] font-black tracking-[0.2em] uppercase">
          {getBlockDisplayHeader(block)}
        </h3>
      </div>

      {renderInstructionText(text)}
    </div>
  );

  const renderInlinePrompt = (prompt: string, qNum: number) => {
    const correctAnswer = getCorrectAnswer(qNum);
    const userAnswer = userAnswers[qNum] ?? '';
    const isCorrect = isSubmitted && answerMatches(userAnswer, correctAnswer);
    const segments = prompt.split(/(__+)/);

    return (
      <div className="text-foreground text-sm leading-relaxed font-bold whitespace-pre-wrap">
        {segments.map((segment, index) => {
          if (/^__+$/.test(segment)) {
            return (
              <span
                key={index}
                className="mx-1 inline-flex items-center gap-2 align-middle"
              >
                <input
                  type="text"
                  placeholder="..."
                  className={`border-border/75 border-b-foreground/20 bg-muted/35 text-foreground focus:border-primary focus:bg-primary/5 focus:ring-primary/10 min-w-[84px] rounded-md border border-b-2 px-2 py-0.5 text-[11px] font-black shadow-sm transition-all outline-none focus:ring-2 ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-green-500 border-b-green-500 bg-green-500/10'
                        : 'border-destructive border-b-destructive bg-destructive/10'
                      : ''
                  }`}
                  value={userAnswer}
                  disabled={isTestLocked}
                  onChange={(event) =>
                    setUserAnswers((previous) => ({
                      ...previous,
                      [qNum]: event.target.value,
                    }))
                  }
                />
              </span>
            );
          }

          return <span key={index}>{segment}</span>;
        })}
      </div>
    );
  };

  const renderInlineNoteText = (text: string) => {
    const parts = text.split(/(\[\[Q\d+\]\])/);

    return parts.map((part, index) => {
      const tokenMatch = part.match(/^\[\[Q(\d+)\]\]$/);

      if (!tokenMatch) {
        return <span key={`${part}-${index}`}>{part}</span>;
      }

      const qNum = Number(tokenMatch[1]);
      const correctAnswer = getCorrectAnswer(qNum);
      const userAnswer = userAnswers[qNum] ?? '';
      const isCorrect = isSubmitted && answerMatches(userAnswer, correctAnswer);

      return (
        <span
          key={`${qNum}-${index}`}
          className="mx-1 inline-flex items-center gap-2 align-middle"
        >
          <span className="text-foreground text-sm font-bold">{qNum}</span>
          {isSubmitted ? renderAnswerStatusIcon(isCorrect) : null}
          <input
            type="text"
            placeholder=""
            className={`border-border/80 bg-muted/25 text-foreground focus:border-foreground/40 focus:ring-foreground/10 h-9 w-20 rounded-md border px-2.5 text-[13px] font-semibold shadow-sm transition-all outline-none focus:ring-2 ${
              isSubmitted
                ? isCorrect
                  ? 'border-green-500 border-b-green-500 bg-green-500/10'
                  : 'border-destructive border-b-destructive bg-destructive/10'
                : ''
            }`}
            value={userAnswer}
            disabled={isTestLocked}
            onChange={(event) =>
              setUserAnswers((previous) => ({
                ...previous,
                [qNum]: event.target.value,
              }))
            }
          />
        </span>
      );
    });
  };

  const renderStructuredNoteBlock = (
    block: ParsedQuestionBlock,
    blockIdx: number,
  ) => {
    const parsedNoteBlock = parseStructuredNoteBlock(block);

    if (!parsedNoteBlock) {
      return null;
    }

    const isFlowchartBlock = isFlowchartStructuredBlock(block);
    const parsedFlowchartBlock = isFlowchartBlock
      ? parseStructuredFlowchartBlock(block)
      : null;

    return (
      <div key={blockIdx} className="space-y-5">
        {renderInstructionCard({
          block,
          text:
            parsedFlowchartBlock?.instructionText ??
            parsedNoteBlock.instructionText,
        })}

        {isFlowchartBlock && parsedFlowchartBlock ? (
          <div className="border-border/70 border-t pt-6">
            <div className="mx-auto max-w-[720px] space-y-8">
              <div className="flex justify-center">
                <h3 className="text-foreground text-center text-[20px] leading-tight font-black tracking-tight whitespace-nowrap">
                  {parsedFlowchartBlock.title}
                </h3>
              </div>

              <div className="mx-auto flex w-full max-w-[680px] flex-col gap-6">
                {parsedFlowchartBlock.bodyLines.map((line, index) => {
                  const trimmedLine = normalizeInstructionFragment(line);

                  if (/^(?:\u2B07|\u2193)$/.test(trimmedLine)) {
                    return (
                      <div
                        key={`flowchart-arrow-${index}`}
                        className="flex w-full justify-center"
                      >
                        <span className="text-foreground text-[18px] leading-none font-bold">
                          {trimmedLine}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <p
                      key={`flowchart-line-${index}`}
                      className="text-foreground text-center text-[15px] leading-9"
                    >
                      {renderInlineNoteText(line)}
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="border-border/70 border-t pt-6">
            <div className="mx-auto max-w-4xl space-y-8">
              <h3 className="text-foreground text-[22px] font-bold tracking-tight">
                {parsedNoteBlock.title}
              </h3>

              {parsedNoteBlock.lead.map((line, index) => (
                <p
                  key={`lead-${index}`}
                  className="text-foreground text-[15px] leading-9"
                >
                  {renderInlineNoteText(line)}
                </p>
              ))}

              {parsedNoteBlock.sections.map((section, sectionIdx) => (
                <section
                  key={`${section.heading}-${sectionIdx}`}
                  className="space-y-4"
                >
                  <h4 className="text-foreground text-[16px] font-semibold">
                    {section.heading}
                  </h4>

                  <ul className="marker:text-foreground/70 list-disc space-y-3 pl-7">
                    {section.items.map((item, itemIdx) => (
                      <li
                        key={`${section.heading}-${itemIdx}`}
                        className="text-foreground text-[15px] leading-9"
                      >
                        {renderInlineNoteText(item)}
                      </li>
                    ))}
                  </ul>
                </section>
              ))}

              {isSubmitted && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {block.questionNumbers.map((qNum) => (
                    <div
                      key={`answer-${qNum}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2"
                    >
                      <span className="text-muted-foreground text-[11px] font-bold">
                        {qNum}
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        {getCorrectAnswer(qNum) || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStructuredSummaryBlock = (
    block: ParsedQuestionBlock,
    blockIdx: number,
  ) => {
    const parsedSummaryBlock = parseStructuredSummaryBlock(block);

    if (!parsedSummaryBlock) {
      return null;
    }

    return (
      <div key={blockIdx} className="space-y-8">
        {renderInstructionCard({
          block,
          text: parsedSummaryBlock.instructionText,
        })}

        <div className="border-border/70 border-t pt-5">
          <div className="max-w-4xl space-y-5">
            <h3 className="text-foreground text-center text-[22px] font-bold tracking-tight">
              {parsedSummaryBlock.title}
            </h3>

            <p className="text-foreground text-[15px] leading-[2.35]">
              {renderInlineNoteText(parsedSummaryBlock.summaryText)}
            </p>

            {isSubmitted && (
              <div className="flex flex-wrap gap-2 pt-2">
                {block.questionNumbers.map((qNum) => (
                  <div
                    key={`answer-${qNum}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 px-3 py-2"
                  >
                    <span className="text-muted-foreground text-[11px] font-bold">
                      {qNum}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      {getCorrectAnswer(qNum) || '-'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderQuestionRow = ({
    qNum,
    prompt,
    choices,
    showPrompt = true,
  }: {
    qNum: number;
    prompt: string;
    choices: string[];
    showPrompt?: boolean;
  }) => {
    const correctAnswer = getCorrectAnswer(qNum);
    const userAnswer = userAnswers[qNum] ?? '';
    const normalizedPrompt = compactPromptLines(
      stripQuestionNumberPrefix(prompt, qNum),
    );
    const hasBlank = showPrompt && /__+/.test(normalizedPrompt);
    const hasChoices = choices.length > 0;
    const shouldRenderBlankInput = hasBlank;
    const promptWithoutBlanks = compactPromptLines(
      normalizedPrompt
        .replace(/__+/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim(),
    );
    const isCorrect = isSubmitted && answerMatches(userAnswer, correctAnswer);
    const normalizedUserAnswer = normalizeAnswerText(userAnswer);
    return (
      <div key={qNum} className="group relative space-y-3 pl-10">
        <div className="bg-foreground text-background absolute top-0 left-0 flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black shadow-md transition-transform group-hover:scale-110">
          {qNum}
        </div>

        <div className="flex items-start gap-2">
          {isSubmitted ? (
            <div className="shrink-0 pt-0.5">
              {renderAnswerStatusIcon(isCorrect)}
            </div>
          ) : null}

          <div className="min-w-0 flex-1 space-y-3">
            {showPrompt && (normalizedPrompt || promptWithoutBlanks) ? (
              shouldRenderBlankInput ? (
                renderInlinePrompt(normalizedPrompt, qNum)
              ) : (
                <p className="text-foreground text-sm leading-relaxed font-bold tracking-tight whitespace-pre-wrap">
                  {hasChoices ? promptWithoutBlanks : normalizedPrompt}
                </p>
              )
            ) : null}

            {hasChoices && !hasBlank ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {choices.map((choice) => {
                  const normalizedChoice = normalizeAnswerText(choice);
                  const isSelected = normalizedUserAnswer === normalizedChoice;
                  const isChoiceCorrect =
                    isSubmitted && answerMatches(choice, correctAnswer);
                  const isWrongSelection =
                    isSubmitted && isSelected && !isChoiceCorrect;

                  return (
                    <button
                      key={`${qNum}-${choice}`}
                      type="button"
                      disabled={isTestLocked}
                      onClick={() =>
                        !isTestLocked &&
                        setUserAnswers((previous) => ({
                          ...previous,
                          [qNum]: choice,
                        }))
                      }
                      className={`min-w-[46px] rounded-full border px-4 py-2 text-[10px] font-black tracking-[0.2em] uppercase shadow-sm transition-all ${
                        isSubmitted
                          ? isChoiceCorrect
                            ? 'border-green-500/40 bg-green-500/10 text-green-600'
                            : isWrongSelection
                              ? 'border-destructive/40 bg-destructive/10 text-destructive'
                              : 'border-border/60 bg-muted/30 text-muted-foreground'
                          : isSelected
                            ? 'border-foreground bg-foreground text-background'
                            : 'border-border/60 bg-background text-muted-foreground hover:border-foreground/25 hover:text-foreground'
                      } ${isTestLocked ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            ) : !shouldRenderBlankInput ? (
              <input
                type="text"
                placeholder="..."
                className={`border-border/75 border-b-foreground/20 bg-muted/35 text-foreground focus:border-primary focus:bg-primary/5 focus:ring-primary/10 w-full max-w-xs rounded-md border border-b-2 px-2.5 py-1.5 text-sm font-black shadow-sm transition-all outline-none focus:ring-2 ${
                  isSubmitted
                    ? isCorrect
                      ? 'border-green-500 border-b-green-500 bg-green-500/10'
                      : 'border-destructive border-b-destructive bg-destructive/10'
                    : ''
                }`}
                value={userAnswer}
                disabled={isTestLocked}
                onChange={(event) =>
                  setUserAnswers((previous) => ({
                    ...previous,
                    [qNum]: event.target.value,
                  }))
                }
              />
            ) : null}

            {isSubmitted && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/5 p-2">
                <span className="text-muted-foreground text-[9px] font-black tracking-[0.2em] uppercase">
                  Answer:
                </span>
                <span className="text-xs font-black text-green-500">
                  {correctAnswer || '-'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const shouldShowQuestionBlockTitle = (block: ParsedQuestionBlock) => {
    const normalizedHeader = normalizeAnswerText(block.header ?? '');

    if (!normalizedHeader) {
      return false;
    }

    if (block.items.length <= 1) {
      return false;
    }

    const firstItem = block.items[0];
    const normalizedPrompt = normalizeAnswerText(
      stripQuestionNumberPrefix(firstItem?.prompt ?? '', firstItem?.qNum ?? 0),
    );

    return normalizedHeader !== normalizedPrompt;
  };

  const renderQuestionGroup = (
    group: ParsedQuestionBlock[],
    groupIdx: number,
  ) => {
    const [primaryBlock, ...continuationBlocks] = group;
    const sectionTitlePrompt = primaryBlock?.contentHeading?.trim() ?? '';

    if (!primaryBlock) {
      return null;
    }

    const parsedNoteBlock = parseStructuredNoteBlock(primaryBlock);
    const parsedSummaryBlock = parseStructuredSummaryBlock(primaryBlock);

    if (parsedNoteBlock) {
      return renderStructuredNoteBlock(primaryBlock, groupIdx);
    }

    if (parsedSummaryBlock) {
      return renderStructuredSummaryBlock(primaryBlock, groupIdx);
    }

    const displayBlockTitle = shouldShowQuestionBlockTitle(primaryBlock)
      ? formatQuestionRangeLabel(primaryBlock.questionNumbers)
      : '';
    const contentHeading = primaryBlock.contentHeading?.trim() ?? '';
    const displayContentHeading =
      /^Which title is the most suitable for the text\?$/i.test(contentHeading)
        ? `Question ${
            primaryBlock.questionNumbers[
              primaryBlock.questionNumbers.length - 1
            ] ??
            primaryBlock.questionNumbers[0] ??
            ''
          }`
        : contentHeading;

    return (
      <section
        key={`${primaryBlock.header}-${groupIdx}`}
        className="border-border/60 bg-background/80 space-y-5 rounded-3xl border p-6 shadow-sm"
      >
        <div className="space-y-2">
          {displayBlockTitle ? (
            <div className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">
              {displayBlockTitle}
            </div>
          ) : null}

          {displayContentHeading ? (
            <h3 className="text-foreground text-lg font-semibold tracking-tight">
              {displayContentHeading}
            </h3>
          ) : null}

          {primaryBlock.instructions ? (
            <div className="border-border/60 bg-muted/20 rounded-2xl border p-4">
              {renderInstructionText(primaryBlock.instructions)}
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          {[primaryBlock, ...continuationBlocks].map((block, blockGroupIdx) => (
            <div
              key={`${block.header}-${groupIdx}-${blockGroupIdx}`}
              className={cn(
                'space-y-6',
                blockGroupIdx > 0 && 'border-border/60 border-t pt-6',
              )}
            >
              {block.items.map((item) => {
                const itemPrompt = compactPromptLines(
                  stripQuestionNumberPrefix(item.prompt, item.qNum),
                );
                const displayPrompt =
                  sectionTitlePrompt &&
                  (!itemPrompt ||
                    /^question\s+\d+$/i.test(itemPrompt) ||
                    itemPrompt === block.header.trim())
                    ? sectionTitlePrompt
                    : item.prompt;

                return renderQuestionRow({
                  qNum: item.qNum,
                  prompt: displayPrompt,
                  choices: block.choices,
                });
              })}
            </div>
          ))}
        </div>
      </section>
    );
  };

  const handleSubmitTest = () => {
    if (!isSubmitted) {
      setIsSubmitted(true);
    }

    setShowScoreModal(true);
  };

  const handleCloseScoreModal = () => {
    setShowScoreModal(false);
  };

  const handleRetryTest = () => {
    setShowScoreModal(false);
    setIsSubmitted(false);
    setIsStarted(false);
    setUserAnswers({});
    setTimeLeft(3600);
  };

  const handleGoToTests = () => {
    setShowScoreModal(false);
    router.push('/home');
  };

  const renderStartScreen = () => (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#f4f3fc] text-[#0f0f1a] dark:bg-[#0b0b16] dark:text-[#f5f3ff]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(155,143,232,0.22), transparent 34%), radial-gradient(circle at top right, rgba(109,95,212,0.10), transparent 32%), radial-gradient(circle at bottom, rgba(255,255,255,0.92), transparent 42%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(155,143,232,0.12), transparent 34%), radial-gradient(circle at top right, rgba(109,95,212,0.08), transparent 32%), radial-gradient(circle at bottom, rgba(255,255,255,0.03), transparent 42%), linear-gradient(180deg, rgba(10,10,20,0.88), rgba(10,10,20,0.58) 28%, transparent 50%)',
        }}
      />

      <PageBody className="relative z-10 pb-24">
        <SidebarTrigger
          className="border-border/70 fixed top-5 z-[60] hidden h-5 w-5 cursor-pointer rounded-2xl border bg-white/90 text-[#7b789a] shadow-[0_12px_25px_-16px_rgba(109,95,212,0.45)] transition-all duration-200 hover:scale-[1.02] hover:border-[#c8c5f7] hover:bg-white hover:text-[#0f0f1a] active:scale-[0.98] lg:inline-flex dark:border-[#2a2a2a] dark:bg-[#17172a]/90 dark:text-[#c8c5f7] dark:shadow-[0_12px_25px_-16px_rgba(0,0,0,0.55)] dark:hover:border-[#4d4970] dark:hover:bg-[#1b1b2f] dark:hover:text-[#f5f3ff]"
          style={{
            left: sidebarOpen
              ? 'calc(var(--sidebar-width) + 0.75rem)'
              : 'calc(var(--sidebar-width-icon) + 0.75rem)',
          }}
        />

        <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="rounded-[30px] border border-[#dddaf0] bg-white/90 shadow-[0_24px_80px_-60px_rgba(109,95,212,0.4)] dark:border-[#2a2a2a] dark:bg-[#111120]/88 dark:shadow-[0_24px_80px_-60px_rgba(0,0,0,0.7)]">
            <div className="flex flex-col gap-5 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
                  <ol className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-medium sm:text-[12px]">
                    <li>
                      <Link
                        href="/tests"
                        className="text-[#7b789a] transition-colors hover:text-[#6d5fd4] dark:text-[#a8a1c9] dark:hover:text-[#cfc8ff]"
                      >
                        Tests
                      </Link>
                    </li>
                    <li className="text-[#7b789a]/30 dark:text-[#a8a1c9]/30">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </li>
                    <li className="truncate text-[#7b789a] dark:text-[#a8a1c9]">
                      Cambridge {startScreen.bookNumber ?? ''}
                    </li>
                    <li className="text-[#7b789a]/30 dark:text-[#a8a1c9]/30">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </li>
                    <li className="truncate font-semibold text-[#6d5fd4] dark:text-[#b6abff]">
                      {startScreen.displayTitle}
                    </li>
                  </ol>
                </nav>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!previousTestHref}
                    onClick={() =>
                      previousTestHref && router.push(previousTestHref)
                    }
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-2xl border transition-all duration-200',
                      previousTestHref
                        ? 'cursor-pointer border-[#dddaf0] bg-white text-[#7b789a] shadow-[0_12px_24px_-18px_rgba(109,95,212,0.35)] hover:scale-[1.02] hover:border-[#c8c5f7] hover:bg-white hover:text-[#0f0f1a] dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#c8c5f7] dark:shadow-[0_12px_24px_-18px_rgba(0,0,0,0.5)] dark:hover:border-[#4d4970] dark:hover:bg-[#1b1b2f] dark:hover:text-[#f5f3ff]'
                        : 'cursor-not-allowed border-[#dddaf0] bg-white/60 text-[#c3bddf] opacity-50 dark:border-[#2a2a2a] dark:bg-[#17172a]/60 dark:text-[#6f6a90]',
                    )}
                    aria-label="Previous test"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={!nextTestHref}
                    onClick={() => nextTestHref && router.push(nextTestHref)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-2xl border transition-all duration-200',
                      nextTestHref
                        ? 'cursor-pointer border-[#dddaf0] bg-white text-[#7b789a] shadow-[0_12px_24px_-18px_rgba(109,95,212,0.35)] hover:scale-[1.02] hover:border-[#c8c5f7] hover:bg-white hover:text-[#0f0f1a] dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#c8c5f7] dark:shadow-[0_12px_24px_-18px_rgba(0,0,0,0.5)] dark:hover:border-[#4d4970] dark:hover:bg-[#1b1b2f] dark:hover:text-[#f5f3ff]'
                        : 'cursor-not-allowed border-[#dddaf0] bg-white/60 text-[#c3bddf] opacity-50 dark:border-[#2a2a2a] dark:bg-[#17172a]/60 dark:text-[#6f6a90]',
                    )}
                    aria-label="Next test"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d8d2ff] bg-white px-4 py-2 text-[10px] font-black tracking-[0.18em] text-[#6d5fd4] uppercase shadow-[0_16px_45px_-30px_rgba(109,95,212,0.45)] dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#cfc8ff] dark:shadow-[0_16px_45px_-30px_rgba(0,0,0,0.55)]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#6d5fd4] shadow-[0_0_0_6px_rgba(109,95,212,0.12)] dark:bg-[#b6abff] dark:shadow-[0_0_0_6px_rgba(182,171,255,0.12)]" />
                    <span>{startScreenHero.label}</span>
                  </div>

                  <div className="space-y-3.5">
                    <h2 className="max-w-[15ch] text-[clamp(1rem,4vw,2rem)] leading-[0.95] font-black tracking-[-0.05em] text-[#0f0f1a] dark:text-[#f5f3ff]">
                      {startScreen.displayTitle}
                    </h2>
                    <p className="max-w-[44ch] text-[13px] leading-[1.7] text-[#7b789a] dark:text-[#c1badd]">
                      Full-length IELTS simulation with instant scoring and
                      detailed answer review.
                    </p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  <StartScreenStatCard
                    icon={Clock}
                    value="60"
                    label="Minutes"
                    iconClassName="border-[#e8e3ff] bg-[#ede9fe] text-[#6d5fd4] dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#b6abff]"
                  />
                  <StartScreenStatCard
                    icon={HelpCircle}
                    value="40"
                    label="Questions"
                    iconClassName="border-[#e8e3ff] bg-[#ede9fe] text-[#6d5fd4] dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#b6abff]"
                  />
                  <StartScreenStatCard
                    icon={Trophy}
                    value="9.0"
                    label="Max band"
                    iconClassName="border-[#e8e3ff] bg-[#ede9fe] text-[#6d5fd4] dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#b6abff]"
                  />
                </div>

                <div className="rounded-[28px] border border-[#dddaf0] bg-white/95 p-4 shadow-[0_24px_70px_-46px_rgba(109,95,212,0.34)] dark:border-[#2a2a2a] dark:bg-[#111120]/90 dark:shadow-[0_24px_70px_-46px_rgba(0,0,0,0.7)]">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-[#e8e3ff] bg-[#ede9fe] text-[#6d5fd4] shadow-sm dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#b6abff]">
                      <Layers3 className="h-3 w-3" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-black tracking-[0.2em] text-[#6d5fd4] uppercase dark:text-[#b6abff]">
                        Band score guide
                      </div>
                      <h3 className="text-[20px] leading-[1.15] font-black tracking-[-0.03em] text-[#0f0f1a] dark:text-[#f5f3ff]">
                        How many correct answers do you need?
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                    {[
                      { band: 'Band 7', score: '34+' },
                      { band: 'Band 8', score: '37+' },
                      { band: 'Band 9', score: '39+' },
                    ].map((item) => (
                      <div
                        key={item.band}
                        className="rounded-[20px] border border-[#dddaf0] bg-[#fbfaff] px-4 py-[18px] text-center dark:border-[#2a2a2a] dark:bg-[#17172a]/90"
                      >
                        <div className="text-[24px] leading-none font-black tracking-tight text-[#6d5fd4] dark:text-[#cfc8ff]">
                          {item.score}
                        </div>
                        <div className="mt-2.5 text-[10px] font-black tracking-[0.2em] text-[#7b789a] uppercase dark:text-[#a8a1c9]">
                          {item.band}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#dddaf0] bg-white/95 p-4 shadow-[0_24px_70px_-46px_rgba(109,95,212,0.3)] sm:p-5 dark:border-[#2a2a2a] dark:bg-[#111120]/90 dark:shadow-[0_24px_70px_-46px_rgba(0,0,0,0.7)]">
                  <h3 className="text-[20px] font-black tracking-[-0.03em] text-[#0f0f1a] dark:text-[#f5f3ff]">
                    Before you begin
                  </h3>
                  <div className="mt-3.5 space-y-2.5">
                    <StartScreenRuleRow
                      icon={Clock}
                      toneClassName="border-[#F0C776] bg-[#FAEEDA] text-[#854F0B] dark:border-[#4d3b16] dark:bg-[#251c12] dark:text-[#f7c46a]"
                      text="Timer starts immediately and cannot be paused — make sure you are ready before clicking Start."
                    />
                    <StartScreenRuleRow
                      icon={Layers3}
                      toneClassName="border-[#B5D4F4] bg-[#E6F1FB] text-[#185FA5] dark:border-[#27344b] dark:bg-[#142036] dark:text-[#7cb4f5]"
                      text="Passages on the left, questions on the right — both panels scroll independently."
                    />
                    <StartScreenRuleRow
                      icon={Check}
                      toneClassName="border-[#A8D19A] bg-[#EAF3DE] text-[#3B6D11] dark:border-[#24351d] dark:bg-[#182410] dark:text-[#8bd27c]"
                      text="Band score shown instantly after submission. Test auto-submits when time runs out."
                    />
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#dddaf0] bg-white/95 p-4 shadow-[0_24px_70px_-46px_rgba(109,95,212,0.35)] sm:p-5 dark:border-[#2a2a2a] dark:bg-[#111120]/90 dark:shadow-[0_24px_70px_-46px_rgba(0,0,0,0.7)]">
                  <button
                    type="button"
                    onClick={() => setIsStarted(true)}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#5b48f5_0%,#6d5fd4_45%,#9b8fe8_100%)] px-5 py-3.5 text-[15px] font-black tracking-[0.08em] text-white shadow-[0_26px_60px_-28px_rgba(109,95,212,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-30px_rgba(109,95,212,0.7)] active:translate-y-0 dark:shadow-[0_26px_60px_-28px_rgba(0,0,0,0.6)]"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Start Test</span>
                  </button>

                  <Link
                    href="/tests"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-[#dddaf0] bg-transparent px-5 py-3.5 text-[14px] font-black tracking-[0.08em] text-[#0f0f1a] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c8c5f7] hover:bg-white active:translate-y-0 dark:border-[#2a2a2a] dark:bg-transparent dark:text-[#f5f3ff] dark:hover:border-[#4d4970] dark:hover:bg-[#17172a]"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back to Tests
                  </Link>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] text-[#7b789a] dark:text-[#a8a1c9]">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-[#6d5fd4] dark:text-[#b6abff]" />
                      Instant result
                    </span>
                    <span className="text-[#c8c5f7] dark:text-[#4d4970]">
                      •
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Trophy className="h-3 w-3 text-[#6d5fd4] dark:text-[#b6abff]" />
                      Band score included
                    </span>
                    <span className="text-[#c8c5f7] dark:text-[#4d4970]">
                      •
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-[#6d5fd4] dark:text-[#b6abff]" />
                      Full simulation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </div>
  );

  const renderExamScreen = () => {
    const score = calculateScore();
    const bandScore = getBandScore(score);
    const bandScoreLabel = formatBandValue(bandScore);
    const nextTarget = getNextTargetBand(score);
    const nextTargetBandLabel = formatBandValue(nextTarget.band);
    const performanceLabel = getPerformanceLabel(bandScore);
    const timeUsedMinutes = Math.max(0, Math.floor((3600 - timeLeft) / 60));
    const incorrectAnswerCount = Math.max(0, totalQuestions - score);
    const ringRadius = 46;
    const ringCircumference = 2 * Math.PI * ringRadius;
    const ringProgress = scoreRingAnimated
      ? Math.min(1, Math.max(0, score / Math.max(totalQuestions, 1)))
      : 0;
    const ringDashOffset = ringCircumference * (1 - ringProgress);
    const useSplitReadingLayout = !isListening && readingPassages.length > 0;
    const scoreDialog = (
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent
          overlayClassName="!bg-[rgba(0,0,0,0.55)] !backdrop-blur-[3px]"
          className="!max-h-[calc(100vh-1.5rem)] !max-w-[420px] !overflow-x-hidden !overflow-y-auto !rounded-[24px] !border-0 !bg-[#ffffff] !p-0 !text-[#1a1a1a] !shadow-[0_24px_80px_rgba(0,0,0,0.4)] dark:!bg-[#111111] dark:!text-[#f5f5f5] dark:!shadow-[0_24px_80px_rgba(0,0,0,0.65)] [&>button]:hidden"
        >
          <DialogHeader className="!flex-row !items-center !justify-between !space-y-0 border-b border-[#f0f0f0] bg-[#ffffff] px-4 py-3 !text-left dark:border-[#2a2a2a] dark:bg-[#111111]">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#1d2d15] dark:text-[#8bd27c]">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-[10px] font-black tracking-[0.2em] text-[#1a1a1a] uppercase dark:text-[#f5f5f5]">
                Test completed
              </span>
            </div>

            <button
              type="button"
              aria-label="Close results"
              onClick={handleCloseScoreModal}
              className="inline-flex h-7 w-7 items-center justify-center rounded-[9px] border border-[#e9e9e9] text-[#888888] transition-all hover:border-[#d8d8d8] hover:bg-[#fafafa] hover:text-[#1a1a1a] dark:border-[#2a2a2a] dark:text-[#9b9b9b] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1a1a1a] dark:hover:text-[#f5f5f5]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </DialogHeader>

          <div className="grid gap-0 border-b border-[#f0f0f0] bg-[#ffffff] px-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center dark:border-[#2a2a2a] dark:bg-[#111111]">
            <div className="flex justify-center">
              <div className="relative flex h-[104px] w-[104px] items-center justify-center">
                <svg
                  viewBox="0 0 120 120"
                  className="absolute inset-0 h-[104px] w-[104px] -rotate-90"
                >
                  <defs>
                    <linearGradient
                      id="ielts-score-ring-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>

                  <circle
                    cx="60"
                    cy="60"
                    r={ringRadius}
                    fill="none"
                    className="stroke-[#f0f0f0] dark:stroke-[#2a2a2a]"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r={ringRadius}
                    fill="none"
                    stroke="url(#ielts-score-ring-gradient)"
                    strokeLinecap="round"
                    strokeWidth="8"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringDashOffset}
                    style={{
                      transition:
                        'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  />
                </svg>

                <div className="relative flex flex-col items-center justify-center text-center">
                  <span className="text-[9px] font-black tracking-[0.2em] text-[#888888] uppercase dark:text-[#9b9b9b]">
                    Your band
                  </span>
                  <span className="mt-1 text-[28px] leading-none font-black text-[#1a1a1a] dark:text-[#f5f5f5]">
                    {bandScoreLabel}
                  </span>
                  <span className="mt-1.5 text-[10px] font-medium text-[#888888] dark:text-[#9b9b9b]">
                    Good Job! 🎉
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF3DE] px-3 py-1 text-[10px] font-black tracking-[0.18em] text-[#3B6D11] uppercase dark:bg-[#1d2d15] dark:text-[#8bd27c]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M3 17l6-6 4 4 8-8" />
                  <path d="M14 7h7v7" />
                </svg>
                {performanceLabel}
              </div>

              <DialogTitle className="text-[18px] leading-tight font-bold text-[#1a1a1a] dark:text-[#f5f5f5]">
                {performanceLabel}
              </DialogTitle>

              <DialogDescription className="text-[12px] leading-[1.35] text-[#888888] dark:text-[#a7a7a7]">
                {bandScore >= 8.5
                  ? 'You’ve reached the top of the scale. Keep it up to stay at '
                  : bandScore >= 7
                    ? 'You scored above average for this test. Keep it up to reach '
                    : bandScore >= 5.5
                      ? 'You’re making solid progress. Keep going to reach '
                      : bandScore >= 4
                        ? 'You’re building the basics. Stay consistent to reach '
                        : 'You’re just getting started. Focus on accuracy to reach '}
                <span className="font-semibold text-[#3B6D11] dark:text-[#8bd27c]">
                  Band {nextTargetBandLabel}
                </span>
                .
              </DialogDescription>

              <div className="rounded-[12px] border border-[#efefef] bg-[#f8f9fa] px-3 py-2.5 dark:border-[#2a2a2a] dark:bg-[#181818]">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#1d2d15] dark:text-[#8bd27c]">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="7" />
                        <path d="M12 9v3l2 2" />
                        <path d="M12 5v2" />
                        <path d="M19 12h-2" />
                        <path d="M7 12H5" />
                      </svg>
                    </span>
                    <div className="min-w-0">
                      <div className="text-[9px] font-black tracking-[0.22em] text-[#888888] uppercase dark:text-[#9b9b9b]">
                        Next target
                      </div>
                      <div className="text-[13px] font-bold text-[#1a1a1a] dark:text-[#f5f5f5]">
                        Band {nextTargetBandLabel}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[18px] leading-none font-black text-[#3B6D11] dark:text-[#8bd27c]">
                      {nextTarget.needed}
                    </div>
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-[#888888] uppercase dark:text-[#9b9b9b]">
                      more correct answers
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-[#f0f0f0] border-b border-[#f0f0f0] bg-[#f0f0f0] sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-[#2a2a2a] dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
            <div className="bg-white px-4 py-3.5 text-center dark:bg-[#141414]">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#1d2d15] dark:text-[#8bd27c]">
                <Check className="h-3.5 w-3.5" />
              </div>
              <div className="mt-2.5 text-[24px] leading-none font-black text-[#1a1a1a] dark:text-[#f5f5f5]">
                {score} / {totalQuestions}
              </div>
              <div className="mt-1.5 text-[13px] font-semibold text-[#3B6D11] dark:text-[#8bd27c]">
                Correct answers
              </div>
            </div>

            <div className="bg-white px-4 py-3.5 text-center dark:bg-[#141414]">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#FDECEA] text-[#c0392b] dark:bg-[#2a1717] dark:text-[#ff8c84]">
                <X className="h-3.5 w-3.5" />
              </div>
              <div className="mt-2.5 text-[24px] leading-none font-black text-[#1a1a1a] dark:text-[#f5f5f5]">
                {incorrectAnswerCount}
              </div>
              <div className="mt-1.5 text-[13px] font-semibold text-[#c0392b] dark:text-[#ff8c84]">
                Incorrect answers
              </div>
            </div>

            <div className="bg-white px-4 py-3.5 text-center dark:bg-[#141414]">
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#E6F1FB] text-[#185FA5] dark:bg-[#122033] dark:text-[#7cb4f5]">
                <Clock className="h-3.5 w-3.5" />
              </div>
              <div className="mt-2.5 text-[24px] leading-none font-black text-[#1a1a1a] dark:text-[#f5f5f5]">
                {timeUsedMinutes} min
              </div>
              <div className="mt-1.5 text-[13px] font-semibold text-[#185FA5] dark:text-[#7cb4f5]">
                Time used
              </div>
            </div>
          </div>

          <DialogFooter className="!block space-y-3.5 px-4 pt-3.5 pb-4">
            <button
              type="button"
              onClick={handleCloseScoreModal}
              className="inline-flex w-full items-center justify-between rounded-[12px] bg-[#1a1a1a] px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#111111] active:translate-y-0 dark:bg-[#f5f5f5] dark:text-[#111111] dark:hover:bg-[#eaeaea]"
            >
              <span className="inline-flex items-center gap-2">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <path d="M8 8h8" />
                  <path d="M8 12h8" />
                  <path d="M8 16h5" />
                </svg>
                <span>Review all answers</span>
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleRetryTest}
                className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#efefef] bg-white px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9d9d9] hover:bg-[#fafafa] active:translate-y-0 dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-[#f5f5f5] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1a1a1a]"
              >
                <span className="inline-flex h-4 w-4 items-center justify-center text-[#888888]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M3 12a9 9 0 1 0 3-6.7" />
                    <path d="M3 5v5h5" />
                  </svg>
                </span>
                Retry test
              </button>

              <button
                type="button"
                onClick={handleGoToTests}
                className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#efefef] bg-white px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9d9d9] hover:bg-[#fafafa] active:translate-y-0 dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-[#f5f5f5] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1a1a1a]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-[#888888]"
                  aria-hidden="true"
                >
                  <rect x="4" y="4" width="6" height="6" rx="1.5" />
                  <rect x="14" y="4" width="6" height="6" rx="1.5" />
                  <rect x="4" y="14" width="6" height="6" rx="1.5" />
                  <rect x="14" y="14" width="6" height="6" rx="1.5" />
                </svg>
                All tests
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 pt-0.5 text-[11px] text-[#888888] dark:text-[#9b9b9b]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#1d2d15] dark:text-[#8bd27c]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3"
                  aria-hidden="true"
                >
                  <path d="M20 11.5v1a8.5 8.5 0 1 1-5.05-7.77" />
                  <path d="m20 5-8.5 8.5L9 10" />
                </svg>
              </span>
              <span>Your results are saved automatically and securely</span>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

    if (isListening) {
      return (
        <>
          <PageHeader
            title={test.title}
            description={`${totalQuestions} questions · ${formatTime(timeLeft)} remaining`}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'text-foreground border-border/70 bg-background/80 rounded-full border px-3 py-1 text-[11px] font-black tracking-[0.18em] uppercase backdrop-blur-sm',
                  isSubmitted
                    ? 'border-green-500/30 bg-green-500/5 text-green-600'
                    : '',
                )}
              >
                {isSubmitted ? `Band ${bandScore}` : formatTime(timeLeft)}
              </div>

              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black tracking-[0.18em] uppercase transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Submit test
                </button>
              ) : null}
            </div>
          </PageHeader>

          <PageBody className="relative overflow-hidden">
            <div className="mx-auto w-full max-w-[1800px] px-4 pb-12 sm:px-6 lg:px-8">
              <div className="grid gap-6 lg:h-[calc(100vh-8.5rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <section className="border-border/60 bg-background/80 min-h-0 overflow-hidden rounded-[28px] border shadow-sm">
                  <div className="flex h-full min-h-0 flex-col">
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
                      {listeningAudio.length > 0 ? (
                        <section className="border-border/60 bg-background/80 space-y-3 rounded-3xl border p-5 shadow-sm">
                          <div className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">
                            Audio
                          </div>
                          <div className="space-y-3">
                            {listeningAudio.map((audio, index) => (
                              <audio
                                key={`${(audio as any)?.url ?? audio}-${index}`}
                                controls
                                className="w-full"
                                src={String((audio as any)?.url ?? audio)}
                              />
                            ))}
                          </div>
                        </section>
                      ) : null}

                      {listeningImages.length > 0 ? (
                        <section className="space-y-3">
                          <div className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">
                            Diagram
                          </div>

                          <div className="grid gap-4">
                            {listeningImages.map((image, index) => (
                              <div
                                key={`${image?.url ?? image}-${index}`}
                                className="border-border/60 bg-background/80 overflow-hidden rounded-3xl border shadow-sm"
                              >
                                <img
                                  src={String((image as any)?.url ?? image)}
                                  alt={
                                    (image as any)?.alt ??
                                    `Listening image ${index + 1}`
                                  }
                                  className="h-[340px] w-full object-contain sm:h-[380px]"
                                />
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : null}
                    </div>
                  </div>
                </section>

                <section className="border-border/60 bg-background/80 min-h-0 overflow-hidden rounded-[28px] border shadow-sm">
                  <div className="flex h-full min-h-0 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                      <div className="space-y-8">
                        {displayQuestionGroups.map((group, groupIdx) =>
                          renderQuestionGroup(group, groupIdx),
                        )}
                      </div>

                      <div className="border-border/60 bg-background/80 mt-8 rounded-3xl border p-6 shadow-sm">
                        {!isSubmitted ? (
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">
                                  Ready to submit
                                </div>
                                <p className="text-muted-foreground mt-1 text-sm">
                                  {isAllAnswered
                                    ? 'All questions are answered. You can submit anytime.'
                                    : 'You can submit early or continue working until time runs out.'}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={handleSubmitTest}
                                className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 rounded-full px-5 py-3 text-[11px] font-black tracking-[0.18em] uppercase transition-all hover:scale-[1.01] active:scale-[0.99]"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                Submit test
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Link
                              href="/home"
                              className="border-border/70 text-foreground hover:border-foreground/20 hover:bg-background/70 inline-flex w-full items-center justify-center gap-2 rounded-2xl border bg-transparent px-4 py-3 text-[11px] font-black tracking-[0.18em] uppercase transition-all duration-300 hover:-translate-y-0.5 dark:hover:bg-white/[0.05]"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                              Back to tests
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {scoreDialog}
          </PageBody>
        </>
      );
    }

    if (useSplitReadingLayout) {
      return (
        <>
          <PageHeader
            title={test.title}
            description={`${totalQuestions} questions · ${formatTime(timeLeft)} remaining`}
          >
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'text-foreground border-border/70 bg-background/80 rounded-full border px-3 py-1 text-[11px] font-black tracking-[0.18em] uppercase backdrop-blur-sm',
                  isSubmitted
                    ? 'border-green-500/30 bg-green-500/5 text-green-600'
                    : '',
                )}
              >
                {isSubmitted ? `Band ${bandScore}` : formatTime(timeLeft)}
              </div>

              {!isSubmitted ? (
                <button
                  type="button"
                  onClick={handleSubmitTest}
                  className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black tracking-[0.18em] uppercase transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  Submit test
                </button>
              ) : null}
            </div>
          </PageHeader>

          <PageBody className="relative overflow-hidden">
            <div className="mx-auto w-full max-w-[1800px] px-4 pb-12 sm:px-6 lg:px-8">
              <div className="grid gap-6 lg:h-[calc(100vh-8.5rem)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <section className="border-border/60 bg-background/70 min-h-0 overflow-hidden rounded-[28px] border shadow-sm">
                  <div className="flex h-full min-h-0 flex-col">
                    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
                      {readingPassages.map(({ passage, passageNumber }) => (
                        <article
                          key={`${passage.heading ?? 'passage'}-${passageNumber}`}
                          className="border-border/60 bg-background/75 hover:border-foreground/15 hover:bg-background/90 space-y-4 rounded-[26px] border p-6 shadow-sm transition-colors"
                        >
                          <div className="text-muted-foreground text-[11px] font-black tracking-[0.24em] uppercase">
                            Reading Passage {passageNumber}
                          </div>

                          {passage.heading ? (
                            <h3 className="text-foreground text-lg font-semibold tracking-tight">
                              {passage.heading}
                            </h3>
                          ) : null}

                          {passage.instruction ? (
                            <div className="text-muted-foreground text-sm leading-7">
                              {renderInstructionText(passage.instruction)}
                            </div>
                          ) : null}

                          {passage.text ? (
                            <div className="text-foreground/90 space-y-3 text-sm leading-7">
                              {passage.text
                                .split(/\n+/)
                                .map((line, lineIdx) => (
                                  <p
                                    key={`${passageNumber}-${lineIdx}-${line}`}
                                    className="whitespace-pre-wrap"
                                  >
                                    {line}
                                  </p>
                                ))}
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="border-border/60 bg-background/80 min-h-0 overflow-hidden rounded-[28px] border shadow-sm">
                  <div className="flex h-full min-h-0 flex-col">
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                      <div className="space-y-8">
                        {displayQuestionGroups.map((group, groupIdx) =>
                          renderQuestionGroup(group, groupIdx),
                        )}
                      </div>

                      <div className="border-border/60 bg-background/80 mt-8 rounded-3xl border p-6 shadow-sm">
                        {!isSubmitted ? (
                          <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div>
                                <div className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">
                                  Ready to submit
                                </div>
                                <p className="text-muted-foreground mt-1 text-sm">
                                  {isAllAnswered
                                    ? 'All questions are answered. You can submit anytime.'
                                    : 'You can submit early or continue working until time runs out.'}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={handleSubmitTest}
                                className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 rounded-full px-5 py-3 text-[11px] font-black tracking-[0.18em] uppercase transition-all hover:scale-[1.01] active:scale-[0.99]"
                              >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                Submit test
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Link
                              href="/home"
                              className="border-border/70 text-foreground hover:border-foreground/20 hover:bg-background/70 inline-flex w-full items-center justify-center gap-2 rounded-2xl border bg-transparent px-4 py-3 text-[11px] font-black tracking-[0.18em] uppercase transition-all duration-300 hover:-translate-y-0.5 dark:hover:bg-white/[0.05]"
                            >
                              <ChevronLeft className="h-3.5 w-3.5" />
                              Back to tests
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {scoreDialog}
          </PageBody>
        </>
      );
    }

    return (
      <>
        <PageHeader
          title={test.title}
          description={`${totalQuestions} questions · ${formatTime(timeLeft)} remaining`}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'text-foreground border-border/70 bg-background/80 rounded-full border px-3 py-1 text-[11px] font-black tracking-[0.18em] uppercase backdrop-blur-sm',
                isSubmitted
                  ? 'border-green-500/30 bg-green-500/5 text-green-600'
                  : '',
              )}
            >
              {isSubmitted ? `Band ${bandScore}` : formatTime(timeLeft)}
            </div>

            {!isSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitTest}
                className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black tracking-[0.18em] uppercase transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                Submit test
              </button>
            ) : null}
          </div>
        </PageHeader>

        <PageBody className="relative overflow-hidden">
          <div className="mx-auto w-full max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="space-y-8">
              {isListening && listeningImages.length > 0 ? (
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {listeningImages.map((image, index) => (
                    <div
                      key={`${image?.url ?? image}-${index}`}
                      className="border-border/60 bg-background/80 overflow-hidden rounded-3xl border shadow-sm"
                    >
                      <img
                        src={String((image as any)?.url ?? image)}
                        alt={
                          (image as any)?.alt ?? `Listening image ${index + 1}`
                        }
                        className="h-48 w-full object-cover"
                      />
                    </div>
                  ))}
                </section>
              ) : null}

              {isListening && listeningAudio.length > 0 ? (
                <section className="border-border/60 bg-background/80 space-y-3 rounded-3xl border p-5 shadow-sm">
                  <div className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">
                    Audio
                  </div>
                  <div className="space-y-3">
                    {listeningAudio.map((audio, index) => (
                      <audio
                        key={`${(audio as any)?.url ?? audio}-${index}`}
                        controls
                        className="w-full"
                        src={String((audio as any)?.url ?? audio)}
                      />
                    ))}
                  </div>
                </section>
              ) : null}

              {readingSections.length > 0 ? (
                <section className="space-y-5">
                  {readingSections.map((section, sectionIdx) => (
                    <div
                      key={`${section.section ?? 'section'}-${sectionIdx}`}
                      className="border-border/60 bg-background/80 space-y-4 rounded-3xl border p-6 shadow-sm"
                    >
                      {section.section ? (
                        <div className="text-muted-foreground text-[11px] font-black tracking-[0.24em] uppercase">
                          {section.section}
                        </div>
                      ) : null}

                      <div className="space-y-4">
                        {(section.passages ?? []).map((passage, passageIdx) => (
                          <article
                            key={`${passage.heading ?? 'passage'}-${passageIdx}`}
                            className="border-border/60 bg-background/70 hover:border-foreground/15 hover:bg-background/90 space-y-3 rounded-2xl border p-5 transition-colors"
                          >
                            {passage.heading ? (
                              <h3 className="text-foreground text-base font-semibold tracking-tight">
                                {passage.heading}
                              </h3>
                            ) : null}

                            {passage.instruction ? (
                              <div className="text-muted-foreground text-sm leading-7">
                                {renderInstructionText(passage.instruction)}
                              </div>
                            ) : null}

                            {passage.text ? (
                              <div className="text-foreground/90 space-y-2 text-sm leading-7">
                                {passage.text
                                  .split(/\n+/)
                                  .map((line, lineIdx) => (
                                    <p
                                      key={`${lineIdx}-${line}`}
                                      className="whitespace-pre-wrap"
                                    >
                                      {line}
                                    </p>
                                  ))}
                              </div>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>
              ) : null}

              <div className="space-y-8">
                {displayQuestionGroups.map((group, groupIdx) =>
                  renderQuestionGroup(group, groupIdx),
                )}
              </div>

              <div className="border-border/60 bg-background/80 rounded-3xl border p-6 shadow-sm">
                {!isSubmitted ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">
                          Ready to submit
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {isAllAnswered
                            ? 'All questions are answered. You can submit anytime.'
                            : 'You can submit early or continue working until time runs out.'}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmitTest}
                        className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center gap-2 rounded-full px-5 py-3 text-[11px] font-black tracking-[0.18em] uppercase transition-all hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Submit test
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link
                      href="/home"
                      className="border-border/70 text-foreground hover:border-foreground/20 hover:bg-background/70 inline-flex w-full items-center justify-center gap-2 rounded-2xl border bg-transparent px-4 py-3 text-[11px] font-black tracking-[0.18em] uppercase transition-all duration-300 hover:-translate-y-0.5 dark:hover:bg-white/[0.05]"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Back to tests
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {scoreDialog}
          </div>
        </PageBody>
      </>
    );
  };

  return isStarted ? renderExamScreen() : renderStartScreen();
}
