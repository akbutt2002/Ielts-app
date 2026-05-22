import { Star } from 'lucide-react';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Card, CardContent } from '@kit/ui/card';

import { MotionReveal, SectionHeading } from './landing-page.shared';
import { testimonials } from './landing-page.content';

export function TestimonialsSection() {
  return (
    <section
      id="about"
      className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      <MotionReveal>
        <SectionHeading
          eyebrow="SUCCESS STORIES"
          title="Loved by students globally."
          subtitle="Real results from real students who prepared with our platform."
        />
      </MotionReveal>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <MotionReveal key={testimonial.name} delay={index * 0.08}>
            <Card className="border-border/80 bg-card rounded-[20px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b3aee8] hover:shadow-[0_18px_45px_rgba(109,95,212,0.12)]">
              <CardContent className="p-6">
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]"
                    />
                  ))}
                </div>

                <p className="text-foreground mt-6 text-sm leading-7 italic">
                  “{testimonial.quote}”
                </p>

                <div className="border-border/60 mt-6 border-t pt-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="text-sm font-bold">
                        {testimonial.name}
                      </div>
                      <div className="text-primary text-xs font-medium">
                        {testimonial.band}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </MotionReveal>
        ))}
      </div>
    </section>
  );
}
