'use client';

import { useMemo } from 'react';

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
  renderGeneral17Test1PlacesTable,
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

function QanatDiagram() {
  return (
    <div className="flex flex-col gap-6">
      <div className="border-border/60 bg-background/70 overflow-hidden rounded-2xl border p-4 shadow-sm">
        <img
          src="/images/ielts/diagram-test-16-qanat-roman.jpg"
          alt="Cross-section of a Roman Qanat Shaft"
          className="h-auto w-full rounded-xl object-contain"
        />
      </div>
      <div className="border-border/60 bg-background/70 overflow-hidden rounded-2xl border p-4 shadow-sm">
        <img
          src="/images/ielts/diagram-test-16-qanat-persian.jpg"
          alt="The Persian Qanat Method"
          className="h-auto w-full rounded-xl object-contain"
        />
      </div>
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
  const sanitizedGroup = useMemo(() => {
    return group.map((block: any) => {
      if (!block || !block.items) {
        return block;
      }
      return {
        ...block,
        items: block.items.map((item: any) => {
          if (!item || !item.prompt) {
            return item;
          }
          return {
            ...item,
            prompt: item.prompt.replace(
              /Paragraph\s*\r?\n\s*([A-Za-z\d]+)/gi,
              'Paragraph $1',
            ),
          };
        }),
      };
    });
  }, [group]);

  const [primaryBlock, ...continuationBlocks] = sanitizedGroup;
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

  const shouldRenderAcademic15Test1NutmegTable =
    !isListening &&
    /Cambridge 15 IELTS Academic Reading Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 8 &&
    groupLastQuestion === 13;

  const shouldRenderAcademic15Test4HuarangoTable =
    !isListening &&
    /Cambridge 15 IELTS Academic Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 6 &&
    groupLastQuestion === 8;

  const shouldRenderGeneral15Test2DangerTable =
    !isListening &&
    /Cambridge 15 IELTS General Reading Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 15 &&
    groupLastQuestion === 20;

  const shouldRenderListening15Test1TimetableTable =
    isListening &&
    /Cambridge 15 Listening Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 15 &&
    groupLastQuestion === 20;

  const shouldRenderListening14Test1CrimeReportForm =
    isListening &&
    /Cambridge 14 Listening Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 10;

  const shouldRenderListening14Test2PatientDetailsForm =
    isListening &&
    /Cambridge 14 Listening Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 10;

  const shouldRenderListening14Test3HotelForm =
    isListening &&
    /Cambridge 14 Listening Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 10;

  const shouldRenderListening14Test4BookingForm =
    isListening &&
    /Cambridge 14 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 7;

  const shouldRenderAcademic13Test1TourismTable =
    !isListening &&
    /Cambridge 13 IELTS Academic Reading Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 7;

  const shouldRenderAcademic13Test2CinnamonTable =
    !isListening &&
    /Cambridge 13 IELTS Academic Reading Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 9;

  const shouldRenderAcademic13Test3CoconutTable =
    !isListening &&
    /Cambridge 13 IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 8;

  const shouldRenderInlineBlankPromptForGeneral16 =
    !isListening &&
    /Cambridge 16 IELTS General Reading Test/i.test(testTitle ?? '') &&
    groupFirstQuestion === 21 &&
    groupLastQuestion === 27 &&
    (primaryBlock.choices?.length ?? 0) === 0;

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

  const shouldRenderAcademic16Test4QanatDiagram =
    !isListening &&
    /Cambridge 16.*Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 6;

  const shouldRenderGeneral16Test1InjuriesTable =
    !isListening &&
    /Cambridge 16 IELTS General Reading Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 15 &&
    groupLastQuestion === 20;

  const shouldRenderListening16Test1StevensonTable =
    isListening &&
    /Cambridge 16 Listening Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 15 &&
    groupLastQuestion === 20;

  const shouldRenderListening13Test1CookeryTable =
    isListening &&
    /Cambridge 13 Listening Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 10;

  const shouldRenderListening13Test2SouthCityClubForm =
    isListening &&
    /Cambridge 13 Listening Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 10;

  const shouldRenderListening13Test3BanfordCityForm =
    isListening &&
    /Cambridge 13 Listening Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 10;

  const shouldRenderListening13Test3SleepyLizardForm =
    isListening &&
    /Cambridge 13 Listening Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 31 &&
    groupLastQuestion === 40;

  const shouldRenderListening13Test4AlexTrainingForm =
    isListening &&
    /Cambridge 13 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 10;

  const shouldRenderListening19Test2GuitarGroupForm =
    isListening &&
    /Cambridge 19 Listening Test 2/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 1 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      6 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderListening13Test1Questions26To30Flowchart =
    isListening &&
    /Cambridge 13 Listening Test 1/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 26 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      30 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderListening16Test4RecreationTable =
    isListening &&
    /Cambridge 16 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 15 &&
    groupLastQuestion === 20;

  const shouldRenderListening15Test2FestivalTable =
    isListening &&
    /Cambridge 15 Listening Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 4;

  const shouldRenderListening16Test4CitiesTable =
    isListening &&
    /Cambridge 16 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 25 &&
    groupLastQuestion === 30;

  const shouldRenderListening16Test1PicturesTable =
    isListening &&
    /Cambridge 16 Listening Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 25 &&
    groupLastQuestion === 30;

  const listening16Test1StevensonInstructionText =
    'Label the map below.\nWrite the correct letter, A-J, next to Questions 15-20.';

  const listening16Test4RecreationInstructionText =
    'Label the map below.\nWrite the correct letter, A-I, next to Questions 15-20.';

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
    testTitle,
  };

  const renderedNoteBlock = renderStructuredNoteBlock(
    primaryBlock,
    groupIdx,
    renderDeps,
  );

  if (
    renderedNoteBlock &&
    !shouldRenderGeneral16Test1InjuriesTable &&
    !shouldRenderListening16Test1StevensonTable &&
    !shouldRenderListening16Test4RecreationTable &&
    !shouldRenderListening15Test2FestivalTable &&
    !shouldRenderAcademic15Test1NutmegTable &&
    !shouldRenderAcademic15Test4HuarangoTable &&
    !shouldRenderGeneral15Test2DangerTable &&
    !shouldRenderListening15Test1TimetableTable &&
    !shouldRenderListening13Test1CookeryTable &&
    !shouldRenderListening13Test2SouthCityClubForm &&
    !shouldRenderListening13Test3BanfordCityForm &&
    !shouldRenderListening13Test3SleepyLizardForm &&
    !shouldRenderListening13Test4AlexTrainingForm &&
    !shouldRenderListening19Test2GuitarGroupForm &&
    !shouldRenderListening13Test1Questions26To30Flowchart &&
    !shouldRenderListening14Test1CrimeReportForm &&
    !shouldRenderListening14Test2PatientDetailsForm &&
    !shouldRenderListening14Test3HotelForm &&
    !shouldRenderListening14Test4BookingForm &&
    !shouldRenderAcademic13Test1TourismTable &&
    !shouldRenderAcademic13Test2CinnamonTable &&
    !shouldRenderAcademic13Test3CoconutTable &&
    !shouldRenderInlineBlankPromptForGeneral16
  ) {
    return renderedNoteBlock;
  }

  const renderedSummaryBlock = renderStructuredSummaryBlock(
    primaryBlock,
    groupIdx,
    renderDeps,
  );

  if (
    renderedSummaryBlock &&
    !shouldRenderGeneral16Test1InjuriesTable &&
    !shouldRenderListening16Test1StevensonTable &&
    !shouldRenderListening16Test4RecreationTable &&
    !shouldRenderListening15Test2FestivalTable &&
    !shouldRenderAcademic15Test1NutmegTable &&
    !shouldRenderAcademic15Test4HuarangoTable &&
    !shouldRenderGeneral15Test2DangerTable &&
    !shouldRenderListening15Test1TimetableTable &&
    !shouldRenderListening13Test1CookeryTable &&
    !shouldRenderListening13Test2SouthCityClubForm &&
    !shouldRenderListening13Test3BanfordCityForm &&
    !shouldRenderListening13Test3SleepyLizardForm &&
    !shouldRenderListening13Test4AlexTrainingForm &&
    !shouldRenderListening19Test2GuitarGroupForm &&
    !shouldRenderListening13Test1Questions26To30Flowchart &&
    !shouldRenderListening14Test1CrimeReportForm &&
    !shouldRenderListening14Test2PatientDetailsForm &&
    !shouldRenderListening14Test3HotelForm &&
    !shouldRenderListening14Test4BookingForm &&
    !shouldRenderAcademic13Test1TourismTable &&
    !shouldRenderAcademic13Test2CinnamonTable &&
    !shouldRenderAcademic13Test3CoconutTable &&
    !shouldRenderInlineBlankPromptForGeneral16
  ) {
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
  const contentHeading = (primaryBlock.contentHeading?.trim() ?? '').replace(
    /^(?:[A-D],\s*)*[A-D]\s*(?:or|and)\s*[A-D]\s*/i,
    '',
  );
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
      (/Cambridge 17 IELTS Academic Reading Test [14]/i.test(testTitle ?? '') &&
        [23, 25].includes(primaryBlock.questionNumbers[0] ?? 0)) ||
      (/Cambridge 16 IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
        [23, 25].includes(primaryBlock.questionNumbers[0] ?? 0)) ||
      (/Cambridge 16 IELTS Academic Reading Test 1/i.test(testTitle ?? '') &&
        [25].includes(primaryBlock.questionNumbers[0] ?? 0)) ||
      (/Cambridge 15 IELTS Academic Reading Test 1/i.test(testTitle ?? '') &&
        [23, 25].includes(primaryBlock.questionNumbers[0] ?? 0)) ||
      (/Cambridge 17 IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
        [21].includes(primaryBlock.questionNumbers[0] ?? 0)) ||
      (/Cambridge 14 IELTS Academic Reading Test 1/i.test(testTitle ?? '') &&
        [19, 21].includes(primaryBlock.questionNumbers[0] ?? 0)) ||
      (/Cambridge 14 IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
        [21].includes(primaryBlock.questionNumbers[0] ?? 0)) ||
      (/Cambridge 14 IELTS Academic Reading Test 4/i.test(testTitle ?? '') &&
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
    isListening17Test2Q8to10 ||
    shouldRenderAcademic15Test1NutmegTable ||
    shouldRenderAcademic15Test4HuarangoTable ||
    shouldRenderGeneral15Test2DangerTable ||
    shouldRenderListening15Test1TimetableTable ||
    shouldRenderListening13Test1CookeryTable ||
    shouldRenderListening13Test2SouthCityClubForm ||
    shouldRenderListening13Test3BanfordCityForm ||
    shouldRenderListening13Test3SleepyLizardForm ||
    shouldRenderListening13Test4AlexTrainingForm ||
    shouldRenderListening19Test2GuitarGroupForm ||
    shouldRenderListening13Test1Questions26To30Flowchart ||
    shouldRenderListening14Test1CrimeReportForm ||
    shouldRenderListening14Test2PatientDetailsForm ||
    shouldRenderListening14Test3HotelForm ||
    shouldRenderListening14Test4BookingForm ||
    shouldRenderAcademic13Test1TourismTable ||
    shouldRenderAcademic13Test2CinnamonTable ||
    shouldRenderAcademic13Test3CoconutTable ||
    (isListening &&
      /Cambridge 14 Listening Test 2/i.test(testTitle ?? '') &&
      groupFirstQuestion === 16 &&
      groupLastQuestion === 20) ||
    shouldRenderInlineBlankPromptForGeneral16
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
  const shouldShowPromptTextWhenBlankForGeneral15Test1Questions23To27 =
    !isListening &&
    /Cambridge 15 IELTS General Reading Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 23 &&
    groupLastQuestion === 27;
  const shouldShowPromptTextWhenBlankForGeneral15Test3Questions15To20 =
    !isListening &&
    /Cambridge 15 IELTS General Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 15 &&
    groupLastQuestion === 20;
  const shouldShowPromptTextWhenBlankForAcademic14Test2Questions35To37 =
    !isListening &&
    /Cambridge 14 IELTS Academic Reading Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 35 &&
    groupLastQuestion === 37;
  const shouldShowPromptTextWhenBlankForGeneralTest3Questions33To36 =
    !isListening &&
    /Cambridge 19 IELTS General Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 33 &&
    groupLastQuestion === 36;
  const shouldShowPromptTextWhenBlankForGeneralTest4Questions1To5 =
    !isListening &&
    /IELTS General Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 5;
  const shouldShowPromptTextWhenBlankForGeneralTest4Questions15To20 =
    !isListening &&
    /IELTS General Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 15 &&
    groupLastQuestion === 20;
  const shouldShowPromptTextWhenBlankForGeneralTest4Questions25To27 =
    !isListening &&
    /IELTS General Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 25 &&
    groupLastQuestion === 27;
  const shouldShowPromptTextWhenBlankForGeneralTest4Questions31To36 =
    !isListening &&
    /IELTS General Reading Test 4/i.test(testTitle ?? '') &&
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
  const shouldShowPromptTextWhenBlankForAcademicTest4Questions11To13 =
    !isListening &&
    /IELTS Academic Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 11 &&
    groupLastQuestion === 13;
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
  const shouldShowPromptTextWhenBlankForAcademicTest3Questions38To40 =
    !isListening &&
    /IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 38 &&
    groupLastQuestion === 40;
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

  const shouldRenderInlineBlankPromptForListening13Test1Questions14To20 =
    isListening &&
    /Cambridge 13 Listening Test 1/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 14 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      20 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldRenderInlineBlankPromptForListening16Test3Questions15To20 =
    isListening &&
    /Cambridge 16 Listening Test 3/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 15 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      20 &&
    (primaryBlock.choices?.length ?? 0) === 0;
  const shouldRenderInlineBlankPromptForListening18Test2Questions15To20 =
    isListening &&
    /Cambridge 18 Listening Test 2/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 15 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      20 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForListening15Test2Questions15To20 =
    isListening &&
    /Cambridge 15 Listening Test 2/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 15 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      20 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForListening15Test2Questions25To30 =
    isListening &&
    /Cambridge 15 Listening Test 2/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 25 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      30 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForListening15Test3Questions27To30 =
    isListening &&
    /Cambridge 15 Listening Test 3/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers[0] === 27 &&
    primaryBlock.questionNumbers[primaryBlock.questionNumbers.length - 1] ===
      30 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForListening15Test4Questions11To16 =
    isListening &&
    /Cambridge 15 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 11 &&
    groupLastQuestion === 16 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForListening15Test4Questions25To30 =
    isListening &&
    /Cambridge 15 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 25 &&
    groupLastQuestion === 30 &&
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

  const shouldRenderInlineBlankPromptForAcademic17Test2Questions24To26 =
    !isListening &&
    /Cambridge 17 IELTS Academic Reading Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 24 &&
    groupLastQuestion === 26 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForGeneral17 =
    !isListening &&
    /Cambridge 17 IELTS General Reading Test/i.test(testTitle ?? '') &&
    ((groupFirstQuestion === 11 && groupLastQuestion === 14) ||
      (groupFirstQuestion === 15 && groupLastQuestion === 20) ||
      (groupFirstQuestion === 21 && groupLastQuestion === 27) ||
      (groupFirstQuestion === 22 && groupLastQuestion === 27)) &&
    (primaryBlock.choices?.length ?? 0) === 0;



  const shouldRenderInlineBlankPromptForAcademic17Test3Questions23To26 =
    !isListening &&
    /Cambridge 17 IELTS Academic Reading Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 23 &&
    groupLastQuestion === 26 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderAcademic18Test1Table =
    !isListening &&
    /Cambridge 18 IELTS Academic Reading Test 1/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers.includes(4) &&
    primaryBlock.questionNumbers.includes(7);

  const shouldRenderAcademic17Test4Table =
    !isListening &&
    /Cambridge 17 IELTS Academic Reading Test 4/i.test(testTitle ?? '') &&
    primaryBlock.questionNumbers.includes(7) &&
    primaryBlock.questionNumbers.includes(13);

  const shouldRenderInlineBlankPromptForGeneral18Test4Questions35To40 =
    !isListening &&
    /Cambridge 18 IELTS General Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 35 &&
    groupLastQuestion === 40 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const shouldRenderInlineBlankPromptForAcademic16Test1Questions8To13 =
    !isListening &&
    /Cambridge 16.*Reading Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 8 &&
    groupLastQuestion === 13;

  const shouldRenderInlineBlankPromptForAcademic16Test4Questions1To6 =
    !isListening &&
    /Cambridge 16.*Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 6;

  const shouldRenderInlineBlankPromptForAcademic13Test4Questions9To13 =
    !isListening &&
    /Cambridge 13 IELTS Academic Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 9 &&
    groupLastQuestion === 13;

  const academic16Test4Questions1To6Prompts = new Map<number, string>([
    [1, '1. ____ to direct the tunnelling'],
    [2, 'water runs into a 2. ____ used by local people'],
    [3, 'vertical shafts to remove earth and for 3. ____'],
    [4, '4. ____ made of wood or stone'],
    [5, '5. ____ attached to the plumb line'],
    [6, 'handholds and footholds used for 6. ____'],
  ]);

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

  const shouldShowPromptTextWhenBlankForListening15Test4Questions1To10 =
    isListening &&
    /Cambridge 15 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 10 &&
    (primaryBlock.choices?.length ?? 0) === 0;

  const listening15Test4Question1To10Prompts = new Map<number, string>([
    [1, 'Occupation: 1. ____'],
    [2, 'Reason for travel today: 2. ____'],
    [3, 'Name of station returning to: 3. ____'],
    [4, 'Type of ticket purchased: Standard 4. ____ ticket'],
    [5, 'Cost of ticket: 5. £ ____'],
    [6, 'Where ticket was bought: 6. ____'],
    [7, 'Least satisfied with: the 7. ____ this morning.'],
    [8, 'Most satisfied with: how much 8. ____ was provided'],
    [9, 'Least satisfied with: lack of seats, particularly on the 9. ____'],
    [10, 'Neither satisfied nor dissatisfied with: the 10. ____ available'],
  ]);

  const listening15Test4Question1To10Rows = Array.from(
    listening15Test4Question1To10Prompts.entries(),
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

  const shouldShowPromptTextWhenBlankForListening14Test1Questions15To20 =
    isListening &&
    /Cambridge 14 Listening Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 15 &&
    groupLastQuestion === 20;

  const shouldShowPromptTextWhenBlankForListening14Test1Questions26To30 =
    isListening &&
    /Cambridge 14 Listening Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 26 &&
    groupLastQuestion === 30;

  const shouldShowPromptTextWhenBlankForListening14Test2Questions16To20 =
    isListening &&
    /Cambridge 14 Listening Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 16 &&
    groupLastQuestion === 20;

  const shouldShowPromptTextWhenBlankForListening14Test2Questions25To30 =
    isListening &&
    /Cambridge 14 Listening Test 2/i.test(testTitle ?? '') &&
    groupFirstQuestion === 25 &&
    groupLastQuestion === 30;

  const shouldShowPromptTextWhenBlankForListening14Test3Questions15To20 =
    isListening &&
    /Cambridge 14 Listening Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 15 &&
    groupLastQuestion === 20;

  const shouldShowPromptTextWhenBlankForListening14Test3Questions27To30 =
    isListening &&
    /Cambridge 14 Listening Test 3/i.test(testTitle ?? '') &&
    groupFirstQuestion === 27 &&
    groupLastQuestion === 30;

  const shouldShowPromptTextWhenBlankForListening14Test4Questions11To16 =
    isListening &&
    /Cambridge 14 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 11 &&
    groupLastQuestion === 20;

  const shouldShowPromptTextWhenBlankForListening14Test4Questions26To30 =
    isListening &&
    /Cambridge 14 Listening Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 26 &&
    groupLastQuestion === 30;

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

  const shouldRenderGeneral17Test1PlacesTable =
    !isListening &&
    /Cambridge 17 IELTS General Reading Test 1/i.test(testTitle ?? '') &&
    groupFirstQuestion === 1 &&
    groupLastQuestion === 5;

  const general17Test1PlacesInstructionText =
    shouldRenderGeneral17Test1PlacesTable
      ? primaryBlock.instructions
          .split('\n')
          .filter((line: string) => {
            const trimmed = line.trim();
            if (/^[A-H](?:\s|$)/i.test(trimmed)) {
              return false;
            }
            const lower = trimmed.toLowerCase();
            const placeNames = [
              'information desk',
              'green channel',
              'hotel reservation counter',
              'level two',
              'lost and found counter',
              'reception desk',
              'red channel',
              'baggage claim belt',
            ];
            if (placeNames.includes(lower)) {
              return false;
            }
            return true;
          })
          .join('\n')
      : primaryBlock.instructions;

  const shouldRenderGeneral17Test4PlumbersTable =
    !isListening &&
    /Cambridge 17 IELTS General Reading Test 4/i.test(testTitle ?? '') &&
    groupFirstQuestion === 22 &&
    groupLastQuestion === 27;

  const general17Test4PlumbersInstructionText = useMemo(() => {
    if (!shouldRenderGeneral17Test4PlumbersTable) {
      return '';
    }
    const lines = primaryBlock.instructions.split(/\r?\n/);
    const filteredLines = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        /^(?:The work of plumbers|Type of|plumber|Work-related issues|Skills\/Actions needed|Residential|· Working underfloor in a)/i.test(
          trimmed,
        )
      ) {
        break;
      }
      filteredLines.push(line);
    }
    return filteredLines.join('\n');
  }, [shouldRenderGeneral17Test4PlumbersTable, primaryBlock.instructions]);

  const general16Test1InjuriesInstructionText = useMemo(() => {
    if (!shouldRenderGeneral16Test1InjuriesTable) {
      return '';
    }
    const lines = primaryBlock.instructions.split(/\r?\n/);
    const filteredLines = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        /^(?:Risks and how to avoid them|Risk Factor|Examples of Farm Activities|Risk Reduction Measures to Consider|Heavy Loads|– Lifting sacks of)/i.test(
          trimmed,
        )
      ) {
        break;
      }
      filteredLines.push(line);
    }
    return filteredLines.join('\n');
  }, [shouldRenderGeneral16Test1InjuriesTable, primaryBlock.instructions]);

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
        : shouldRenderAcademic15Test1NutmegTable
          ? [
              'Complete the table below.',
              'Choose ONE WORD ONLY from the passage for each answer.',
              'Write your answers in boxes 8-13 on your answer sheet.',
            ].join('\n')
        : shouldRenderAcademic15Test4HuarangoTable
          ? [
              'Complete the table below.',
              'Choose NO MORE THAN TWO WORDS from the passage for each answer.',
              'Write your answers in boxes 6-8 on your answer sheet.',
            ].join('\n')
        : shouldRenderGeneral15Test2DangerTable
          ? [
              'Complete the table below.',
              'Choose ONE WORD ONLY from the text for each answer.',
              'Write your answers in boxes 15-20 on your answer sheet.',
            ].join('\n')
        : shouldRenderListening15Test1TimetableTable
          ? [
              'Complete the table below.',
              'Write ONE WORD AND/OR A NUMBER for each answer.',
            ].join('\n')
        : shouldRenderListening13Test1CookeryTable
          ? [
              'Complete the table below.',
              'Write ONE WORD AND/OR A NUMBER for each answer.',
            ].join('\n')
        : shouldRenderListening13Test1Questions26To30Flowchart
          ? [
              'Complete the flow-chart below.',
              'Choose FIVE answers from the box and write the correct letter, A-H, next to Questions 26-30.',
            ].join('\n')
        : shouldRenderListening13Test2SouthCityClubForm
          ? [
              'Complete the notes below.',
              'Write ONE WORD AND/OR A NUMBER for each answer.',
            ].join('\n')
        : shouldRenderListening13Test3BanfordCityForm
          ? [
              'Complete the notes below.',
              'Write ONE WORD AND/OR A NUMBER for each answer.',
            ].join('\n')
        : shouldRenderListening13Test3SleepyLizardForm
          ? [
              'Complete the notes below.',
              'Write ONE WORD ONLY for each answer.',
            ].join('\n')
        : shouldRenderListening13Test4AlexTrainingForm
          ? [
              'Complete the notes below.',
              'Write ONE WORD AND/OR A NUMBER for each answer.',
            ].join('\n')
        : shouldRenderListening19Test2GuitarGroupForm
          ? [
              'Complete the form below.',
              'Write ONE WORD AND/OR A NUMBER for each answer.',
            ].join('\n')
        : shouldRenderListening14Test1CrimeReportForm
          ? [
              'Complete the form below.',
              'Write ONE WORD AND/OR A NUMBER for each answer.',
            ].join('\n')
        : shouldRenderListening14Test2PatientDetailsForm
          ? [
              'Complete the notes below.',
              'Write ONE WORD AND/OR A NUMBER for each answer.',
            ].join('\n')
        : shouldRenderListening14Test3HotelForm
          ? [
              'Complete the notes below.',
              'Write ONE WORD AND/OR A NUMBER for each answer.',
            ].join('\n')
        : shouldRenderListening14Test4BookingForm
          ? [
              'Complete the notes below.',
              'Write ONE WORD AND/OR A NUMBER for each answer.',
            ].join('\n')
        : shouldRenderAcademic13Test1TourismTable
          ? [
              'Complete the table below.',
              'Choose ONE WORD ONLY from the passage for each answer.',
              'Write your answers in boxes 1-7 on your answer sheet.',
            ].join('\n')
        : shouldRenderAcademic13Test2CinnamonTable
          ? [
              'Complete the table below.',
              'Choose ONE WORD ONLY from the passage for each answer.',
              'Write your answers in boxes 1-9 on your answer sheet.',
            ].join('\n')
        : shouldRenderAcademic13Test3CoconutTable
          ? [
              'Complete the table below.',
              'Choose ONE WORD ONLY from the passage for each answer.',
              'Write your answers in boxes 1-8 on your answer sheet.',
            ].join('\n')
          : shouldRenderAcademic18Test1Table
            ? [
                'Complete the table below.',
                'Choose ONE WORD ONLY from the passage for each answer.',
              ].join('\n')
            : shouldRenderAcademic17Test4Table
              ? [
                  'Complete the table below.',
                  'Choose ONE WORD ONLY from the passage for each answer.',
                  'Write your answers in boxes 7-13 on your answer sheet.',
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
  const renderAcademic17Test4TableQuestion = (qNum: number, prompt: string) => (
    <QuestionRow
      key={`academic-17-test-4-table-${qNum}`}
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
  const renderListening13Test1FlowchartQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-13-test-1-flowchart-${qNum}`}
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

  const renderListening13Test1CookeryQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-13-test-1-cookery-${qNum}`}
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

  const renderListening13Test2SouthCityQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-13-test-2-southcity-${qNum}`}
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

  const renderListening13Test3BanfordQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-13-test-3-banford-${qNum}`}
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

  const renderListening13Test3LizardQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-13-test-3-lizard-${qNum}`}
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

  const renderListening13Test4AlexQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-13-test-4-alex-${qNum}`}
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

  const renderListening19Test2GuitarQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-19-test-2-guitar-${qNum}`}
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

  const renderListening15Test1TimetableQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-15-test-1-timetable-${qNum}`}
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

  const renderListening14Test1CrimeQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-14-test-1-crime-${qNum}`}
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

  const renderListening14Test2PatientQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-14-test-2-patient-${qNum}`}
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

  const renderListening14Test3HotelQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-14-test-3-hotel-${qNum}`}
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

  const renderListening14Test4BookingQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-14-test-4-booking-${qNum}`}
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

  const renderAcademic13Test1TourismQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`academic-13-test-1-tourism-${qNum}`}
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

  const renderAcademic13Test2CinnamonQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`academic-13-test-2-cinnamon-${qNum}`}
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

  const renderAcademic13Test3CoconutQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`academic-13-test-3-coconut-${qNum}`}
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

  const renderGeneral15Test2DangerQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`general-15-test-2-danger-${qNum}`}
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

  const renderAcademic15Test4HuarangoQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`academic-15-test-4-huarango-${qNum}`}
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

  const renderAcademic15Test1NutmegQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`academic-15-test-1-nutmeg-${qNum}`}
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

  const renderGeneral17Test4PlumbersQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`general-17-test-4-plumbers-${qNum}`}
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

  const renderListening15Test4FormQuestion = (qNum: number, prompt: string) => (
    <QuestionRow
      key={`listening-15-test-4-form-${qNum}`}
      qNum={qNum}
      prompt={prompt}
      choices={[]}
      showPrompt={true}
      showPromptTextWhenBlank={true}
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

  const renderListening15Test2FestivalQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-15-test-2-festival-${qNum}`}
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

  const renderGeneral16Test1InjuriesQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`general-16-test-1-injuries-${qNum}`}
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

  const renderListening16Test1StevensonQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-16-test-1-stevenson-${qNum}`}
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

  const renderListening16Test1PicturesQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-16-test-1-pictures-${qNum}`}
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

  const renderListening16Test4CitiesQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-16-test-4-cities-${qNum}`}
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

  const renderListening16Test4RecreationQuestion = (
    qNum: number,
    prompt: string,
  ) => (
    <QuestionRow
      key={`listening-16-test-4-recreation-${qNum}`}
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
              shouldRenderListening16Test1StevensonTable
                ? listening16Test1StevensonInstructionText
                : shouldRenderListening16Test4RecreationTable
                  ? listening16Test4RecreationInstructionText
                  : shouldRenderGeneral16Test1InjuriesTable
                    ? general16Test1InjuriesInstructionText
                    : shouldRenderGeneral17Test4PlumbersTable
                      ? general17Test4PlumbersInstructionText
                      : shouldRenderGeneral17Test1PlacesTable
                        ? general17Test1PlacesInstructionText
                        : shouldInlinePairedListeningPrompt
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

            {shouldRenderGeneral17Test1PlacesTable &&
              renderGeneral17Test1PlacesTable()}
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        {isListening18Test3Q1to4 ? (
          <div className="border-border/60 bg-muted/10 mx-auto w-full max-w-xl space-y-4 rounded-2xl border p-5 shadow-sm">
            <div className="space-y-1 text-center">
              <h4 className="text-foreground text-lg font-extrabold tracking-wide uppercase">
                Wayside Camera Club
              </h4>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                membership form
              </p>
            </div>
            <div className="border-border/40 my-3 border-t" />
            <div className="grid grid-cols-[140px_1fr] gap-y-3 px-2 text-sm">
              <div className="text-muted-foreground flex items-center font-semibold">
                Name:
              </div>
              <div className="text-foreground bg-muted/30 border-border/40 rounded-lg border px-3 py-1.5 font-extrabold">
                Dan Green
              </div>
              <div className="text-muted-foreground flex items-center font-semibold">
                Email address:
              </div>
              <div className="text-foreground bg-muted/30 border-border/40 rounded-lg border px-3 py-1.5 font-extrabold">
                dan1068@market.com
              </div>
            </div>
          </div>
        ) : null}

        {shouldRenderGeneral18Test3RoadDiagram ? (
          <RoadConstructionDiagram />
        ) : null}

        {shouldRenderAcademic16Test4QanatDiagram ? <QanatDiagram /> : null}

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

        {shouldShowPromptTextWhenBlankForListening15Test4Questions1To10 ? (
          <div className="border-border/60 bg-background/50 space-y-6 rounded-3xl border p-6 shadow-sm">
            {/* Header 1 */}
            <div className="space-y-1">
              <h3 className="text-foreground text-[16px] font-extrabold tracking-tight">
                Customer Satisfaction Survey
              </h3>
              <h4 className="text-muted-foreground text-[13px] font-semibold tracking-wider uppercase">
                Customer details
              </h4>
            </div>

            {/* Static Text: Name */}
            <div className="text-foreground/80 text-sm font-medium">
              Name: Sophie Bird
            </div>

            {/* Q1 & Q2 */}
            <div className="space-y-4 border-t pt-4">
              {renderListening15Test4FormQuestion(1, 'Occupation: 1. ____')}
              {renderListening15Test4FormQuestion(
                2,
                'Reason for travel today: 2. ____',
              )}
            </div>

            {/* Header 2 */}
            <div className="border-t pt-4">
              <h4 className="text-muted-foreground text-[13px] font-semibold tracking-wider uppercase">
                Journey information
              </h4>
            </div>

            {/* Q3, Q4, Q5 */}
            <div className="space-y-4">
              {renderListening15Test4FormQuestion(
                3,
                'Name of station returning to: 3. ____',
              )}
              {renderListening15Test4FormQuestion(
                4,
                'Type of ticket purchased: Standard 4. ____ ticket',
              )}
              {renderListening15Test4FormQuestion(
                5,
                'Cost of ticket: 5. £ ____',
              )}
            </div>

            {/* Static Text: When ticket was purchased */}
            <div className="text-foreground/80 border-t pt-4 text-sm font-medium">
              When ticket was purchased: Yesterday
            </div>

            {/* Q6 */}
            <div className="space-y-4">
              {renderListening15Test4FormQuestion(
                6,
                'Where ticket was bought: 6. ____',
              )}
            </div>

            {/* Header 3 */}
            <div className="border-t pt-4">
              <h4 className="text-muted-foreground text-[13px] font-semibold tracking-wider uppercase">
                Satisfaction with journey
              </h4>
            </div>

            {/* Static Text: Wifi */}
            <div className="text-foreground/80 text-sm font-medium">
              Most satisfied with: the wifi
            </div>

            {/* Q7 */}
            <div className="space-y-4">
              {renderListening15Test4FormQuestion(
                7,
                'Least satisfied with: the 7. ____ this morning.',
              )}
            </div>

            {/* Header 4 */}
            <div className="border-t pt-4">
              <h4 className="text-muted-foreground text-[13px] font-semibold tracking-wider uppercase">
                Satisfaction with station facilities
              </h4>
            </div>

            {/* Q8, Q9, Q10 */}
            <div className="space-y-4">
              {renderListening15Test4FormQuestion(
                8,
                'Most satisfied with: how much 8. ____ was provided',
              )}
              {renderListening15Test4FormQuestion(
                9,
                'Least satisfied with: lack of seats, particularly on the 9. ____',
              )}
              {renderListening15Test4FormQuestion(
                10,
                'Neither satisfied nor dissatisfied with: the 10. ____ available',
              )}
            </div>
          </div>
        ) : shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 ? (
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
        ) : shouldRenderListening16Test1StevensonTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Title */}
            <div className="border-border/60 text-muted-foreground border-b px-4 py-5 text-center text-sm font-black tracking-wider uppercase">
              Plan of Stevenson’s site
            </div>

            {/* Grid container */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r">
                <span className="text-foreground text-sm font-semibold">
                  15. coffee room
                </span>
                <div>{renderListening16Test1StevensonQuestion(15, '')}</div>
              </div>
              <div className="border-border/60 flex items-center justify-between border-b p-4">
                <span className="text-foreground text-sm font-semibold">
                  16. warehouse
                </span>
                <div>{renderListening16Test1StevensonQuestion(16, '')}</div>
              </div>

              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r">
                <span className="text-foreground text-sm font-semibold">
                  17. staff canteen
                </span>
                <div>{renderListening16Test1StevensonQuestion(17, '')}</div>
              </div>
              <div className="border-border/60 flex items-center justify-between border-b p-4">
                <span className="text-foreground text-sm font-semibold">
                  18. meeting room
                </span>
                <div>{renderListening16Test1StevensonQuestion(18, '')}</div>
              </div>

              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r md:border-b-0">
                <span className="text-foreground text-sm font-semibold">
                  19. human resources
                </span>
                <div>{renderListening16Test1StevensonQuestion(19, '')}</div>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-foreground text-sm font-semibold">
                  20. boardroom
                </span>
                <div>{renderListening16Test1StevensonQuestion(20, '')}</div>
              </div>
            </div>
          </div>
        ) : shouldRenderListening16Test4RecreationTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Title */}
            <div className="border-border/60 text-muted-foreground border-b px-4 py-5 text-center text-sm font-black tracking-wider uppercase">
              Recreation ground after proposed changes
            </div>

            {/* Grid container */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r">
                <span className="text-foreground text-sm font-semibold">
                  15. New car park
                </span>
                <div>{renderListening16Test4RecreationQuestion(15, '')}</div>
              </div>
              <div className="border-border/60 flex items-center justify-between border-b p-4">
                <span className="text-foreground text-sm font-semibold">
                  18. Skateboard ramp
                </span>
                <div>{renderListening16Test4RecreationQuestion(18, '')}</div>
              </div>

              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r">
                <span className="text-foreground text-sm font-semibold">
                  16. New cricket pitch
                </span>
                <div>{renderListening16Test4RecreationQuestion(16, '')}</div>
              </div>
              <div className="border-border/60 flex items-center justify-between border-b p-4">
                <span className="text-foreground text-sm font-semibold">
                  19. Pavilion
                </span>
                <div>{renderListening16Test4RecreationQuestion(19, '')}</div>
              </div>

              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r md:border-b-0">
                <span className="text-foreground text-sm font-semibold">
                  17. Children’s playground
                </span>
                <div>{renderListening16Test4RecreationQuestion(17, '')}</div>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-foreground text-sm font-semibold">
                  20. Notice board
                </span>
                <div>{renderListening16Test4RecreationQuestion(20, '')}</div>
              </div>
            </div>
          </div>
        ) : shouldRenderListening16Test4CitiesTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Title */}
            <div className="border-border/60 text-muted-foreground border-b px-4 py-5 text-center text-sm font-black tracking-wider uppercase">
              Cities
            </div>

            {/* Grid container */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r">
                <span className="text-foreground text-sm font-semibold">
                  25. Amsterdam
                </span>
                <div>{renderListening16Test4CitiesQuestion(25, '')}</div>
              </div>
              <div className="border-border/60 flex items-center justify-between border-b p-4">
                <span className="text-foreground text-sm font-semibold">
                  28. Buenos Aires
                </span>
                <div>{renderListening16Test4CitiesQuestion(28, '')}</div>
              </div>

              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r">
                <span className="text-foreground text-sm font-semibold">
                  26. Dublin
                </span>
                <div>{renderListening16Test4CitiesQuestion(26, '')}</div>
              </div>
              <div className="border-border/60 flex items-center justify-between border-b p-4">
                <span className="text-foreground text-sm font-semibold">
                  29. New York
                </span>
                <div>{renderListening16Test4CitiesQuestion(29, '')}</div>
              </div>

              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r md:border-b-0">
                <span className="text-foreground text-sm font-semibold">
                  27. London
                </span>
                <div>{renderListening16Test4CitiesQuestion(27, '')}</div>
              </div>
              <div className="flex items-center justify-between p-4">
                <span className="text-foreground text-sm font-semibold">
                  30. Sydney
                </span>
                <div>{renderListening16Test4CitiesQuestion(30, '')}</div>
              </div>
            </div>
          </div>
        ) : shouldRenderListening16Test1PicturesTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Title */}
            <div className="border-border/60 text-muted-foreground border-b px-4 py-5 text-center text-sm font-black tracking-wider uppercase">
              Pictures
            </div>

            {/* Grid container */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r">
                <span className="text-foreground text-sm font-semibold">
                  25. Falcon (Landseer)
                </span>
                <div>{renderListening16Test1PicturesQuestion(25, '')}</div>
              </div>
              <div className="border-border/60 flex items-center justify-between border-b p-4">
                <span className="text-foreground text-sm font-semibold">
                  26. Fish hawk (Audubon)
                </span>
                <div>{renderListening16Test1PicturesQuestion(26, '')}</div>
              </div>

              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r">
                <span className="text-foreground text-sm font-semibold">
                  27. Kingfisher (van Gogh)
                </span>
                <div>{renderListening16Test1PicturesQuestion(27, '')}</div>
              </div>
              <div className="border-border/60 flex items-center justify-between border-b p-4">
                <span className="text-foreground text-sm font-semibold">
                  28. Portrait of William Wells
                </span>
                <div>{renderListening16Test1PicturesQuestion(28, '')}</div>
              </div>

              <div className="border-border/60 flex items-center justify-between border-b p-4 md:border-r md:border-b-0">
                <span className="text-foreground text-sm font-semibold">
                  29. Vairumati (Gauguin)
                </span>
                <div>{renderListening16Test1PicturesQuestion(29, '')}</div>
              </div>
              <div className="flex flex-col justify-between gap-2 p-4 md:flex-row md:items-center">
                <span className="text-foreground text-sm font-semibold">
                  30. Portrait of Giovanni de Medici
                </span>
                <div className="self-end md:self-auto">
                  {renderListening16Test1PicturesQuestion(30, '')}
                </div>
              </div>
            </div>
          </div>
        ) : shouldRenderListening15Test2FestivalTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Header */}
            <div className="border-border/60 text-muted-foreground border-b px-4 py-5 text-center text-sm font-black tracking-wider uppercase">
              Festival information
            </div>

            {/* Table Column Headers */}
            <div className="border-border/60 text-muted-foreground bg-muted/20 grid grid-cols-[160px_1fr_2.2fr] border-b text-center text-xs font-bold uppercase">
              <div className="border-border/60 border-r px-4 py-3">Date</div>
              <div className="border-border/60 border-r px-4 py-3">
                Type of event
              </div>
              <div className="px-4 py-3">Details</div>
            </div>

            {/* Row 1 */}
            <div className="border-border/60 grid grid-cols-[160px_1fr_2.2fr] border-b text-sm">
              <div className="border-border/60 bg-muted/5 flex items-center justify-center border-r px-4 py-4 font-semibold">
                17th
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-medium">
                a concert
              </div>
              <div className="text-foreground/80 flex items-center justify-start px-4 py-4 font-medium">
                performers from Canada
              </div>
            </div>

            {/* Row 2 */}
            <div className="border-border/60 grid grid-cols-[160px_1fr_2.2fr] border-b text-sm">
              <div className="border-border/60 bg-muted/5 flex items-center justify-center border-r px-4 py-4 font-semibold">
                18th
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-medium">
                a ballet
              </div>
              <div className="flex items-center justify-start px-4 py-4 font-medium">
                {renderListening15Test2FestivalQuestion(
                  1,
                  'company called 1. ____',
                )}
              </div>
            </div>

            {/* Row 3 */}
            <div className="border-border/60 grid grid-cols-[160px_1fr_2.2fr] border-b text-sm">
              <div className="border-border/60 bg-muted/5 flex items-center justify-center border-r px-4 py-4 font-semibold">
                19th-20th (afternoon)
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-medium">
                a play
              </div>
              <div className="flex items-center justify-start px-4 py-4 font-medium">
                {renderListening15Test2FestivalQuestion(
                  2,
                  'type of play: a comedy called Jemima\nhas had a good 2. ____',
                )}
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-[160px_1fr_2.2fr] text-sm">
              <div className="border-border/60 bg-muted/5 flex items-center justify-center border-r px-4 py-4 font-semibold">
                20th (evening)
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-medium">
                {renderListening15Test2FestivalQuestion(3, 'a 3. ____ show')}
              </div>
              <div className="flex items-center justify-start px-4 py-4 font-medium">
                {renderListening15Test2FestivalQuestion(
                  4,
                  'show is called 4. ____',
                )}
              </div>
            </div>
          </div>
        ) : shouldRenderGeneral16Test1InjuriesTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Table title */}
            <div className="border-border/60 border-b px-4 py-5 text-center text-sm font-black">
              Risks and how to avoid them
            </div>

            {/* Table headers */}
            <div className="border-border/60 grid grid-cols-[1fr_1.5fr_1.5fr] border-b text-sm font-semibold">
              <div className="border-border/60 border-r px-4 py-4">
                Risk Factor
              </div>
              <div className="border-border/60 border-r px-4 py-4">
                Examples of Farm Activities
              </div>
              <div className="px-4 py-4">
                Risk Reduction Measures to Consider
              </div>
            </div>

            {/* Row 1: Heavy Loads */}
            <div className="border-border/60 grid grid-cols-[1fr_1.5fr_1.5fr] border-b">
              {/* Risk Factor */}
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Heavy Loads
              </div>
              {/* Examples of Farm Activities */}
              <div className="border-border/60 border-r px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral16Test1InjuriesQuestion(
                      15,
                      'Lifting sacks of 15. ____',
                    )}
                  </li>
                  <li>Carrying food for animals</li>
                </ul>
              </div>
              {/* Risk Reduction Measures to Consider */}
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>Divide into containers that weigh less</li>
                  <li>Use a vehicle such as a tractor</li>
                </ul>
              </div>
            </div>

            {/* Row 2: Awkward posture */}
            <div className="border-border/60 grid grid-cols-[1fr_1.5fr_1.5fr] border-b">
              {/* Risk Factor */}
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Awkward posture
              </div>
              {/* Examples of Farm Activities */}
              <div className="border-border/60 border-r px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral16Test1InjuriesQuestion(
                      16,
                      'Lifting a restless 16. ____',
                    )}
                  </li>
                  <li>
                    {renderGeneral16Test1InjuriesQuestion(
                      17,
                      'Moving something around a big 17. ____',
                    )}
                  </li>
                </ul>
              </div>
              {/* Risk Reduction Measures to Consider */}
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral16Test1InjuriesQuestion(
                      18,
                      'Buy particular 18. ____ to help with support',
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* Row 3: A lot of bending while working */}
            <div className="grid grid-cols-[1fr_1.5fr_1.5fr]">
              {/* Risk Factor */}
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                {renderGeneral16Test1InjuriesQuestion(
                  19,
                  'A lot of 19. ____ while working',
                )}
              </div>
              {/* Examples of Farm Activities */}
              <div className="border-border/60 border-r px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral16Test1InjuriesQuestion(
                      20,
                      'Fixing a fallen 20. ____',
                    )}
                  </li>
                </ul>
              </div>
              {/* Risk Reduction Measures to Consider */}
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>Use a workbench instead</li>
                </ul>
              </div>
            </div>
          </div>
        ) : shouldRenderGeneral17Test4PlumbersTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Table title */}
            <div className="border-border/60 border-b px-4 py-5 text-sm font-black">
              The work of plumbers
            </div>

            {/* Table headers */}
            <div className="border-border/60 grid grid-cols-[1fr_2.2fr_2.8fr] border-b text-sm font-semibold">
              <div className="border-border/60 border-r px-4 py-4">
                Type of plumber
              </div>
              <div className="border-border/60 border-r px-4 py-4">
                Work-related issues
              </div>
              <div className="px-4 py-4">Skills/Actions needed</div>
            </div>

            {/* Row 1: Residential */}
            <div className="border-border/60 grid grid-cols-[1fr_2.2fr_2.8fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Residential
              </div>
              <div className="border-border/60 border-r px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral17Test4PlumbersQuestion(
                      22,
                      'Working underfloor in a 22 ____ area',
                    )}
                  </li>
                  <li>Dealing with a wood product</li>
                </ul>
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>Plan carefully</li>
                  <li>
                    {renderGeneral17Test4PlumbersQuestion(
                      23,
                      'Always use the appropriate 23 ____ for each tool',
                    )}
                  </li>
                  <li>
                    {renderGeneral17Test4PlumbersQuestion(
                      24,
                      'Consider how different 24 ____ will be affected',
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* Row 2: Commercial */}
            <div className="border-border/60 grid grid-cols-[1fr_2.2fr_2.8fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Commercial
              </div>
              <div className="border-border/60 border-r px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>
                    Working with advanced equipment designed for integrated
                    systems
                  </li>
                </ul>
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>Fully comprehend instructions</li>
                  <li>
                    {renderGeneral17Test4PlumbersQuestion(
                      25,
                      'Take images of structures to locate important materials like 25 ____',
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* Row 3: Service */}
            <div className="grid grid-cols-[1fr_2.2fr_2.8fr]">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Service
              </div>
              <div className="border-border/60 border-r px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>Diagnosing problems and their causes</li>
                  <li>
                    Fully understanding something someone else installed, e.g.,
                    a shower unit
                  </li>
                </ul>
              </div>
              <div className="px-4 py-5">
                <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed">
                  <li>
                    {renderGeneral17Test4PlumbersQuestion(
                      26,
                      'Providing quick, 26 ____ solutions',
                    )}
                  </li>
                  <li>
                    {renderGeneral17Test4PlumbersQuestion(
                      27,
                      'Deal well with people who have a lot of 27 ____ or disruption as a result of their problems',
                    )}
                  </li>
                </ul>
              </div>
            </div>
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
        ) : shouldRenderAcademic17Test4Table ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            <div className="border-border/60 border-b px-4 py-5 text-sm font-black">
              The study carried out by Rocha’s team
            </div>

            <div className="border-border/60 grid grid-cols-[140px_1fr] border-b text-sm font-semibold">
              <div className="border-border/60 border-r px-4 py-4">Aim</div>
              <div className="px-4 py-4 leading-relaxed">
                – to investigate the feeding habits of bats in farmland near the
                Ranomafana National Park
              </div>
            </div>

            <div className="border-border/60 grid grid-cols-[140px_1fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Method
              </div>
              <div className="space-y-3 px-4 py-5">
                <div className="text-sm leading-relaxed">
                  – ultrasonic recording to identify favourite feeding spots
                </div>
                <div>
                  {renderAcademic17Test4TableQuestion(
                    7,
                    '– DNA analysis of bat 7 ____',
                  )}
                </div>
              </div>
            </div>

            <div className="border-border/60 grid grid-cols-[140px_1fr] border-b">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Findings
              </div>
              <div className="space-y-4 px-4 py-5">
                <div className="text-sm leading-relaxed font-medium">
                  – the bats were most active in rice fields located on hills
                </div>
                <div>
                  {renderAcademic17Test4TableQuestion(
                    8,
                    '– ate pests of rice, 8 ____ , sugarcane, nuts and fruit',
                  )}
                </div>
                <div>
                  {renderAcademic17Test4TableQuestion(
                    9,
                    '– prevent the spread of disease by eating 9 ____ and blackflies',
                  )}
                </div>
                <div className="text-sm leading-relaxed font-semibold">
                  – local attitudes to bats are mixed:
                </div>
                <div className="space-y-3 pl-6">
                  <div>
                    {renderAcademic17Test4TableQuestion(
                      10,
                      '– they provide food rich in 10 ____',
                    )}
                  </div>
                  <div>
                    {renderAcademic17Test4TableQuestion(
                      11,
                      '– the buildings where they roost become 11 ____',
                    )}
                  </div>
                  <div>
                    {renderAcademic17Test4TableQuestion(
                      12,
                      '– they play an important role in local 12 ____',
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-[140px_1fr]">
              <div className="border-border/60 border-r px-4 py-5 text-sm font-black">
                Recommendation
              </div>
              <div className="px-4 py-5">
                {renderAcademic17Test4TableQuestion(
                  13,
                  '– farmers should provide special 13 ____ to support the bat population',
                )}
              </div>
            </div>
          </div>
        ) : shouldRenderListening14Test4BookingForm ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
            {/* Form Title */}
            <div className="text-center space-y-1">
              <h4 className="text-foreground text-[18px] font-black tracking-wider uppercase">
                Enquiry about booking hotel room for event
              </h4>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 gap-4 border-b border-border/40 pb-4 text-[14px]">
              <div className="flex gap-2">
                <span className="font-bold text-foreground">Example:</span>
                <span className="text-foreground font-medium">
                  Andrew is the <span className="underline font-bold">Events</span> Manager
                </span>
              </div>
            </div>

            {/* Section 1: Rooms */}
            <div className="space-y-4">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Rooms
              </h5>
              
              <div className="grid grid-cols-1 gap-y-3.5 text-[14px] pl-4">
                {/* Adelphi Room */}
                <div className="space-y-2">
                  <h6 className="font-extrabold text-foreground text-[14px]">Adelphi Room</h6>
                  
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-foreground font-medium">– number of people who can sit down to eat:</span>
                    {renderListening14Test4BookingQuestion(1, '1. ____')}
                  </div>

                  <div className="text-foreground font-medium pl-4 py-0.5">
                    has a gallery suitable for musicians
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap font-medium">
                    <span className="text-foreground">– can go out and see the</span>
                    {renderListening14Test4BookingQuestion(2, '2. ____')}
                    <span className="text-foreground">in pots on the terrace</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap font-medium">
                    <span className="text-foreground">– terrace has a view of a group of</span>
                    {renderListening14Test4BookingQuestion(3, '3. ____')}
                  </div>
                </div>

                {/* Carlton Room */}
                <div className="space-y-2 pt-2">
                  <h6 className="font-extrabold text-foreground text-[14px]">Carlton Room</h6>

                  <div className="text-foreground font-medium pl-4">
                    – number of people who can sit down to eat: 110
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap font-medium">
                    <span className="text-foreground">– has a</span>
                    {renderListening14Test4BookingQuestion(4, '4. ____')}
                    <span className="text-foreground">view of the lake</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Options */}
            <div className="space-y-4 pt-2">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Options
              </h5>

              <div className="grid grid-cols-1 gap-y-3.5 text-[14px] pl-4 font-medium">
                <div className="space-y-2">
                  <h6 className="font-extrabold text-foreground text-[14px]">Master of Ceremonies:</h6>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-foreground">– can give a</span>
                    {renderListening14Test4BookingQuestion(5, '5. ____')}
                    <span className="text-foreground">while people are eating</span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-foreground">– will provide</span>
                    {renderListening14Test4BookingQuestion(6, '6. ____')}
                    <span className="text-foreground">if there are any problems</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Accommodation */}
            <div className="space-y-4 pt-2">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Accommodation
              </h5>

              <div className="grid grid-cols-1 gap-y-3.5 text-[14px] pl-4 font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-foreground">– in the hotel rooms or</span>
                  {renderListening14Test4BookingQuestion(7, '7. ____')}
                </div>
              </div>
            </div>
          </div>
        ) : shouldRenderAcademic13Test3CoconutTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm max-w-3xl mx-auto w-full">
            {/* Table Header */}
            <div className="grid grid-cols-[120px_180px_1fr] bg-muted/40 border-b border-border/60 text-xs font-black uppercase tracking-wider text-muted-foreground">
              <div className="px-4 py-3 border-r border-border/60">Part</div>
              <div className="px-4 py-3 border-r border-border/60">Description</div>
              <div className="px-4 py-3">Uses</div>
            </div>

            {/* Row 1: trunk */}
            <div className="grid grid-cols-[120px_180px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                trunk
              </div>
              <div className="px-4 py-4 border-r border-border/60 text-foreground font-medium">
                up to 30 metres
              </div>
              <div className="px-4 py-4 text-foreground font-medium flex items-center gap-1.5 flex-wrap">
                {renderAcademic13Test3CoconutQuestion(1, 'timber for houses and the making of 1. ____')}
              </div>
            </div>

            {/* Row 2: leaves */}
            <div className="grid grid-cols-[120px_180px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                leaves
              </div>
              <div className="px-4 py-4 border-r border-border/60 text-foreground font-medium">
                up to 6 metres long
              </div>
              <div className="px-4 py-4 text-foreground font-medium flex items-center gap-1.5 flex-wrap">
                to make brushes
              </div>
            </div>

            {/* Row 3: flowers */}
            <div className="grid grid-cols-[120px_180px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                flowers
              </div>
              <div className="px-4 py-4 border-r border-border/60 text-foreground font-medium">
                at the top of the trunk
              </div>
              <div className="px-4 py-4 text-foreground font-medium flex items-center gap-1.5 flex-wrap">
                {renderAcademic13Test3CoconutQuestion(2, 'stems provide sap, used as a drink or a source of 2. ____')}
              </div>
            </div>

            {/* Row 4: fruits -> outer layer */}
            <div className="grid grid-cols-[120px_180px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground bg-muted/5">
                fruits
              </div>
              <div className="px-4 py-4 border-r border-border/60 text-foreground font-medium">
                outer layer
              </div>
              <div className="px-4 py-4 text-muted-foreground italic text-xs">
                (waterproof)
              </div>
            </div>

            {/* Row 5: fruits -> middle layer */}
            <div className="grid grid-cols-[120px_180px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground bg-muted/5">
              </div>
              <div className="px-4 py-4 border-r border-border/60 text-foreground font-medium">
                middle layer (coir fibres)
              </div>
              <div className="px-4 py-4 text-foreground font-medium flex items-center gap-1.5 flex-wrap">
                {renderAcademic13Test3CoconutQuestion(3, 'used for 3. ____')}
              </div>
            </div>

            {/* Row 6: fruits -> inner layer */}
            <div className="grid grid-cols-[120px_180px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground bg-muted/5">
              </div>
              <div className="px-4 py-4 border-r border-border/60 text-foreground font-medium">
                inner layer (shell)
              </div>
              <div className="px-4 py-4 text-foreground font-medium flex items-center gap-1.5 flex-wrap">
                {renderAcademic13Test3CoconutQuestion(4, 'a source of 4. ____')}
              </div>
            </div>

            {/* Row 7: fruits -> when halved */}
            <div className="grid grid-cols-[120px_180px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground bg-muted/5">
              </div>
              <div className="px-4 py-4 border-r border-border/60 text-foreground font-medium">
                (when halved)
              </div>
              <div className="px-4 py-4 text-foreground font-medium flex items-center gap-1.5 flex-wrap">
                {renderAcademic13Test3CoconutQuestion(5, 'for 5. ____')}
              </div>
            </div>

            {/* Row 8: fruits -> coconut water */}
            <div className="grid grid-cols-[120px_180px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground bg-muted/5">
              </div>
              <div className="px-4 py-4 border-r border-border/60 text-foreground font-medium">
                coconut water
              </div>
              <div className="px-4 py-4 space-y-2 text-foreground font-medium">
                <div>a drink</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test3CoconutQuestion(6, 'a source of 6. ____ for other plants')}
                </div>
              </div>
            </div>

            {/* Row 9: fruits -> coconut flesh */}
            <div className="grid grid-cols-[120px_180px_1fr] text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground bg-muted/5">
              </div>
              <div className="px-4 py-4 border-r border-border/60 text-foreground font-medium">
                coconut flesh
              </div>
              <div className="px-4 py-4 space-y-3 text-foreground font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test3CoconutQuestion(7, 'oil and milk for cooking and 7. ____')}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test3CoconutQuestion(8, 'glycerine (an ingredient in 8. ____ )')}
                </div>
              </div>
            </div>
          </div>
        ) : shouldRenderAcademic13Test2CinnamonTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm max-w-3xl mx-auto w-full">
            {/* Table Header */}
            <div className="grid grid-cols-[180px_1fr] bg-muted/40 border-b border-border/60 text-xs font-black uppercase tracking-wider text-muted-foreground">
              <div className="px-4 py-3 border-r border-border/60">Period / Context</div>
              <div className="px-4 py-3">Notes</div>
            </div>

            {/* Row 1: Biblical times */}
            <div className="grid grid-cols-[180px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                Biblical times:
              </div>
              <div className="px-4 py-4 space-y-3 text-foreground font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test2CinnamonQuestion(1, 'added to 1. ____')}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test2CinnamonQuestion(2, 'used to show 2. ____ Between people')}
                </div>
              </div>
            </div>

            {/* Row 2: Ancient Rome */}
            <div className="grid grid-cols-[180px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                Ancient Rome:
              </div>
              <div className="px-4 py-4 space-y-3 text-foreground font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test2CinnamonQuestion(3, 'used for its sweet smell at 3. ____')}
                </div>
              </div>
            </div>

            {/* Row 3: Middle Ages */}
            <div className="grid grid-cols-[180px_1fr] text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                Middle Ages:
              </div>
              <div className="px-4 py-4 space-y-3 text-foreground font-medium">
                <div>added to food, especially meat</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test2CinnamonQuestion(4, 'was an indication of a person’s 4. ____')}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test2CinnamonQuestion(5, 'known as a treatment for 5. ____ and other health problems')}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test2CinnamonQuestion(6, 'grown in 6. ____')}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test2CinnamonQuestion(7, 'merchants used 7. ____ to bring it to the Mediterranean')}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test2CinnamonQuestion(8, 'arrived in the Mediterranean at 8. ____')}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {renderAcademic13Test2CinnamonQuestion(9, 'traders took it to 9. ____ and sold it to destinations around Europe.')}
                </div>
              </div>
            </div>
          </div>
        ) : shouldRenderAcademic13Test1TourismTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm max-w-3xl mx-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[200px_1fr] bg-muted/40 border-b border-border/60 text-xs font-black uppercase tracking-wider text-muted-foreground">
              <div className="px-4 py-3 border-r border-border/60">Section of website</div>
              <div className="px-4 py-3">Comments</div>
            </div>

            {/* Row 1: Database of tourism services */}
            <div className="grid grid-cols-[200px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                Database of tourism services
              </div>
              <div className="px-4 py-4 space-y-3 text-foreground font-medium">
                <div>• easy for tourism-related businesses to get on the list</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>• allowed businesses to</span>
                  {renderAcademic13Test1TourismQuestion(1, '1. ____')}
                  <span>information regularly</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>• provided a country-wide evaluation of businesses, including their impact on the</span>
                  {renderAcademic13Test1TourismQuestion(2, '2. ____')}
                </div>
              </div>
            </div>

            {/* Row 2: Special features on local topics */}
            <div className="grid grid-cols-[200px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                Special features on local topics
              </div>
              <div className="px-4 py-4 space-y-3 text-foreground font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>• e.g. an interview with a former sports</span>
                  {renderAcademic13Test1TourismQuestion(3, '3. ____')}
                  <span>, and an interactive tour of various locations used in</span>
                  {renderAcademic13Test1TourismQuestion(4, '4. ____')}
                </div>
              </div>
            </div>

            {/* Row 3: Information on driving routes */}
            <div className="grid grid-cols-[200px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                Information on driving routes
              </div>
              <div className="px-4 py-4 text-foreground font-medium flex items-center gap-1.5 flex-wrap">
                <span>• varied depending on the</span>
                {renderAcademic13Test1TourismQuestion(5, '5. ____')}
              </div>
            </div>

            {/* Row 4: Travel Planner */}
            <div className="grid grid-cols-[200px_1fr] border-b border-border/60 text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                Travel Planner
              </div>
              <div className="px-4 py-4 text-foreground font-medium flex items-center gap-1.5 flex-wrap">
                <span>• included a map showing selected places, details of public transport and local</span>
                {renderAcademic13Test1TourismQuestion(6, '6. ____')}
              </div>
            </div>

            {/* Row 5: ‘Your Words’ */}
            <div className="grid grid-cols-[200px_1fr] text-[14px]">
              <div className="px-4 py-4 border-r border-border/60 font-bold text-foreground">
                ‘Your Words’
              </div>
              <div className="px-4 py-4 text-foreground font-medium flex items-center gap-1.5 flex-wrap">
                <span>• travellers could send a link to their</span>
                {renderAcademic13Test1TourismQuestion(7, '7. ____')}
              </div>
            </div>
          </div>
        ) : shouldRenderListening14Test3HotelForm ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
            {/* Form Title */}
            <div className="text-center space-y-1">
              <h4 className="text-foreground text-[18px] font-black tracking-wider uppercase">
                Flanders Conference Hotel
              </h4>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 gap-4 border-b border-border/40 pb-4 text-[14px]">
              <div className="flex gap-2">
                <span className="font-extrabold text-foreground">Customer Services Manager:</span>
                <span className="text-foreground font-medium">
                  <span className="underline font-bold">Angela</span>
                </span>
              </div>
            </div>

            {/* Section 1: Date available */}
            <div className="space-y-4">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Date available
              </h5>
              
              <div className="grid grid-cols-1 gap-y-3.5 text-[14px] pl-4">
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-medium">– weekend beginning February 4<sup>th</sup></span>
                </div>
              </div>
            </div>

            {/* Section 2: Conference facilities */}
            <div className="space-y-4 pt-2">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Conference facilities
              </h5>

              <div className="grid grid-cols-1 gap-y-3.5 text-[14px] pl-4">
                <div className="flex items-center gap-1.5 flex-wrap font-medium">
                  <span className="text-foreground">– the</span>
                  {renderListening14Test3HotelQuestion(1, '1. ____')}
                  <span className="text-foreground">room for talks (projector and</span>
                  {renderListening14Test3HotelQuestion(2, '2. ____')}
                  <span className="text-foreground">available)</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap font-medium">
                  <span className="text-foreground">– area for coffee and an</span>
                  {renderListening14Test3HotelQuestion(3, '3. ____')}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap font-medium">
                  <span className="text-foreground">– free</span>
                  {renderListening14Test3HotelQuestion(4, '4. ____')}
                  <span className="text-foreground">throughout</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-foreground font-medium">– a standard buffet lunch costs</span>
                  <span className="font-extrabold text-foreground">5. $</span>
                  {renderListening14Test3HotelQuestion(5, '____')}
                  <span className="text-foreground font-medium">per head</span>
                </div>
              </div>
            </div>

            {/* Section 3: Accommodation */}
            <div className="space-y-4 pt-2">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Accommodation
              </h5>

              <div className="grid grid-cols-1 gap-y-3.5 text-[14px] pl-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-foreground font-medium">– Rooms will cost</span>
                  <span className="font-extrabold text-foreground">6. $</span>
                  {renderListening14Test3HotelQuestion(6, '____')}
                  <span className="text-foreground font-medium">including breakfast.</span>
                </div>
              </div>
            </div>

            {/* Section 4: Other facilities */}
            <div className="space-y-4 pt-2">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Other facilities
              </h5>

              <div className="grid grid-cols-1 gap-y-3.5 text-[14px] pl-4 font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-foreground">– The hotel also has a spa and rooftop</span>
                  {renderListening14Test3HotelQuestion(7, '7. ____')}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-foreground">– There’s a free shuttle service to the</span>
                  {renderListening14Test3HotelQuestion(8, '8. ____')}
                </div>
              </div>
            </div>

            {/* Section 5: Location */}
            <div className="space-y-4 pt-2">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Location
              </h5>

              <div className="grid grid-cols-1 gap-y-3.5 text-[14px] pl-4 font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-foreground">– Wilby Street (quite near the</span>
                  {renderListening14Test3HotelQuestion(9, '9. ____')}
                  <span className="text-foreground">)</span>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-foreground">– near to restaurants and many</span>
                  {renderListening14Test3HotelQuestion(10, '10. ____')}
                </div>
              </div>
            </div>
          </div>
        ) : shouldRenderListening14Test2PatientDetailsForm ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
            {/* Form Title */}
            <div className="text-center space-y-1">
              <h4 className="text-foreground text-[18px] font-black tracking-wider uppercase">
                TOTAL HEALTH CLINIC
              </h4>
              <p className="text-muted-foreground text-[12px] font-bold tracking-widest uppercase">
                PATIENT DETAILS
              </p>
            </div>

            {/* Section 1: Personal information */}
            <div className="space-y-4">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Personal information
              </h5>
              
              <div className="grid grid-cols-1 gap-y-3.5 text-[14px]">
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-bold text-foreground">Example:</span>
                  <div className="flex gap-2">
                    <span className="font-bold text-foreground">Name:</span>
                    <span className="text-foreground font-medium">Julie Anne <span className="underline font-bold">Garcia</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Contact phone:</span>
                  <div className="flex items-center">
                    {renderListening14Test2PatientQuestion(1, '1. ____')}
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Date of birth:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {renderListening14Test2PatientQuestion(2, '2. ____')}
                    <span className="text-foreground font-medium">, 1992</span>
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Occupation:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-foreground font-medium">works as a</span>
                    {renderListening14Test2PatientQuestion(3, '3. ____')}
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Insurance company:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {renderListening14Test2PatientQuestion(4, '4. ____')}
                    <span className="text-foreground font-medium">Life Insurance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Details of the problem */}
            <div className="space-y-4 pt-2">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Details of the problem
              </h5>

              <div className="grid grid-cols-1 gap-y-3.5 text-[14px]">
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Type of problem:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-foreground font-medium">pain in her left</span>
                    {renderListening14Test2PatientQuestion(5, '5. ____')}
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">When it began:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {renderListening14Test2PatientQuestion(6, '6. ____')}
                    <span className="text-foreground font-medium">ago</span>
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                  <span className="font-extrabold text-foreground">Action already taken:</span>
                  <span className="text-foreground font-medium">has taken painkillers and applied ice</span>
                </div>
              </div>
            </div>

            {/* Section 3: Other information */}
            <div className="space-y-4 pt-2">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Other information
              </h5>

              <div className="grid grid-cols-1 gap-y-3.5 text-[14px]">
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Sports played:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-foreground font-medium">belongs to a</span>
                    {renderListening14Test2PatientQuestion(7, '7. ____')}
                    <span className="text-foreground font-medium">club</span>
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground"></span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-foreground font-medium">goes</span>
                    {renderListening14Test2PatientQuestion(8, '8. ____')}
                    <span className="text-foreground font-medium">regularly</span>
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Medical history:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-foreground font-medium">injured her</span>
                    {renderListening14Test2PatientQuestion(9, '9. ____')}
                    <span className="text-foreground font-medium">last year</span>
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground"></span>
                  <span className="text-foreground font-medium">no allergies</span>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground"></span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-foreground font-medium">no regular medication apart from</span>
                    {renderListening14Test2PatientQuestion(10, '10. ____')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : shouldRenderListening14Test1CrimeReportForm ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
            {/* Form Title */}
            <div className="text-center space-y-1">
              <h4 className="text-foreground text-[18px] font-black tracking-wider uppercase">
                CRIME REPORT FORM
              </h4>
            </div>

            {/* General Info */}
            <div className="grid grid-cols-1 gap-4 border-b border-border/40 pb-4 text-[14px]">
              <div className="flex gap-2">
                <span className="font-extrabold text-foreground">Type of crime:</span>
                <span className="text-muted-foreground font-semibold">theft</span>
              </div>
            </div>

            {/* Section 1: Personal information */}
            <div className="space-y-4">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Personal information
              </h5>
              
              <div className="grid grid-cols-1 gap-y-3.5 text-[14px]">
                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-bold text-foreground">Example:</span>
                  <div className="flex gap-2">
                    <span className="font-bold text-foreground">Name:</span>
                    <span className="text-foreground font-medium">Louise <span className="underline font-bold">Taylor</span></span>
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Nationality:</span>
                  <div className="flex items-center">
                    {renderListening14Test1CrimeQuestion(1, '1. ____')}
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Date of birth:</span>
                  <span className="text-foreground font-medium">14 December 1977</span>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Occupation:</span>
                  <span className="text-foreground font-medium">interior designer</span>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Reason for visit:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-foreground font-medium">business (to buy antique</span>
                    {renderListening14Test1CrimeQuestion(2, '2. ____')}
                    <span className="text-foreground font-medium">)</span>
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Length of stay:</span>
                  <span className="text-foreground font-medium">two months</span>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 items-center">
                  <span className="font-extrabold text-foreground">Current address:</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {renderListening14Test1CrimeQuestion(3, '3. ____')}
                    <span className="text-foreground font-medium">Apartments (No 15)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Details of theft */}
            <div className="space-y-4 pt-2">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Details of theft
              </h5>

              <div className="space-y-3.5 text-[14px]">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-extrabold text-foreground">Items stolen:</span>
                  <span className="text-foreground font-medium">– a wallet containing approximately</span>
                  {renderListening14Test1CrimeQuestion(4, '4. £ ____')}
                </div>
                <div className="flex items-center gap-1 flex-wrap pl-6">
                  <span className="text-foreground font-medium">– a</span>
                  {renderListening14Test1CrimeQuestion(5, '5. ____')}
                </div>
                <div className="flex items-center gap-1 flex-wrap pl-6">
                  <span className="font-extrabold text-foreground">Date of theft:</span>
                  {renderListening14Test1CrimeQuestion(6, '6. ____')}
                </div>
              </div>
            </div>

            {/* Section 3: Possible time and place of theft */}
            <div className="space-y-4 pt-2">
              <h5 className="text-foreground text-[15px] font-extrabold border-b border-border/30 pb-1 uppercase tracking-wider">
                Possible time and place of theft
              </h5>

              <div className="space-y-3.5 text-[14px]">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-extrabold text-foreground">Location:</span>
                  <span className="text-foreground font-medium">outside the</span>
                  {renderListening14Test1CrimeQuestion(7, '7. ____')}
                  <span className="text-foreground font-medium">at about 4 pm</span>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="font-extrabold text-foreground">Details of suspect:</span>
                  <span className="text-foreground font-medium">– some boys asked for the</span>
                  {renderListening14Test1CrimeQuestion(8, '8. ____')}
                  <span className="text-foreground font-medium">then ran off</span>
                </div>
                <div className="pl-6 text-muted-foreground font-medium">
                  – one had a T-shirt with a picture of a tiger
                </div>
                <div className="flex items-center gap-1 flex-wrap pl-6">
                  <span className="text-foreground font-medium">– he was about 12, slim build with</span>
                  {renderListening14Test1CrimeQuestion(9, '9. ____')}
                  <span className="text-foreground font-medium">hair</span>
                </div>
              </div>
            </div>

            {/* Section 4: Crime reference number */}
            <div className="pt-4 border-t border-border/40">
              <div className="flex items-center gap-1.5 flex-wrap text-[14px]">
                <span className="font-extrabold text-foreground">The crime reference number allocated:</span>
                {renderListening14Test1CrimeQuestion(10, '10. ____')}
              </div>
            </div>
          </div>
        ) : shouldRenderListening13Test2SouthCityClubForm ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
            {/* Form Header */}
            <div className="border-b border-border/40 pb-4">
              <h4 className="text-foreground text-[18px] font-black tracking-wide">
                South City Cycling Club
              </h4>
            </div>

            {/* Example Section */}
            <div className="border-b border-border/40 pb-4 space-y-2 text-[14px]">
              <div className="text-muted-foreground italic text-xs">Example</div>
              <div className="text-foreground font-medium">
                Name of club secretary: Jim <span className="italic font-bold">Hunter</span>
              </div>
            </div>

            {/* Membership Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Membership</h5>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Full membership costs $260; this covers cycling and</span>
                {renderListening13Test2SouthCityQuestion(1, '1. ____')}
                <span>all over Australia</span>
              </div>
              <div className="font-medium text-foreground text-sm">• Recreational membership costs $108</div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Cost of membership includes the club fee and</span>
                {renderListening13Test2SouthCityQuestion(2, '2. ____')}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• The club kit is made by a company called</span>
                {renderListening13Test2SouthCityQuestion(3, '3. ____')}
              </div>
            </div>

            {/* Training Rides Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Training rides</h5>
              <div className="font-medium text-foreground text-sm">• Chance to improve cycling skills and fitness</div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Level B: speed about</span>
                {renderListening13Test2SouthCityQuestion(4, '4. ____')}
                <span>kph</span>
              </div>
              <div className="space-y-2">
                <div className="font-medium text-foreground text-sm">• Weekly sessions</div>
                <div className="flex items-center gap-1.5 flex-wrap pl-6 font-medium text-foreground text-sm">
                  <span>– Tuesdays at 5.30 am, meet at the</span>
                  {renderListening13Test2SouthCityQuestion(5, '5. ____')}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pl-6 font-medium text-foreground text-sm">
                  <span>– Thursdays at 5.30 am, meet at the entrance to the</span>
                  {renderListening13Test2SouthCityQuestion(6, '6. ____')}
                </div>
              </div>
            </div>

            {/* Further Information Section */}
            <div className="space-y-3 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Further information</h5>
              <div className="font-medium text-foreground text-sm">• Rides are about an hour and a half</div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Members often have</span>
                {renderListening13Test2SouthCityQuestion(7, '7. ____')}
                <span>together afterwards</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• There is not always a</span>
                {renderListening13Test2SouthCityQuestion(8, '8. ____')}
                <span>with the group on these rides</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Check and print the</span>
                {renderListening13Test2SouthCityQuestion(9, '9. ____')}
                <span>on the website beforehand</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Bikes must have</span>
                {renderListening13Test2SouthCityQuestion(10, '10. ____')}
              </div>
            </div>
          </div>
        ) : shouldRenderListening13Test3BanfordCityForm ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
            {/* Form Header */}
            <div className="border-b border-border/40 pb-4">
              <h4 className="text-foreground text-[18px] font-black tracking-wide">
                Moving to Banford City
              </h4>
            </div>

            {/* Example Section */}
            <div className="border-b border-border/40 pb-4 space-y-2 text-[14px]">
              <div className="text-muted-foreground italic text-xs">Example</div>
              <div className="text-foreground font-medium">
                Linda recommends living in suburb of: <span className="italic font-bold">Dalton</span>
              </div>
            </div>

            {/* Accommodation Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Accommodation</h5>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Average rent: 1 £</span>
                {renderListening13Test3BanfordQuestion(1, '1. ____')}
                <span>a month</span>
              </div>
            </div>

            {/* Transport Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Transport</h5>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Linda travels to work by</span>
                {renderListening13Test3BanfordQuestion(2, '2. ____')}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Limited</span>
                {renderListening13Test3BanfordQuestion(3, '3. ____')}
                <span>in city centre</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Trains to London every</span>
                {renderListening13Test3BanfordQuestion(4, '4. ____')}
                <span>Minutes</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Poor train service at</span>
                {renderListening13Test3BanfordQuestion(5, '5. ____')}
              </div>
            </div>

            {/* Advantages Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Advantages of living in Banford</h5>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• New</span>
                {renderListening13Test3BanfordQuestion(6, '6. ____')}
                <span>opened recently</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• 7</span>
                {renderListening13Test3BanfordQuestion(7, '7. ____')}
                <span>has excellent reputation</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Good</span>
                {renderListening13Test3BanfordQuestion(8, '8. ____')}
                <span>on Bridge Street</span>
              </div>
            </div>

            {/* Meet Linda Section */}
            <div className="space-y-3 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Meet Linda</h5>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Meet Linda on</span>
                {renderListening13Test3BanfordQuestion(9, '9. ____')}
                <span>after 5.30 pm</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• In the</span>
                {renderListening13Test3BanfordQuestion(10, '10. ____')}
                <span>opposite the station</span>
              </div>
            </div>
          </div>
        ) : shouldRenderListening13Test3SleepyLizardForm ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
            {/* Form Header */}
            <div className="border-b border-border/40 pb-4">
              <h4 className="text-foreground text-[18px] font-black tracking-wide">
                The sleepy lizard (<span className="italic font-bold">tiliqua rugosa</span>)
              </h4>
            </div>

            {/* Description Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Description</h5>
              <div className="font-medium text-foreground text-sm">• They are common in Western and South Australia</div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• They are brown, but recognisable by their blue</span>
                {renderListening13Test3LizardQuestion(31, '31. ____')}
              </div>
              <div className="font-medium text-foreground text-sm">• They are relatively large</div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Their diet consists mainly of</span>
                {renderListening13Test3LizardQuestion(32, '32. ____')}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Their main predators are large birds and</span>
                {renderListening13Test3LizardQuestion(33, '33. ____')}
              </div>
            </div>

            {/* Navigation study Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Navigation study</h5>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• One study found that lizards can use the</span>
                {renderListening13Test3LizardQuestion(34, '34. ____')}
                <span>to help them navigate</span>
              </div>
            </div>

            {/* Observations in the wild Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Observations in the wild</h5>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Observations show that these lizards keep the same</span>
                {renderListening13Test3LizardQuestion(35, '35. ____')}
                <span>for several years</span>
              </div>
            </div>

            {/* What people want Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">What people want</h5>
              <div className="space-y-2">
                <div className="font-medium text-foreground text-sm">• Possible reasons:</div>
                <div className="font-medium text-foreground text-sm pl-6">– to improve the survival of their young</div>
                <div className="flex items-center gap-1.5 flex-wrap pl-6 font-medium text-foreground text-sm">
                  <span>(but little</span>
                  {renderListening13Test3LizardQuestion(36, '36. ____')}
                  <span>has been noted between parents and children)</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap pl-6 font-medium text-foreground text-sm">
                  <span>– to provide</span>
                  {renderListening13Test3LizardQuestion(37, '37. ____')}
                  <span>for female lizards</span>
                </div>
              </div>
            </div>

            {/* Tracking study Section */}
            <div className="space-y-3 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Tracking study</h5>
              <div className="flex items-center gap-1.5 flex-wrap pl-6 font-medium text-foreground text-sm">
                <span>– A study was carried out using GPS systems attached to the</span>
                {renderListening13Test3LizardQuestion(38, '38. ____')}
                <span>of the lizards</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap pl-6 font-medium text-foreground text-sm">
                <span>– This provided information on the lizards’ location and even the number of</span>
                {renderListening13Test3LizardQuestion(39, '39. ____')}
                <span>taken</span>
              </div>
              <div className="font-medium text-foreground text-sm pl-6">– It appeared that the lizards were trying to avoid one another</div>
              <div className="flex items-center gap-1.5 flex-wrap pl-6 font-medium text-foreground text-sm">
                <span>– This may be in order to reduce chances of</span>
                {renderListening13Test3LizardQuestion(40, '40. ____')}
              </div>
            </div>
          </div>
        ) : shouldRenderListening13Test4AlexTrainingForm ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm p-6 space-y-6 max-w-2xl mx-auto">
            {/* Form Header */}
            <div className="border-b border-border/40 pb-4">
              <h4 className="text-foreground text-[18px] font-black tracking-wide">
                Alex’s Training
              </h4>
            </div>

            {/* Example Section */}
            <div className="border-b border-border/40 pb-4 space-y-2 text-[14px]">
              <div className="text-muted-foreground italic text-xs">Example</div>
              <div className="text-foreground font-medium">
                Alex complete his training in <span className="italic font-bold">2014</span>
              </div>
            </div>

            {/* About the applicant Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">About the applicant:</h5>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• At first, Alex did his training in the</span>
                {renderListening13Test4AlexQuestion(1, '1. ____')}
                <span>department.</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Alex didn’t have a qualification from school in</span>
                {renderListening13Test4AlexQuestion(2, '2. ____')}
                <span>.</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Alex thinks he should have done the diploma in</span>
                {renderListening13Test4AlexQuestion(3, '3. ____')}
                <span>skills.</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Age of other trainees: the youngest was</span>
                {renderListening13Test4AlexQuestion(4, '4. ____')}
                <span>.</span>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="space-y-3 pb-4 border-b border-border/40 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Benefits of doing training at JPNW:</h5>
              <div className="font-medium text-foreground text-sm">• Lots of opportunities because of the size of the organisation.</div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Trainees receive the same amount of</span>
                {renderListening13Test4AlexQuestion(5, '5. ____')}
                <span>as permanent staff.</span>
              </div>
              <div className="font-medium text-foreground text-sm">• The training experience increases people’s confidence a lot.</div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Trainees go to</span>
                {renderListening13Test4AlexQuestion(6, '6. ____')}
                <span>one day per month.</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• The company is in a convenient</span>
                {renderListening13Test4AlexQuestion(7, '7. ____')}
                <span>.</span>
              </div>
            </div>

            {/* Advice Section */}
            <div className="space-y-3 text-[14px]">
              <h5 className="font-extrabold text-foreground text-[15px]">Advice for interview:</h5>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Don’t wear</span>
                {renderListening13Test4AlexQuestion(8, '8. ____')}
                <span>.</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Don’t be</span>
                {renderListening13Test4AlexQuestion(9, '9. ____')}
                <span>.</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>• Make sure you</span>
                {renderListening13Test4AlexQuestion(10, '10. ____')}
                <span>.</span>
              </div>
            </div>
          </div>
        ) : shouldRenderListening19Test2GuitarGroupForm ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm p-6 space-y-4 max-w-2xl mx-auto">
            {/* Form Header */}
            <div className="border-b border-border/40 pb-4">
              <h4 className="text-foreground text-[18px] font-black tracking-wide">
                Guitar Group
              </h4>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 text-[14px]">
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>Coordinator: Gary</span>
                {renderListening19Test2GuitarQuestion(1, '1. ____')}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>Level:</span>
                {renderListening19Test2GuitarQuestion(2, '2. ____')}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>Place: the</span>
                {renderListening19Test2GuitarQuestion(3, '3. ____')}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                {renderListening19Test2GuitarQuestion(4, '4. ____')}
                <span>Street</span>
              </div>
              <div className="font-medium text-foreground text-sm pl-0">
                First floor, Room T347
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>Time: Thursday morning at</span>
                {renderListening19Test2GuitarQuestion(5, '5. ____')}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap font-medium text-foreground text-sm">
                <span>Recommended website: ‘The perfect</span>
                {renderListening19Test2GuitarQuestion(6, '6. ____')}
                <span>’</span>
              </div>
            </div>
          </div>
        ) : shouldRenderListening13Test1CookeryTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm max-w-3xl mx-auto">
            {/* Table Header */}
            <div className="grid grid-cols-[1.4fr_1.4fr_2.5fr] bg-muted/40 border-b border-border/60 text-xs font-black uppercase tracking-wider text-muted-foreground">
              <div className="px-4 py-3 border-r border-border/60">Cookery Class</div>
              <div className="px-4 py-3 border-r border-border/60">Focus</div>
              <div className="px-4 py-3">Other Information</div>
            </div>

            {/* Row 1 */}
            <div className="border-border/60 grid grid-cols-[1.4fr_1.4fr_2.5fr] border-b text-sm">
              <div className="border-border/60 flex flex-col justify-center border-r px-4 py-4 text-foreground">
                <div className="text-xs text-muted-foreground italic mb-1">Example</div>
                <div className="font-bold">The Food <span className="italic">Studio</span></div>
              </div>
              <div className="border-border/60 flex flex-col justify-center border-r px-4 py-4 text-foreground font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>how to</span>
                  {renderListening13Test1CookeryQuestion(1, '1. ____')}
                  <span>and cook with seasonal products</span>
                </div>
              </div>
              <div className="flex flex-col justify-center px-4 py-4 gap-3 text-foreground font-medium">
                <div>• small classes</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>• also offers</span>
                  {renderListening13Test1CookeryQuestion(2, '2. ____')}
                  <span>classes</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>• clients who return get a</span>
                  {renderListening13Test1CookeryQuestion(3, '3. ____')}
                  <span>discount</span>
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="border-border/60 grid grid-cols-[1.4fr_1.4fr_2.5fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold text-foreground">
                Bond’s Cookery School
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 text-foreground font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>food that is</span>
                  {renderListening13Test1CookeryQuestion(4, '4. ____')}
                </div>
              </div>
              <div className="flex flex-col justify-center px-4 py-4 gap-3 text-foreground font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>• includes recipes to strengthen your</span>
                  {renderListening13Test1CookeryQuestion(5, '5. ____')}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>• they have a free</span>
                  {renderListening13Test1CookeryQuestion(6, '6. ____')}
                  <span>Every Thursday</span>
                </div>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-[1.4fr_1.4fr_2.5fr] text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold text-foreground">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>The</span>
                  {renderListening13Test1CookeryQuestion(7, '7. ____')}
                  <span>Centre</span>
                </div>
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 text-foreground font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>mainly</span>
                  {renderListening13Test1CookeryQuestion(8, '8. ____')}
                  <span>food</span>
                </div>
              </div>
              <div className="flex flex-col justify-center px-4 py-4 gap-3 text-foreground font-medium">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>• located near the</span>
                  {renderListening13Test1CookeryQuestion(9, '9. ____')}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>• a special course in skills with a</span>
                  {renderListening13Test1CookeryQuestion(10, '10. ____')}
                  <span>is sometimes available</span>
                </div>
              </div>
            </div>
          </div>
        ) : shouldRenderListening15Test1TimetableTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Table Title */}
            <div className="bg-muted/10 border-b border-border/60 px-4 py-3 text-sm font-bold text-foreground">
              Timetable for Isle of Man holiday
            </div>
            
            {/* Table Column Headers */}
            <div className="border-border/60 text-muted-foreground bg-muted/20 grid grid-cols-[1fr_1.8fr_2.2fr] border-b text-center text-xs font-bold uppercase">
              <div className="border-border/60 border-r px-4 py-3"></div>
              <div className="border-border/60 border-r px-4 py-3">Activity</div>
              <div className="px-4 py-3">Notes</div>
            </div>

            {/* Row 1 */}
            <div className="border-border/60 grid grid-cols-[1fr_1.8fr_2.2fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold bg-muted/5">
                Day 1
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                Arrive
              </div>
              <div className="flex flex-col justify-center px-4 py-4 gap-2">
                <div>Introduction by manager</div>
                <div>
                  {renderListening15Test1TimetableQuestion(
                    15,
                    'Hotel dining room has view of the 15. ____',
                  )}
                </div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="border-border/60 grid grid-cols-[1fr_1.8fr_2.2fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold bg-muted/5">
                Day 2
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                Tynwald Exhibition and Peel
              </div>
              <div className="flex items-center justify-start px-4 py-4">
                {renderListening15Test1TimetableQuestion(
                  16,
                  'Tynwald may have been founded in 16. ____ not 979.',
                )}
              </div>
            </div>

            {/* Row 3 */}
            <div className="border-border/60 grid grid-cols-[1fr_1.8fr_2.2fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold bg-muted/5">
                Day 3
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                Trip to Snaefell
              </div>
              <div className="flex items-center justify-start px-4 py-4">
                {renderListening15Test1TimetableQuestion(
                  17,
                  'Travel along promenade in a tram; train to Laxey; train to the 17. ____ of Snaefell',
                )}
              </div>
            </div>

            {/* Row 4 */}
            <div className="border-border/60 grid grid-cols-[1fr_1.8fr_2.2fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold bg-muted/5">
                Day 4
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                Free day
              </div>
              <div className="flex items-center justify-start px-4 py-4">
                {renderListening15Test1TimetableQuestion(
                  18,
                  'Company provides a 18. ____ for local transport and heritage sites.',
                )}
              </div>
            </div>

            {/* Row 5 */}
            <div className="border-border/60 grid grid-cols-[1fr_1.8fr_2.2fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold bg-muted/5">
                Day 5
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                {renderListening15Test1TimetableQuestion(
                  19,
                  'Take the 19. ____ railway train from Douglas to Port Erin',
                )}
              </div>
              <div className="flex items-center justify-start px-4 py-4">
                {renderListening15Test1TimetableQuestion(
                  20,
                  'Free time, then coach to Castletown – former 20. ____ has old castle.',
                )}
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-[1fr_1.8fr_2.2fr] text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold bg-muted/5">
                Day 6
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                Leave
              </div>
              <div className="flex items-center justify-start px-4 py-4">
                Leave the island by ferry or plane
              </div>
            </div>
          </div>
        ) : shouldRenderGeneral15Test2DangerTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Table Column Headers */}
            <div className="border-border/60 text-muted-foreground bg-muted/20 grid grid-cols-[1.2fr_1.8fr_1.2fr_1.8fr] border-b text-center text-xs font-bold uppercase">
              <div className="border-border/60 border-r px-4 py-3">Type of danger</div>
              <div className="border-border/60 border-r px-4 py-3">Examples</div>
              <div className="border-border/60 border-r px-4 py-3">Risks involved</div>
              <div className="px-4 py-3">Necessary action</div>
            </div>

            {/* Row 1 */}
            <div className="border-border/60 grid grid-cols-[1.2fr_1.8fr_1.2fr_1.8fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold bg-muted/5">
                Biohazard
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                {renderGeneral15Test2DangerQuestion(
                  15,
                  '15. ____ , mould, bacteria, algae',
                )}
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                can lead to disease and death
              </div>
              <div className="flex items-center justify-start px-4 py-4">
                use protective clothing and equipment
              </div>
            </div>

            {/* Row 2 */}
            <div className="border-border/60 grid grid-cols-[1.2fr_1.8fr_1.2fr_1.8fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold bg-muted/5">
                Confined spaces
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                Contaminants e.g. gases, vapours and dusts
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                injury from fire or explosion
              </div>
              <div className="flex items-center justify-start px-4 py-4">
                follow Safe Work code of practice
              </div>
            </div>

            {/* Row 3 */}
            <div className="border-border/60 grid grid-cols-[1.2fr_1.8fr_1.2fr_1.8fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 text-muted-foreground/60 font-normal bg-muted/5/50">
                Confined spaces
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                high concentrations of harmful airborne contaminants e.g. carbon monoxide
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                {renderGeneral15Test2DangerQuestion(
                  16,
                  '16. ____',
                )}
              </div>
              <div className="flex items-center justify-start px-4 py-4">
                follow Safe Work code of practice
              </div>
            </div>

            {/* Row 4 */}
            <div className="border-border/60 grid grid-cols-[1.2fr_1.8fr_1.2fr_1.8fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 text-muted-foreground/60 font-normal bg-muted/5/50">
                Confined spaces
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                water
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                {renderGeneral15Test2DangerQuestion(
                  17,
                  '17. ____',
                )}
              </div>
              <div className="flex items-center justify-start px-4 py-4">
                cut off water sources
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-[1.2fr_1.8fr_1.2fr_1.8fr] text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-bold bg-muted/5">
                Electricity
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                metal pipes which are conductive
              </div>
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4">
                death from electrocution
              </div>
              <div className="flex items-center justify-start px-4 py-4">
                <div className="flex flex-col gap-2 w-full">
                  <div>
                    {renderGeneral15Test2DangerQuestion(
                      18,
                      '– use insulated 18. ____ . and appropriate equipment',
                    )}
                  </div>
                  <div>
                    {renderGeneral15Test2DangerQuestion(
                      19,
                      '– ensure equipment has 19. ____ on to show it is safe',
                    )}
                  </div>
                  <div>
                    {renderGeneral15Test2DangerQuestion(
                      20,
                      '– make sure electricity has been 20. ____',
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : shouldRenderAcademic15Test4HuarangoTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Table Column Headers */}
            <div className="border-border/60 text-muted-foreground bg-muted/20 grid grid-cols-[1.2fr_1fr] border-b text-center text-xs font-bold uppercase">
              <div className="border-border/60 border-r px-4 py-3">Part of tree</div>
              <div className="px-4 py-3">Traditional use</div>
            </div>

            {/* Row 1 */}
            <div className="border-border/60 grid grid-cols-[1.2fr_1fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-medium">
                {renderAcademic15Test4HuarangoQuestion(
                  6,
                  '6. ____',
                )}
              </div>
              <div className="flex items-center justify-start bg-muted/5 px-4 py-4 leading-relaxed font-semibold">
                Fuel
              </div>
            </div>

            {/* Row 2 */}
            <div className="border-border/60 grid grid-cols-[1.2fr_1fr] border-b text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-medium">
                {renderAcademic15Test4HuarangoQuestion(
                  7,
                  '7. ____ and bark',
                )}
              </div>
              <div className="flex items-center justify-start bg-muted/5 px-4 py-4 leading-relaxed font-semibold">
                Medicine
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-[1.2fr_1fr] text-sm">
              <div className="border-border/60 flex items-center justify-start border-r px-4 py-4 font-medium">
                {renderAcademic15Test4HuarangoQuestion(
                  8,
                  '8. ____',
                )}
              </div>
              <div className="flex items-center justify-start bg-muted/5 px-4 py-4 leading-relaxed font-semibold">
                construction
              </div>
            </div>
          </div>
        ) : shouldRenderAcademic15Test1NutmegTable ? (
          <div className="border-border/60 bg-background/60 overflow-hidden rounded-2xl border shadow-sm">
            {/* Table Column Headers */}
            <div className="border-border/60 text-muted-foreground bg-muted/20 grid grid-cols-[160px_1fr] border-b text-center text-xs font-bold uppercase">
              <div className="border-border/60 border-r px-4 py-3">Period</div>
              <div className="px-4 py-3">Details</div>
            </div>

            {/* Row 1 */}
            <div className="border-border/60 grid grid-cols-[160px_1fr] border-b text-sm">
              <div className="border-border/60 bg-muted/5 flex items-center justify-center border-r px-4 py-4 font-semibold">
                Middle Ages
              </div>
              <div className="flex items-center justify-start px-4 py-4 font-medium">
                {renderAcademic15Test1NutmegQuestion(
                  8,
                  'Nutmeg was brought to Europe by the 8. ____',
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="border-border/60 grid grid-cols-[160px_1fr] border-b text-sm">
              <div className="border-border/60 bg-muted/5 flex items-center justify-center border-r px-4 py-4 font-semibold">
                16th century
              </div>
              <div className="text-foreground/80 flex items-center justify-start px-4 py-4 leading-relaxed font-medium">
                European nations took control of the nutmeg trade
              </div>
            </div>

            {/* Row 3 */}
            <div className="border-border/60 grid grid-cols-[160px_1fr] border-b text-sm">
              <div className="border-border/60 bg-muted/5 flex items-center justify-center border-r px-4 py-4 font-semibold">
                17th century
              </div>
              <div className="flex items-center justify-start px-4 py-4 font-medium">
                {renderAcademic15Test1NutmegQuestion(
                  9,
                  'Demand for nutmeg grew, as it was believed to be effective against the disease known as the 9. ____',
                )}
              </div>
            </div>

            {/* Row 4 */}
            <div className="border-border/60 grid grid-cols-[160px_1fr] border-b text-sm">
              <div className="border-border/60 bg-muted/5 flex items-center justify-center border-r px-4 py-4 font-semibold">
                The Dutch
              </div>
              <div className="flex flex-col justify-center space-y-3 px-4 py-4">
                <div className="text-foreground/80 text-sm leading-relaxed font-medium">
                  – took control of the Banda Islands
                </div>
                <div className="text-foreground/80 text-sm leading-relaxed font-medium">
                  – restricted nutmeg production to a few areas
                </div>
                <div>
                  {renderAcademic15Test1NutmegQuestion(
                    10,
                    '– put 10. ____ on nutmeg to avoid it being cultivated outside the islands',
                  )}
                </div>
                <div>
                  {renderAcademic15Test1NutmegQuestion(
                    11,
                    '– finally obtained the island of 11. ____ from the British',
                  )}
                </div>
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-[160px_1fr] text-sm">
              <div className="bg-muted/5 flex items-center justify-center border-r px-4 py-4 font-semibold">
                Late 18th century
              </div>
              <div className="flex flex-col justify-center space-y-3 px-4 py-4">
                <div>
                  {renderAcademic15Test1NutmegQuestion(
                    12,
                    '1770 – nutmeg plants were secretly taken to 12. ____',
                  )}
                </div>
                <div>
                  {renderAcademic15Test1NutmegQuestion(
                    13,
                    '1778 – half the Banda Islands’ nutmeg plantations were destroyed by a 13. ____',
                  )}
                </div>
              </div>
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
              <div className="border-border/60 border-r px-4 py-4">
                Location
              </div>
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
                {renderListening17Test2TableQuestion(
                  10,
                  'designing the 10. ____',
                )}
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
        ) : shouldRenderListening13Test1Questions26To30Flowchart ? (
          <div className="space-y-6">
            {/* Grid of Choices */}
            <div className="border-border/60 bg-background/40 rounded-2xl border p-4 shadow-sm max-w-3xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-medium">
                <div className="flex gap-2">
                  <span className="font-extrabold text-foreground">A</span>
                  <span className="text-muted-foreground">container</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-extrabold text-foreground">B</span>
                  <span className="text-muted-foreground">soil</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-extrabold text-foreground">C</span>
                  <span className="text-muted-foreground">weight</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-extrabold text-foreground">D</span>
                  <span className="text-muted-foreground">condition</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-extrabold text-foreground">E</span>
                  <span className="text-muted-foreground">height</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-extrabold text-foreground">F</span>
                  <span className="text-muted-foreground">colour</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-extrabold text-foreground">G</span>
                  <span className="text-muted-foreground">types</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-extrabold text-foreground">H</span>
                  <span className="text-muted-foreground">depths</span>
                </div>
              </div>
            </div>

            <div className="text-center font-bold text-base text-foreground mt-6 mb-4">
              Stage in the experiment
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
              {/* Step 1 */}
              <div className="border-border/60 bg-background/60 rounded-2xl border px-5 py-4 shadow-sm text-sm">
                <div className="flex items-center gap-1.5 flex-wrap justify-center font-medium text-foreground">
                  <span>Select seeds of different</span>
                  {renderListening13Test1FlowchartQuestion(26, '26. ____')}
                  <span>and sizes.</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
              </div>

              {/* Step 2 */}
              <div className="border-border/60 bg-background/60 rounded-2xl border px-5 py-4 shadow-sm text-sm">
                <div className="flex items-center gap-1.5 flex-wrap justify-center font-medium text-foreground">
                  <span>Measure and record the</span>
                  {renderListening13Test1FlowchartQuestion(27, '27. ____')}
                  <span>and size of each one.</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
              </div>

              {/* Step 3 */}
              <div className="border-border/60 bg-background/60 rounded-2xl border px-5 py-4 shadow-sm text-sm">
                <div className="flex items-center gap-1.5 flex-wrap justify-center font-medium text-foreground">
                  <span>Decide on the</span>
                  {renderListening13Test1FlowchartQuestion(28, '28. ____')}
                  <span>to be used.</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
              </div>

              {/* Step 4 */}
              <div className="border-border/60 bg-background/60 rounded-2xl border px-5 py-4 shadow-sm text-sm">
                <div className="flex items-center gap-1.5 flex-wrap justify-center font-medium text-foreground">
                  <span>Use a different</span>
                  {renderListening13Test1FlowchartQuestion(29, '29. ____')}
                  <span>for each seed and label it.</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
              </div>

              {/* Step 5 */}
              <div className="border-border/60 bg-background/60 rounded-2xl border px-5 py-4 shadow-sm text-sm">
                <div className="flex items-center gap-1.5 flex-wrap justify-center font-medium text-foreground">
                  <span>After about 3 weeks, record the plant’s</span>
                  {renderListening13Test1FlowchartQuestion(30, '30. ____')}
                  <span>.</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <polyline points="19 12 12 19 5 12"></polyline>
                  </svg>
                </div>
              </div>

              {/* Step 6 */}
              <div className="border-border/60 bg-background/60 rounded-2xl border px-5 py-4 shadow-sm text-sm">
                <div className="flex items-center justify-center font-medium text-foreground">
                  <span>Investigate the findings.</span>
                </div>
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
                        shouldRenderInlineBlankPromptForAcademic17Test2Questions24To26 ||
                        shouldRenderInlineBlankPromptForAcademic17Test3Questions23To26 ||
                        shouldShowPromptTextWhenBlankForQuestions15To21 ||
                        shouldShowPromptTextWhenBlankForGeneralTest2Questions1To7 ||
                        shouldShowPromptTextWhenBlankForGeneralTest2Questions32To35 ||
                        shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 ||
                        shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 ||
                        shouldShowPromptTextWhenBlankForGeneral15Test1Questions23To27 ||
                        shouldShowPromptTextWhenBlankForGeneral15Test3Questions15To20 ||
                        shouldShowPromptTextWhenBlankForAcademic14Test2Questions35To37 ||
                        shouldShowPromptTextWhenBlankForListening14Test1Questions15To20 ||
                        shouldShowPromptTextWhenBlankForListening14Test1Questions26To30 ||
                        shouldShowPromptTextWhenBlankForListening14Test2Questions16To20 ||
                        shouldShowPromptTextWhenBlankForListening14Test2Questions25To30 ||
                        shouldShowPromptTextWhenBlankForListening14Test3Questions15To20 ||
                        shouldShowPromptTextWhenBlankForListening14Test3Questions27To30 ||
                        shouldShowPromptTextWhenBlankForListening14Test4Questions11To16 ||
                        shouldShowPromptTextWhenBlankForListening14Test4Questions26To30 ||
                        shouldRenderAcademic13Test1TourismTable ||
                        shouldShowPromptTextWhenBlankForGeneralTest3Questions1To8 ||
                        shouldShowPromptTextWhenBlankForGeneralTest3Questions9To14 ||
                        shouldShowPromptTextWhenBlankForGeneralTest3Questions33To36 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions1To5 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions15To20 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions25To27 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions31To36 ||
                        shouldShowPromptTextWhenBlankForAcademicTest2Questions14To18 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions14To17 ||
                        shouldShowPromptTextWhenBlankForAcademicTest4Questions14To17 ||
                        shouldShowPromptTextWhenBlankForAcademicTest4Questions18To23 ||
                        shouldShowPromptTextWhenBlankForAcademicTest4Questions11To13 ||
                        shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions23To26 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions31To34 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions38To40 ||
                        shouldRenderInlineBlankPromptForAcademic16Test1Questions8To13 ||
                        shouldRenderInlineBlankPromptForAcademic16Test4Questions1To6 ||
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
                        shouldRenderInlineBlankPromptForListening17Test2Questions1To7 ||
                        shouldRenderInlineBlankPromptForListening15Test2Questions15To20 ||
                        shouldRenderInlineBlankPromptForListening15Test2Questions25To30 ||
                        shouldRenderInlineBlankPromptForListening15Test3Questions27To30 ||
                        shouldRenderInlineBlankPromptForListening15Test4Questions11To16 ||
                        shouldRenderInlineBlankPromptForListening15Test4Questions25To30 ||
                        shouldRenderInlineBlankPromptForListening13Test1Questions14To20
                      }
                      inlineBlankPrompt={
                        shouldRenderInlineBlankPromptForAcademic16Test1Questions8To13 ||
                        shouldRenderInlineBlankPromptForAcademic16Test4Questions1To6 ||
                        shouldRenderInlineBlankPromptForAcademic18Test1Questions1To3 ||
                        shouldRenderInlineBlankPromptForAcademic18Test1Questions22To26 ||
                        shouldRenderInlineBlankPromptForAcademic17Test2Questions24To26 ||
                        shouldRenderInlineBlankPromptForAcademic17Test3Questions23To26 ||
                        shouldRenderInlineBlankPromptForQuestions15To21 ||
                        shouldRenderInlineBlankPromptForQuestions28To32 ||
                        shouldRenderInlineBlankPromptForGeneralTest2Questions21To27 ||
                        shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 ||
                        shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 ||
                        shouldRenderInlineBlankPromptForGeneralTest3Questions22To27 ||
                        shouldShowPromptTextWhenBlankForGeneralTest4Questions15To20 ||
                        shouldShowPromptTextWhenBlankForAcademicTest3Questions38To40 ||
                        shouldShowPromptTextWhenBlankForAcademicTest4Questions11To13 ||
                        shouldShowPromptTextWhenBlankForGeneral15Test1Questions23To27 ||
                        shouldShowPromptTextWhenBlankForGeneral15Test3Questions15To20 ||
                        shouldShowPromptTextWhenBlankForAcademic14Test2Questions35To37 ||
                        shouldShowPromptTextWhenBlankForListening14Test1Questions15To20 ||
                        shouldShowPromptTextWhenBlankForListening14Test1Questions26To30 ||
                        shouldShowPromptTextWhenBlankForListening14Test2Questions16To20 ||
                        shouldShowPromptTextWhenBlankForListening14Test2Questions25To30 ||
                        shouldShowPromptTextWhenBlankForListening14Test3Questions15To20 ||
                        shouldShowPromptTextWhenBlankForListening14Test3Questions27To30 ||
                        shouldShowPromptTextWhenBlankForListening14Test4Questions11To16 ||
                        shouldShowPromptTextWhenBlankForListening14Test4Questions26To30 ||
                        shouldRenderAcademic13Test1TourismTable ||
                        shouldRenderInlineBlankPromptForAcademicTest2Questions19To22 ||
                        shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                        shouldRenderInlineBlankPromptForListeningQuestions16To20 ||
                        shouldRenderInlineBlankPromptForListeningQuestions25To30 ||
                        shouldRenderInlineBlankPromptForListening16Test3Questions15To20 ||
                        shouldRenderInlineBlankPromptForListening18Test2Questions15To20 ||
                        shouldRenderInlineBlankPromptForListening15Test2Questions15To20 ||
                        shouldRenderInlineBlankPromptForListening15Test2Questions25To30 ||
                        shouldRenderInlineBlankPromptForListening15Test3Questions27To30 ||
                        shouldRenderInlineBlankPromptForListening15Test4Questions11To16 ||
                        shouldRenderInlineBlankPromptForListening15Test4Questions25To30 ||
                        shouldRenderInlineBlankPromptForListening13Test1Questions14To20 ||
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
                                        : shouldRenderInlineBlankPromptForAcademic16Test4Questions1To6 &&
                                            academic16Test4Questions1To6Prompts.has(
                                              item.qNum,
                                            )
                                          ? academic16Test4Questions1To6Prompts.get(
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
                            shouldRenderInlineBlankPromptForGeneral16 ||
                            shouldRenderInlineBlankPromptForGeneral17 ||
                            shouldRenderInlineBlankPromptForAcademic18Test1Questions1To3 ||
                            shouldRenderInlineBlankPromptForAcademic18Test1Questions22To26 ||
                            shouldRenderInlineBlankPromptForAcademic17Test2Questions24To26 ||
                            shouldRenderInlineBlankPromptForAcademic17Test3Questions23To26 ||
                            shouldShowPromptTextWhenBlankForQuestions15To21 ||
                            shouldShowPromptTextWhenBlankForGeneralTest2Questions1To7 ||
                        shouldShowPromptTextWhenBlankForGeneralTest2Questions32To35 ||
                            shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 ||
                            shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 ||
                            shouldShowPromptTextWhenBlankForGeneral15Test1Questions23To27 ||
                            shouldShowPromptTextWhenBlankForGeneral15Test3Questions15To20 ||
                            shouldShowPromptTextWhenBlankForAcademic14Test2Questions35To37 ||
                            shouldShowPromptTextWhenBlankForListening14Test1Questions15To20 ||
                            shouldShowPromptTextWhenBlankForListening14Test1Questions26To30 ||
                            shouldShowPromptTextWhenBlankForListening14Test2Questions16To20 ||
                            shouldShowPromptTextWhenBlankForListening14Test2Questions25To30 ||
                            shouldShowPromptTextWhenBlankForListening14Test3Questions15To20 ||
                            shouldShowPromptTextWhenBlankForListening14Test3Questions27To30 ||
                            shouldShowPromptTextWhenBlankForListening14Test4Questions11To16 ||
                            shouldShowPromptTextWhenBlankForListening14Test4Questions26To30 ||
                            shouldRenderAcademic13Test1TourismTable ||
                            shouldShowPromptTextWhenBlankForGeneralTest3Questions1To8 ||
                            shouldShowPromptTextWhenBlankForGeneralTest3Questions9To14 ||
                            shouldShowPromptTextWhenBlankForGeneralTest3Questions33To36 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions1To5 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions15To20 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions25To27 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions31To36 ||
                            shouldShowPromptTextWhenBlankForAcademicTest2Questions14To18 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions14To17 ||
                            shouldShowPromptTextWhenBlankForAcademicTest4Questions14To17 ||
                            shouldShowPromptTextWhenBlankForAcademicTest4Questions18To23 ||
                            shouldShowPromptTextWhenBlankForAcademicTest4Questions11To13 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions23To26 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions31To34 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions38To40 ||
                            shouldRenderInlineBlankPromptForAcademic16Test1Questions8To13 ||
                            shouldRenderInlineBlankPromptForAcademic16Test4Questions1To6 ||
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
                            shouldRenderInlineBlankPromptForListening17Test2Questions1To7 ||
                            shouldRenderInlineBlankPromptForListening15Test2Questions15To20 ||
                            shouldRenderInlineBlankPromptForListening15Test2Questions25To30 ||
                            shouldRenderInlineBlankPromptForListening15Test3Questions27To30 ||
                            shouldRenderInlineBlankPromptForListening15Test4Questions11To16 ||
                            shouldRenderInlineBlankPromptForListening15Test4Questions25To30 ||
                            shouldRenderInlineBlankPromptForAcademic13Test4Questions9To13
                          }
                          inlineBlankPrompt={
                            shouldRenderInlineBlankPromptForAcademic16Test1Questions8To13 ||
                            shouldRenderInlineBlankPromptForAcademic16Test4Questions1To6 ||
                            shouldRenderInlineBlankPromptForGeneral16 ||
                            shouldRenderInlineBlankPromptForGeneral17 ||
                            shouldRenderInlineBlankPromptForAcademic18Test1Questions1To3 ||
                            shouldRenderInlineBlankPromptForAcademic18Test1Questions22To26 ||
                            shouldRenderInlineBlankPromptForAcademic17Test2Questions24To26 ||
                            shouldRenderInlineBlankPromptForAcademic17Test3Questions23To26 ||
                            shouldRenderInlineBlankPromptForQuestions15To21 ||
                            shouldRenderInlineBlankPromptForQuestions28To32 ||
                            shouldRenderInlineBlankPromptForGeneralTest2Questions21To27 ||
                            shouldRenderInlineBlankPromptForGeneral18Test2Questions22To27 ||
                            shouldRenderInlineBlankPromptForGeneral18Test3Questions15To20 ||
                            shouldRenderInlineBlankPromptForGeneralTest3Questions22To27 ||
                            shouldShowPromptTextWhenBlankForGeneralTest4Questions15To20 ||
                            shouldShowPromptTextWhenBlankForAcademicTest3Questions38To40 ||
                            shouldShowPromptTextWhenBlankForAcademicTest4Questions11To13 ||
                            shouldShowPromptTextWhenBlankForGeneral15Test1Questions23To27 ||
                            shouldShowPromptTextWhenBlankForGeneral15Test3Questions15To20 ||
                            shouldShowPromptTextWhenBlankForAcademic14Test2Questions35To37 ||
                            shouldShowPromptTextWhenBlankForListening14Test1Questions15To20 ||
                            shouldShowPromptTextWhenBlankForListening14Test1Questions26To30 ||
                            shouldShowPromptTextWhenBlankForListening14Test2Questions16To20 ||
                            shouldShowPromptTextWhenBlankForListening14Test2Questions25To30 ||
                            shouldShowPromptTextWhenBlankForListening14Test3Questions15To20 ||
                            shouldShowPromptTextWhenBlankForListening14Test3Questions27To30 ||
                            shouldShowPromptTextWhenBlankForListening14Test4Questions11To16 ||
                            shouldShowPromptTextWhenBlankForListening14Test4Questions26To30 ||
                            shouldRenderAcademic13Test1TourismTable ||
                            shouldRenderInlineBlankPromptForAcademicTest2Questions19To22 ||
                            shouldRenderInlineBlankPromptForAcademicTest3Questions18To22 ||
                            shouldRenderInlineBlankPromptForListeningQuestions16To20 ||
                            shouldRenderInlineBlankPromptForListeningQuestions25To30 ||
                            shouldRenderInlineBlankPromptForListening16Test3Questions15To20 ||
                            shouldRenderInlineBlankPromptForListening18Test2Questions15To20 ||
                            shouldRenderInlineBlankPromptForListening15Test2Questions15To20 ||
                            shouldRenderInlineBlankPromptForListening15Test2Questions25To30 ||
                            shouldRenderInlineBlankPromptForListening15Test3Questions27To30 ||
                            shouldRenderInlineBlankPromptForListening15Test4Questions11To16 ||
                            shouldRenderInlineBlankPromptForListening15Test4Questions25To30 ||
                            shouldRenderInlineBlankPromptForGeneral18Test4Questions35To40 ||
                            shouldRenderInlineBlankPromptForListening18Test3Questions1To4 ||
                            shouldRenderInlineBlankPromptForListening17Test2Questions1To7 ||
                            (shouldShowPromptTextWhenBlankForListeningTest2Questions1To6 &&
                              item.qNum >= 1 &&
                              item.qNum <= 6) ||
                            shouldShowPromptTextWhenBlankForListeningTest4Questions26To30 ||
                            shouldRenderInlineBlankPromptForAcademic13Test4Questions9To13
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
