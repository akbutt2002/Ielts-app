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
  const shouldHideListeningLeadInRow =
    Boolean(listeningLeadInQuestion) &&
    primaryBlock.questionNumbers[0] === 11;
  const shouldRenderListeningLeadInRow =
    Boolean(listeningLeadInQuestion) &&
    primaryBlock.questionNumbers[0] === 12;

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
              if (isPairedListeningChoiceBlock && blockGroupIdx === 0) {
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
                        shouldInlinePairedListeningPrompt ? '' : displayPrompt
                      }
                      choices={block.choices}
                      pairedQuestionNumbers={block.questionNumbers}
                      showPrompt={!shouldInlinePairedListeningPrompt}
                      hideQuestionNumber={isPairedListeningChoiceBlock}
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
