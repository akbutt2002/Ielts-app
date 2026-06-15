export function calculateScore({
  scoredQuestionNumbers,
  answerLookup,
  pairedChoiceQuestionBlocks,
  userAnswers,
  parsePairedChoiceSelection,
  answerMatches,
  getChoiceComparisonValue,
  getPairedChoiceComparisonValues,
}: any) {
  let score = 0;

  const questionNumbersToScore: number[] = Array.from(
    new Set<number>(
      scoredQuestionNumbers.length > 0
        ? scoredQuestionNumbers
        : Array.from(answerLookup.keys()),
    ),
  );
  const handledPairedQuestionNumbers = new Set<number>();
  const handledPairedBlockKeys = new Set<string>();

  pairedChoiceQuestionBlocks.forEach((block: any) => {
    const [firstQuestion, secondQuestion] = block.questionNumbers;

    if (!firstQuestion || !secondQuestion) {
      return;
    }

    const pairedBlockKey = [firstQuestion, secondQuestion]
      .slice()
      .sort((a, b) => a - b)
      .join('-');

    if (handledPairedBlockKeys.has(pairedBlockKey)) {
      return;
    }

    handledPairedBlockKeys.add(pairedBlockKey);
    handledPairedQuestionNumbers.add(firstQuestion);
    handledPairedQuestionNumbers.add(secondQuestion);

    const selectedChoices = parsePairedChoiceSelection(
      userAnswers[firstQuestion] ?? '',
    );
    const correctChoices = Array.from(
      new Set(
        block.questionNumbers
          .map((qNum: number) => answerLookup.get(qNum) ?? '')
          .flatMap((answer: string) =>
            getPairedChoiceComparisonValues(answer),
          )
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

export function getBandScore(score: number, testType: 'listening' | 'academic' | 'general' = 'academic') {
  if (testType === 'listening') {
    if (score >= 39) return 9.0;
    if (score >= 37) return 8.5;
    if (score >= 35) return 8.0;
    if (score >= 32) return 7.5;
    if (score >= 30) return 7.0;
    if (score >= 26) return 6.5;
    if (score >= 23) return 6.0;
    if (score >= 18) return 5.5;
    if (score >= 15) return 5.0;
    if (score >= 12) return 4.5;
    if (score >= 10) return 4.0;
    if (score >= 8) return 3.5;
    if (score >= 6) return 3.0;
    if (score >= 4) return 2.5;
    if (score >= 3) return 2.0;
    if (score >= 2) return 1.5;
    if (score >= 1) return 1.0;
    return 0;
  }

  if (testType === 'general') {
    if (score >= 40) return 9.0;
    if (score >= 39) return 8.5;
    if (score >= 37) return 8.0;
    if (score >= 36) return 7.5;
    if (score >= 34) return 7.0;
    if (score >= 32) return 6.5;
    if (score >= 30) return 6.0;
    if (score >= 27) return 5.5;
    if (score >= 23) return 5.0;
    if (score >= 19) return 4.5;
    if (score >= 15) return 4.0;
    if (score >= 12) return 3.5;
    if (score >= 9) return 3.0;
    if (score >= 6) return 2.5;
    if (score >= 4) return 2.0;
    if (score >= 3) return 1.5;
    if (score >= 2) return 1.0;
    return 0;
  }

  // academic
  if (score >= 39) return 9.0;
  if (score >= 37) return 8.5;
  if (score >= 35) return 8.0;
  if (score >= 33) return 7.5;
  if (score >= 30) return 7.0;
  if (score >= 27) return 6.5;
  if (score >= 23) return 6.0;
  if (score >= 19) return 5.5;
  if (score >= 15) return 5.0;
  if (score >= 13) return 4.5;
  if (score >= 10) return 4.0;
  if (score >= 8) return 3.5;
  if (score >= 6) return 3.0;
  if (score >= 4) return 2.5;
  if (score >= 3) return 2.0;
  if (score >= 2) return 1.5;
  if (score >= 1) return 1.0;
  return 0;
}
