import type {
  IeltsListingBookModule,
  IeltsListingBookView,
  IeltsListingData,
  IeltsListingStats,
  IeltsModuleKey,
} from './listing-data';

export type IeltsListingFilterResult = {
  books: IeltsListingBookView[];
  counts: IeltsListingStats;
  totalVisibleTests: number;
};

export function filterIeltsListingData(
  data: IeltsListingData,
  searchTerm: string,
  moduleFilter: IeltsModuleKey | 'all',
): IeltsListingFilterResult {
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const books = data.books
    .map((book) => {
      const modules = book.modules
        .map((module) => {
          if (moduleFilter !== 'all' && module.key !== moduleFilter) {
            return null;
          }

          const tests = module.tests.filter((test) => {
            if (!normalizedSearch) {
              return true;
            }

            const haystack = [
              test.title,
              test.rowLabel,
              test.bookLabel,
              test.moduleLabel,
              String(test.bookNumber),
              String(test.testNumber),
            ]
              .join(' ')
              .toLowerCase();

            return haystack.includes(normalizedSearch);
          });

          if (tests.length === 0) {
            return null;
          }

          return {
            ...module,
            tests,
          };
        })
        .filter((module): module is IeltsListingBookModule => Boolean(module));

      const visibleTests = modules.reduce(
        (total, module) => total + module.tests.length,
        0,
      );

      if (visibleTests === 0) {
        return null;
      }

      return {
        ...book,
        modules,
        visibleTests,
      };
    })
    .filter((book): book is IeltsListingBookView => Boolean(book));

  const counts: IeltsListingStats = {
    totalTests: books.reduce((total, book) => total + book.visibleTests, 0),
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
    books,
    counts,
    totalVisibleTests: counts.totalTests,
  };
}
