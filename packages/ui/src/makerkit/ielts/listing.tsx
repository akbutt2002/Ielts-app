'use client';

import * as React from 'react';

import Link from 'next/link';

import {
  BarChart3,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Headphones,
  type LucideIcon,
  Play,
  Search,
} from 'lucide-react';

import {
  type IeltsListingBookModule,
  type IeltsListingBookView,
  type IeltsListingData,
  type IeltsListingStats,
  type IeltsModuleKey,
  filterIeltsListingData,
} from '@kit/ielts';

import { cn } from '../../lib/utils';
import { Card, CardContent } from '../../shadcn/card';
import { Input } from '../../shadcn/input';
import { SidebarTrigger } from '../../shadcn/sidebar';

type ModuleFilter = IeltsModuleKey | 'all';

type Tone = {
  dotStyle: React.CSSProperties;
  iconClassName: string;
  badgeClassName: string;
};

type ModuleMeta = {
  label: string;
  icon: LucideIcon;
  tone: Tone;
};

const moduleMeta: Record<IeltsModuleKey, ModuleMeta> = {
  general: {
    label: 'General reading',
    icon: BookOpen,
    tone: {
      dotStyle: { backgroundColor: '#185FA5' },
      iconClassName:
        'bg-[#E6F1FB] text-[#185FA5] dark:bg-[#185FA5]/15 dark:text-[#C8DFF4]',
      badgeClassName:
        'bg-[#E6F1FB] text-[#185FA5] dark:bg-[#185FA5]/15 dark:text-[#C8DFF4]',
    },
  },
  academic: {
    label: 'Academic reading',
    icon: GraduationCap,
    tone: {
      dotStyle: { backgroundColor: '#534AB7' },
      iconClassName:
        'bg-[#EEEDFE] text-[#534AB7] dark:bg-[#534AB7]/15 dark:text-[#D7D4FF]',
      badgeClassName:
        'bg-[#EEEDFE] text-[#534AB7] dark:bg-[#534AB7]/15 dark:text-[#D7D4FF]',
    },
  },
  listening: {
    label: 'Listening',
    icon: Headphones,
    tone: {
      dotStyle: { backgroundColor: '#854F0B' },
      iconClassName:
        'bg-[#FAEEDA] text-[#854F0B] dark:bg-[#854F0B]/15 dark:text-[#F7D7A2]',
      badgeClassName:
        'bg-[#FAEEDA] text-[#854F0B] dark:bg-[#854F0B]/15 dark:text-[#F7D7A2]',
    },
  },
};

const filterPills: Array<{
  key: ModuleFilter;
  label: string;
  countKey: keyof IeltsListingStats;
}> = [
  { key: 'all', label: 'All', countKey: 'totalTests' },
  { key: 'general', label: 'General reading', countKey: 'generalReading' },
  { key: 'academic', label: 'Academic reading', countKey: 'academicReading' },
  { key: 'listening', label: 'Listening', countKey: 'listening' },
];

const statCards: Array<{
  key: keyof IeltsListingStats;
  label: string;
  icon: LucideIcon;
  toneClassName: string;
}> = [
  {
    key: 'totalTests',
    label: 'Total tests',
    icon: BarChart3,
    toneClassName:
      'bg-foreground/5 text-foreground dark:bg-foreground/10 dark:text-foreground',
  },
  {
    key: 'generalReading',
    label: 'General reading',
    icon: BookOpen,
    toneClassName:
      'bg-[#E6F1FB] text-[#185FA5] dark:bg-[#185FA5]/15 dark:text-[#C8DFF4]',
  },
  {
    key: 'academicReading',
    label: 'Academic reading',
    icon: GraduationCap,
    toneClassName:
      'bg-[#EEEDFE] text-[#534AB7] dark:bg-[#534AB7]/15 dark:text-[#D7D4FF]',
  },
  {
    key: 'listening',
    label: 'Listening',
    icon: Headphones,
    toneClassName:
      'bg-[#FAEEDA] text-[#854F0B] dark:bg-[#854F0B]/15 dark:text-[#F7D7A2]',
  },
];

