'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';

import { BookOpen } from 'lucide-react';

import { cn } from '@kit/ui/utils';

import { answerMatches } from '../utils/answer-matcher';
import {
  boxRangePattern,
  formatInstructionLines,
  getInstructionLineStyle,
  normalizeInstructionFragment,
  questionRangePattern,
} from '../utils/instruction-formatter';
import {
  compactPromptLines,
  formatQuestionRangeLabel,
  getBlockDisplayHeader,
  isFlowchartStructuredBlock,
  parseStructuredFlowchartBlock,
  parseStructuredNoteBlock,
  parseStructuredSummaryBlock,
  stripQuestionNumberPrefix,
} from '../utils/question-parser';
import { QuestionRow } from './QuestionRow';

type QuestionItem = {
  qNum: number;
  prompt: string;
  choices?: string[];
  pairedQuestionNumbers?: number[];
};

type QuestionBlockLike = {
  header: string;
  questionNumbers: number[];
  instructions: string;
  contentHeading?: string;
  items: QuestionItem[];
  choices?: string[];
};

export type InstructionRenderDeps = {
  answerLookup: Map<number, string>;
  userAnswers: Record<number, string>;
  isSubmitted: boolean;
  isTestLocked: boolean;
  setUserAnswers: Dispatch<SetStateAction<Record<number, string>>>;
  renderAnswerStatusIcon: (isCorrect: boolean) => ReactNode;
  testTitle?: string;
};

function renderInstructionLine(line: string) {
  const highlightPattern =
    /(Questions?\s+\d+(?:(?:\s*(?:to|-)\s*|\s+and\s+)\d+)?|boxes?\s+\d+(?:\s*(?:to|-)\s*\d+)?|\bONE WORD(?: AND\/OR A NUMBER)?\b|\bNOT GIVEN\b|\bTRUE\b|\bFALSE\b|\bYES\b|\bNO\b|\bTWO\b|\bSIX\b|\b[A-Z](?:\s*-\s*[A-Z])\b|\b[ivxlcdm]+(?:\s*-\s*[ivxlcdm]+)\b|\b[A-Z]\b(?:\s*,\s*\b[A-Z]\b)*(?:\s+or\s+\b[A-Z]\b))/gi;

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
        /^[A-Z](?:\s*-\s*[A-Z])$/i.test(normalizedPart) ||
        /^[ivxlcdm]+(?:\s*-\s*[ivxlcdm]+)$/i.test(normalizedPart) ||
        /^\b[A-Z]\b(?:\s*,\s*\b[A-Z]\b)*(?:\s+or\s+\b[A-Z]\b)$/i.test(
          normalizedPart,
        ));

    return (
      <span
        key={`${normalizedPart}-${index}`}
        className={isHighlighted ? 'text-foreground font-semibold' : undefined}
      >
        {part}
      </span>
    );
  });
}

function renderPeopleListLine(line: string) {
  const peopleMatch = line.match(/^([A-Z])(?:[.)])?\s+(.+)$/);

  if (!peopleMatch?.[1] || !peopleMatch[2]) {
    return renderInstructionLine(line);
  }

  const [, letter, remainder] = peopleMatch;

  return (
    <>
      <strong className="text-foreground font-bold">{letter}</strong> {''}
      <span>{remainder}</span>
    </>
  );
}

function renderOpinionListLine(line: string) {
  const opinionMatch = line.match(/^([A-Z])(?:[.)])?\s+(.+)$/);

  if (!opinionMatch?.[1] || !opinionMatch[2]) {
    return renderInstructionLine(line);
  }

  const [, letter, remainder] = opinionMatch;

  return (
    <>
      <strong className="text-foreground font-bold">{letter}</strong> {''}
      <span>{remainder}</span>
    </>
  );
}

