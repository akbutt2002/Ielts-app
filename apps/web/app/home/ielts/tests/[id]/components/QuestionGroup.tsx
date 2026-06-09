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

  const isListeningTest4TrainingProgrammesBlock =
    isListening &&
    /Cambridge 19 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 11 &&
    /problems with some training programmes for new runners does Liz mention\?/i.test(
      [primaryBlock.rawText, primaryBlock.instructions, primaryBlock.items[0]?.prompt]
        .filter(Boolean)
        .join('\n'),
    );
  const pairedChoiceQuestionNumbers = isListeningTest4TrainingProgrammesBlock
    ? [11, 12]
    : primaryBlock.questionNumbers;
  const isListeningTest2GuitarLessonTable =
    isListening &&
    /Cambridge 19 Listening Test 2/i.test(testTitle ?? '') &&
    /Questions 7-10/i.test(primaryBlock.header ?? '') &&
    /A typical 45-minute guitar lesson/i.test(primaryBlock.rawText ?? primaryBlock.instructions ?? '');
  const displayBlockTitle = isListeningTest4TrainingProgrammesBlock
    ? 'Questions 11-12'
    : isListeningTest2GuitarLessonTable
      ? 'Questions 7-10'
      : shouldShowQuestionBlockTitle(primaryBlock)
        ? formatQuestionRangeLabel(primaryBlock.questionNumbers)
        : '';
  const listeningPartLabel = isListening
    ? `Part ${Math.min(
        4,
        Math.max(1, Math.ceil((primaryBlock.questionNumbers[0] ?? 1) / 10)),
      )}`
    : '';
  const contentHeading = primaryBlock.contentHeading?.trim() ?? '';
  const isListeningTest4MarathonQuestionBlock =
    isListening &&
    /Cambridge 19 Listening Test 4/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 19 &&
    /What does Liz say about running her first marathon\?/i.test(
      [primaryBlock.rawText, primaryBlock.instructions, primaryBlock.items[0]?.prompt]
        .filter(Boolean)
        .join('\n'),
    );
  const isListeningTest2ShoeProjectQuestionBlock =
    isListening &&
    /Cambridge 19 Listening Test 2/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 29 &&
    /Why did the project to make .*new.* shoes out of old shoes fail\?/i.test(
      [primaryBlock.rawText, primaryBlock.instructions, primaryBlock.items[0]?.prompt]
        .filter(Boolean)
        .join('\n'),
    );
  const isPairedListeningChoiceBlock =
    isListening &&
    !isListeningTest4MarathonQuestionBlock &&
    !isListeningTest2ShoeProjectQuestionBlock &&
    pairedChoiceQuestionNumbers.length === 2 &&
    (primaryBlock.choices?.length ?? 0) > 0;
  const shouldInlinePairedListeningPrompt = isPairedListeningChoiceBlock;
  const shouldInlinePairedReadingChoicePrompt =
    !isListening &&
    pairedChoiceQuestionNumbers.length === 2 &&
    (primaryBlock.choices?.length ?? 0) > 0 &&
    ([20, 22].includes(primaryBlock.questionNumbers[0] ?? 0) ||
      (/Cambridge 19 IELTS Academic Reading Test 2/i.test(testTitle ?? '') &&
        [23, 25].includes(primaryBlock.questionNumbers[0] ?? 0)));
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
  const shouldShowPromptTextWhenBlankForAcademicTest2Questions14To18 =
    !isListening &&
    /Cambridge 19 IELTS Academic Reading Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 14 &&
    groupLastQuestion === 18;
  const shouldShowPromptTextWhenBlankForAcademicTest3Questions14To17 =
    !isListening &&
    /Cambridge 19 IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 14 &&
    groupLastQuestion === 17;
  const shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 =
    !isListening &&
    /Cambridge 19 IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 18 &&
    groupLastQuestion === 22 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldShowPromptTextWhenBlankForAcademicTest3Questions23To26 =
    !isListening &&
    /Cambridge 19 IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 23 &&
    groupLastQuestion === 26;  const shouldShowPromptTextWhenBlankForAcademicTest3Questions31To34 =
    !isListening &&
    /Cambridge 19 IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 31 &&
    groupLastQuestion === 34;  const shouldRenderInlineBlankPromptForAcademicTest2Questions19To22 =
    !isListening &&
    /Cambridge 19 IELTS Academic Reading Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 19 &&
    groupLastQuestion === 22 &&
    (primaryBlock.choices?.length ?? 0) === 0;
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

  const shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 =
    isListening &&
    /Cambridge 19 Listening Test 2/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers.includes(1) &&
    primaryBlock.questionNumbers.includes(6) &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const listeningTest2Question1To6Prompts = new Map<number, string>([
    [1, 'Coordinator: Gary 1 ____'],
    [2, 'Level: 2 ____'],
    [3, 'Place: the 3 ____'],
    [4, '4 ____ Street, first floor, Room T347'],
    [5, 'Time: Thursday morning at 5 ____'],
    [6, "Recommended website: 'The perfect 6 ____'"],
  ]);
  const listeningTest2Question1To6Rows = Array.from(
    listeningTest2Question1To6Prompts.entries(),
  ).map(([qNum, prompt]) => ({ qNum, prompt }));
  const shouldRenderListeningTest2ShoeRejectionRows =
    isListening &&
    /Cambridge 19 Listening Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 25 &&
    groupLastQuestion === 28 &&
    (primaryBlock.choices?.length ?? 0) > 0;
  const listeningTest2Question25To28Prompts = new Map<number, string>([
    [25, 'the high-heeled shoes'],
  ]);
  const listeningTest2Question25To28Rows = Array.from(
    listeningTest2Question25To28Prompts.entries(),
  ).map(([qNum, prompt]) => ({ qNum, prompt }));
  const shouldShowPromptTextWhenBlankForListeningTest3Questions11To16 =
    isListening &&
    /Cambridge 19 Listening Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion <= 11 &&
    groupLastQuestion >= 16 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldShowPromptTextWhenBlankForListeningTest4Questions15To18 =
    isListening &&
    /Cambridge 19 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 15 &&
    groupLastQuestion === 18 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const listeningTest4Question15To18Prompts = new Map<number, string>([
    [15, 'Ceri ____'],
    [16, 'James ____'],
    [17, 'Leo ____'],
    [18, 'Mark ____'],
  ]);
  const shouldShowPromptTextWhenBlankForListeningTest4Questions26To30 =
    isListening &&
    /Cambridge 19 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 26 &&
    groupLastQuestion === 30 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const listeningTest4Question26To30Prompts = new Map<number, string>([
    [26, 'rare books ____'],
    [27, 'children\'s books ____'],
    [28, 'unwanted books ____'],
    [29, 'requested books ____'],
    [30, 'coursebooks ____'],
  ]);

  const shouldRenderListeningTest2GuitarLessonTable =
    isListeningTest2GuitarLessonTable &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldRenderListeningTest3ShoppingTable =
    isListening &&
    /Cambridge 19 Listening Test 3/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 7 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      10 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldRenderListeningTest3Flowchart =
    isListening &&
    /Cambridge 19 Listening Test 3/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 26 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      30 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldRenderListeningTest4ResponsibilitiesTable =
    isListening &&
    /Cambridge 19 Listening Test 4/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 7 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      10 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const listeningTest3InstructionText = shouldShowPromptTextWhenBlankForListeningTest4Questions15To18
    ? [
        'What reason prevented each of the following members of the Compton Park Runners Club from joining until recently?',
        'Write the correct letter, A, B, or C next to Questions 15-18.',
        'Reasons:',
        'A a lack of confidence',
        'B a dislike of running',
        'C a lack of time',
      ].join('\n')
    : shouldRenderListeningTest2GuitarLessonTable
      ? primaryBlock.instructions
          .split(/\r?\n/)
          .map((line: string) => line.trim())
          .filter(Boolean)
          .slice(0, 3)
          .join('\n')
    : shouldRenderListeningTest3ShoppingTable
      ? primaryBlock.instructions
        .split(/\r?\n/)
        .map((line: string) => line.trim())
        .filter(Boolean)
        .slice(0, 4)
        .join('\n')
    : shouldRenderListeningTest3Flowchart
      ? [
          'Complete the flowchart below.',
          'Choose FIVE answers from the box and write the correct letter, A-H, next to Questions 26-30.',
          'A size',
          'B escape',
          'C age',
          'D water',
          'E cereal',
          'F calculations',
          'G changes',
          'H colour',
        ].join('\n')
      : shouldRenderListeningTest4ResponsibilitiesTable
        ? primaryBlock.instructions
            .split(/\r?\n/)
            .map((line: string) => line.trim())
            .filter(Boolean)
            .slice(0, 4)
            .join('\n')
        : listeningInstructionText;
  const renderListeningTest2GuitarLessonQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-test-2-guitar-lesson-${qNum}`}
      qNum={qNum}
      prompt={prompt}
      choices={[]}
      showPrompt={true}
      inlineBlankPrompt={true}
      hideQuestionNumber={true}
      answerLookup={answerLookup}
      userAnswers={userAnswers}
      isSubmitted={isSubmitted}
      isTestLocked={isTestLocked}
      setUserAnswers={setUserAnswers}
      renderAnswerStatusIcon={renderAnswerStatusIcon}
    />
  );
  const renderListeningTest3ShoppingQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-test-3-shopping-${qNum}`}
      qNum={qNum}
      prompt={prompt}
      choices={[]}
      showPrompt={true}
      inlineBlankPrompt={true}
      hideQuestionNumber={true}
      answerLookup={answerLookup}
      userAnswers={userAnswers}
      isSubmitted={isSubmitted}
      isTestLocked={isTestLocked}
      setUserAnswers={setUserAnswers}
      renderAnswerStatusIcon={renderAnswerStatusIcon}
    />
  );
  const renderListeningTest3FlowQuestion = (qNum: number, prompt: string) => (
    <QuestionRow
      key={`listening-test-3-flow-${qNum}`}
      qNum={qNum}
      prompt={prompt}
      choices={[]}
      showPrompt={true}
      inlineBlankPrompt={true}
      hideQuestionNumber={true}
      answerLookup={answerLookup}
      userAnswers={userAnswers}
      isSubmitted={isSubmitted}
      isTestLocked={isTestLocked}
      setUserAnswers={setUserAnswers}
      renderAnswerStatusIcon={renderAnswerStatusIcon}
    />
  );
  const renderListeningTest4ResponsibilitiesQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-test-4-responsibilities-${qNum}`}
      qNum={qNum}
      prompt={prompt}
      choices={[]}
      showPrompt={true}
      inlineBlankPrompt={true}
      hideQuestionNumber={true}
      answerLookup={answerLookup}
      userAnswers={userAnswers}
      isSubmitted={isSubmitted}
      isTestLocked={isTestLocked}
      setUserAnswers={setUserAnswers}
      renderAnswerStatusIcon={renderAnswerStatusIcon}
    />
  );
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
            <div className="bg-foreground absolute top-0 bottom-0 left-0 w-1.5" />

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
                  : listeningTest3InstructionText,
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

        {shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 ? (
          <div className="space-y-6">
            {listeningTest2Question1To6Rows.map((item) => (
              <QuestionRow
                key={`listening-test-2-form-${item.qNum}`}
                qNum={item.qNum}
                prompt={item.prompt}
                choices={[]}
                showPrompt={true}
                showPromptTextWhenBlank={true}
                inlineBlankPrompt={true}
                answerLookup={answerLookup}
                userAnswers={userAnswers}
                isSubmitted={isSubmitted}
                isTestLocked={isTestLocked}
                setUserAnswers={setUserAnswers}
                renderAnswerStatusIcon={renderAnswerStatusIcon}
              />
            ))}
          </div>
        ) : shouldRenderListeningTest2ShoeRejectionRows ? (
          <div className="space-y-6">
            {listeningTest2Question25To28Rows.map((item) => (
              <QuestionRow
                key={`listening-test-2-shoe-rejection-${item.qNum}`}
                qNum={item.qNum}
                prompt={item.prompt}
                choices={primaryBlock.choices}
                showPrompt={true}
                answerLookup={answerLookup}
                userAnswers={userAnswers}
                isSubmitted={isSubmitted}
                isTestLocked={isTestLocked}
                setUserAnswers={setUserAnswers}
                renderAnswerStatusIcon={renderAnswerStatusIcon}
              />
            ))}
          </div>
        ) : shouldRenderListeningTest2GuitarLessonTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 border-b px-4 py-5 text-center text-sm font-black">
              A typical 45-minute guitar lesson
            </div>

            <div className="border-border/60 grid grid-cols-3 border-b text-center text-sm font-semibold">
              <div className="border-border/60 border-r px-4 py-4">Time</div>
              <div className="border-border/60 border-r px-4 py-4">Activity</div>
              <div className="px-4 py-4">Notes</div>
            </div>

            <div className="border-border/60 grid grid-cols-3 border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                5 minutes
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                tuning guitars
              </div>
              <div className="px-4 py-5">
                {renderListeningTest2GuitarLessonQuestion(
                  7,
                  'using an app or by 7 ____',
                )}
              </div>
            </div>

            <div className="border-border/60 grid grid-cols-3 border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                10 minutes
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                strumming chords using our thumbs
              </div>
              <div className="px-4 py-5">
                {renderListeningTest2GuitarLessonQuestion(
                  8,
                  'keeping time while the teacher is 8 ____',
                )}
              </div>
            </div>

            <div className="border-border/60 grid grid-cols-3 border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                15 minutes
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                playing songs
              </div>
              <div className="px-4 py-5">
                {renderListeningTest2GuitarLessonQuestion(
                  9,
                  'often listening to a 9 ____ of a song',
                )}
              </div>
            </div>

            <div className="border-border/60 grid grid-cols-3 border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                10 minutes
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                playing single notes and simple tunes
              </div>
              <div className="px-4 py-5">
                {renderListeningTest2GuitarLessonQuestion(
                  10,
                  'playing together, then 10 ____',
                )}
              </div>
            </div>

            <div className="grid grid-cols-3">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                5 minutes
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                noting things to practise at home
              </div>
              <div className="px-4 py-5" />
            </div>
          </div>
        ) : shouldRenderListeningTest3ShoppingTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 border-b px-4 py-5 text-center text-sm font-black">
              Shopping
            </div>

            <div className="border-border/60 grid grid-cols-3 border-b text-center text-sm">
              <div className="border-border/60 border-r px-4 py-4" />
              <div className="border-border/60 border-r px-4 py-4">
                To buy
              </div>
              <div className="px-4 py-4">Other ideas</div>
            </div>

            <div className="border-border/60 grid grid-cols-3 border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm font-black">
                Fish market
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                a dozen prawns
              </div>
              <div className="px-4 py-5">
                {renderListeningTest3ShoppingQuestion(
                  7,
                  'a handful of 7 ____\n(type of seaweed)',
                )}
              </div>
            </div>

            <div className="border-border/60 grid grid-cols-3 border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm font-black">
                Organic Shop
              </div>
              <div className="border-border/60 border-r px-4 py-5">
                {renderListeningTest3ShoppingQuestion(
                  8,
                  'beans and a 8 ____ for dessert',
                )}
              </div>
              <div className="px-4 py-5">
                {renderListeningTest3ShoppingQuestion(9, 'spices and 9 ____')}
              </div>
            </div>

            <div className="grid grid-cols-3">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm font-black">
                Bakery
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                a brown loaf
              </div>
              <div className="px-4 py-5">
                {renderListeningTest3ShoppingQuestion(10, 'a 10 ____ tart')}
              </div>
            </div>
          </div>
        ) : shouldRenderListeningTest4ResponsibilitiesTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 border-b px-4 py-5 text-center text-sm font-black">
              Responsibilities
            </div>

            <div className="border-border/60 grid grid-cols-4 border-b text-center text-sm font-semibold">
              <div className="border-border/60 border-r px-3 py-4" />
              <div className="border-border/60 border-r px-3 py-4">Task 1</div>
              <div className="border-border/60 border-r px-3 py-4">Task 2</div>
              <div className="px-3 py-4">Notes</div>
            </div>

            <div className="border-border/60 grid grid-cols-4 border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-3 py-5 text-center text-sm font-black">
                Bakery section
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-3 py-5 text-center text-sm">
                Check sell-by dates
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-3 py-5 text-center text-sm">
                Change price labels
              </div>
              <div className="px-3 py-5">
                {renderListeningTest4ResponsibilitiesQuestion(
                  7,
                  'Use 7 ____ labels',
                )}
              </div>
            </div>

            <div className="border-border/60 grid grid-cols-4 border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-3 py-5 text-center text-sm font-black">
                Sushi takeaway counter
              </div>
              <div className="border-border/60 border-r px-3 py-5">
                {renderListeningTest4ResponsibilitiesQuestion(
                  8,
                  'Re-stock with 8 ____ boxes if needed',
                )}
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-3 py-5 text-center text-sm">
                Wipe preparation area and clean the sink
              </div>
              <div className="flex items-center justify-center px-3 py-5 text-center text-sm">
                Do not clean any knives
              </div>
            </div>

            <div className="grid grid-cols-4">
              <div className="border-border/60 flex items-center justify-center border-r px-3 py-5 text-center text-sm font-black">
                Meat and fish counters
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-3 py-5 text-center text-sm">
                Clean the serving area, including the weighing scales
              </div>
              <div className="border-border/60 border-r px-3 py-5">
                {renderListeningTest4ResponsibilitiesQuestion(
                  9,
                  'Collect 9 ____ for the fish from the cold-room',
                )}
              </div>
              <div className="px-3 py-5">
                {renderListeningTest4ResponsibilitiesQuestion(
                  10,
                  'Must wear special 10 ____',
                )}
              </div>
            </div>
          </div>
        ) : shouldRenderListeningTest3Flowchart ? (
          <div className="space-y-4">
            <div className="border-border/60 bg-background/60 rounded-2xl border px-4 py-5 text-center shadow-sm">
              {renderListeningTest3FlowQuestion(
                26,
                'Choose mice which are all the same 26 ____',
              )}
            </div>

            <div className="text-primary text-center text-xl font-black leading-none">
              ?
            </div>

            <div className="border-border/60 bg-background/60 rounded-2xl border px-4 py-5 text-center shadow-sm">
              {renderListeningTest3FlowQuestion(
                27,
                'Divide the mice into two groups, each with a different 27 ____',
              )}
            </div>

            <div className="text-primary text-center text-xl font-black leading-none">
              ?
            </div>

            <div className="border-border/60 bg-background/60 space-y-4 rounded-2xl border px-4 py-5 text-center text-sm shadow-sm">
              <p>Put each group in a separate cage.</p>
              <p>Feed group A commercial mouse food.</p>
              {renderListeningTest3FlowQuestion(
                28,
                'Feed group B the same, but also sugar contained in 28 ____',
              )}
            </div>

            <div className="text-primary text-center text-xl font-black leading-none">
              ?
            </div>

            <div className="border-border/60 bg-background/60 space-y-4 rounded-2xl border px-4 py-5 text-center text-sm shadow-sm">
              <p>Take measurements using an electronic scale.</p>
              {renderListeningTest3FlowQuestion(
                29,
                'Place them in a weighing chamber to prevent 29 ____',
              )}
            </div>

            <div className="text-primary text-center text-xl font-black leading-none">
              ?
            </div>

            <div className="border-border/60 bg-background/60 rounded-2xl border px-4 py-5 text-center shadow-sm">
              {renderListeningTest3FlowQuestion(30, 'Do all necessary 30 ____')}
            </div>
          </div>
        ) : shouldFlattenListeningQuestionRows ? (
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
                  const scopedDisplayPrompt =
                    shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
                    listeningTest2Question1To6Prompts.has(item.qNum)
                      ? listeningTest2Question1To6Prompts.get(item.qNum)!
                      : shouldShowPromptTextWhenBlankForListeningTest4Questions15To18 &&
                    listeningTest4Question15To18Prompts.has(item.qNum)
                      ? listeningTest4Question15To18Prompts.get(item.qNum)!
                      : shouldShowPromptTextWhenBlankForListeningTest4Questions26To30 &&
                          listeningTest4Question26To30Prompts.has(item.qNum)
                        ? listeningTest4Question26To30Prompts.get(item.qNum)!
                        : displayPrompt;

                  return (
                    <QuestionRow
                      key={`${block.header}-${groupIdx}-${block.questionNumbers.join(
                        '-',
                      )}-${item.qNum}-${itemIdx}`}
                      qNum={item.qNum}
                      prompt={scopedDisplayPrompt}
                      choices={block.choices}
                      pairedQuestionNumbers={isPairedListeningChoiceBlock ? pairedChoiceQuestionNumbers : []}
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
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions31To36 ||
                        shouldShowPromptTextWhenBlankForAcademicTest2Questions14To18 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions14To17 ||
                        shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions23To26 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions31To34 ||
                          ((shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
                              item.qNum >= 1 &&
                              item.qNum <= 6) ||
                            (shouldShowPromptTextWhenBlankForListeningTest3Questions11To16 &&
                              item.qNum >= 11 &&
                              item.qNum <= 16) ||
                            (shouldShowPromptTextWhenBlankForListeningTest4Questions15To18 &&
                              item.qNum >= 15 &&
                              item.qNum <= 18) ||
                            (shouldShowPromptTextWhenBlankForListeningTest4Questions26To30 &&
                              item.qNum >= 26 &&
                              item.qNum <= 30))
                      }
                      inlineBlankPrompt={
                        shouldRenderInlineBlankPromptForQuestions15To21 ||
                        shouldRenderInlineBlankPromptForQuestions28To32 ||
                        shouldRenderInlineBlankPromptForGeneralTest2Questions21To27 ||
                        shouldRenderInlineBlankPromptForGeneralTest3Questions22To27 ||
                        shouldRenderInlineBlankPromptForAcademicTest2Questions19To22 ||
                        shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                        shouldRenderInlineBlankPromptForListeningQuestions16To20 ||
                        shouldRenderInlineBlankPromptForListeningQuestions25To30 ||
                        (shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
                          item.qNum >= 1 &&
                          item.qNum <= 6) ||
                        shouldShowPromptTextWhenBlankForListeningTest4Questions26To30
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
                      pairedQuestionNumbers={pairedChoiceQuestionNumbers}
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
                      const scopedDisplayPrompt =
                        shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
                        listeningTest2Question1To6Prompts.has(item.qNum)
                          ? listeningTest2Question1To6Prompts.get(item.qNum)!
                          : shouldShowPromptTextWhenBlankForListeningTest4Questions15To18 &&
                        listeningTest4Question15To18Prompts.has(item.qNum)
                          ? listeningTest4Question15To18Prompts.get(item.qNum)!
                          : shouldShowPromptTextWhenBlankForListeningTest4Questions26To30 &&
                              listeningTest4Question26To30Prompts.has(item.qNum)
                            ? listeningTest4Question26To30Prompts.get(item.qNum)!
                            : displayPrompt;

                      return (
                        <QuestionRow
                          key={`${block.header}-${groupIdx}-${blockGroupIdx}-${item.qNum}-${itemIdx}`}
                          qNum={item.qNum}
                          prompt={scopedDisplayPrompt}
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
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions31To36 ||
                            shouldShowPromptTextWhenBlankForAcademicTest2Questions14To18 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions14To17 ||
                            shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions23To26 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions31To34 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions31To34 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions14To17 ||
                        shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions23To26 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions31To34 ||
                          ((shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
                              item.qNum >= 1 &&
                              item.qNum <= 6) ||
                            (shouldShowPromptTextWhenBlankForListeningTest3Questions11To16 &&
                              item.qNum >= 11 &&
                              item.qNum <= 16) ||
                            (shouldShowPromptTextWhenBlankForListeningTest4Questions15To18 &&
                              item.qNum >= 15 &&
                              item.qNum <= 18) ||
                            (shouldShowPromptTextWhenBlankForListeningTest4Questions26To30 &&
                              item.qNum >= 26 &&
                              item.qNum <= 30))
                          }
                          inlineBlankPrompt={
                            shouldRenderInlineBlankPromptForQuestions15To21 ||
                            shouldRenderInlineBlankPromptForQuestions28To32 ||
                            shouldRenderInlineBlankPromptForGeneralTest2Questions21To27 ||
                            shouldRenderInlineBlankPromptForGeneralTest3Questions22To27 ||
                            shouldRenderInlineBlankPromptForAcademicTest2Questions19To22 ||
                            shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                        shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                            shouldRenderInlineBlankPromptForListeningQuestions16To20 ||
                            shouldRenderInlineBlankPromptForListeningQuestions25To30 ||
                        (shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
                          item.qNum >= 1 &&
                          item.qNum <= 6) ||
                        shouldShowPromptTextWhenBlankForListeningTest4Questions26To30
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
