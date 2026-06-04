'use client';

import React from 'react';

import {
  Check,
  ChevronRight,
  Clock,
  Trophy,
  X,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@kit/ui/dialog';

export function ScoreModal({
  open,
  onOpenChange,
  bandScore,
  bandScoreLabel,
  performanceLabel,
  nextTargetBandLabel,
  nextTarget,
  score,
  totalQuestions,
  timeUsedMinutes,
  scoreRingAnimated,
  onClose,
  onRetry,
  onGoToTests,
}: any) {
  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringProgress = scoreRingAnimated
    ? Math.min(1, Math.max(0, score / Math.max(totalQuestions, 1)))
    : 0;
  const ringDashOffset = ringCircumference * (1 - ringProgress);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="!bg-[rgba(0,0,0,0.55)] !backdrop-blur-[3px]"
        className="!max-h-[calc(100vh-1.5rem)] !max-w-[420px] !overflow-x-hidden !overflow-y-auto !rounded-[24px] !border-0 !bg-[#ffffff] !p-0 !text-[#1a1a1a] !shadow-[0_24px_80px_rgba(0,0,0,0.4)] dark:!bg-[#111111] dark:!text-[#f5f5f5] dark:!shadow-[0_24px_80px_rgba(0,0,0,0.65)] [&>button]:hidden"
      >
        <DialogHeader className="!flex-row !items-center !justify-between !space-y-0 border-b border-[#f0f0f0] bg-[#ffffff] px-4 py-3 !text-left dark:border-[#2a2a2a] dark:bg-[#111111]">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-[9px] bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#1d2d15] dark:text-[#8bd27c]">
              <Check className="h-3.5 w-3.5" />
            </span>
            <span className="text-[10px] font-black tracking-[0.2em] text-[#1a1a1a] uppercase dark:text-[#f5f5f5]">
              Test completed
            </span>
          </div>

          <button
            type="button"
            aria-label="Close results"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-[9px] border border-[#e9e9e9] text-[#888888] transition-all hover:border-[#d8d8d8] hover:bg-[#fafafa] hover:text-[#1a1a1a] dark:border-[#2a2a2a] dark:text-[#9b9b9b] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1a1a1a] dark:hover:text-[#f5f5f5]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </DialogHeader>

        <div className="grid gap-0 border-b border-[#f0f0f0] bg-[#ffffff] px-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-center dark:border-[#2a2a2a] dark:bg-[#111111]">
          <div className="flex justify-center">
            <div className="relative flex h-[104px] w-[104px] items-center justify-center">
              <svg
                viewBox="0 0 120 120"
                className="absolute inset-0 h-[104px] w-[104px] -rotate-90"
              >
                <defs>
                  <linearGradient
                    id="ielts-score-ring-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>

                <circle
                  cx="60"
                  cy="60"
                  r={ringRadius}
                  fill="none"
                  className="stroke-[#f0f0f0] dark:stroke-[#2a2a2a]"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={ringRadius}
                  fill="none"
                  stroke="url(#ielts-score-ring-gradient)"
                  strokeLinecap="round"
                  strokeWidth="8"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringDashOffset}
                  style={{
                    transition:
                      'stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />
              </svg>

              <div className="relative flex flex-col items-center justify-center text-center">
                <span className="text-[9px] font-black tracking-[0.2em] text-[#888888] uppercase dark:text-[#9b9b9b]">
                  Your band
                </span>
                <span className="mt-1 text-[28px] leading-none font-black text-[#1a1a1a] dark:text-[#f5f5f5]">
                  {bandScoreLabel}
                </span>
                <span className="mt-1.5 text-[10px] font-medium text-[#888888] dark:text-[#9b9b9b]">
                  Good Job! 🎉
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EAF3DE] px-3 py-1 text-[10px] font-black tracking-[0.18em] text-[#3B6D11] uppercase dark:bg-[#1d2d15] dark:text-[#8bd27c]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
              </svg>
              {performanceLabel}
            </div>

            <DialogTitle className="text-[18px] leading-tight font-bold text-[#1a1a1a] dark:text-[#f5f5f5]">
              {performanceLabel}
            </DialogTitle>

            <DialogDescription className="text-[12px] leading-[1.35] text-[#888888] dark:text-[#a7a7a7]">
              {bandScore >= 8.5
                ? 'You’ve reached the top of the scale. Keep it up to stay at '
                : bandScore >= 7
                  ? 'You scored above average for this test. Keep it up to reach '
                  : bandScore >= 5.5
                    ? 'You’re making solid progress. Keep going to reach '
                    : bandScore >= 4
                      ? 'You’re building the basics. Stay consistent to reach '
                      : 'You’re just getting started. Focus on accuracy to reach '}
              <span className="font-semibold text-[#3B6D11] dark:text-[#8bd27c]">
                Band {nextTargetBandLabel}
              </span>
              .
            </DialogDescription>

            <div className="rounded-[12px] border border-[#efefef] bg-[#f8f9fa] px-3 py-2.5 dark:border-[#2a2a2a] dark:bg-[#181818]">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#1d2d15] dark:text-[#8bd27c]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="7" />
                      <path d="M12 9v3l2 2" />
                      <path d="M12 5v2" />
                      <path d="M19 12h-2" />
                      <path d="M7 12H5" />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <div className="text-[9px] font-black tracking-[0.22em] text-[#888888] uppercase dark:text-[#9b9b9b]">
                      Next target
                    </div>
                    <div className="text-[13px] font-bold text-[#1a1a1a] dark:text-[#f5f5f5]">
                      Band {nextTargetBandLabel}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[18px] leading-none font-black text-[#3B6D11] dark:text-[#8bd27c]">
                    {nextTarget.needed}
                  </div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-[#888888] uppercase dark:text-[#9b9b9b]">
                    more correct answers
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-[#f0f0f0] border-b border-[#f0f0f0] bg-[#f0f0f0] sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-[#2a2a2a] dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
          <div className="bg-white px-4 py-3.5 text-center dark:bg-[#141414]">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#1d2d15] dark:text-[#8bd27c]">
              <Check className="h-3.5 w-3.5" />
            </div>
            <div className="mt-2.5 text-[24px] leading-none font-black text-[#1a1a1a] dark:text-[#f5f5f5]">
              {score} / {totalQuestions}
            </div>
            <div className="mt-1.5 text-[13px] font-semibold text-[#3B6D11] dark:text-[#8bd27c]">
              Correct answers
            </div>
          </div>

          <div className="bg-white px-4 py-3.5 text-center dark:bg-[#141414]">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#FDECEA] text-[#c0392b] dark:bg-[#2a1717] dark:text-[#ff8c84]">
              <X className="h-3.5 w-3.5" />
            </div>
            <div className="mt-2.5 text-[24px] leading-none font-black text-[#1a1a1a] dark:text-[#f5f5f5]">
              {Math.max(0, totalQuestions - score)}
            </div>
            <div className="mt-1.5 text-[13px] font-semibold text-[#c0392b] dark:text-[#ff8c84]">
              Incorrect answers
            </div>
          </div>

          <div className="bg-white px-4 py-3.5 text-center dark:bg-[#141414]">
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#E6F1FB] text-[#185FA5] dark:bg-[#122033] dark:text-[#7cb4f5]">
              <Clock className="h-3.5 w-3.5" />
            </div>
            <div className="mt-2.5 text-[24px] leading-none font-black text-[#1a1a1a] dark:text-[#f5f5f5]">
              {timeUsedMinutes} min
            </div>
            <div className="mt-1.5 text-[13px] font-semibold text-[#185FA5] dark:text-[#7cb4f5]">
              Time used
            </div>
          </div>
        </div>

        <DialogFooter className="!block space-y-3.5 px-4 pt-3.5 pb-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-between rounded-[12px] bg-[#1a1a1a] px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#111111] active:translate-y-0 dark:bg-[#f5f5f5] dark:text-[#111111] dark:hover:bg-[#eaeaea]"
          >
            <span className="inline-flex items-center gap-2">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
              </svg>
              <span>Review all answers</span>
            </span>
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#efefef] bg-white px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9d9d9] hover:bg-[#fafafa] active:translate-y-0 dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-[#f5f5f5] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1a1a1a]"
            >
              <span className="inline-flex h-4 w-4 items-center justify-center text-[#888888]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 1 0 3-6.7" />
                  <path d="M3 5v5h5" />
                </svg>
              </span>
              Retry test
            </button>

            <button
              type="button"
              onClick={onGoToTests}
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border border-[#efefef] bg-white px-4 py-2.5 text-sm font-semibold text-[#1a1a1a] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d9d9d9] hover:bg-[#fafafa] active:translate-y-0 dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-[#f5f5f5] dark:hover:border-[#3a3a3a] dark:hover:bg-[#1a1a1a]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-[#888888]"
                aria-hidden="true"
              >
                <rect x="4" y="4" width="6" height="6" rx="1.5" />
                <rect x="14" y="4" width="6" height="6" rx="1.5" />
                <rect x="4" y="14" width="6" height="6" rx="1.5" />
                <rect x="14" y="14" width="6" height="6" rx="1.5" />
              </svg>
              All tests
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 pt-0.5 text-[11px] text-[#888888] dark:text-[#9b9b9b]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#EAF3DE] text-[#3B6D11] dark:bg-[#1d2d15] dark:text-[#8bd27c]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
                aria-hidden="true"
              >
                <path d="M20 11.5v1a8.5 8.5 0 1 1-5.05-7.77" />
                <path d="m20 5-8.5 8.5L9 10" />
              </svg>
            </span>
            <span>Your results are saved automatically and securely</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
