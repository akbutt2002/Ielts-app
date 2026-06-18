'use client';

import { cn } from '@kit/ui/utils';

import { normalizeAnswerText } from '../utils/answer-matcher';
import { questionRangePattern } from '../utils/instruction-formatter';
import {
  compactPromptLines,
  formatQuestionRangeLabel,
  stripQuestionNumberPrefix,
} from '../utils/question-parser';
import { QuestionRow } from './QuestionRow';
import {
  renderInstructionText,
  renderStructuredNoteBlock,
  renderStructuredSummaryBlock,
} from './instruction-renderers';

function RoadConstructionDiagram() {
  return (
    <div className="border-border/60 bg-background/70 overflow-hidden rounded-2xl border p-4 shadow-sm">
      <img
        src="/images/ielts/diagram-test-18-road.png"
        alt="Roman road construction diagram for questions 38 to 40"
        className="h-auto w-full rounded-xl object-contain"
      />
    </div>
  );
}
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

  const isListening18Test3Q1to4 =
    isListening &&
    /Cambridge 18 Listening Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 4;

  const isListening18Test3Q5to10 =
    isListening &&
    /Cambridge 18 Listening Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 5 &&
    groupLastQuestion === 10;

  const isListening17Test2Q8to10 =
    isListening &&
    /Cambridge 17 Listening Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 8 &&
    groupLastQuestion === 10;

  const shouldRenderGeneral18Test3RoadDiagram =
    !isListening &&
    /Cambridge 18 IELTS General Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 38 &&
    groupLastQuestion === 40;
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
      [
        primaryBlock.rawText,
        primaryBlock.instructions,
        primaryBlock.items[0]?.prompt,
      ]
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
    /A typical 45-minute guitar lesson/i.test(
      primaryBlock.rawText ?? primaryBlock.instructions ?? '',
    );
  const isListening18Test2JobTable =
    isListening &&
    /Cambridge 18 Listening Test 2/i.test(testTitle ?? '') &&
    /Questions 6-10/i.test(primaryBlock.header ?? '') &&
    primaryBlock.questionNumbers.includes(6) &&
    primaryBlock.questionNumbers.includes(10);
  const displayBlockTitle = isListeningTest4TrainingProgrammesBlock
    ? 'Questions 11-12'
    : isListeningTest2GuitarLessonTable
      ? 'Questions 7-10'
      : isListening18Test2JobTable
        ? 'Questions 6-10'
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
      [
        primaryBlock.rawText,
        primaryBlock.instructions,
        primaryBlock.items[0]?.prompt,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  const isListeningTest2ShoeProjectQuestionBlock =
    isListening &&
    /Cambridge 19 Listening Test 2/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 29 &&
    /Why did the project to make .*new.* shoes out of old shoes fail\?/i.test(
      [
        primaryBlock.rawText,
        primaryBlock.instructions,
        primaryBlock.items[0]?.prompt,
      ]
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
        [23, 25].includes(primaryBlock.questionNumbers[0] ?? 0)) ||
      (/Cambridge 18 IELTS Academic Reading Test 4/i.test(testTitle ?? '') &&
        [10, 12].includes(primaryBlock.questionNumbers[0] ?? 0)));
  const shouldUseGeneral18Test2Questions28To31Prompts =
    !isListening &&
    /Cambridge 18 IELTS General Reading Test 2/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 28 &&
    primaryBlock.questionNumbers.includes(31) &&
    (primaryBlock.choices?.length ?? 0) === 5;
  const general18Test2Questions28To31Prompts = new Map<number, string>([
    [28, "mention of Mawer's desire to oversee all the stages of her business"],
    [
      29,
      'reference to changing employment patterns among the general population',
    ],
    [30, 'the date when Clothkits was originally established as a product'],
    [31, 'the benefits of sewing a garment and then wearing it'],
  ]);
  const shouldUseGeneral18Test3Questions28To33Prompts =
    !isListening &&
    /Cambridge 18 IELTS General Reading Test 3/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 28 &&
    primaryBlock.questionNumbers.includes(33) &&
    (primaryBlock.choices?.length ?? 0) === 6;
  const general18Test3Questions28To33Prompts = new Map<number, string>([
    [28, 'the various functions of Roman roads'],
    [29, 'reference to some current remains of Roman road building'],
    [30, 'a description of preparations for building a road'],
    [31, 'the period in history when road building began'],
    [32, 'the consequence of damage caused by a natural disaster'],
    [33, 'the total distance once crossed by Roman roads'],
  ]);
  const shouldUseGeneral18Test2Questions32To35Prompts =
    !isListening &&
    /Cambridge 18 IELTS General Reading Test 2/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 32 &&
    primaryBlock.questionNumbers.includes(35) &&
    (primaryBlock.choices?.length ?? 0) === 4;
  const general18Test2Questions32To35Prompts = new Map<number, string>([
    [
      32,
      'in Paragraph A, the writer says that Kay Mawer was reminded about Clothkits by',
    ],
    [33, 'What does the reader learn about Clothkits in the 1960s and 1970s?'],
    [34, 'Why did Clothkits close in 1991?'],
    [35, 'What point does the writer make in Paragraph E?'],
  ]);
  const general18Test2Questions32To35Choices = new Map<number, string[]>([
    [
      32,
      [
        'A a shop she visited.',
        'B a purchase she made.',
        'C an outfit someone was wearing.',
        'D a conversation with someone she knew.',
      ],
    ],
    [
      33,
      [
        'A Its designs represented the attitudes of the time.',
        'B its products were only affordable for the wealthy.',
        'C its creator tried many times to launch her company.',
        'D its management was spread across numerous countries.',
      ],
    ],
    [
      34,
      [
        'A There were unexpected staffing problems.',
        'B The funding for sewing activities was inadequate.',
        "C Freeman's was an unsuitable partner.",
        "D Records on Kennedy's database were lost.",
      ],
    ],
    [
      35,
      [
        'A Clothkits will reach more markets than in the past.',
        'B Clothkits will need bigger premises than in the past.',
        'C People are more concerned about throwing away items than in the past.',
        'D People do less sewing now than in the past.',
      ],
    ],
  ]);
  const displayContentHeading =
    shouldInlinePairedListeningPrompt ||
    shouldUseGeneral18Test2Questions28To31Prompts ||
    shouldUseGeneral18Test3Questions28To33Prompts ||
    shouldUseGeneral18Test2Questions32To35Prompts ||
    isListening18Test3Q1to4 ||
    isListening18Test3Q5to10 ||
    isListening17Test2Q8to10
      ? ''
      : /^Which title is the most suitable for the text\?$/i.test(
            contentHeading,
          )
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
    shouldInlinePairedReadingChoicePrompt && primaryBlock.items[0]
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
    Boolean(listeningLeadInQuestion) && primaryBlock.questionNumbers[0] === 11;
  const shouldRenderListeningLeadInRow =
    Boolean(listeningLeadInQuestion) && primaryBlock.questionNumbers[0] === 12;
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
  const shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 =
    !isListening &&
    /Cambridge 18 IELTS General Reading Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 22 &&
    groupLastQuestion === 27 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const general18Test2Question22To27Prompts = new Map<number, string>([
    [22, "Chefs' uniforms and 22 ____ must be washed for every shift."],
    [
      23,
      'Kitchen staff need to change the 23 ____ when they start chopping another kind of food.',
    ],
    [
      24,
      'All staff must make sure their hands are clean after handling 24 ____.',
    ],
    [25, 'Workers in the kitchen should not attempt to repair 25 ____.'],
    [26, '26 ____ are required to identify any chemicals kept in the kitchen.'],
    [27, 'It is forbidden for kitchen staff to have drinks from the 27 ____.'],
  ]);
  const shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 =
    !isListening &&
    /Cambridge 18 IELTS General Reading Test 3/i.test(testTitle ?? '') &&
    (primaryBlock.questionNumbers?.[0] ?? 0) === 15 &&
    primaryBlock.questionNumbers?.includes(20) &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const general18Test3Question15To20Prompts = new Map<number, string>([
    [
      15,
      'Parking is limited, so the use of alternative methods of transport and the 15 ____ of cars is encouraged.',
    ],
    [16, 'Staff with the highest 16 ____ are given parking spaces first.'],
    [
      17,
      'Some parking spaces are reserved for company vehicles during the 17 ____ but may be used by staff at other times.',
    ],
    [
      18,
      'If an employee leaves the company permanently, their parking space will normally be given to their 18 ____.',
    ],
    [
      19,
      'If an employee takes extended leave, their parking space will be given to the person who provides 19 ____ for the absent employee.',
    ],
    [20, 'All 20 ____ about car parking should be sent to the HR Manager.'],
  ]);
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
  const shouldShowPromptTextWhenBlankForAcademicTest4Questions14To17 =
    !isListening &&
    /Cambridge 19 IELTS Academic Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 14 &&
    groupLastQuestion === 17;
  const shouldShowPromptTextWhenBlankForAcademicTest4Questions18To23 =
    !isListening &&
    /Cambridge 19 IELTS Academic Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 18 &&
    groupLastQuestion === 23;
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
    groupLastQuestion === 26;
  const shouldShowPromptTextWhenBlankForAcademicTest3Questions31To34 =
    !isListening &&
    /Cambridge 19 IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 31 &&
    groupLastQuestion === 34;
  const shouldRenderInlineBlankPromptForAcademicTest2Questions19To22 =
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
  const shouldRenderInlineBlankPromptForListening18Test2Questions15To20 =
    isListening &&
    /Cambridge 18 Listening Test 2/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 15 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      20 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForListening18Test3Questions1To4 =
    isListening &&
    /Cambridge 18 Listening Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 4 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForListening17Test2Questions1To7 =
    isListening &&
    /Cambridge 17 Listening Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 7 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForAcademic18Test1Questions1To3 =
    !isListening &&
    /Cambridge 18 IELTS Academic Reading Test 1/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 1 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      3 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForAcademic18Test1Questions22To26 =
    !isListening &&
    /Cambridge 18 IELTS Academic Reading Test 1/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 22 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      26 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderAcademic18Test1Table =
    !isListening &&
    /Cambridge 18 IELTS Academic Reading Test 1/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers.includes(4) &&
    primaryBlock.questionNumbers.includes(7);

  const shouldRenderInlineBlankPromptForGeneral18Test4Questions35To40 =
    !isListening &&
    /Cambridge 18 IELTS General Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 35 &&
    groupLastQuestion === 40 &&
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
    [26, 'the ankle boots'],
    [27, 'the baby shoes'],
    [28, 'the trainers'],
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
    [27, "children's books ____"],
    [28, 'unwanted books ____'],
    [29, 'requested books ____'],
    [30, 'coursebooks ____'],
  ]);

  const shouldRenderListeningTest2GuitarLessonTable =
    isListeningTest2GuitarLessonTable &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldRenderListening18Test2JobTable =
    isListening18Test2JobTable && (primaryBlock.choices?.length ?? 0) === 0;
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
  const shouldRenderGeneral18Test1CustomerComplaintsTable =
    !isListening &&
    /Cambridge 18 IELTS General Reading Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 23 &&
    groupLastQuestion === 27 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldRenderGeneral18Test4DairyTable =
    !isListening &&
    /Cambridge 18 IELTS General Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 22 &&
    groupLastQuestion === 27 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderListening18Test3PhotographyTable =
    isListening &&
    /Cambridge 18 Listening Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 5 &&
    groupLastQuestion === 10 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderListening17Test2Table =
    isListening &&
    /Cambridge 17 Listening Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 8 &&
    groupLastQuestion === 10 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const listeningTest3InstructionText =
    shouldShowPromptTextWhenBlankForListeningTest4Questions15To18
      ? [
          'What reason prevented each of the following members of the Compton Park Runners Club from joining until recently?',
          'Write the correct letter, A, B, or C next to Questions 15-18.',
          'Reasons:',
          'A a lack of confidence',
          'B a dislike of running',
          'C a lack of time',
        ].join('\n')
      : shouldRenderListening18Test2JobTable
        ? [
            'Complete the table below.',
            'Write ONE WORD AND/OR A NUMBER for each answer.',
          ].join('\n')
        : shouldRenderAcademic18Test1Table
          ? [
              'Complete the table below.',
              'Choose ONE WORD ONLY from the passage for each answer.',
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
                    'I (dummy)', // Keep lines aligned or not
                  ]
                    .slice(0, 10)
                    .join('\n') // adjust/keep it clean
                : shouldRenderListeningTest4ResponsibilitiesTable
                  ? primaryBlock.instructions
                      .split(/\r?\n/)
                      .map((line: string) => line.trim())
                      .filter(Boolean)
                      .slice(0, 4)
                      .join('\n')
                  : shouldRenderGeneral18Test1CustomerComplaintsTable
                    ? primaryBlock.instructions
                        .split(/\r?\n/)
                        .map((line: string) => line.trim())
                        .filter(Boolean)
                        .slice(0, 3)
                        .join('\n')
                    : shouldRenderGeneral18Test4DairyTable
                      ? primaryBlock.instructions
                          .split(/\r?\n/)
                          .map((line: string) => line.trim())
                          .filter(Boolean)
                          .slice(0, 3)
                          .join('\n')
                      : listeningInstructionText;
  const renderListening18Test2JobQuestion = (qNum: number, prompt: string) => (
    <QuestionRow
      key={`listening-18-test-2-job-${qNum}`}
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
  const renderAcademic18Test1TableQuestion = (qNum: number, prompt: string) => (
    <QuestionRow
      key={`academic-18-test-1-table-${qNum}`}
      qNum={qNum}
      prompt={prompt}
      choices={[]}
      showPrompt={true}
      inlineBlankPrompt={true}
      hideQuestionNumber={true}
      narrowInput={true}
      answerLookup={answerLookup}
      userAnswers={userAnswers}
      isSubmitted={isSubmitted}
      isTestLocked={isTestLocked}
      setUserAnswers={setUserAnswers}
      renderAnswerStatusIcon={renderAnswerStatusIcon}
    />
  );
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
  const renderListening18Test3PhotographyQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-18-test-3-photography-${qNum}`}
      qNum={qNum}
      prompt={prompt}
      choices={[]}
      showPrompt={true}
      inlineBlankPrompt={true}
      hideQuestionNumber={true}
      keepQuestionNumberPrefix={true}
      answerLookup={answerLookup}
      userAnswers={userAnswers}
      isSubmitted={isSubmitted}
      isTestLocked={isTestLocked}
      setUserAnswers={setUserAnswers}
      renderAnswerStatusIcon={renderAnswerStatusIcon}
    />
  );
  const renderListening17Test2TableQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-17-test-2-table-${qNum}`}
      qNum={qNum}
      prompt={prompt}
      choices={[]}
      showPrompt={true}
      inlineBlankPrompt={true}
      hideQuestionNumber={true}
      keepQuestionNumberPrefix={true}
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
  const renderGeneral18Test1CustomerComplaintsQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`general-18-test-1-customer-complaints-${qNum}`}
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
  const renderGeneral18Test4DairyQuestion = (qNum: number, prompt: string) => (
    <QuestionRow
      key={`general-18-test-4-dairy-${qNum}`}
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
        {isListening18Test3Q1to4 ? (
          <div className="border-border/60 bg-muted/10 rounded-2xl border p-5 space-y-4 shadow-sm max-w-xl mx-auto w-full">
            <div className="text-center space-y-1">
              <h4 className="text-foreground text-lg font-extrabold tracking-wide uppercase">
                Wayside Camera Club
              </h4>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                membership form
              </p>
            </div>
            <div className="border-t border-border/40 my-3" />
            <div className="grid grid-cols-[140px_1fr] gap-y-3 text-sm px-2">
              <div className="text-muted-foreground font-semibold flex items-center">Name:</div>
              <div className="text-foreground font-extrabold bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">Dan Green</div>
              <div className="text-muted-foreground font-semibold flex items-center">Email address:</div>
              <div className="text-foreground font-extrabold bg-muted/30 px-3 py-1.5 rounded-lg border border-border/40">dan1068@market.com</div>
            </div>
          </div>
        ) : null}

        {shouldRenderGeneral18Test3RoadDiagram ? (
          <RoadConstructionDiagram />
        ) : null}

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
        ) : shouldRenderGeneral18Test1CustomerComplaintsTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 border-b px-4 py-5 text-sm font-black">
              Strategies for dealing with customer complaints
            </div>

            <div className="border-border/60 grid grid-cols-[0.9fr_1.35fr_1.35fr] border-b text-sm font-semibold">
              <div className="border-border/60 border-r px-4 py-4">
                Strategy
              </div>
              <div className="border-border/60 border-r px-4 py-4">
                Your approach
              </div>
              <div className="px-4 py-4">The customer...</div>
            </div>

            <div className="border-border/60 grid grid-cols-[0.9fr_1.35fr_1.35fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Stay calm
              </div>
              <div className="border-border/60 border-r px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>Remember it is not a direct attack on you.</li>
                  <li>
                    {renderGeneral18Test1CustomerComplaintsQuestion(
                      23,
                      'Do not try to 23 ____ the argument.',
                    )}
                  </li>
                </ul>
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral18Test1CustomerComplaintsQuestion(
                      24,
                      'usually had 24 ____ that were not fulfilled.',
                    )}
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-border/60 grid grid-cols-[0.9fr_1.35fr_1.35fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Listen well
              </div>
              <div className="border-border/60 border-r px-4 py-5">
                <ul className="list-disc pl-5 text-sm leading-relaxed">
                  <li>Use short phrases in reply.</li>
                </ul>
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral18Test1CustomerComplaintsQuestion(
                      25,
                      'cannot recognise a 25 ____ until calm',
                    )}
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-border/60 grid grid-cols-[0.9fr_1.35fr_1.35fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Get the facts
              </div>
              <div className="border-border/60 border-r px-4 py-5">
                <ul className="list-disc pl-5 text-sm leading-relaxed">
                  <li>Ask questions and begin a proper conversation.</li>
                </ul>
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc pl-5 text-sm leading-relaxed">
                  <li>will start to trust you.</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-[0.9fr_1.35fr_1.35fr]">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Suggest action
              </div>
              <div className="border-border/60 border-r px-4 py-5">
                <ul className="list-disc pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral18Test1CustomerComplaintsQuestion(
                      26,
                      "Be sure of your company's 26 ____ on complaints.",
                    )}
                  </li>
                </ul>
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral18Test1CustomerComplaintsQuestion(
                      27,
                      'may well make a verbal 27 ____ in future.',
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : shouldRenderGeneral18Test4DairyTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 border-b px-4 py-5 text-sm font-black">
              Working with cows in a dairy
            </div>

            <div className="border-border/60 grid grid-cols-[1fr_2.5fr] border-b text-sm font-semibold">
              <div className="border-border/60 border-r px-4 py-4">Hazard</div>
              <div className="px-4 py-4">Managing the hazard</div>
            </div>

            {/* Category: Slips and trips */}
            <div className="border-border/60 bg-muted/30 border-b px-4 py-2 text-xs font-black tracking-wider uppercase">
              Slips and trips
            </div>

            {/* Slippery floor surfaces */}
            <div className="border-border/60 grid grid-cols-[1fr_2.5fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Slippery floor surfaces
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>Remove solid spills such as grain immediately.</li>
                  <li>
                    {renderGeneral18Test4DairyQuestion(
                      22,
                      'Ensure all items of 22 ____ have good grip.',
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* Hoses and pipes */}
            <div className="border-border/60 grid grid-cols-[1fr_2.5fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Hoses and pipes
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>Ensure they are fitted to walls where possible.</li>
                  <li>Highlight obstructions with brightly coloured tape.</li>
                </ul>
              </div>
            </div>

            {/* Overhead obstacles */}
            <div className="border-border/60 grid grid-cols-[1fr_2.5fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Overhead obstacles
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral18Test4DairyQuestion(
                      23,
                      'Ensure they are covered with 23 ____',
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* Unsuitable steps */}
            <div className="border-border/60 grid grid-cols-[1fr_2.5fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Unsuitable steps
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral18Test4DairyQuestion(
                      24,
                      'Provide good lighting and install 24 ____',
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* Category: Lifting and carrying */}
            <div className="border-border/60 bg-muted/30 border-b px-4 py-2 text-xs font-black tracking-wider uppercase">
              Lifting and carrying
            </div>

            {/* Transporting containers and calves */}
            <div className="border-border/60 grid grid-cols-[1fr_2.5fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Transporting containers and calves
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>Spread the weight evenly between both hands.</li>
                  <li>
                    {renderGeneral18Test4DairyQuestion(
                      25,
                      'Try to avoid moving containers by hand, and use equipment such as 25 ____ instead.',
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* Category: Milking by hand */}
            <div className="border-border/60 bg-muted/30 border-b px-4 py-2 text-xs font-black tracking-wider uppercase">
              Milking by hand
            </div>

            {/* Repetitive handling of milking equipment */}
            <div className="grid grid-cols-[1fr_2.5fr]">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Repetitive handling of milking equipment
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral18Test4DairyQuestion(
                      26,
                      'Keep everything accessible so that employees don’t need to bend or 26 ____',
                    )}
                  </li>
                  <li>
                    {renderGeneral18Test4DairyQuestion(
                      27,
                      'Introduce a system of 27 ____ to increase variety.',
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : shouldRenderListening18Test2JobTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 grid grid-cols-4 border-b text-sm font-semibold">
              <div className="border-border/60 border-r px-4 py-4">
                Location
              </div>
              <div className="border-border/60 border-r px-4 py-4">
                Job title
              </div>
              <div className="border-border/60 border-r px-4 py-4">
                Responsibilities include
              </div>
              <div className="px-4 py-4">Pay and conditions</div>
            </div>

            <div className="border-border/60 grid grid-cols-4 border-b">
              {/* Location */}
              <div className="border-border/60 flex flex-col justify-center border-r px-4 py-5">
                {renderListening18Test2JobQuestion(6, '6. 6 ____ Street')}
              </div>
              {/* Job title */}
              <div className="border-border/60 text-foreground/80 flex items-center border-r px-4 py-5 text-sm font-medium">
                Breakfast supervisor
              </div>
              {/* Responsibilities include */}
              <div className="border-border/60 flex flex-col justify-center space-y-4 border-r px-4 py-5">
                <div className="text-foreground/80 pl-10 text-sm leading-relaxed font-medium">
                  Checking portions, etc. are correct
                </div>
                {renderListening18Test2JobQuestion(
                  7,
                  '7. Making sure 7 ____ is clean',
                )}
              </div>
              {/* Pay and conditions */}
              <div className="flex flex-col justify-center space-y-4 px-4 py-5">
                {renderListening18Test2JobQuestion(
                  8,
                  '8. Starting salary 8 £ ____ per hour',
                )}
                <div className="text-foreground/80 pl-10 text-sm leading-relaxed font-medium">
                  Start work at 5.30 a.m.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4">
              {/* Location */}
              <div className="border-border/60 text-foreground/80 flex items-center border-r px-4 py-5 text-sm font-medium">
                City Road
              </div>
              {/* Job title */}
              <div className="border-border/60 text-foreground/80 flex items-center border-r px-4 py-5 text-sm font-medium">
                Junior chef
              </div>
              {/* Responsibilities include */}
              <div className="border-border/60 flex flex-col justify-center space-y-4 border-r px-4 py-5">
                <div className="text-foreground/80 pl-10 text-sm leading-relaxed font-medium">
                  Supporting senior chefs
                </div>
                {renderListening18Test2JobQuestion(
                  9,
                  '9. Maintaining stock and organising 9 ____',
                )}
              </div>
              {/* Pay and conditions */}
              <div className="flex flex-col justify-center space-y-4 px-4 py-5">
                <div className="text-foreground/80 pl-10 text-sm leading-relaxed font-medium">
                  Annual salary £23,000
                </div>
                {renderListening18Test2JobQuestion(
                  10,
                  '10. No work on a 10 ____ once a month',
                )}
              </div>
            </div>
          </div>
        ) : shouldRenderAcademic18Test1Table ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 grid grid-cols-[140px_1fr_1.1fr_0.9fr] border-b text-center text-xs font-semibold">
              <div className="border-border/60 border-r px-3 py-3"></div>
              <div className="border-border/60 border-r px-3 py-3">Growth</div>
              <div className="border-border/60 border-r px-3 py-3">
                Selection
              </div>
              <div className="px-3 py-3">Sale</div>
            </div>

            <div className="border-border/60 grid grid-cols-[140px_1fr_1.1fr_0.9fr] border-b">
              {/* Column 1: Row Header */}
              <div className="border-border/60 bg-muted/5 flex items-center border-r px-3 py-4 text-xs font-black">
                Intensive farming
              </div>
              {/* Column 2: Growth */}
              <div className="border-border/60 flex flex-col justify-start border-r px-3 py-4">
                <ul className="text-foreground/80 list-disc space-y-2.5 pl-4 text-xs leading-relaxed">
                  <li>
                    {renderAcademic18Test1TableQuestion(
                      4,
                      'wide range of 4 ____ used',
                    )}
                  </li>
                  <li>techniques pollute air</li>
                </ul>
              </div>
              {/* Column 3: Selection */}
              <div className="border-border/60 flex flex-col justify-start border-r px-3 py-4">
                <ul className="text-foreground/80 list-disc space-y-2.5 pl-4 text-xs leading-relaxed">
                  <li>quality not good</li>
                  <li>
                    {renderAcademic18Test1TableQuestion(
                      5,
                      'varieties of fruit and vegetables chosen that can survive long 5 ____',
                    )}
                  </li>
                </ul>
              </div>
              {/* Column 4: Sale */}
              <div className="flex flex-col justify-start px-3 py-4">
                <ul className="text-foreground/80 list-disc space-y-2.5 pl-4 text-xs leading-relaxed">
                  <li>
                    {renderAcademic18Test1TableQuestion(
                      6,
                      '6 6 ____ receive very little of overall income',
                    )}
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-[140px_1fr_1.1fr_0.9fr]">
              {/* Column 1: Row Header */}
              <div className="border-border/60 bg-muted/5 flex items-center border-r px-3 py-4 text-xs font-black">
                Aeroponic urban farming
              </div>
              {/* Column 2: Growth */}
              <div className="border-border/60 flex flex-col justify-start border-r px-3 py-4">
                <ul className="text-foreground/80 list-disc space-y-2.5 pl-4 text-xs leading-relaxed">
                  <li>no soil used</li>
                  <li>nutrients added to water, which is recycled</li>
                </ul>
              </div>
              {/* Column 3: Selection */}
              <div className="border-border/60 flex flex-col justify-start border-r px-3 py-4">
                <ul className="text-foreground/80 list-disc space-y-2.5 pl-4 text-xs leading-relaxed">
                  <li>
                    {renderAcademic18Test1TableQuestion(
                      7,
                      'produce chosen because of its 7 ____',
                    )}
                  </li>
                </ul>
              </div>
              {/* Column 4: Sale */}
              <div className="bg-muted/5 px-3 py-4">{/* Empty */}</div>
            </div>
          </div>
        ) : shouldRenderListeningTest2GuitarLessonTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 border-b px-4 py-5 text-center text-sm font-black">
              A typical 45-minute guitar lesson
            </div>

            <div className="border-border/60 grid grid-cols-3 border-b text-center text-sm font-semibold">
              <div className="border-border/60 border-r px-4 py-4">Time</div>
              <div className="border-border/60 border-r px-4 py-4">
                Activity
              </div>
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
        ) : shouldRenderListening18Test3PhotographyTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 border-b px-4 py-5 text-center text-sm font-black">
              Photography competitions
            </div>

            <div className="border-border/60 bg-muted/20 grid grid-cols-3 border-b text-center text-sm font-bold">
              <div className="border-border/60 border-r px-4 py-4">
                Title of competition
              </div>
              <div className="border-border/60 border-r px-4 py-4">
                Instructions
              </div>
              <div className="px-4 py-4">Feedback to Dan</div>
            </div>

            {/* Row 1 */}
            <div className="border-border/60 grid grid-cols-3 border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm font-medium">
                {renderListening18Test3PhotographyQuestion(5, '5. ‘____’')}
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                A scene in the home
              </div>
              <div className="flex items-center justify-center px-4 py-5 text-center text-sm">
                The picture’s composition was not good.
              </div>
            </div>

            {/* Row 2 */}
            <div className="border-border/60 grid grid-cols-3 border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm font-bold">
                ‘Beautiful Sunsets’
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                {renderListening18Test3PhotographyQuestion(
                  6,
                  'Scene must show some 6. ____',
                )}
              </div>
              <div className="flex items-center justify-center px-4 py-5 text-center text-sm">
                {renderListening18Test3PhotographyQuestion(
                  7,
                  'The 7. ____ was wrong.',
                )}
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-3">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm font-medium">
                {renderListening18Test3PhotographyQuestion(8, '8. ‘____’')}
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                {renderListening18Test3PhotographyQuestion(
                  9,
                  'Scene must show 9. ____',
                )}
              </div>
              <div className="flex items-center justify-center px-4 py-5 text-center text-sm">
                {renderListening18Test3PhotographyQuestion(
                  10,
                  'The photograph was too 10. ____.',
                )}
              </div>
            </div>
          </div>
        ) : shouldRenderListening17Test2Table ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 border-b px-4 py-5 text-center text-sm font-black">
              Village social events
            </div>

            <div className="border-border/60 bg-muted/20 grid grid-cols-[100px_1.5fr_1.2fr_1.5fr] border-b text-center text-sm font-bold">
              <div className="border-border/60 border-r px-4 py-4">Date</div>
              <div className="border-border/60 border-r px-4 py-4">Event</div>
              <div className="border-border/60 border-r px-4 py-4">Location</div>
              <div className="px-4 py-4">Help needed</div>
            </div>

            {/* Row 1 */}
            <div className="border-border/60 grid grid-cols-[100px_1.5fr_1.2fr_1.5fr] border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                19 Oct
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm font-medium">
                {renderListening17Test2TableQuestion(8, '8. ____')}
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                Village hall
              </div>
              <div className="flex items-center justify-center px-4 py-5 text-center text-sm">
                providing refreshments
              </div>
            </div>

            {/* Row 2 */}
            <div className="border-border/60 grid grid-cols-[100px_1.5fr_1.2fr_1.5fr] border-b">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                18 Nov
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                dance
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                Village hall
              </div>
              <div className="flex items-center justify-center px-4 py-5 text-center text-sm">
                {renderListening17Test2TableQuestion(9, 'checking 9. ____')}
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-[100px_1.5fr_1.2fr_1.5fr]">
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                31 Dec
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                New Year’s Eve party
              </div>
              <div className="border-border/60 flex items-center justify-center border-r px-4 py-5 text-center text-sm">
                Mountfort Hotel
              </div>
              <div className="flex items-center justify-center px-4 py-5 text-center text-sm">
                {renderListening17Test2TableQuestion(10, 'designing the 10. ____')}
              </div>
            </div>
          </div>
        ) : shouldRenderListeningTest3ShoppingTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 border-b px-4 py-5 text-center text-sm font-black">
              Shopping
            </div>

            <div className="border-border/60 grid grid-cols-3 border-b text-center text-sm">
              <div className="border-border/60 border-r px-4 py-4" />
              <div className="border-border/60 border-r px-4 py-4">To buy</div>
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

            <div className="text-primary text-center text-xl leading-none font-black">
              ?
            </div>

            <div className="border-border/60 bg-background/60 rounded-2xl border px-4 py-5 text-center shadow-sm">
              {renderListeningTest3FlowQuestion(
                27,
                'Divide the mice into two groups, each with a different 27 ____',
              )}
            </div>

            <div className="text-primary text-center text-xl leading-none font-black">
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

            <div className="text-primary text-center text-xl leading-none font-black">
              ?
            </div>

            <div className="border-border/60 bg-background/60 space-y-4 rounded-2xl border px-4 py-5 text-center text-sm shadow-sm">
              <p>Take measurements using an electronic scale.</p>
              {renderListeningTest3FlowQuestion(
                29,
                'Place them in a weighing chamber to prevent 29 ____',
              )}
            </div>

            <div className="text-primary text-center text-xl leading-none font-black">
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
                  const shouldHideGeneral18Test2MergedExtraRow =
                    shouldUseGeneral18Test2Questions28To31Prompts &&
                    block.questionNumbers[0] === 28 &&
                    block.questionNumbers.includes(40) &&
                    item.qNum > 31;

                  if (shouldHideGeneral18Test2MergedExtraRow) {
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
                  const scopedDisplayPrompt =
                    shouldUseGeneral18Test2Questions28To31Prompts &&
                    general18Test2Questions28To31Prompts.has(item.qNum)
                      ? general18Test2Questions28To31Prompts.get(item.qNum)!
                      : shouldUseGeneral18Test3Questions28To33Prompts &&
                          general18Test3Questions28To33Prompts.has(item.qNum)
                        ? general18Test3Questions28To33Prompts.get(item.qNum)!
                        : shouldUseGeneral18Test2Questions32To35Prompts &&
                            general18Test2Questions32To35Prompts.has(item.qNum)
                          ? general18Test2Questions32To35Prompts.get(item.qNum)!
                          : shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 &&
                              general18Test2Question22To27Prompts.has(item.qNum)
                            ? general18Test2Question22To27Prompts.get(
                                item.qNum,
                              )!
                            : shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 &&
                                general18Test3Question15To20Prompts.has(
                                  item.qNum,
                                )
                              ? general18Test3Question15To20Prompts.get(
                                  item.qNum,
                                )!
                              : shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
                                  listeningTest2Question1To6Prompts.has(
                                    item.qNum,
                                  )
                                ? listeningTest2Question1To6Prompts.get(
                                    item.qNum,
                                  )!
                                : shouldShowPromptTextWhenBlankForListeningTest4Questions15To18 &&
                                    listeningTest4Question15To18Prompts.has(
                                      item.qNum,
                                    )
                                  ? listeningTest4Question15To18Prompts.get(
                                      item.qNum,
                                    )!
                                  : shouldShowPromptTextWhenBlankForListeningTest4Questions26To30 &&
                                      listeningTest4Question26To30Prompts.has(
                                        item.qNum,
                                      )
                                    ? listeningTest4Question26To30Prompts.get(
                                        item.qNum,
                                      )!
                                    : displayPrompt;
                  const scopedChoices =
                    shouldUseGeneral18Test2Questions32To35Prompts &&
                    general18Test2Questions32To35Choices.has(item.qNum)
                      ? general18Test2Questions32To35Choices.get(item.qNum)!
                      : block.choices;

                  return (
                    <QuestionRow
                      key={`${block.header}-${groupIdx}-${block.questionNumbers.join(
                        '-',
                      )}-${item.qNum}-${itemIdx}`}
                      qNum={item.qNum}
                      prompt={scopedDisplayPrompt}
                      choices={scopedChoices}
                      pairedQuestionNumbers={
                        isPairedListeningChoiceBlock
                          ? pairedChoiceQuestionNumbers
                          : []
                      }
                      showPrompt={true}
                      showPromptTextWhenBlank={
                        shouldShowPromptTextWhenBlank ||
                        shouldRenderInlineBlankPromptForAcademic18Test1Questions1To3 ||
                        shouldRenderInlineBlankPromptForAcademic18Test1Questions22To26 ||
                        shouldShowPromptTextWhenBlankForQuestions15To21 ||
                        shouldShowPromptTextWhenBlankForGeneralTest2Questions1To7 ||
                        shouldShowPromptTextWhenBlankForGeneralTest2Questions32To35 ||
                        shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 ||
                        shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 ||
                        shouldShowPromptTextWhenBlankForGeneralTest3Questions1To8 ||
                        shouldShowPromptTextWhenBlankForGeneralTest3Questions9To14 ||
                        shouldShowPromptTextWhenBlankForGeneralTest3Questions33To36 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions1To5 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions25To27 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions31To36 ||
                        shouldShowPromptTextWhenBlankForAcademicTest2Questions14To18 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions14To17 ||
                        shouldShowPromptTextWhenBlankForAcademicTest4Questions14To17 ||
                        shouldShowPromptTextWhenBlankForAcademicTest4Questions18To23 ||
                        shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions23To26 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions31To34 ||
                        shouldRenderInlineBlankPromptForGeneral18Test4Questions35To40 ||
                        (shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
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
                          item.qNum <= 30) ||
                        shouldRenderInlineBlankPromptForListening17Test2Questions1To7
                      }
                      inlineBlankPrompt={
                        shouldRenderInlineBlankPromptForAcademic18Test1Questions1To3 ||
                        shouldRenderInlineBlankPromptForAcademic18Test1Questions22To26 ||
                        shouldRenderInlineBlankPromptForQuestions15To21 ||
                        shouldRenderInlineBlankPromptForQuestions28To32 ||
                        shouldRenderInlineBlankPromptForGeneralTest2Questions21To27 ||
                        shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 ||
                        shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 ||
                        shouldRenderInlineBlankPromptForGeneralTest3Questions22To27 ||
                        shouldRenderInlineBlankPromptForAcademicTest2Questions19To22 ||
                        shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                        shouldRenderInlineBlankPromptForListeningQuestions16To20 ||
                        shouldRenderInlineBlankPromptForListeningQuestions25To30 ||
                        shouldRenderInlineBlankPromptForListening18Test2Questions15To20 ||
                        shouldRenderInlineBlankPromptForGeneral18Test4Questions35To40 ||
                        shouldRenderInlineBlankPromptForListening18Test3Questions1To4 ||
                        shouldRenderInlineBlankPromptForListening17Test2Questions1To7 ||
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
                (isPairedListeningChoiceBlock ||
                  shouldInlinePairedReadingChoicePrompt) &&
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
                      const shouldHideGeneral18Test2MergedExtraRow =
                        shouldUseGeneral18Test2Questions28To31Prompts &&
                        block.questionNumbers[0] === 28 &&
                        block.questionNumbers.includes(40) &&
                        item.qNum > 31;

                      if (shouldHideGeneral18Test2MergedExtraRow) {
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
                      const scopedDisplayPrompt =
                        shouldUseGeneral18Test2Questions28To31Prompts &&
                        general18Test2Questions28To31Prompts.has(item.qNum)
                          ? general18Test2Questions28To31Prompts.get(item.qNum)!
                          : shouldUseGeneral18Test3Questions28To33Prompts &&
                              general18Test3Questions28To33Prompts.has(
                                item.qNum,
                              )
                            ? general18Test3Questions28To33Prompts.get(
                                item.qNum,
                              )!
                            : shouldUseGeneral18Test2Questions32To35Prompts &&
                                general18Test2Questions32To35Prompts.has(
                                  item.qNum,
                                )
                              ? general18Test2Questions32To35Prompts.get(
                                  item.qNum,
                                )!
                              : shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 &&
                                  general18Test2Question22To27Prompts.has(
                                    item.qNum,
                                  )
                                ? general18Test2Question22To27Prompts.get(
                                    item.qNum,
                                  )!
                                : shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 &&
                                    general18Test3Question15To20Prompts.has(
                                      item.qNum,
                                    )
                                  ? general18Test3Question15To20Prompts.get(
                                      item.qNum,
                                    )!
                                  : shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
                                      listeningTest2Question1To6Prompts.has(
                                        item.qNum,
                                      )
                                    ? listeningTest2Question1To6Prompts.get(
                                        item.qNum,
                                      )!
                                    : shouldShowPromptTextWhenBlankForListeningTest4Questions15To18 &&
                                        listeningTest4Question15To18Prompts.has(
                                          item.qNum,
                                        )
                                      ? listeningTest4Question15To18Prompts.get(
                                          item.qNum,
                                        )!
                                      : shouldShowPromptTextWhenBlankForListeningTest4Questions26To30 &&
                                          listeningTest4Question26To30Prompts.has(
                                            item.qNum,
                                          )
                                        ? listeningTest4Question26To30Prompts.get(
                                            item.qNum,
                                          )!
                                        : displayPrompt;
                      const scopedChoices =
                        shouldUseGeneral18Test2Questions32To35Prompts &&
                        general18Test2Questions32To35Choices.has(item.qNum)
                          ? general18Test2Questions32To35Choices.get(item.qNum)!
                          : block.choices;

                      return (
                        <QuestionRow
                          key={`${block.header}-${groupIdx}-${blockGroupIdx}-${item.qNum}-${itemIdx}`}
                          qNum={item.qNum}
                          prompt={scopedDisplayPrompt}
                          choices={scopedChoices}
                          showPromptTextWhenBlank={
                            shouldShowPromptTextWhenBlank ||
                            shouldRenderInlineBlankPromptForAcademic18Test1Questions1To3 ||
                            shouldRenderInlineBlankPromptForAcademic18Test1Questions22To26 ||
                            shouldShowPromptTextWhenBlankForQuestions15To21 ||
                            shouldShowPromptTextWhenBlankForGeneralTest2Questions1To7 ||
                            shouldShowPromptTextWhenBlankForGeneralTest2Questions32To35 ||
                            shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 ||
                            shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 ||
                            shouldShowPromptTextWhenBlankForGeneralTest3Questions1To8 ||
                            shouldShowPromptTextWhenBlankForGeneralTest3Questions9To14 ||
                            shouldShowPromptTextWhenBlankForGeneralTest3Questions33To36 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions1To5 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions25To27 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions31To36 ||
                            shouldShowPromptTextWhenBlankForAcademicTest2Questions14To18 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions14To17 ||
                            shouldShowPromptTextWhenBlankForAcademicTest4Questions14To17 ||
                            shouldShowPromptTextWhenBlankForAcademicTest4Questions18To23 ||
                            shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions23To26 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions31To34 ||
                            shouldRenderInlineBlankPromptForGeneral18Test4Questions35To40 ||
                            (shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
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
                              item.qNum <= 30) ||
                            shouldRenderInlineBlankPromptForListening17Test2Questions1To7
                          }
                          inlineBlankPrompt={
                            shouldRenderInlineBlankPromptForAcademic18Test1Questions1To3 ||
                            shouldRenderInlineBlankPromptForAcademic18Test1Questions22To26 ||
                            shouldRenderInlineBlankPromptForQuestions15To21 ||
                            shouldRenderInlineBlankPromptForQuestions28To32 ||
                            shouldRenderInlineBlankPromptForGeneralTest2Questions21To27 ||
                            shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 ||
                            shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 ||
                            shouldRenderInlineBlankPromptForGeneralTest3Questions22To27 ||
                            shouldRenderInlineBlankPromptForAcademicTest2Questions19To22 ||
                            shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                            shouldRenderInlineBlankPromptForListeningQuestions16To20 ||
                            shouldRenderInlineBlankPromptForListeningQuestions25To30 ||
                            shouldRenderInlineBlankPromptForListening18Test2Questions15To20 ||
                            shouldRenderInlineBlankPromptForGeneral18Test4Questions35To40 ||
                            shouldRenderInlineBlankPromptForListening18Test3Questions1To4 ||
                            shouldRenderInlineBlankPromptForListening17Test2Questions1To7 ||
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
