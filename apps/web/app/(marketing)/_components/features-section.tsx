import { Card, CardContent } from '@kit/ui/card';

import { MotionReveal, SectionHeading } from './landing-page.shared';
import { features } from './landing-page.content';

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <MotionReveal>
        <SectionHeading
          eyebrow="WHY CANDIDATES CHOOSE US"
          title="Everything you need to score higher"
          subtitle="Built by IELTS experts who obsess over every detail that matters on exam day."
        />
      </MotionReveal>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <MotionReveal key={feature.title} delay={index * 0.08}>
              <Card className="group border-border/80 bg-card rounded-[14px] p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b3aee8] hover:shadow-[0_18px_40px_rgba(109,95,212,0.12)]">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <span className="text-primary dark:bg-primary/10 flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#ede9fe]">
                      <Icon className="h-4 w-4" />
                    </span>

                    <div className="space-y-2">
                      <h3 className="text-sm font-bold">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-6">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </MotionReveal>
          );
        })}
      </div>
    </section>
  );
}
