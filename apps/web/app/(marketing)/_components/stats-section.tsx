import { Card } from '@kit/ui/card';

import { MotionReveal } from './landing-page.shared';
import { stats } from './landing-page.content';

export function StatsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <MotionReveal>
        <Card className="border-border/70 bg-card rounded-[18px] shadow-[0_18px_48px_rgba(109,95,212,0.12)]">
          <div className="divide-border/70 grid grid-cols-2 divide-x divide-y lg:grid-cols-4 lg:divide-y-0">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="flex flex-col gap-4 p-6 sm:p-8"
                >
                  <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-[9px]">
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="space-y-1">
                    <div className="text-[2rem] font-black tracking-tight sm:text-[2.15rem]">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-[11px] font-semibold tracking-[0.28em] uppercase">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </MotionReveal>
    </section>
  );
}
