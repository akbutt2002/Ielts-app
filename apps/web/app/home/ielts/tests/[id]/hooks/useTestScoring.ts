export function calculateScore({
  scoredQuestionNumbers,
  answerLookup,
  pairedChoiceQuestionBlocks,
  userAnswers,
  parsePairedChoiceSelection,
  answerMatches,
  getChoiceComparisonValue,
}: any) {
  let score = 0;

  const questionNumbersToScore =
    scoredQuestionNumbers.length > 0
      ? scoredQuestionNumbers
      : Array.from(answerLookup.keys());
  const handledPairedQuestionNumbers = new Set<number>();

  pairedChoiceQuestionBlocks.forEach((block: any) => {
    const [firstQuestion, secondQuestion] = block.questionNumbers;

    if (!firstQuestion || !secondQuestion) {
      return;
    }

    handledPairedQuestionNumbers.add(firstQuestion);
    handledPairedQuestionNumbers.add(secondQuestion);

    const selectedChoices = parsePairedChoiceSelection(
      userAnswers[firstQuestion] ?? '',
    );
    const correctChoices = Array.from(
      new Set(
        block.questionNumbers
          .map((qNum: number) => answerLookup.get(qNum) ?? '')
          .map((answer: string) => getChoiceComparisonValue(answer))
          .filter(Boolean),
      ),
    );

    score += selectedChoices.filter((choice: string) =>
      correctChoices.includes(choice),
    ).length;
  });

  questionNumbersToScore.forEach((qNum: number) => {
    if (handledPairedQuestionNumbers.has(qNum)) {
      return;
    }

    const correctAnswer = answerLookup.get(qNum) ?? '';

    if (answerMatches(userAnswers[qNum] ?? '', correctAnswer)) {
      score++;
    }
  });

  return score;
}

export function getBandScore(score: number) {
  if (score >= 39) return 9;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8;
  if (score >= 32) return 7.5;
  if (score >= 30) return 7;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4;

  return 0;
}
