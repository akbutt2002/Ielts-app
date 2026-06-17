'use client';

import React from 'react';

import Link from 'next/link';

import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Headphones,
  HelpCircle,
  Layers3,
  Play,
  Trophy,
} from 'lucide-react';

import { PageBody } from '@kit/ui/page';
import { SidebarTrigger } from '@kit/ui/shadcn-sidebar';
import { cn } from '@kit/ui/utils';

export function StartScreen({
  sidebarOpen,
  startScreen,
  startScreenHero,
  previousTestHref,
  nextTestHref,
  onStartTest,
  onPreviousTest,
  onNextTest,
}: any) {
  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#f4f3fc] text-[#0f0f1a] dark:bg-[#0b0b16] dark:text-[#f5f3ff]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(155,143,232,0.22), transparent 34%), radial-gradient(circle at top right, rgba(109,95,212,0.10), transparent 32%), radial-gradient(circle at bottom, rgba(255,255,255,0.92), transparent 42%)',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            'radial-gradient(circle at top left, rgba(155,143,232,0.12), transparent 34%), radial-gradient(circle at top right, rgba(109,95,212,0.08), transparent 32%), radial-gradient(circle at bottom, rgba(255,255,255,0.03), transparent 42%), linear-gradient(180deg, rgba(10,10,20,0.88), rgba(10,10,20,0.58) 28%, transparent 50%)',
        }}
      />

      <PageBody className="relative z-10 pb-24">
        <SidebarTrigger
          className="border-border/70 fixed top-5 z-[60] hidden h-5 w-5 cursor-pointer rounded-2xl border bg-white/90 text-[#7b789a] shadow-[0_12px_25px_-16px_rgba(109,95,212,0.45)] transition-all duration-200 hover:scale-[1.02] hover:border-[#c8c5f7] hover:bg-white hover:text-[#0f0f1a] active:scale-[0.98] lg:inline-flex dark:border-[#2a2a2a] dark:bg-[#17172a]/90 dark:text-[#c8c5f7] dark:shadow-[0_12px_25px_-16px_rgba(0,0,0,0.55)] dark:hover:border-[#4d4970] dark:hover:bg-[#1b1b2f] dark:hover:text-[#f5f3ff]"
          style={{
            left: sidebarOpen
              ? 'calc(var(--sidebar-width) + 0.75rem)'
              : 'calc(var(--sidebar-width-icon) + 0.75rem)',
          }}
        />

        <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="rounded-[30px] border border-[#dddaf0] bg-white/90 shadow-[0_24px_80px_-60px_rgba(109,95,212,0.4)] dark:border-[#2a2a2a] dark:bg-[#111120]/88 dark:shadow-[0_24px_80px_-60px_rgba(0,0,0,0.7)]">
            <div className="flex flex-col gap-5 px-4 py-4 sm:px-6 sm:py-5 lg:px-7 lg:py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <nav aria-label="Breadcrumb" className="min-w-0 flex-1">
                  <ol className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-medium sm:text-[12px]">
                    <li>
                      <Link
                        href="/tests"
                        className="text-[#7b789a] transition-colors hover:text-[#6d5fd4] dark:text-[#a8a1c9] dark:hover:text-[#cfc8ff]"
                      >
                        Tests
                      </Link>
                    </li>
                    <li className="text-[#7b789a]/30 dark:text-[#a8a1c9]/30">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </li>
                    <li className="truncate text-[#7b789a] dark:text-[#a8a1c9]">
                      Cambridge {startScreen.bookNumber ?? ''}
                    </li>
                    <li className="text-[#7b789a]/30 dark:text-[#a8a1c9]/30">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </li>
                    <li className="truncate font-semibold text-[#6d5fd4] dark:text-[#b6abff]">
                      {startScreen.displayTitle}
                    </li>
                  </ol>
                </nav>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={!previousTestHref}
                    onClick={onPreviousTest}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-2xl border transition-all duration-200',
                      previousTestHref
                        ? 'cursor-pointer border-[#dddaf0] bg-white text-[#7b789a] shadow-[0_12px_24px_-18px_rgba(109,95,212,0.35)] hover:scale-[1.02] hover:border-[#c8c5f7] hover:bg-white hover:text-[#0f0f1a] dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#c8c5f7] dark:shadow-[0_12px_24px_-18px_rgba(0,0,0,0.5)] dark:hover:border-[#4d4970] dark:hover:bg-[#1b1b2f] dark:hover:text-[#f5f3ff]'
                        : 'cursor-not-allowed border-[#dddaf0] bg-white/60 text-[#c3bddf] opacity-50 dark:border-[#2a2a2a] dark:bg-[#17172a]/60 dark:text-[#6f6a90]',
                    )}
                    aria-label="Previous test"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={!nextTestHref}
                    onClick={onNextTest}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-2xl border transition-all duration-200',
                      nextTestHref
                        ? 'cursor-pointer border-[#dddaf0] bg-white text-[#7b789a] shadow-[0_12px_24px_-18px_rgba(109,95,212,0.35)] hover:scale-[1.02] hover:border-[#c8c5f7] hover:bg-white hover:text-[#0f0f1a] dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#c8c5f7] dark:shadow-[0_12px_24px_-18px_rgba(0,0,0,0.5)] dark:hover:border-[#4d4970] dark:hover:bg-[#1b1b2f] dark:hover:text-[#f5f3ff]'
                        : 'cursor-not-allowed border-[#dddaf0] bg-white/60 text-[#c3bddf] opacity-50 dark:border-[#2a2a2a] dark:bg-[#17172a]/60 dark:text-[#6f6a90]',
                    )}
                    aria-label="Next test"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#d8d2ff] bg-white px-4 py-2 text-[10px] font-black tracking-[0.18em] text-[#6d5fd4] uppercase shadow-[0_16px_45px_-30px_rgba(109,95,212,0.45)] dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#cfc8ff] dark:shadow-[0_16px_45px_-30px_rgba(0,0,0,0.55)]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#6d5fd4] shadow-[0_0_0_6px_rgba(109,95,212,0.12)] dark:bg-[#b6abff] dark:shadow-[0_0_0_6px_rgba(182,171,255,0.12)]" />
                    <span>{startScreenHero.label}</span>
                  </div>

                  <div className="space-y-3.5">
                    <h2 className="max-w-none text-[clamp(1rem,4vw,2rem)] leading-[0.95] font-black tracking-[-0.05em] text-[#0f0f1a] dark:text-[#f5f3ff]">
                      {startScreen.displayTitle}
                    </h2>
                    <p className="max-w-[44ch] text-[13px] leading-[1.7] text-[#7b789a] dark:text-[#c1badd]">
                      Full-length IELTS simulation with instant scoring and
                      detailed answer review.
                    </p>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-3">
                  <div className="border-border/60 rounded-[22px] border bg-white/90 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c8c5f7] hover:shadow-[0_18px_40px_-24px_rgba(109,95,212,0.35)] dark:border-[#2a2a2a] dark:bg-[#17172a]/85 dark:hover:border-[#4d4970] dark:hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-[13px] border border-[#e8e3ff] bg-[#ede9fe] text-[#6d5fd4] shadow-sm dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#b6abff]">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="mt-3">
                      <div className="text-[22px] leading-none font-black tracking-tight text-[#0f0f1a] dark:text-[#f5f3ff]">
                        60
                      </div>
                      <div className="mt-1 text-[8px] font-black tracking-[0.22em] text-[#7b789a] uppercase dark:text-[#a8a1c9]">
                        Minutes
                      </div>
                    </div>
                  </div>

                  <div className="border-border/60 rounded-[22px] border bg-white/90 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c8c5f7] hover:shadow-[0_18px_40px_-24px_rgba(109,95,212,0.35)] dark:border-[#2a2a2a] dark:bg-[#17172a]/85 dark:hover:border-[#4d4970] dark:hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-[13px] border border-[#e8e3ff] bg-[#ede9fe] text-[#6d5fd4] shadow-sm dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#b6abff]">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <div className="mt-3">
                      <div className="text-[22px] leading-none font-black tracking-tight text-[#0f0f1a] dark:text-[#f5f3ff]">
                        40
                      </div>
                      <div className="mt-1 text-[8px] font-black tracking-[0.22em] text-[#7b789a] uppercase dark:text-[#a8a1c9]">
                        Questions
                      </div>
                    </div>
                  </div>

                  <div className="border-border/60 rounded-[22px] border bg-white/90 p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c8c5f7] hover:shadow-[0_18px_40px_-24px_rgba(109,95,212,0.35)] dark:border-[#2a2a2a] dark:bg-[#17172a]/85 dark:hover:border-[#4d4970] dark:hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.5)]">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-[13px] border border-[#e8e3ff] bg-[#ede9fe] text-[#6d5fd4] shadow-sm dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#b6abff]">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div className="mt-3">
                      <div className="text-[22px] leading-none font-black tracking-tight text-[#0f0f1a] dark:text-[#f5f3ff]">
                        9.0
                      </div>
                      <div className="mt-1 text-[8px] font-black tracking-[0.22em] text-[#7b789a] uppercase dark:text-[#a8a1c9]">
                        Max band
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#dddaf0] bg-white/95 p-4 shadow-[0_24px_70px_-46px_rgba(109,95,212,0.34)] dark:border-[#2a2a2a] dark:bg-[#111120]/90 dark:shadow-[0_24px_70px_-46px_rgba(0,0,0,0.7)]">
                  <div className="flex items-start gap-3">
                    <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-[#e8e3ff] bg-[#ede9fe] text-[#6d5fd4] shadow-sm dark:border-[#2a2a2a] dark:bg-[#17172a] dark:text-[#b6abff]">
                      <Layers3 className="h-3 w-3" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-black tracking-[0.2em] text-[#6d5fd4] uppercase dark:text-[#b6abff]">
                        Band score guide
                      </div>
                      <h3 className="text-[20px] leading-[1.15] font-black tracking-[-0.03em] text-[#0f0f1a] dark:text-[#f5f3ff]">
                        How many correct answers do you need?
                      </h3>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                    {[
                      { band: 'Band 7', score: '34+' },
                      { band: 'Band 8', score: '37+' },
                      { band: 'Band 9', score: '39+' },
                    ].map((item) => (
                      <div
                        key={item.band}
                        className="rounded-[20px] border border-[#dddaf0] bg-[#fbfaff] px-4 py-[18px] text-center dark:border-[#2a2a2a] dark:bg-[#17172a]/90"
                      >
                        <div className="text-[24px] leading-none font-black tracking-tight text-[#6d5fd4] dark:text-[#cfc8ff]">
                          {item.score}
                        </div>
                        <div className="mt-2.5 text-[10px] font-black tracking-[0.2em] text-[#7b789a] uppercase dark:text-[#a8a1c9]">
                          {item.band}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#dddaf0] bg-white/95 p-4 shadow-[0_24px_70px_-46px_rgba(109,95,212,0.3)] sm:p-5 dark:border-[#2a2a2a] dark:bg-[#111120]/90 dark:shadow-[0_24px_70px_-46px_rgba(0,0,0,0.7)]">
                  <h3 className="text-[20px] font-black tracking-[-0.03em] text-[#0f0f1a] dark:text-[#f5f3ff]">
                    Before you begin
                  </h3>
                  <div className="mt-3.5 space-y-2.5">
                    <div className="flex items-start gap-3 rounded-[18px] border border-[#eeeaf9] bg-[#fbfaff] px-4 py-3 dark:border-[#2a2a2a] dark:bg-[#141428]/85">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[13px] border border-[#F0C776] bg-[#FAEEDA] text-[#854F0B] shadow-sm dark:border-[#4d3b16] dark:bg-[#251c12] dark:text-[#f7c46a]">
                        <Clock className="h-3 w-3" />
                      </span>
                      <p className="text-[12px] leading-6 text-[#0f0f1a]/88 dark:text-[#e7e3ff]/88">
                        Timer starts immediately and cannot be paused — make sure
                        you are ready before clicking Start.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 rounded-[18px] border border-[#eeeaf9] bg-[#fbfaff] px-4 py-3 dark:border-[#2a2a2a] dark:bg-[#141428]/85">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[13px] border border-[#B5D4F4] bg-[#E6F1FB] text-[#185FA5] shadow-sm dark:border-[#27344b] dark:bg-[#142036] dark:text-[#7cb4f5]">
                        <Layers3 className="h-3 w-3" />
                      </span>
                      <p className="text-[12px] leading-6 text-[#0f0f1a]/88 dark:text-[#e7e3ff]/88">
                        Passages on the left, questions on the right — both panels
                        scroll independently.
                      </p>
                    </div>
                    <div className="flex items-start gap-3 rounded-[18px] border border-[#eeeaf9] bg-[#fbfaff] px-4 py-3 dark:border-[#2a2a2a] dark:bg-[#141428]/85">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[13px] border border-[#A8D19A] bg-[#EAF3DE] text-[#3B6D11] shadow-sm dark:border-[#24351d] dark:bg-[#182410] dark:text-[#8bd27c]">
                        <Check className="h-3 w-3" />
                      </span>
                      <p className="text-[12px] leading-6 text-[#0f0f1a]/88 dark:text-[#e7e3ff]/88">
                        Band score shown instantly after submission. Test
                        auto-submits when time runs out.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#dddaf0] bg-white/95 p-4 shadow-[0_24px_70px_-46px_rgba(109,95,212,0.35)] sm:p-5 dark:border-[#2a2a2a] dark:bg-[#111120]/90 dark:shadow-[0_24px_70px_-46px_rgba(0,0,0,0.7)]">
                  <button
                    type="button"
                    onClick={onStartTest}
                    className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#5b48f5_0%,#6d5fd4_45%,#9b8fe8_100%)] px-5 py-3.5 text-[15px] font-black tracking-[0.08em] text-white shadow-[0_26px_60px_-28px_rgba(109,95,212,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_70px_-30px_rgba(109,95,212,0.7)] active:translate-y-0 dark:shadow-[0_26px_60px_-28px_rgba(0,0,0,0.6)]"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Start Test</span>
                  </button>

                  <Link
                    href="/tests"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[22px] border border-[#dddaf0] bg-transparent px-5 py-3.5 text-[14px] font-black tracking-[0.08em] text-[#0f0f1a] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c8c5f7] hover:bg-white active:translate-y-0 dark:border-[#2a2a2a] dark:bg-transparent dark:text-[#f5f3ff] dark:hover:border-[#4d4970] dark:hover:bg-[#17172a]"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Back to Tests
                  </Link>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[11px] text-[#7b789a] dark:text-[#a8a1c9]">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-[#6d5fd4] dark:text-[#b6abff]" />
                      Instant result
                    </span>
                    <span className="text-[#c8c5f7] dark:text-[#4d4970]">
                      •
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Trophy className="h-3 w-3 text-[#6d5fd4] dark:text-[#b6abff]" />
                      Band score included
                    </span>
                    <span className="text-[#c8c5f7] dark:text-[#4d4970]">
                      •
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3 text-[#6d5fd4] dark:text-[#b6abff]" />
                      Full simulation
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageBody>
    </div>
  );
}
