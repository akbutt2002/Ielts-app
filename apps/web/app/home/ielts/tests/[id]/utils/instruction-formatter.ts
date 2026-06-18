export const questionRangePattern =
  /^Questions?\s+\d+(?:(?:\s*(?:to|-|\u2013|\u2014)\s*|\s+and\s+)\d+)?\.?$/i;

export const boxRangePattern =
  /^boxes?\s+\d+(?:\s*(?:to|-|\u2013|\u2014)\s*\d+)?\.?$/i;

const instructionStrongLinePatterns = [
  questionRangePattern,
  /^List of Headings$/i,
];

const instructionMediumLinePatterns = [
  /^Do the following statements agree with the information given in the text\?$/i,
  /^For which review are the following statements true\?$/i,
  /^Complete the (?:sentences|notes|summary) below\.?$/i,
  /^Label the map below\.?$/i,
];

export function normalizeInstructionFragment(line: string) {
  return line
    .replace(/ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“|ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â|Ã¢â‚¬â€œ|Ã¢â‚¬â€/g, '-')
    .replace(/ÃƒÂ¢Ã¢â€šÂ¬Ã‹Å“|ÃƒÂ¢Ã¢â€šÂ¬Ã¢â€žÂ¢|Ã¢â‚¬Ëœ|Ã¢â‚¬â„¢/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function joinInstructionFragments(current: string, next: string) {
  const normalizedCurrent = current.trim();
  const normalizedNext = next.trim();

  if (!normalizedCurrent) {
    return normalizedNext;
  }

  if (!normalizedNext) {
    return normalizedCurrent;
  }

  if (/^[,.;:?)]/.test(normalizedNext)) {
    return `${normalizedCurrent}${normalizedNext}`;
  }

  return `${normalizedCurrent} ${normalizedNext}`;
}

export function isLowercaseRomanHeading(line: string) {
  return /^[ivxlcdm]+$/.test(line.trim());
}

export function getInstructionLineStyle(line: string) {
  const trimmedLine = normalizeInstructionFragment(line);

  if (!trimmedLine) {
    return 'empty';
  }

  if (
    instructionStrongLinePatterns.some((pattern) => pattern.test(trimmedLine))
  ) {
    return 'strong';
  }

  if (
    instructionMediumLinePatterns.some((pattern) => pattern.test(trimmedLine))
  ) {
    return 'medium';
  }

  return 'base';
}

export function formatInstructionLines(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => normalizeInstructionFragment(line))
    .filter(Boolean);

  const formattedLines: string[] = [];
  let inPeopleList = false;

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] ?? '';
    const nextLine = lines[index + 1];
    const isPeopleListHeading = /^List of People$/i.test(line);
    const isPeopleListLetterOnly = /^[A-Z](?:[.)])?$/.test(line);
    const isPeopleListEntry =
      /^[A-Z](?:[.)])?\s+\S/.test(line) ||
      (inPeopleList && isPeopleListLetterOnly);

    if (
      questionRangePattern.test(line) ||
      /^List of Headings$/i.test(line) ||
      /^Opinions$/i.test(line) ||
      isPeopleListHeading
    ) {
      formattedLines.push(line);
      inPeopleList = isPeopleListHeading;
      continue;
    }

    if (isPeopleListEntry) {
      if (inPeopleList && isPeopleListLetterOnly && nextLine) {
        formattedLines.push(joinInstructionFragments(line, nextLine));
        index++;
        continue;
      }

      formattedLines.push(line);
      continue;
    }

    if (/^[A-Z](?:[.)])?$/.test(line) && nextLine) {
      formattedLines.push(joinInstructionFragments(line, nextLine));
      index++;
      continue;
    }

    if (/^(TRUE|FALSE|NOT GIVEN|YES|NO)$/i.test(line) && nextLine) {
      formattedLines.push(joinInstructionFragments(line, nextLine));
      index++;
      continue;
    }

    if (isLowercaseRomanHeading(line) && nextLine) {
      formattedLines.push(joinInstructionFragments(line, nextLine));
      index++;
      continue;
    }

    let mergedLine = line;

    while (index + 1 < lines.length) {
      const upcomingLine = lines[index + 1] ?? '';

      if (
        questionRangePattern.test(upcomingLine) ||
        /^List of Headings$/i.test(upcomingLine) ||
        /^Opinions$/i.test(upcomingLine) ||
        /^List of People$/i.test(upcomingLine) ||
        /^[A-Z](?:[.)])?(?:\s|$)/i.test(upcomingLine) ||
        /^(TRUE|FALSE|NOT GIVEN|YES|NO)$/i.test(upcomingLine) ||
        isLowercaseRomanHeading(upcomingLine)
      ) {
        break;
      }

      if (/[.?:]$/.test(mergedLine) && /^[A-Z]/.test(upcomingLine)) {
        break;
      }

      mergedLine = joinInstructionFragments(mergedLine, upcomingLine);
      index++;
    }

    formattedLines.push(mergedLine);
  }

  return formattedLines;
}
