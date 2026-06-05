'use client';

import { cn } from '@kit/ui/utils';

import { normalizeAnswerText } from '../utils/answer-matcher';
import {
  compactPromptLines,
  formatQuestionRangeLabel,
  stripQuestionNumberPrefix,
} from '../utils/question-parser';
import { questionRangePattern } from '../utils/instruction-formatter';
import {
  renderInstructionText,
  renderStructuredNoteBlock,
  renderStructuredSummaryBlock,
} from './instruction-renderers';
import { QuestionRow } from './QuestionRow';

export function QuestionGroup({
  group,
  groupIdx,
  testTitle,
  isListening,
  listeningLeadInQuestion,
  answerLookup,
  userAnswers,
  isSubmitted,
  isTestLocked,
  setUserAnswers,
  renderAnswerStatusIcon,
}: any) {
  const [primaryBlock, ...continuationBlocks] = group;
  const sectionTitlePrompt = primaryBlock?.contentHeading?.trim() ?? '';

  if (!primaryBlock) {
    return null;
  }

  const groupedQuestionNumbers = Array.from(
    new Set(
      [primaryBlock, ...continuationBlocks].flatMap(
        (block: any) => block.questionNumbers ?? [],
      ),
    ),
  ).sort((a, b) => a - b);
  const groupFirstQuestion = groupedQuestionNumbers[0] ?? 0;
  const groupLastQuestion =
    groupedQuestionNumbers[groupedQuestionNumbers.length - 1] ?? 0;

  const shouldShowQuestionBlockTitle = (block: any) => {
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

  const renderDeps = {
    answerLookup,
    userAnswers,
    isSubmitted,
    isTestLocked,
    setUserAnswers,
    renderAnswerStatusIcon,
  };

  const renderedNoteBlock = renderStructuredNoteBlock(
    primaryBlock,
    groupIdx,
    renderDeps,
  );

  if (renderedNoteBlock) {
    return renderedNoteBlock;
  }

  const renderedSummaryBlock = renderStructuredSummaryBlock(
    primaryBlock,
    groupIdx,
    renderDeps,
  );

  if (renderedSummaryBlock) {
    return renderedSummaryBlock;
  }

  const displayBlockTitle = shouldShowQuestionBlockTitle(primaryBlock)
    ? formatQuestionRangeLabel(primaryBlock.questionNumbers)
    : '';
  const listeningPartLabel = isListening
    ? `Part ${Math.min(
        4,
        Math.max(1, Math.ceil((primaryBlock.questionNumbers[0] ?? 1) / 10)),
      )}`
    : '';
  const contentHeading = primaryBlock.contentHeading?.trim() ?? '';
  const isPairedListeningChoiceBlock =
    isListening &&
    primaryBlock.questionNumbers.length === 2 &&
    (primaryBlock.choices?.length ?? 0) > 0;
  const shouldInlinePairedListeningPrompt = isPairedListeningChoiceBlock;
  const shouldInlinePairedReadingChoicePrompt =
    !isListening &&
    primaryBlock.questionNumbers.length === 2 &&
    (primaryBlock.choices?.length ?? 0) > 0 &&
    [20, 22].includes(primaryBlock.questionNumbers[0] ?? 0);
  const displayContentHeading = shouldInlinePairedListeningPrompt
    ? ''
    : /^Which title is the most suitable for the text\?$/i.test(contentHeading)
      ? `Question ${
          primaryBlock.questionNumbers[
            primaryBlock.questionNumbers.length - 1
          ] ??
          primaryBlock.questionNumbers[0] ??
          ''
        }`
      : contentHeading;
  const listeningInstructionText =
    isListening &&
    primaryBlock.questionNumbers.length > 1 &&
    !isPairedListeningChoiceBlock
      ? primaryBlock.instructions
          .split(/\r?\n/)
          .filter((line: string) => {
            const normalizedLine = line.trim();

            if (!normalizedLine) {
              return true;
            }

            const firstQuestionNumber = primaryBlock.items[0]?.qNum ?? 0;

            if (!firstQuestionNumber) {
              return true;
            }

            return !new RegExp(`^${firstQuestionNumber}\\b`).test(
              normalizedLine,
            );
          })
          .join('\n')
      : primaryBlock.instructions;
  const shouldFlattenListeningQuestionRows =
    isListening &&
    primaryBlock.questionNumbers.length > 1 &&
    !isPairedListeningChoiceBlock;
  const pairedInstructionText = shouldInlinePairedListeningPrompt
    ? primaryBlock.instructions
        .split(/\r?\n/)
        .map((line: string) => line.trim())
        .filter(
          (line: string, index: number) =>
            index !== 0 || !questionRangePattern.test(line),
        )
        .join('\n')
    : primaryBlock.instructions;
  const pairedReadingInstructionText =
    shouldInlinePairedReadingChoicePrompt &&
    primaryBlock.items[0]
      ? [
          primaryBlock.instructions,
          compactPromptLines(
            stripQuestionNumberPrefix(
              primaryBlock.items[0]?.prompt ?? '',
              primaryBlock.items[0]?.qNum ?? 0,
            ),
          ),
        ]
          .filter(Boolean)
          .join('\n')
      : primaryBlock.instructions;
  const shouldHideListeningLeadInRow =
    Boolean(listeningLeadInQuestion) &&
    primaryBlock.questionNumbers[0] === 11;
  const shouldRenderListeningLeadInRow =
    Boolean(listeningLeadInQuestion) &&
    primaryBlock.questionNumbers[0] === 12;
  const shouldShowPromptTextWhenBlank =
    !isListening &&
    primaryBlock.questionNumbers[0] === 14 &&
    primaryBlock.questionNumbers.includes(19) &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldShowPromptTextWhenBlankForQuestions15To21 =
    !isListening &&
    primaryBlock.questionNumbers[0] === 15 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      21 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldRenderInlineBlankPromptForQuestions15To21 =
    shouldShowPromptTextWhenBlankForQuestions15To21;
  const shouldRenderInlineBlankPromptForQuestions28To32 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 1/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 28 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      32 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldShowPromptTextWhenBlankForGeneralTest2Questions1To7 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 7;
  const shouldShowPromptTextWhenBlankForGeneralTest2Questions32To35 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 32 &&
    groupLastQuestion === 35;
  const shouldRenderInlineBlankPromptForGeneralTest2Questions21To27 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 21 &&
    groupLastQuestion === 27 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldShowPromptTextWhenBlankForGeneralTest3Questions1To8 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 8;
  const shouldShowPromptTextWhenBlankForGeneralTest3Questions9To14 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 9 &&
    groupLastQuestion === 14;
  const shouldRenderInlineBlankPromptForGeneralTest3Questions22To27 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 22 &&
    groupLastQuestion === 27 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldShowPromptTextWhenBlankForGeneralTest3Questions33To36 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 33 &&
    groupLastQuestion === 36;
  const shouldShowPromptTextWhenBlankForGeneralTest4Questions1To5 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 5;
  const shouldShowPromptTextWhenBlankForGeneralTest4Questions25To27 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 25 &&
    groupLastQuestion === 27;
  const shouldShowPromptTextWhenBlankForGeneralTest4Questions31To36 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 31 &&
    groupLastQuestion === 36;
  const shouldRenderInlineBlankPromptForListeningQuestions16To20 =
    isListening &&
    /Cambridge 19 Listening Test 1/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 16 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      20 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldRenderInlineBlankPromptForListeningQuestions25To30 =
    isListening &&
    /Cambridge 19 Listening Test 1/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 25 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      30 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  return (
    <section
      key={`${primaryBlock.header}-${groupIdx}`}
      className="border-border/60 bg-background/80 space-y-5 rounded-3xl border p-6 shadow-sm"
    >
      <div className="space-y-2">
        {listeningPartLabel ? (
          <div className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">
            {listeningPartLabel}
          </div>
        ) : null}

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
          <div className="border-border/60 bg-muted/20 relative overflow-hidden rounded-2xl border p-4">
            {isListening ? (
              <div className="bg-foreground absolute top-0 bottom-0 left-0 w-1.5" />
            ) : null}

            {renderInstructionText(
              shouldInlinePairedListeningPrompt
                ? [
                    pairedInstructionText,
                    compactPromptLines(
                      stripQuestionNumberPrefix(
                        primaryBlock.items[0]?.prompt ?? '',
                        primaryBlock.items[0]?.qNum ?? 0,
                      ),
                    ),
                  ]
                    .filter(Boolean)
                    .join('\n')
                : shouldInlinePairedReadingChoicePrompt
                  ? pairedReadingInstructionText
                  : listeningInstructionText,
            )}
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        {shouldRenderListeningLeadInRow ? (
          <div>
            <QuestionRow
              key={`${listeningLeadInQuestion!.qNum}-${groupIdx}-lead-in`}
              qNum={listeningLeadInQuestion!.qNum}
              prompt={listeningLeadInQuestion!.prompt}
              choices={listeningLeadInQuestion!.choices}
              pairedQuestionNumbers={
                listeningLeadInQuestion!.pairedQuestionNumbers
              }
              answerLookup={answerLookup}
              userAnswers={userAnswers}
              isSubmitted={isSubmitted}
              isTestLocked={isTestLocked}
              setUserAnswers={setUserAnswers}
              renderAnswerStatusIcon={renderAnswerStatusIcon}
            />
          </div>
        ) : null}

        {shouldFlattenListeningQuestionRows ? (
          <div className="space-y-6">
            {[primaryBlock, ...continuationBlocks].flatMap((block: any) =>
              block.items
                .filter(
                  (item: any) =>
                    !(shouldHideListeningLeadInRow && item.qNum === 11),
                )
                .map((item: any, itemIdx: number) => {
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

                  return (
                    <QuestionRow
                      key={`${block.header}-${groupIdx}-${block.questionNumbers.join(
                        '-',
                      )}-${item.qNum}-${itemIdx}`}
                      qNum={item.qNum}
                      prompt={displayPrompt}
                      choices={block.choices}
                      pairedQuestionNumbers={block.questionNumbers}
                      showPrompt={true}
                      showPromptTextWhenBlank={
                        shouldShowPromptTextWhenBlank ||
                        shouldShowPromptTextWhenBlankForQuestions15To21 ||
                        shouldShowPromptTextWhenBlankForGeneralTest2Questions1To7 ||
                        shouldShowPromptTextWhenBlankForGeneralTest2Questions32To35 ||
                        shouldShowPromptTextWhenBlankForGeneralTest3Questions1To8 ||
                        shouldShowPromptTextWhenBlankForGeneralTest3Questions9To14 ||
                        shouldShowPromptTextWhenBlankForGeneralTest3Questions33To36 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions1To5 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions25To27 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions31To36
                      }
                      inlineBlankPrompt={
                        shouldRenderInlineBlankPromptForQuestions15To21 ||
                        shouldRenderInlineBlankPromptForQuestions28To32 ||
                        shouldRenderInlineBlankPromptForGeneralTest2Questions21To27 ||
                        shouldRenderInlineBlankPromptForGeneralTest3Questions22To27 ||
                        shouldRenderInlineBlankPromptForListeningQuestions16To20 ||
                        shouldRenderInlineBlankPromptForListeningQuestions25To30
                      }
                      answerLookup={answerLookup}
                      userAnswers={userAnswers}
                      isSubmitted={isSubmitted}
                      isTestLocked={isTestLocked}
                      setUserAnswers={setUserAnswers}
                      renderAnswerStatusIcon={renderAnswerStatusIcon}
                    />
                  );
                }),
            )}
          </div>
        ) : (
          [primaryBlock, ...continuationBlocks].map(
            (block: any, blockGroupIdx: number) => {
              if (
                (isPairedListeningChoiceBlock || shouldInlinePairedReadingChoicePrompt) &&
                blockGroupIdx === 0
              ) {
                const item = block.items[0];

                if (!item) {
                  return null;
                }

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

                return (
                  <div
                    key={`${block.header}-${groupIdx}-${blockGroupIdx}`}
                    className="space-y-6"
                  >
                    <QuestionRow
                      key={`${block.header}-${groupIdx}-${blockGroupIdx}-${item.qNum}`}
                      qNum={item.qNum}
                      prompt={
                        shouldInlinePairedListeningPrompt ||
                        shouldInlinePairedReadingChoicePrompt
                          ? ''
                          : displayPrompt
                      }
                      choices={block.choices}
                      pairedQuestionNumbers={block.questionNumbers}
                      showPrompt={
                        !shouldInlinePairedListeningPrompt &&
                        !shouldInlinePairedReadingChoicePrompt
                      }
                      showPromptTextWhenBlank={shouldShowPromptTextWhenBlank}
                      hideQuestionNumber={
                        isPairedListeningChoiceBlock ||
                        shouldInlinePairedReadingChoicePrompt
                      }
                      answerLookup={answerLookup}
                      userAnswers={userAnswers}
                      isSubmitted={isSubmitted}
                      isTestLocked={isTestLocked}
                      setUserAnswers={setUserAnswers}
                      renderAnswerStatusIcon={renderAnswerStatusIcon}
                    />
                  </div>
                );
              }

              return (
                <div
                  key={`${block.header}-${groupIdx}-${blockGroupIdx}`}
                  className={cn(
                    'space-y-6',
                    blockGroupIdx > 0 && 'border-border/60 border-t pt-6',
                  )}
                >
                  {block.items
                  .filter(
                    (item: any) =>
                      !(shouldHideListeningLeadInRow && item.qNum === 11),
                  )
                  .map((item: any, itemIdx: number) => {
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

                      return (
                        <QuestionRow
                          key={`${block.header}-${groupIdx}-${blockGroupIdx}-${item.qNum}-${itemIdx}`}
                          qNum={item.qNum}
                          prompt={displayPrompt}
                          choices={block.choices}
                          showPromptTextWhenBlank={
                            shouldShowPromptTextWhenBlank ||
                            shouldShowPromptTextWhenBlankForQuestions15To21 ||
                            shouldShowPromptTextWhenBlankForGeneralTest2Questions1To7 ||
                            shouldShowPromptTextWhenBlankForGeneralTest2Questions32To35 ||
                            shouldShowPromptTextWhenBlankForGeneralTest3Questions1To8 ||
                            shouldShowPromptTextWhenBlankForGeneralTest3Questions9To14 ||
                            shouldShowPromptTextWhenBlankForGeneralTest3Questions33To36 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions1To5 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions25To27 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions31To36
                          }
                          inlineBlankPrompt={
                            shouldRenderInlineBlankPromptForQuestions15To21 ||
                            shouldRenderInlineBlankPromptForQuestions28To32 ||
                            shouldRenderInlineBlankPromptForGeneralTest2Questions21To27 ||
                            shouldRenderInlineBlankPromptForGeneralTest3Questions22To27 ||
                            shouldRenderInlineBlankPromptForListeningQuestions16To20 ||
                            shouldRenderInlineBlankPromptForListeningQuestions25To30
                          }
                          answerLookup={answerLookup}
                          userAnswers={userAnswers}
                          isSubmitted={isSubmitted}
                          isTestLocked={isTestLocked}
                          setUserAnswers={setUserAnswers}
                          renderAnswerStatusIcon={renderAnswerStatusIcon}
                        />
                      );
                    })}
                </div>
              );
            },
          )
        )}
      </div>
    </section>
  );
}