export function IeltsTestListing({ listing }: { listing: IeltsListingData }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [moduleFilter, setModuleFilter] = React.useState<ModuleFilter>('all');
  const [openBooks, setOpenBooks] = React.useState<Set<number>>(
    () => new Set([19]),
  );

  const filteredListing = React.useMemo(
    () => filterIeltsListingData(listing, searchTerm, moduleFilter),
    [listing, searchTerm, moduleFilter],
  );

  const shouldAutoOpenBooks = searchTerm.trim().length > 0;

  const visibleBookSet = React.useMemo(() => {
    if (!shouldAutoOpenBooks) {
      return openBooks;
    }

    return new Set(filteredListing.books.map((book) => book.bookNumber));
  }, [filteredListing.books, openBooks, shouldAutoOpenBooks]);

  return (
    <main className="mx-auto flex w-full max-w-full flex-col gap-6 px-4 py-2 sm:px-6 lg:px-8">
      <section className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-40 -mx-4 border-b border-transparent px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-3">
        <div className="flex gap-4">
          <SidebarTrigger className="border-border/70 bg-background text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground mt-2.5 hidden h-5 w-5 shrink-0 cursor-pointer rounded-xl border shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] lg:inline-flex" />
          <div>
            <h1 className="text-[1.65rem] font-semibold tracking-tight sm:text-[2.1rem]">
              IELTS practice tests
            </h1>
            <p className="text-muted-foreground max-w-2xl text-[11px] sm:text-xs">
              {listing.stats.totalTests} full-length simulations &middot;
              Cambridge 14&ndash;19 &middot; Complete answer keys
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.key}
                className="border-border/70 bg-card/90 rounded-2xl shadow-sm"
              >
                <CardContent className="flex h-full flex-col gap-3 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        'inline-flex h-9 w-9 items-center justify-center rounded-2xl',
                        stat.toneClassName,
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground text-[11px] font-medium">
                      {stat.label}
                    </p>
                    <p className="text-[1.8rem] font-semibold tracking-tight sm:text-[1.95rem]">
                      {listing.stats[stat.key]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between xl:gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {filterPills.map((pill) => {
              const active = moduleFilter === pill.key;

              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => setModuleFilter(pill.key)}
                  aria-pressed={active}
                  className={cn(
                    'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium tracking-tight transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] sm:h-9 sm:px-3 sm:text-xs',
                    active
                      ? 'border-foreground bg-foreground text-background shadow-sm'
                      : 'border-border/70 bg-card text-foreground hover:border-border hover:bg-muted/40',
                  )}
                >
                  <span>{pill.label}</span>
                  <span
                    className={cn(
                      'inline-flex min-w-[22px] justify-center rounded-full px-1.5 py-[2px] text-[9px] font-semibold sm:min-w-6 sm:px-2 sm:text-[10px]',
                      active
                        ? 'bg-background/15 text-background'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {listing.stats[pill.countKey]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full xl:w-[300px] xl:shrink-0">
            <label htmlFor="ielts-search" className="sr-only">
              Search IELTS tests
            </label>
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2" />
              <Input
                id="ielts-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by book or test"
                className="border-border/70 bg-background h-9 rounded-full pl-8 text-xs shadow-sm sm:h-10 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-[9px] font-semibold tracking-[0.3em] uppercase">
            Cambridge books
          </p>
        </div>

        {filteredListing.books.length ? (
          <div className="space-y-4">
            {filteredListing.books.map((book) => (
              <BookCard
                key={book.bookNumber}
                book={book}
                open={visibleBookSet.has(book.bookNumber)}
                onToggle={() => {
                  setOpenBooks((current) => {
                    const next = new Set(current);

                    if (next.has(book.bookNumber)) {
                      next.delete(book.bookNumber);
                    } else {
                      next.add(book.bookNumber);
                    }

                    return next;
                  });
                }}
                moduleFilter={moduleFilter}
              />
            ))}
          </div>
        ) : (
          <EmptyState searchTerm={searchTerm} />
        )}
      </section>
    </main>
  );
}

function BookCard({
  book,
  open,
  onToggle,
  moduleFilter,
}: {
  book: IeltsListingBookView;
  open: boolean;
  onToggle: () => void;
  moduleFilter: ModuleFilter;
}) {
  const modules =
    moduleFilter === 'all'
      ? book.modules
      : book.modules.filter((module) => module.key === moduleFilter);

  const iconDots = [
    moduleMeta.general.tone.dotStyle,
    moduleMeta.academic.tone.dotStyle,
    moduleMeta.listening.tone.dotStyle,
  ];

  return (
    <Card className="border-border/70 bg-card/90 overflow-hidden rounded-3xl shadow-sm transition-shadow hover:shadow-md">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="border-border/70 hover:bg-muted/40 flex w-full cursor-pointer items-center gap-3 border-b px-4 py-3 text-left transition-colors sm:px-5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className="text-[13px] font-semibold tracking-tight sm:text-sm">
              {book.bookLabel}
            </span>
            <span className="text-muted-foreground text-[9px] font-medium tracking-[0.24em] uppercase">
              IELTS
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          {iconDots.map((dotStyle, index) => (
            <span
              key={index}
              className="h-1.5 w-1.5 rounded-full"
              style={dotStyle}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2.5">
          <span className="border-border/70 bg-background/90 text-muted-foreground rounded-full border px-2.5 py-0.5 text-[10px] font-medium">
            {book.visibleTests} tests
          </span>
          <ChevronDown
            className={cn(
              'text-muted-foreground h-3 w-3 transition-transform duration-300',
              open ? 'rotate-180' : 'rotate-0',
            )}
          />
        </div>
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-300 ease-out',
          open ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div
          className={cn(
            'grid grid-cols-1',
            modules.length === 1
              ? 'lg:grid-cols-1'
              : modules.length === 2
                ? 'lg:grid-cols-2'
                : 'lg:grid-cols-3',
          )}
        >
          {modules.map((module, index) => (
            <ModuleColumn
              key={module.key}
              module={module}
              book={book}
              isFirst={index === 0}
              isLast={index === modules.length - 1}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function ModuleColumn({
  module,
  book,
  isFirst,
  isLast,
}: {
  module: IeltsListingBookModule;
  book: IeltsListingBookView;
  isFirst: boolean;
  isLast: boolean;
}) {
  const config = moduleMeta[module.key];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'min-w-0 px-4 py-3 sm:px-5',
        !isFirst && 'border-border/70 border-t lg:border-t-0',
        !isLast && 'lg:border-border/70 lg:border-r',
      )}
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              'inline-flex h-[34px] w-[34px] items-center justify-center rounded-2xl',
              config.tone.iconClassName,
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>

          <div className="space-y-0.5">
            <h3 className="text-[13px] font-semibold tracking-tight">
              {config.label}
            </h3>
            <p className="text-muted-foreground text-[10px]">
              {module.tests.length} tests
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-0.5">
        {module.tests.map((test) => (
          <ListingRow key={test.id} test={test} book={book} module={module} />
        ))}
      </div>
    </div>
  );
}

function ListingRow({
  test,
  book,
  module,
}: {
  test: IeltsListingBookModule['tests'][number];
  book: IeltsListingBookView;
  module: IeltsListingBookModule;
}) {
  const config = moduleMeta[module.key];
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <Link
      href={`/home/ielts/tests/${test.id}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${test.title}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      className="hover:bg-muted/40 flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 transition-colors"
    >
      <span
        className={cn(
          'flex h-7 min-w-7 items-center justify-center rounded-full text-[10px] font-semibold transition-colors',
          config.tone.badgeClassName,
        )}
      >
        {test.testNumber}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-[13px] font-semibold">
          {test.rowLabel}
        </p>
        <p className="text-muted-foreground truncate text-[11px]">
          {test.questions} questions &middot; {test.minutes} min
        </p>
      </div>

      <div className="relative ml-auto h-8 min-w-[112px] overflow-visible">
        <span
          className={cn(
            'border-border/70 bg-background/90 text-muted-foreground absolute top-1/2 right-0 inline-flex -translate-y-1/2 items-center rounded-full border px-2.5 py-0.5 text-[9px] font-medium transition-all duration-200',
            isHovered
              ? 'pointer-events-none translate-x-2 scale-95 opacity-0'
              : 'translate-x-0 scale-100 opacity-100',
          )}
        >
          {book.bookLabel}
        </span>

        <span
          className={cn(
            'absolute top-1/2 right-0 inline-flex -translate-y-1/2 items-center transition-all duration-300 ease-out',
            isHovered
              ? 'translate-x-0 scale-100 opacity-100'
              : 'pointer-events-none translate-x-2 scale-95 opacity-0',
          )}
        >
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-amber-400 opacity-70 blur-[8px] dark:from-cyan-400 dark:via-fuchsia-500 dark:to-amber-300 dark:opacity-100" />
          <span className="bg-background text-foreground ring-border/60 dark:bg-foreground dark:text-background relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[9px] font-semibold shadow-[0_8px_20px_rgba(0,0,0,0.18)] ring-1 transition-transform duration-300 hover:scale-[1.03] dark:shadow-[0_8px_20px_rgba(0,0,0,0.42)] dark:ring-white/10">
            <Play className="h-[9px] w-[9px] fill-current transition-transform duration-300" />
            Start
          </span>
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="border-border/70 bg-card/70 flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed px-6 py-12 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4">
        <span className="bg-muted/60 text-muted-foreground inline-flex h-12 w-12 items-center justify-center rounded-full">
          <Search className="h-5 w-5" />
        </span>
        <div className="space-y-1">
          <h2 className="text-base font-semibold tracking-tight">
            No tests match your search
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {searchTerm.trim()
              ? `We couldn't find anything for "${searchTerm.trim()}".`
              : 'Try another filter to see the Cambridge books.'}
          </p>
        </div>
      </div>
    </div>
  );
}