function renderMaryamMirzakhaniPhraseTable() {
  const rows = [
    [
      { letter: 'A', text: 'appeal' },
      { letter: 'B', text: 'determined' },
      { letter: 'C', text: 'intrigued' },
    ],
    [
      { letter: 'D', text: 'single' },
      { letter: 'E', text: 'achievement' },
      { letter: 'F', text: 'devoted' },
    ],
    [
      { letter: 'G', text: 'involved' },
      { letter: 'H', text: 'unique' },
      { letter: 'I', text: 'innovative' },
    ],
    [
      { letter: 'J', text: 'satisfaction' },
      { letter: 'K', text: 'intent' },
      null,
    ],
  ];

  return (
    <div className="border-border/70 mt-7 overflow-hidden rounded-2xl border bg-white/40 shadow-sm dark:bg-white/[0.03]">
      {rows.map((row, rowIdx) => (
        <div
          key={`maryam-phrase-row-${rowIdx}`}
          className={cn(
            'grid grid-cols-3',
            rowIdx < rows.length - 1 && 'border-border/70 border-b',
          )}
        >
          {row.map((cell, cellIdx) => (
            <div
              key={`maryam-phrase-cell-${rowIdx}-${cellIdx}`}
              className={cn(
                'text-foreground flex min-h-20 items-center justify-center px-4 py-5 text-center text-[15px] leading-7',
                cellIdx < row.length - 1 && 'border-border/70 border-r',
              )}
            >
              {cell ? (
                <span>
                  <strong className="font-bold">{cell.letter}</strong>{' '}
                  {cell.text}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function renderAcademic17Test2PhraseTable() {
  const rows = [
    [
      { letter: 'A', text: 'invention' },
      { letter: 'B', text: 'goals' },
      { letter: 'C', text: 'compromise' },
    ],
    [
      { letter: 'D', text: 'mistakes' },
      { letter: 'E', text: 'luck' },
      { letter: 'F', text: 'inspiration' },
    ],
    [{ letter: 'G', text: 'experiments' }, null, null],
  ];

  return (
    <div className="border-border/70 mt-7 overflow-hidden rounded-2xl border bg-white/40 shadow-sm dark:bg-white/[0.03]">
      {rows.map((row, rowIdx) => (
        <div
          key={`acad17t2-phrase-row-${rowIdx}`}
          className={cn(
            'grid grid-cols-3',
            rowIdx < rows.length - 1 && 'border-border/70 border-b',
          )}
        >
          {row.map((cell, cellIdx) => (
            <div
              key={`acad17t2-phrase-cell-${rowIdx}-${cellIdx}`}
              className={cn(
                'text-foreground flex min-h-20 items-center justify-center px-4 py-5 text-center text-[15px] leading-7',
                cellIdx < row.length - 1 && 'border-border/70 border-r',
              )}
            >
              {cell ? (
                <span>
                  <strong className="font-bold">{cell.letter}</strong>{' '}
                  {cell.text}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function renderAcademic17Test3PhraseTable() {
  const rows = [
    [
      { letter: 'A', text: 'development plans' },
      { letter: 'B', text: 'deep excavations' },
    ],
    [
      { letter: 'C', text: 'great distance' },
      { letter: 'D', text: 'excessive expense' },
    ],
    [
      { letter: 'E', text: 'impossible tasks' },
      { letter: 'F', text: 'associated risks' },
    ],
    [
      { letter: 'G', text: 'water level' },
      { letter: 'H', text: 'specific areas' },
    ],
    [
      { letter: 'I', text: 'total expenditure' },
      { letter: 'J', text: 'construction guidelines' },
    ],
  ];

  return (
    <div className="border-border/70 mt-7 overflow-hidden rounded-2xl border bg-white/40 shadow-sm dark:bg-white/[0.03]">
      {rows.map((row, rowIdx) => (
        <div
          key={`acad17t3-phrase-row-${rowIdx}`}
          className={cn(
            'grid grid-cols-2',
            rowIdx < rows.length - 1 && 'border-border/70 border-b',
          )}
        >
          {row.map((cell, cellIdx) => (
            <div
              key={`acad17t3-phrase-cell-${rowIdx}-${cellIdx}`}
              className={cn(
                'text-foreground flex min-h-16 items-center justify-start px-8 py-4 text-left text-[15px] leading-7',
                cellIdx < row.length - 1 && 'border-border/70 border-r',
              )}
            >
              {cell ? (
                <span>
                  <strong className="font-bold">{cell.letter}</strong>{' '}
                  <span className="ml-2">{cell.text}</span>
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function renderCharlesIIPhraseTable() {
  const rows = [
    [
      { letter: 'A', text: 'military innovation' },
      { letter: 'F', text: 'decisive victory' },
    ],
    [
      { letter: 'B', text: 'large reward' },
      { letter: 'G', text: 'political debate' },
    ],
    [
      { letter: 'C', text: 'widespread conspiracy' },
      { letter: 'H', text: 'strategic alliance' },
    ],
    [
      { letter: 'D', text: 'relative safety' },
      { letter: 'I', text: 'popular solution' },
    ],
    [
      { letter: 'E', text: 'new government' },
      { letter: 'J', text: 'religious conviction' },
    ],
  ];

  return (
    <div className="border-border/70 mt-7 overflow-hidden rounded-2xl border bg-white/40 shadow-sm dark:bg-white/[0.03]">
      {rows.map((row, rowIdx) => (
        <div
          key={`charles-phrase-row-${rowIdx}`}
          className={cn(
            'grid grid-cols-2',
            rowIdx < rows.length - 1 && 'border-border/70 border-b',
          )}
        >
          {row.map((cell, cellIdx) => (
            <div
              key={`charles-phrase-cell-${rowIdx}-${cellIdx}`}
              className={cn(
                'text-foreground flex min-h-16 items-center justify-start px-8 py-4 text-left text-[15px] leading-7',
                cellIdx < row.length - 1 && 'border-border/70 border-r',
              )}
            >
              {cell ? (
                <span>
                  <strong className="font-bold">{cell.letter}</strong>{' '}
                  <span className="ml-2">{cell.text}</span>
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function renderInstructionText(text: string) {
  const lines = formatInstructionLines(text);

  let inOpinionsBlock = false;

  return (
    <div className="space-y-1.5">
      {lines.map((line, index) => {
        const style = getInstructionLineStyle(line);
        const isPeopleListLine = /^[A-Z](?:[.)])?\s+\S/.test(line);
        const isOpinionsHeading = /^Opinions$/i.test(line);
        const isOpinionListLine =
          inOpinionsBlock &&
          /^\s*[A-Z](?:[.)])?\s+\S/.test(line) &&
          !isPeopleListLine;

        if (isOpinionsHeading) {
          inOpinionsBlock = true;
        } else if (inOpinionsBlock && !isOpinionListLine) {
          inOpinionsBlock = false;
        }

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
              : isOpinionsHeading
                ? renderInstructionLine(line)
                : isOpinionListLine
                  ? renderOpinionListLine(line)
                  : renderInstructionLine(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInstructionCard({
  block,
  text,
  className = '',
}: {
  block: QuestionBlockLike;
  text: string;
  className?: string;
}) {
  return (
    <div
      className={`group border-border/60 bg-muted/20 relative overflow-hidden rounded-2xl border p-6 shadow-sm ${className}`}
    >
      <div className="bg-foreground absolute top-0 bottom-0 left-0 w-1.5" />

      <div className="mb-6 flex items-center gap-3">
        <div className="border-foreground/10 bg-foreground/5 rounded-lg border p-2">
          <BookOpen className="text-foreground h-4 w-4" />
        </div>

        <h3 className="text-foreground text-[11px] font-black tracking-[0.2em] uppercase">
          {getBlockDisplayHeader(block as any)}
        </h3>
      </div>

      {renderInstructionText(text)}
    </div>
  );
}

function renderInlineNoteText(
  text: string,
  deps: InstructionRenderDeps,
  renderInlinePrompt?: (prompt: string, qNum: number) => ReactNode,
) {
  const parts = text.split(/(\[\[Q\d+\]\])/);

  return parts.map((part, index) => {
    const tokenMatch = part.match(/^\[\[Q(\d+)\]\]$/);

    if (!tokenMatch) {
      return <span key={`${part}-${index}`}>{part}</span>;
    }

    const qNum = Number(tokenMatch[1]);
    const correctAnswer = deps.answerLookup.get(qNum) ?? '';
    const userAnswer = deps.userAnswers[qNum] ?? '';
    const isCorrect =
      deps.isSubmitted && answerMatches(userAnswer, correctAnswer);

    return (
      <span
        key={`${qNum}-${index}`}
        className="mx-1 inline-flex items-center gap-2 align-middle"
      >
        <span className="text-foreground text-sm font-bold">{qNum}</span>
        {deps.isSubmitted ? deps.renderAnswerStatusIcon(isCorrect) : null}
        <input
          type="text"
          placeholder=""
          className={`border-border/80 bg-muted/25 text-foreground focus:border-foreground/40 focus:ring-foreground/10 h-9 w-20 rounded-md border px-2.5 text-[13px] font-semibold shadow-sm transition-all outline-none focus:ring-2 ${
            deps.isSubmitted
              ? isCorrect
                ? 'border-green-500 border-b-green-500 bg-green-500/10'
                : 'border-destructive border-b-destructive bg-destructive/10'
              : ''
          }`}
          value={userAnswer}
          disabled={deps.isTestLocked}
          onChange={(event) =>
            deps.setUserAnswers((previous) => ({
              ...previous,
              [qNum]: event.target.value,
            }))
          }
        />
      </span>
    );
  });
}

export function renderStructuredNoteBlock(
  block: QuestionBlockLike,
  blockIdx: number,
  deps: InstructionRenderDeps,
) {
  const parsedNoteBlock = parseStructuredNoteBlock(block as any);

  if (!parsedNoteBlock) {
    return null;
  }

  const isFlowchartBlock = isFlowchartStructuredBlock(block as any);
  const parsedFlowchartBlock = isFlowchartBlock
    ? parseStructuredFlowchartBlock(block as any)
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
                    {renderInlineNoteText(line, deps)}
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
                {renderInlineNoteText(line, deps)}
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
                      {renderInlineNoteText(item, deps)}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {deps.isSubmitted && (
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
                      {deps.answerLookup.get(qNum) || '-'}
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
}

export function renderStructuredSummaryBlock(
  block: QuestionBlockLike,
  blockIdx: number,
  deps: InstructionRenderDeps,
) {
  const parsedSummaryBlock = parseStructuredSummaryBlock(block as any);

  if (!parsedSummaryBlock) {
    return null;
  }

  const shouldShowMaryamMirzakhaniPhraseTable =
    /^Maryam Mirzakhani$/i.test(parsedSummaryBlock.title.trim()) &&
    block.questionNumbers.includes(27);

  const shouldShowCharlesIIPhraseTable =
    /^The story behind the hunt for Charles II$/i.test(
      parsedSummaryBlock.title.trim(),
    ) && block.questionNumbers.includes(27);

  const shouldShowAcademic17Test2PhraseTable =
    /Cambridge 17 IELTS Academic Reading Test 2/i.test(deps.testTitle ?? '') &&
    block.questionNumbers.includes(37);

  const shouldShowAcademic17Test3PhraseTable =
    /Cambridge 17 IELTS Academic Reading Test 3/i.test(deps.testTitle ?? '') &&
    block.questionNumbers.includes(36);

  const summaryText = shouldShowMaryamMirzakhaniPhraseTable
    ? parsedSummaryBlock.summaryText
        .replace(
          /\s*A\s+appeal\s+B\s+determined\s+C\s+intrigued\s+D\s+single\s+E\s+achievement\s+F\s+devoted\s+G\s+involved\s+H\s+unique\s+I\s+innovative\s+J\s+satisfaction\s+K\s+intent\s*$/i,
          '',
        )
        .trim()
    : shouldShowAcademic17Test2PhraseTable
      ? parsedSummaryBlock.summaryText
          .replace(
            /\s*A\s+invention\s+B\s+goals\s+C\s+compromise\s+D\s+mistakes\s+E\s+luck\s+F\s+inspiration\s+G\s+experiments\s*$/i,
            '',
          )
          .trim()
      : shouldShowAcademic17Test3PhraseTable
        ? parsedSummaryBlock.summaryText
            .replace(
              /\s*A\s+development\s+plans\s+B\s+deep\s+excavations\s+C\s+great\s+distance\s+D\s+excessive\s+expense\s+E\s+impossible\s+tasks\s+F\s+associated\s+risks\s+G\s+water\s+level\s+H\s+specific\s+areas\s+I\s+total\s+expenditure\s+J\s+construction\s+guidelines\s*$/i,
              '',
            )
            .trim()
        : parsedSummaryBlock.summaryText;

  const charlesIIInstructionText = shouldShowCharlesIIPhraseTable
    ? parsedSummaryBlock.instructionText
        .split('\n')
        .filter((line) => {
          const trimmed = line.trim();
          return (
            !trimmed.startsWith('A ') &&
            !trimmed.startsWith('B ') &&
            !trimmed.startsWith('C ') &&
            !trimmed.startsWith('D ') &&
            !trimmed.startsWith('E ') &&
            !trimmed.startsWith('F ') &&
            !trimmed.startsWith('G ') &&
            !trimmed.startsWith('H ') &&
            !trimmed.startsWith('I ') &&
            !trimmed.startsWith('J ')
          );
        })
        .join('\n')
    : parsedSummaryBlock.instructionText;

  return (
    <div key={blockIdx} className="space-y-8">
      {renderInstructionCard({
        block,
        text: shouldShowCharlesIIPhraseTable
          ? charlesIIInstructionText
          : parsedSummaryBlock.instructionText,
      })}

      {shouldShowCharlesIIPhraseTable && renderCharlesIIPhraseTable()}

      <div className="border-border/70 border-t pt-5">
        <div className="max-w-4xl space-y-5">
          <h3 className="text-foreground text-center text-[22px] font-bold tracking-tight">
            {parsedSummaryBlock.title}
          </h3>

          <p className="text-foreground text-[15px] leading-[2.35]">
            {renderInlineNoteText(summaryText, deps)}
          </p>

          {shouldShowMaryamMirzakhaniPhraseTable &&
            renderMaryamMirzakhaniPhraseTable()}

          {shouldShowAcademic17Test2PhraseTable &&
            renderAcademic17Test2PhraseTable()}

          {shouldShowAcademic17Test3PhraseTable &&
            renderAcademic17Test3PhraseTable()}

          {deps.isSubmitted && (
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
                    {deps.answerLookup.get(qNum) || '-'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function renderGeneral17Test1PlacesTable() {
  const rows = [
    [
      { letter: 'A', text: 'Information Desk' },
      { letter: 'E', text: 'Green Channel' },
    ],
    [
      { letter: 'B', text: 'Hotel Reservation Counter' },
      { letter: 'F', text: 'Level Two' },
    ],
    [
      { letter: 'C', text: 'Lost and Found Counter' },
      { letter: 'G', text: 'Reception Desk' },
    ],
    [
      { letter: 'D', text: 'Red Channel' },
      { letter: 'H', text: 'Baggage Claim Belt' },
    ],
  ];

  return (
    <div className="border-border/70 mt-7 overflow-hidden rounded-2xl border bg-white/40 shadow-sm dark:bg-white/[0.03]">
      {rows.map((row, rowIdx) => (
        <div
          key={`gen17t1-places-row-${rowIdx}`}
          className={cn(
            'grid grid-cols-2',
            rowIdx < rows.length - 1 && 'border-border/70 border-b',
          )}
        >
          {row.map((cell, cellIdx) => (
            <div
              key={`gen17t1-places-cell-${rowIdx}-${cellIdx}`}
              className={cn(
                'text-foreground flex min-h-16 items-center justify-start px-8 py-4 text-left text-[15px] leading-7',
                cellIdx < row.length - 1 && 'border-border/70 border-r',
              )}
            >
              {cell ? (
                <span>
                  <strong className="font-bold">{cell.letter}</strong>{' '}
                  <span className="ml-2">{cell.text}</span>
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
