'use client';

import Link from 'next/link';

import {
  Check,
  ChevronLeft,
  Clock,
  FileText,
  Headphones,
  HelpCircle,
  Layers3,
  Play,
  Trophy,
  X,
} from 'lucide-react';

import { PageBody, PageHeader } from '@kit/ui/page';
import { cn } from '@kit/ui/utils';

import { ScoreModal } from './ScoreModal';
import { PassagePanel } from './PassagePanel';
import { QuestionGroup } from './QuestionGroup';
import {
  answerMatches,
  getChoiceComparisonValue,
  parsePairedChoiceSelection,
} from '../utils/answer-matcher';
import { renderInstructionText } from './instruction-renderers';
import { calculateScore, getBandScore } from '../hooks/useTestScoring';

const scoreTargetBands = [
  { band: 4.0, minimumCorrectAnswers: 10 },
  { band: 5.0, minimumCorrectAnswers: 15 },
  { band: 6.0, minimumCorrectAnswers: 23 },
  { band: 7.0, minimumCorrectAnswers: 30 },
  { band: 8.0, minimumCorrectAnswers: 35 },
  { band: 9.0, minimumCorrectAnswers: 39 },
] as const;

export function ExamScreen({
  test,
  isListening,
  timeLeft,
  totalQuestions,
  scoreRingAnimated,
  showScoreModal,
  setShowScoreModal,
  isSubmitted,
  isAllAnswered,
  answerLookup,
  pairedChoiceQuestionBlocks,
  userAnswers,
  readingPassages,
  readingSections,
  listeningAudio,
  listeningImages,
  displayQuestionGroups,
  listeningLeadInQuestion,
  isTestLocked,
  setUserAnswers,
  handleSubmitTest,
  handleCloseScoreModal,
  handleRetryTest,
  handleGoToTests,
}: any) {
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
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
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

  const score = calculateScore({
    scoredQuestionNumbers: displayQuestionGroups.flatMap((group: any) =>
      group.flatMap((block: any) => block.questionNumbers ?? []),
    ),
    answerLookup,
    pairedChoiceQuestionBlocks,
    userAnswers,
    parsePairedChoiceSelection,
    answerMatches,
    getChoiceComparisonValue,
  });
  const bandScore = getBandScore(score);
  const bandScoreLabel = formatBandValue(bandScore);
  const nextTarget = getNextTargetBand(score);
  const nextTargetBandLabel = formatBandValue(nextTarget.band);
  const performanceLabel = getPerformanceLabel(bandScore);
  const timeUsedMinutes = Math.max(0, Math.floor((3600 - timeLeft) / 60));
  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = scoreRingAnimated
    ? Math.min(1, Math.max(0, score / Math.max(totalQuestions, 1)))
    : 0;
  const ringDashOffset = ringCircumference * (1 - ringProgress);
  const useSplitReadingLayout = !isListening && readingPassages.length > 0;
  const scoreDialog = (
    <ScoreModal
      open={showScoreModal}
      onOpenChange={setShowScoreModal}
      bandScore={bandScore}
      bandScoreLabel={bandScoreLabel}
      performanceLabel={performanceLabel}
      nextTargetBandLabel={nextTargetBandLabel}
      nextTarget={nextTarget}
      score={score}
      totalQuestions={totalQuestions}
      timeUsedMinutes={timeUsedMinutes}
      scoreRingAnimated={scoreRingAnimated}
      onClose={handleCloseScoreModal}
      onRetry={handleRetryTest}
      onGoToTests={handleGoToTests}
    />
  );

  if (isListening) {
    return (
      <>
        <PageHeader
          title={test.title}
          description={`${totalQuestions} questions · ${formatTime(
            timeLeft,
          )} remaining`}
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
                          {listeningAudio.map((audio: any, index: number) => (
                            <audio
                              key={`${audio?.url ?? audio}-${index}`}
                              controls
                              className="w-full"
                              src={String(audio?.url ?? audio)}
                            />
                          ))}
                        </div>
                      </section>
                    ) : null}

                    {listeningImages.length > 0 ? (
                      <section className="space-y-3">
                        {/Cambridge 19 Listening Test 1/i.test(
                          test?.title ?? '',
                        ) ? (
                          <div className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">
                            Questions 16-20
                          </div>
                        ) : null}

                        <div className="text-muted-foreground text-[11px] font-black tracking-[0.22em] uppercase">
                          Diagram
                        </div>

                        <div className="grid gap-4">
                          {listeningImages.map((image: any, index: number) => (
                            <div
                              key={`${image?.url ?? image}-${index}`}
                              className="border-border/60 bg-background/80 overflow-hidden rounded-3xl border shadow-sm"
                            >
                              <img
                                src={String(image?.url ?? image)}
                                alt={
                                  image?.alt ?? `Listening image ${index + 1}`
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
                      {displayQuestionGroups.map((group: any, groupIdx: number) => (
                        <QuestionGroup
                          key={`group-${groupIdx}`}
                          group={group}
                          groupIdx={groupIdx}
                          isListening={isListening}
                          listeningLeadInQuestion={listeningLeadInQuestion}
                          answerLookup={answerLookup}
                          userAnswers={userAnswers}
                          isSubmitted={isSubmitted}
                          isTestLocked={isTestLocked}
                          setUserAnswers={setUserAnswers}
                          renderAnswerStatusIcon={renderAnswerStatusIcon}
                        />
                      ))}
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
          description={`${totalQuestions} questions · ${formatTime(
            timeLeft,
          )} remaining`}
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
              <PassagePanel passages={readingPassages} />

              <section className="border-border/60 bg-background/80 min-h-0 overflow-hidden rounded-[28px] border shadow-sm">
                <div className="flex h-full min-h-0 flex-col">
                  <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-8">
                      {displayQuestionGroups.map((group: any, groupIdx: number) => (
                        <QuestionGroup
                          key={`group-${groupIdx}`}
                          group={group}
                          groupIdx={groupIdx}
                          isListening={isListening}
                          listeningLeadInQuestion={listeningLeadInQuestion}
                          answerLookup={answerLookup}
                          userAnswers={userAnswers}
                          isSubmitted={isSubmitted}
                          isTestLocked={isTestLocked}
                          setUserAnswers={setUserAnswers}
                          renderAnswerStatusIcon={renderAnswerStatusIcon}
                        />
                      ))}
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
                {listeningImages.map((image: any, index: number) => (
                  <div
                    key={`${image?.url ?? image}-${index}`}
                    className="border-border/60 bg-background/80 overflow-hidden rounded-3xl border shadow-sm"
                  >
                    <img
                      src={String(image?.url ?? image)}
                      alt={image?.alt ?? `Listening image ${index + 1}`}
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
                  {listeningAudio.map((audio: any, index: number) => (
                    <audio
                      key={`${audio?.url ?? audio}-${index}`}
                      controls
                      className="w-full"
                      src={String(audio?.url ?? audio)}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {readingSections.length > 0 ? (
              <section className="space-y-5">
                {readingSections.map((section: any, sectionIdx: number) => (
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
                      {(section.passages ?? []).map(
                        (passage: any, passageIdx: number) => (
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
                                {passage.text.split(/\n+/).map((line: string, lineIdx: number) => (
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
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </section>
            ) : null}

            <div className="space-y-8">
              {displayQuestionGroups.map((group: any, groupIdx: number) => (
                <QuestionGroup
                  key={`group-${groupIdx}`}
                  group={group}
                  groupIdx={groupIdx}
                  isListening={isListening}
                  listeningLeadInQuestion={listeningLeadInQuestion}
                  answerLookup={answerLookup}
                  userAnswers={userAnswers}
                  isSubmitted={isSubmitted}
                  isTestLocked={isTestLocked}
                  setUserAnswers={setUserAnswers}
                  renderAnswerStatusIcon={renderAnswerStatusIcon}
                />
              ))}
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
}
