import { type IeltsTestRecord, getAllIeltsTests, slugify } from '@kit/ielts';

import type { StartScreenNavigation } from './question-parser';

const startScreenModuleOrder = ['general', 'academic', 'listening'] as const;

export function extractCambridgeBookNumber(title: string) {
  const match = title.match(/Cambridge\s+(\d+)/i);

  return match?.[1] ? Number(match[1]) : null;
}

export function stripCambridgePrefix(title: string) {
  return title.replace(/^Cambridge\s+\d+\s+(?:IELTS\s+)?/i, '').trim();
}

export function resolveTestModuleKey(record: IeltsTestRecord) {
  const title = String(record.title ?? '').toLowerCase();
  const testType = String(record.test_type ?? '').toLowerCase();

  if (title.includes('listening') || testType === 'listening') {
    return 'listening' as const;
  }

  if (title.includes('academic reading')) {
    return 'academic' as const;
  }

  return 'general' as const;
}

export function extractTestNumber(title: string) {
  const match = title.match(/Test\s+(\d+)/i);

  return match?.[1] ? Number(match[1]) : 0;
}

export function buildStartScreenNavigation(
  test: IeltsTestRecord,
): StartScreenNavigation {
  const bookNumber = extractCambridgeBookNumber(test.title);

  if (bookNumber === null) {
    return {
      prevTest: null,
      nextTest: null,
    };
  }

  const currentSlug = slugify(test.title);
  const bookTests = getAllIeltsTests()
    .filter((record) => extractCambridgeBookNumber(record.title) === bookNumber)
    .sort((left, right) => {
      const leftModuleIndex = startScreenModuleOrder.indexOf(
        resolveTestModuleKey(left),
      );
      const rightModuleIndex = startScreenModuleOrder.indexOf(
        resolveTestModuleKey(right),
      );

      return (
        leftModuleIndex - rightModuleIndex ||
        extractTestNumber(left.title) - extractTestNumber(right.title) ||
        left.title.localeCompare(right.title)
      );
    });

  const currentIndex = bookTests.findIndex(
    (record) => slugify(record.title) === currentSlug,
  );

  return {
    prevTest: currentIndex > 0 ? (bookTests[currentIndex - 1] ?? null) : null,
    nextTest:
      currentIndex >= 0 && currentIndex < bookTests.length - 1
        ? (bookTests[currentIndex + 1] ?? null)
        : null,
  };
}

export function buildStartScreenDetails(test: IeltsTestRecord) {
  return {
    displayTitle: stripCambridgePrefix(test.title),
    moduleKey: resolveTestModuleKey(test),
    navigation: buildStartScreenNavigation(test),
    bookNumber: extractCambridgeBookNumber(test.title),
  };
}
