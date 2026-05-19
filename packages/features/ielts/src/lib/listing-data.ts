import { slugify, type IeltsTestRecord } from './test-selection';

export type IeltsModuleKey = 'general' | 'academic' | 'listening';

export type IeltsListingStats = {
  totalTests: number;
  generalReading: number;
  academicReading: number;
  listening: number;
};

export type IeltsListingTest = {
  id: string;
  title: string;
  bookNumber: number;
  bookLabel: string;
  moduleKey: IeltsModuleKey;
  moduleLabel: string;
  testNumber: number;
  rowLabel: string;
  questions: number;
  minutes: number;
};

export type IeltsListingBookModule = {
  key: IeltsModuleKey;
  label: string;
  tests: IeltsListingTest[];
};

export type IeltsListingBook = {
  bookNumber: number;
  bookLabel: string;
  modules: IeltsListingBookModule[];
  totalTests: number;
};

export type IeltsListingData = {
  stats: IeltsListingStats;
  books: IeltsListingBook[];
};

export type IeltsListingBookView = IeltsListingBook & {
  visibleTests: number;
  modules: IeltsListingBookModule[];
};

const moduleOrder: IeltsModuleKey[] = ['general', 'academic', 'listening'];

const moduleLabels: Record<IeltsModuleKey, string> = {
  general: 'General reading',
  academic: 'Academic reading',
  listening: 'Listening',
};

function extractBookNumber(title: string) {
  const match = title.match(/Cambridge\s+(\d+)/i);

  return match?.[1] ? Number(match[1]) : null;
}

function extractTestNumber(title: string) {
  const match = title.match(/Test\s+(\d+)/i);

  return match?.[1] ? Number(match[1]) : null;
}

function resolveModuleKey(record: IeltsTestRecord): IeltsModuleKey | null {
  const title = String(record.title ?? '');
  const normalized = title.toLowerCase();

  if (
    normalized.includes('listening') ||
    String(record.test_type ?? '').toLowerCase() === 'listening'
  ) {
    return 'listening';
  }

  if (normalized.includes('general reading')) {
    return 'general';
  }

  if (normalized.includes('academic reading')) {
    return 'academic';
  }

  return null;
}

function shouldIncludeBook(bookNumber: number, minBookNumber: number, maxBookNumber: number) {
  return bookNumber >= minBookNumber && bookNumber <= maxBookNumber;
}

function normalizeRecord(record: IeltsTestRecord) {
  const bookNumber = extractBookNumber(record.title);

  if (bookNumber === null) {
    return null;
  }

  const moduleKey = resolveModuleKey(record);

  if (!moduleKey) {
    return null;
  }

  const testNumber = extractTestNumber(record.title) ?? 0;
  const moduleLabel = moduleLabels[moduleKey];

  return {
    id: slugify(record.title),
    title: record.title,
    bookNumber,
    bookLabel: `Cambridge ${bookNumber}`,
    moduleKey,
    moduleLabel,
    testNumber,
    rowLabel: `${moduleLabel.replace(/\s+reading$/i, '')} test ${testNumber}`,
    questions: Number(record.total_answers ?? 40) || 40,
    minutes: 60,
  } satisfies IeltsListingTest;
}

function sortTests(tests: IeltsListingTest[]) {
  return [...tests].sort(
    (a, b) => a.testNumber - b.testNumber || a.title.localeCompare(b.title),
  );
}

function buildEmptyModules(): Record<IeltsModuleKey, IeltsListingTest[]> {
  return {
    general: [],
    academic: [],
    listening: [],
  };
}

export function buildIeltsListingData(
  tests: IeltsTestRecord[],
  listening: IeltsTestRecord[],
  options?: {
    minBookNumber?: number;
    maxBookNumber?: number;
  },
): IeltsListingData {
  const minBookNumber = options?.minBookNumber ?? 14;
  const maxBookNumber = options?.maxBookNumber ?? 19;
  const normalizedRecords = [...tests, ...listening]
    .map((record) => normalizeRecord(record))
    .filter((record): record is IeltsListingTest => Boolean(record))
    .filter((record) =>
      shouldIncludeBook(record.bookNumber, minBookNumber, maxBookNumber),
    );

  const groupedByBook = new Map<number, Record<IeltsModuleKey, IeltsListingTest[]>>();

  normalizedRecords.forEach((record) => {
    if (!groupedByBook.has(record.bookNumber)) {
      groupedByBook.set(record.bookNumber, buildEmptyModules());
    }

    groupedByBook.get(record.bookNumber)?.[record.moduleKey].push(record);
  });

  const books = Array.from(groupedByBook.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([bookNumber, modules]) => {
      const sortedModules = moduleOrder.map((moduleKey) => ({
        key: moduleKey,
        label: moduleLabels[moduleKey],
        tests: sortTests(modules[moduleKey]),
      }));

      return {
        bookNumber,
        bookLabel: `Cambridge ${bookNumber}`,
        modules: sortedModules,
        totalTests: sortedModules.reduce(
          (total, module) => total + module.tests.length,
          0,
        ),
      };
    });

  const stats: IeltsListingStats = {
    totalTests: books.reduce((total, book) => total + book.totalTests, 0),
    generalReading: books.reduce(
      (total, book) =>
        total +
        (book.modules.find((module) => module.key === 'general')?.tests.length ??
          0),
      0,
    ),
    academicReading: books.reduce(
      (total, book) =>
        total +
        (book.modules.find((module) => module.key === 'academic')?.tests.length ??
          0),
      0,
    ),
    listening: books.reduce(
      (total, book) =>
        total +
        (book.modules.find((module) => module.key === 'listening')?.tests.length ??
          0),
      0,
    ),
  };

  return {
    stats,
    books,
  };
}
