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
    <main className="mx-auto flex w-full max-w-full flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-5">
            <SidebarTrigger className="border-border/70 bg-background text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground -ml-5 hidden h-5 w-5 shrink-0 cursor-pointer rounded-xl border shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] lg:inline-flex" />

            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                IELTS practice tests
              </h1>
              <p className="text-muted-foreground max-w-2xl text-sm">
                {listing.stats.totalTests} full-length simulations &middot;
                Cambridge 14&ndash;19 &middot; Complete answer keys
              </p>
            </div>
          </div>

          <div className="w-full lg:w-[340px]">
            <label htmlFor="ielts-search" className="sr-only">
              Search IELTS tests
            </label>
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="ielts-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by book or test"
                className="border-border/70 bg-background h-11 rounded-full pl-9 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.key}
                className="border-border/70 bg-card/90 rounded-2xl shadow-sm"
              >
                <CardContent className="flex h-full flex-col gap-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={cn(
                        'inline-flex h-11 w-11 items-center justify-center rounded-2xl',
                        stat.toneClassName,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm font-medium">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-semibold tracking-tight">
                      {listing.stats[stat.key]}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterPills.map((pill) => {
            const active = moduleFilter === pill.key;

            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => setModuleFilter(pill.key)}
                aria-pressed={active}
                className={cn(
                  'inline-flex h-11 cursor-pointer items-center gap-3 rounded-full border px-4 text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
                  active
                    ? 'border-foreground bg-foreground text-background shadow-sm'
                    : 'border-border/70 bg-card text-foreground hover:border-border hover:bg-muted/40',
                )}
              >
                <span>{pill.label}</span>
                <span
                  className={cn(
                    'inline-flex min-w-8 justify-center rounded-full px-2 py-0.5 text-xs font-semibold',
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
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs font-semibold tracking-[0.35em] uppercase">
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
        className="border-border/70 hover:bg-muted/40 flex w-full cursor-pointer items-center gap-4 border-b px-4 py-4 text-left transition-colors sm:px-5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-base font-semibold tracking-tight">
              {book.bookLabel}
            </span>
            <span className="text-muted-foreground text-xs font-medium tracking-[0.28em] uppercase">
              IELTS
            </span>
          </div>
        </div>

        <div className="hidden items-center gap-1.5 md:flex">
          {iconDots.map((dotStyle, index) => (
            <span
              key={index}
              className="h-2.5 w-2.5 rounded-full"
              style={dotStyle}
            />
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="border-border/70 bg-background/90 text-muted-foreground rounded-full border px-3 py-1 text-xs font-medium">
            {book.visibleTests} tests
          </span>
          <ChevronDown
            className={cn(
              'text-muted-foreground h-4 w-4 transition-transform duration-300',
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
        'min-w-0 px-4 py-4 sm:px-5',
        !isFirst && 'border-border/70 border-t lg:border-t-0',
        !isLast && 'lg:border-border/70 lg:border-r',
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-2xl',
              config.tone.iconClassName,
            )}
          >
            <Icon className="h-4.5 w-4.5" />
          </span>

          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold tracking-tight">
              {config.label}
            </h3>
            <p className="text-muted-foreground text-xs">
              {module.tests.length} tests
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-1">
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
      className="hover:bg-muted/40 flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 transition-colors"
    >
      <span
        className={cn(
          'flex h-8 min-w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
          config.tone.badgeClassName,
        )}
      >
        {test.testNumber}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-semibold">
          {test.rowLabel}
        </p>
        <p className="text-muted-foreground truncate text-xs">
          {test.questions} questions &middot; {test.minutes} min
        </p>
      </div>

      <div className="relative ml-auto h-9 min-w-[132px] overflow-visible">
        <span
          className={cn(
            'border-border/70 bg-background/90 text-muted-foreground absolute top-1/2 right-0 inline-flex -translate-y-1/2 items-center rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-200',
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
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-500 via-violet-500 to-amber-400 opacity-80 blur-[10px] dark:from-cyan-400 dark:via-fuchsia-500 dark:to-amber-300 dark:opacity-100" />
          <span className="bg-background text-foreground ring-border/60 dark:bg-foreground dark:text-background relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold shadow-[0_10px_26px_rgba(0,0,0,0.18)] ring-1 transition-transform duration-300 hover:scale-[1.03] dark:shadow-[0_10px_26px_rgba(0,0,0,0.42)] dark:ring-white/10">
            <Play className="h-3 w-3 fill-current transition-transform duration-300" />
            Start
          </span>
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="border-border/70 bg-card/70 flex min-h-[240px] items-center justify-center rounded-3xl border border-dashed px-6 py-14 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4">
        <span className="bg-muted/60 text-muted-foreground inline-flex h-14 w-14 items-center justify-center rounded-full">
          <Search className="h-6 w-6" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            No tests match your search
          </h2>
          <p className="text-muted-foreground text-sm">
            {searchTerm.trim()
              ? `We couldn't find anything for "${searchTerm.trim()}".`
              : 'Try another filter to see the Cambridge books.'}
          </p>
        </div>
      </div>
    </div>
  );
}
