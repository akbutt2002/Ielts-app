'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
  BookOpen,
  Headphones,
} from 'lucide-react';

import { type IeltsTestRecord, getAllIeltsTests, slugify } from '@kit/ielts';
import { ModeToggle } from '@kit/ui/mode-toggle';
import { SidebarTrigger, useSidebar } from '@kit/ui/shadcn-sidebar';
import { ExamScreen } from './components/ExamScreen';
import { StartScreen } from './components/StartScreen';
import { useTestTimer } from './hooks/useTestTimer';
import { buildStartScreenDetails } from './utils/start-screen';
import {
  boxRangePattern,
  formatInstructionLines,
  getInstructionLineStyle,
  normalizeInstructionFragment,
  questionRangePattern,
} from './utils/instruction-formatter';
import {
  uniqueQuestionNumbers,
  buildSequentialQuestionRange,
  countBlankMarkers,
  isPureRangeLine,
  detectQuestionMarker,
  extractQuestionNumbersFromRangeText,
  extractQuestionNumbersFromHeader,
  inferListeningQuestionNumbersFromText,
  estimateListeningSlotCount,
  expandQuestionNumbersToSlotCount,
  isEmptyListeningDuplicateBlock,
  hasRenderableAnswerSlot,
  normalizeChoiceLabel,
  normalizeBlockChoices,
  isChoiceLine,
  isQuestionContentHeadingLine,
  extractInlineQuestionItems,
  detectTrailingBlankQuestionMarker,
  extractQuestionNumbersFromQuestionText,
  normalizeQuestionBlock,
  getExpectedQuestionNumbers,
  findRawQuestionStart,
  extractSupplementalQuestionBlock,
  supplementMissingQuestionBlocks,
  normalizeSchemaQuestionBlocks,
  normalizeReadingQuestionBlocks,
  normalizeListeningQuestionBlocks,
  normalizeReadingSections,
  normalizeTestAudio,
  normalizeTestImages,
  parseStructuredNoteBlock,
  parseStructuredSummaryBlock,
  compactPromptLines,
  stripQuestionNumberPrefix,
  stripLeadingBulletMarker,
  formatQuestionRangeLabel,
  parseQuestionBlock,
  buildAnswerLookup,
} from './utils/question-parser';
import {
  answerMatches,
  getChoiceAnswerValue,
  getChoiceComparisonValue,
  normalizeAnswerText,
  parsePairedChoiceSelection,
  splitAnswerVariants,
} from './utils/answer-matcher';


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


export default function TestPage({ test }: { test: IeltsTestRecord }) {
  const isListening = test?.test_type === 'listening';
  const router = useRouter();
  const { open: sidebarOpen } = useSidebar();

  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreRingAnimated, setScoreRingAnimated] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const { timeLeft, setTimeLeft } = useTestTimer(isStarted, isSubmitted);
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
  const listeningLeadInQuestion = useMemo(() => {
    if (
      !isListening ||
      !/Cambridge 19 Listening Test 1/i.test(test?.title ?? '')
    ) {
      return null;
    }

    const leadInBlock = parsedQuestionBlocks.find(
      (block) => block.questionNumbers[0] === 11,
    );
    const leadInItem = leadInBlock?.items[0];

    if (!leadInBlock || !leadInItem) {
      return null;
    }

    return {
      qNum: leadInItem.qNum,
      prompt: leadInItem.prompt,
      choices: leadInBlock.choices ?? [],
      pairedQuestionNumbers: leadInBlock.questionNumbers ?? [],
    };
  }, [isListening, parsedQuestionBlocks, test?.title]);
  const pairedChoiceQuestionBlocks = useMemo(
    () =>
      isListening
        ? parsedQuestionBlocks.filter(
            (block) =>
              block.questionNumbers.length === 2 &&
              (block.choices?.length ?? 0) > 0,
          )
        : [],
    [isListening, parsedQuestionBlocks],
  );
  const pairedChoiceBlockLookup = useMemo(() => {
    const lookup = new Map<number, ParsedQuestionBlock>();

    pairedChoiceQuestionBlocks.forEach((block) => {
      const firstQuestion = block.questionNumbers[0];

      if (firstQuestion) {
        lookup.set(firstQuestion, block);
      }
    });

    return lookup;
  }, [pairedChoiceQuestionBlocks]);
  const pairedChoiceHiddenQuestionNumbers = useMemo(
    () =>
      new Set(
        pairedChoiceQuestionBlocks
          .map((block) => block.questionNumbers[1] ?? 0)
          .filter((qNum) => qNum > 0),
      ),
    [pairedChoiceQuestionBlocks],
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
  const answeredQuestionCount = useMemo(() => {
    let count = 0;

    visibleQuestionNumbers.forEach((qNum) => {
      if (pairedChoiceHiddenQuestionNumbers.has(qNum)) {
        return;
      }

      const pairedBlock = pairedChoiceBlockLookup.get(qNum);

      if (pairedBlock) {
        count += parsePairedChoiceSelection(userAnswers[qNum] ?? '').length;
        return;
      }

      if ((userAnswers[qNum] ?? '').trim()) {
        count += 1;
      }
    });

    return count;
  }, [
    pairedChoiceBlockLookup,
    pairedChoiceHiddenQuestionNumbers,
    userAnswers,
    visibleQuestionNumbers,
  ]);
  const isAllAnswered = answeredQuestionCount >= totalQuestions;
  const isTestLocked = isSubmitted || timeLeft === 0;

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
    <StartScreen
      sidebarOpen={sidebarOpen}
      startScreen={startScreen}
      startScreenHero={startScreenHero}
      previousTestHref={previousTestHref}
      nextTestHref={nextTestHref}
      onStartTest={() => setIsStarted(true)}
      onPreviousTest={() =>
        previousTestHref ? router.push(previousTestHref) : null
      }
      onNextTest={() => (nextTestHref ? router.push(nextTestHref) : null)}
    />
  );

  return isStarted ? (
    <ExamScreen
      test={test}
      isListening={isListening}
      timeLeft={timeLeft}
      totalQuestions={totalQuestions}
      scoreRingAnimated={scoreRingAnimated}
      showScoreModal={showScoreModal}
      setShowScoreModal={setShowScoreModal}
      isSubmitted={isSubmitted}
      isAllAnswered={isAllAnswered}
      answerLookup={answerLookup}
      pairedChoiceQuestionBlocks={pairedChoiceQuestionBlocks}
      userAnswers={userAnswers}
      readingPassages={readingPassages}
      readingSections={readingSections}
      listeningAudio={listeningAudio}
      listeningImages={listeningImages}
      displayQuestionGroups={displayQuestionGroups}
      listeningLeadInQuestion={listeningLeadInQuestion}
      isTestLocked={isTestLocked}
      setUserAnswers={setUserAnswers}
      handleSubmitTest={handleSubmitTest}
      handleCloseScoreModal={handleCloseScoreModal}
      handleRetryTest={handleRetryTest}
      handleGoToTests={handleGoToTests}
    />
  ) : (
    renderStartScreen()
  );
}

