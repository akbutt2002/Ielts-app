function normalizeAnswerAlias(value: string) {
  if (value === 'ng') {
    return 'not given';
  }

  return value;
}

export function normalizeAnswerText(value: string) {
  return normalizeAnswerAlias(
    value
      .normalize('NFKC')
      .replace(/[\u2018\u2019\u0060]/g, "'")
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/[^a-z0-9]+/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase(),
  );
}

export function splitAnswerVariants(answer: string) {
  return answer
    .split(/\s*\/\s*|\s+or\s+/i)
    .flatMap((part) => {
      const trimmedPart = part.trim();
      const withoutParentheses = trimmedPart.replace(/\([^)]*\)/g, '').trim();
      const withParenthesesContent = trimmedPart
        .replace(/\(([^)]*)\)/g, '$1')
        .trim();

      return [trimmedPart, withoutParentheses, withParenthesesContent];
    })
    .filter(Boolean);
}

export function getChoiceAnswerValue(option: string) {
  const trimmedOption = option.trim();
  const letterMatch = trimmedOption.match(/^([A-Z])(?:[\s.)\-–—:]|$)/i);

  if (letterMatch?.[1]) {
    return letterMatch[1].toUpperCase();
  }

  return trimmedOption;
}

export function getChoiceComparisonValue(option: string) {
  return normalizeAnswerText(getChoiceAnswerValue(option));
}

export function getChoiceComparisonValues(answer: string) {
  return splitAnswerVariants(answer)
    .map((variant) => getChoiceComparisonValue(variant))
    .filter(Boolean);
}

export function getPairedChoiceComparisonValues(answer: string) {
  return splitAnswerVariants(answer)
    .flatMap((variant) =>
      variant
        .replace(/\([^)]*\)/g, ' ')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/[\/,]+/g, ' ')
        .split(/\s+/)
        .map((part) => part.trim())
        .filter((part) => /^[A-Z]$/i.test(part))
        .map((part) => getChoiceComparisonValue(part)),
    )
    .filter(Boolean);
}

export function answerMatches(userAnswer: string, correctAnswer: string) {
  let normalizedUserAnswer = normalizeAnswerText(userAnswer ?? '');

  if (!normalizedUserAnswer) {
    return false;
  }

  // Clean correct answer of common IELTS instruction prefixes/suffixes
  let cleanedCorrect = correctAnswer
    .replace(/\bin\s+either\s+order\b/gi, '')
    .replace(/\bboth\s+required\s+for\s+one\s+mark\b/gi, '')
    .replace(/\(\s*\)/g, '')
    .trim();

  // If the clean answer is empty, fallback to original
  if (!cleanedCorrect) {
    cleanedCorrect = correctAnswer;
  }

  const variants = splitAnswerVariants(cleanedCorrect);

  if (variants.length === 0) {
    return normalizeAnswerText(cleanedCorrect) === normalizedUserAnswer;
  }

  // Check simple variant matching
  if (variants.some(
    (variant) => normalizeAnswerText(variant) === normalizedUserAnswer,
  )) {
    return true;
  }

  // For answers that are marked with "in either order" or specify multiple components,
  // we check if they match set-wise (order-independent).
  const isEitherOrder = /either\s+order/i.test(correctAnswer) || /both\s+required/i.test(correctAnswer);
  if (isEitherOrder) {
    const userWords = normalizedUserAnswer.split(/[\s,]+/i).filter((w) => w !== 'and' && w !== 'or' && w !== 'both');
    for (const variant of variants) {
      const variantNorm = normalizeAnswerText(variant);
      const variantWords = variantNorm.split(/[\s,]+/i).filter((w) => w !== 'and' && w !== 'or' && w !== 'both');
      if (variantWords.length > 0 && variantWords.length === userWords.length) {
        const match = variantWords.every((w) => userWords.includes(w));
        if (match) {
          return true;
        }
      }
    }
  }

  return false;
}

export function parsePairedChoiceSelection(value: string) {
  return value
    .split('|')
    .map((part) => getChoiceComparisonValue(part))
    .filter(Boolean);
}
