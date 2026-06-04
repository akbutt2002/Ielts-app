'use client';

import type { Dispatch, ReactNode, SetStateAction } from 'react';

import { cn } from '@kit/ui/utils';

import {
  getChoiceComparisonValue,
  getChoiceComparisonValues,
  parsePairedChoiceSelection,
} from '../utils/answer-matcher';
import {
  compactPromptLines,
  stripLeadingBulletMarker,
  stripQuestionNumberPrefix,
} from '../utils/question-parser';

type QuestionRowProps = {
  qNum: number;
  prompt: string;
  choices: string[];
  showPrompt?: boolean;
  pairedQuestionNumbers?: number[];
  hideQuestionNumber?: boolean;
  answerLookup: Map<number, string>;
  userAnswers: Record<number, string>;
  isSubmitted: boolean;
  isTestLocked: boolean;
  setUserAnswers: Dispatch<SetStateAction<Record<number, string>>>;
  renderAnswerStatusIcon: (isCorrect: boolean) => ReactNode;
};

export function QuestionRow({
  qNum,
  prompt,
  choices,
  showPrompt = true,
  pairedQuestionNumbers = [],
  hideQuestionNumber = false,
  answerLookup,
  userAnswers,
  isSubmitted,
  isTestLocked,
  setUserAnswers,
  renderAnswerStatusIcon,
}: QuestionRowProps) {
  const isPairedChoiceRow =
    pairedQuestionNumbers.length === 2 && choices.length > 0;
  const correctAnswer = isPairedChoiceRow
    ? pairedQuestionNumbers
        .map((questionNumber) => answerLookup.get(questionNumber) ?? '')
        .map((answer) => getChoiceComparisonValue(answer))
        .filter(Boolean)
        .join(' / ')
    : answerLookup.get(qNum) ?? '';
  const userAnswer = userAnswers[qNum] ?? '';
  const normalizedPrompt = compactPromptLines(
    stripQuestionNumberPrefix(stripLeadingBulletMarker(prompt), qNum),
  );
  const hasBlank = showPrompt && /__+/.test(normalizedPrompt);
  const hasChoices = choices.length > 0;
  const shouldRenderBlankInput = hasBlank;
  const selectedChoices = isPairedChoiceRow
    ? parsePairedChoiceSelection(userAnswer)
    : [];
  const correctChoiceValues = isPairedChoiceRow
    ? Array.from(
        new Set(
          pairedQuestionNumbers
            .map((questionNumber) => {
              const answer = answerLookup.get(questionNumber) ?? '';
              return getChoiceComparisonValue(answer);
            })
            .filter(Boolean),
        ),
      )
    : getChoiceComparisonValues(correctAnswer);
  const promptWithoutBlanks = compactPromptLines(
    normalizedPrompt
      .replace(/__+/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim(),
  );
  const isCorrect = isPairedChoiceRow
    ? isSubmitted &&
      selectedChoices.length > 0 &&
      selectedChoices.every((choice) => correctChoiceValues.includes(choice))
    : isSubmitted &&
      correctChoiceValues.includes(getChoiceComparisonValue(userAnswer));
  const normalizedUserAnswer = getChoiceComparisonValue(userAnswer);

  return (
    <div key={qNum} className="group relative space-y-3 pl-10">
      {!hideQuestionNumber ? (
        <div className="bg-foreground text-background absolute top-0 left-0 flex h-6 w-6 items-center justify-center rounded-lg text-[10px] font-black shadow-md transition-transform group-hover:scale-110">
          {qNum}
        </div>
      ) : null}

      <div className="flex items-start gap-2">
        {isSubmitted ? (
          <div className="shrink-0 pt-0.5">
            {renderAnswerStatusIcon(isCorrect)}
          </div>
        ) : null}

        <div className="min-w-0 flex-1 space-y-3">
          {showPrompt && (normalizedPrompt || promptWithoutBlanks) ? (
            shouldRenderBlankInput ? (
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
            ) : (
              <p className="text-foreground text-sm leading-relaxed font-bold tracking-tight whitespace-pre-wrap">
                {hasChoices ? promptWithoutBlanks : normalizedPrompt}
              </p>
            )
          ) : null}

          {hasChoices && !hasBlank ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {choices.map((choice) => {
                const normalizedChoice = getChoiceComparisonValue(choice);
                const isSelected = isPairedChoiceRow
                  ? selectedChoices.includes(normalizedChoice)
                  : normalizedUserAnswer === normalizedChoice;
                const isChoiceCorrect =
                  correctChoiceValues.includes(normalizedChoice);
                const isWrongSelection =
                  isSubmitted && isSelected && !isChoiceCorrect;

                return (
                  <button
                    key={`${qNum}-${choice}`}
                    type="button"
                    disabled={isTestLocked}
                    onClick={() =>
                      !isTestLocked &&
                      setUserAnswers((previous) => {
                        if (!isPairedChoiceRow) {
                          return {
                            ...previous,
                            [qNum]: normalizedChoice,
                          };
                        }

                        const normalizedSelectedChoices = selectedChoices.slice();
                        const selectedIndex =
                          normalizedSelectedChoices.indexOf(normalizedChoice);

                        if (selectedIndex >= 0) {
                          normalizedSelectedChoices.splice(selectedIndex, 1);
                        } else if (normalizedSelectedChoices.length < 2) {
                          normalizedSelectedChoices.push(normalizedChoice);
                        }

                        return {
                          ...previous,
                          [qNum]: normalizedSelectedChoices.join('|'),
                        };
                      })
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
}
