import Link from 'next/link';

import { ChevronRight } from 'lucide-react';

import { Card, CardContent } from '@kit/ui/card';

import { cn } from '@kit/ui/utils';

import { MotionReveal, SectionHeading } from './landing-page.shared';
import { practiceCards } from './landing-page.content';

export function PracticeSection() {
  return (
    <section
      id="tests"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <MotionReveal>
        <SectionHeading
          eyebrow="PRACTICE TESTS"
          title="Start practicing today"
          subtitle="Cambridge 14-19 - General Reading, Academic Reading, and Listening."
        />
      </MotionReveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {practiceCards.map((card, index) => {
          const Icon = card.icon;

          return (
            <MotionReveal
              key={card.title}
              delay={index * 0.08}
              className="block"
            >
              <Link
                href={'/tests'}
                className="group block"
                aria-label={card.title}
              >
                <Card className="border-border/80 bg-card overflow-hidden rounded-[18px] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#b3aee8] group-hover:shadow-[0_18px_45px_rgba(109,95,212,0.14)]">
                  <div
                    className={cn(
                      'relative flex h-[182px] items-center justify-center overflow-hidden',
                      card.topClassName,
                    )}
                  >
                    <div className="bg-background/60 absolute inset-0 opacity-40" />
                    <span className="bg-card/85 text-primary relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/40 shadow-sm backdrop-blur-sm dark:border-white/10">
                      <Icon className="h-8 w-8" />
                    </span>

                    <span
                      className={cn(
                        'absolute top-4 right-4 rounded-full px-3 py-1 text-[11px] font-bold tracking-[0.2em] uppercase',
                        card.pillClassName,
                      )}
                    >
                      {card.label}
                    </span>
                  </div>

                  <CardContent className="flex flex-col gap-3 p-5">
                    <div className="text-muted-foreground text-xs font-medium">
                      {card.meta}
                    </div>

                    <h3 className="text-base font-bold tracking-tight">
                      {card.title}
                    </h3>

                    <p className="text-muted-foreground text-sm leading-6">
                      {card.description}
                    </p>

                    <div className="border-border/60 mt-2 flex items-center justify-between border-t pt-4">
                      <span className="text-foreground text-sm font-medium">
                        40 questions · 60 min
                      </span>

                      <span className="bg-background text-muted-foreground border-border/70 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </MotionReveal>
          );
        })}
      </div>
    </section>
  );
}
