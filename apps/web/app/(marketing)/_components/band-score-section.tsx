'use client';

import { useEffect, useRef, useState } from 'react';

import { Card } from '@kit/ui/card';

import { MotionReveal, SectionHeading } from './landing-page.shared';
import { bandBars, bandRows } from './landing-page.content';

export function BandScoreSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="pricing"
      ref={sectionRef}
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <MotionReveal>
        <Card className="border-border/80 bg-card rounded-[18px] shadow-[0_18px_48px_rgba(109,95,212,0.12)]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <MotionReveal className="p-6 sm:p-8 lg:p-10" delay={0.05}>
              <SectionHeading
                eyebrow="BAND SCORE GUIDE"
                title="Know exactly where you stand"
                subtitle="Our scoring engine maps your correct answers to the official IELTS band scale instantly after every test."
                align="left"
                className="max-w-[22rem]"
              />

              <div className="mt-8 space-y-4">
                {bandBars.map((bar) => (
                  <div
                    key={bar.band}
                    className="grid grid-cols-[48px_minmax(0,1fr)_48px] items-center gap-3"
                  >
                    <span className="text-foreground text-[11px] font-medium">
                      {bar.band}
                    </span>

                    <div className="h-1.5 overflow-hidden rounded-full bg-[#ece9f8] dark:bg-white/10">
                      <div
                        className="bg-primary h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.21,0.47,0.32,0.98)]"
                        style={{ width: visible ? `${bar.percent}%` : '0%' }}
                      />
                    </div>

                    <span className="text-primary text-right text-[11px] font-medium">
                      {bar.score}
                    </span>
                  </div>
                ))}
              </div>
            </MotionReveal>

            <MotionReveal
              className="border-border/70 bg-[#f9f8fe] p-6 sm:p-8 lg:border-l dark:bg-white/5"
              delay={0.12}
            >
              <div className="space-y-3">
                {bandRows.map((row) => {
                  const Icon = row.icon;

                  return (
                    <div
                      key={row.title}
                      className="bg-card rounded-[12px] border border-[#dddaf0] px-5 py-4 dark:border-white/10 dark:bg-white/5"
                    >
                      <div className="flex items-start gap-3">
                        <span className="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]">
                          <Icon className="h-4 w-4" />
                        </span>

                        <div>
                          <div className="text-sm font-bold">{row.title}</div>
                          <div className="text-muted-foreground text-xs">
                            {row.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </MotionReveal>
          </div>
        </Card>
      </MotionReveal>
    </section>
  );
}
