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
};

function renderInstructionLine(line: string) {
  const highlightPattern =
    /(Questions?\s+\d+(?:(?:\s*(?:to|-)\s*|\s+and\s+)\d+)?|boxes?\s+\d+(?:\s*(?:to|-)\s*\d+)?|\bONE WORD(?: AND\/OR A NUMBER)?\b|\bNOT GIVEN\b|\bTRUE\b|\bFALSE\b|\bYES\b|\bNO\b|\bTWO\b|\bSIX\b|\b[A-H](?:\s*-\s*[A-H])\b|\b[ivxlcdm]+(?:\s*-\s*[ivxlcdm]+)\b|\b[A-H]\b(?:\s*,\s*\b[A-H]\b)*(?:\s+or\s+\b[A-H]\b))/gi;

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
        className={isHighlighted ? 'text-foreground font-semibold' : undefined}
      >
        {part}
      </span>
    );
  });
}

function renderPeopleListLine(line: string) {
  const peopleMatch = line.match(/^([A-H])(?:[.)])?\s+(.+)$/);

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
  const opinionMatch = line.match(/^([A-H])(?:[.)])?\s+(.+)$/);

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
export function renderInstructionText(text: string) {
  const lines = formatInstructionLines(text);

  let inOpinionsBlock = false;

  return (
    <div className="space-y-1.5">
      {lines.map((line, index) => {
        const style = getInstructionLineStyle(line);
        const isPeopleListLine = /^[A-H](?:[.)])?\s+\S/.test(line);
        const isOpinionsHeading = /^Opinions$/i.test(line);
        const isOpinionListLine =
          inOpinionsBlock &&
          /^\s*[A-H](?:[.)])?\s+\S/.test(line) &&
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
          parsedFlowchartBlock?.instructionText ?? parsedNoteBlock.instructionText,
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
    block.questionNumbers[0] === 27 &&
    block.questionNumbers[block.questionNumbers.length - 1] === 32;

  const maryamMirzakhaniSummaryText = shouldShowMaryamMirzakhaniPhraseTable
    ? parsedSummaryBlock.summaryText
        .replace(
          /\s*A\s+appeal\s+B\s+determined\s+C\s+intrigued\s+D\s+single\s+E\s+achievement\s+F\s+devoted\s+G\s+involved\s+H\s+unique\s+I\s+innovative\s+J\s+satisfaction\s+K\s+intent\s*$/i,
          '',
        )
        .trim()
    : parsedSummaryBlock.summaryText;

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
            {renderInlineNoteText(maryamMirzakhaniSummaryText, deps)}
          </p>

          {shouldShowMaryamMirzakhaniPhraseTable &&
            renderMaryamMirzakhaniPhraseTable()}

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
