'use client';

import { Send } from 'lucide-react';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import { Card } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { cn } from '@kit/ui/utils';

import { newsletterAvatars } from './landing-page.content';
import { MotionReveal } from './landing-page.shared';

export function NewsletterSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <MotionReveal>
        <Card className="border-border/80 bg-card overflow-hidden rounded-[20px] shadow-[0_24px_60px_rgba(109,95,212,0.16)]">
          <div className="grid lg:grid-cols-2">
            <MotionReveal
              className="bg-[#4f3fbf] p-8 text-white sm:p-10"
              delay={0.05}
            >
              <div className="space-y-4">
                <div className="text-[11px] font-bold tracking-[0.28em] text-[#d8d4ff] uppercase">
                  Stay updated
                </div>

                <h2 className="max-w-md text-3xl font-black tracking-tight text-white">
                  Get IELTS tips in your inbox every week
                </h2>

                <p className="max-w-md text-sm leading-7 text-[#d8d4ff]">
                  Expert preparation strategies, new Cambridge test releases,
                  and band score tips - all free.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex">
                  {newsletterAvatars.map((initial, index) => (
                    <Avatar
                      key={initial}
                      className={cn(
                        'h-8 w-8 border-2 border-[#4f3fbf]',
                        index > 0 && '-ml-2',
                      )}
                    >
                      <AvatarFallback className="bg-white text-[11px] font-bold text-[#4f3fbf]">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>

                <p className="text-sm text-[#d8d4ff]">
                  <span className="font-bold text-white">50,000+</span>{' '}
                  subscribers
                </p>
              </div>
            </MotionReveal>

            <MotionReveal className="bg-card p-8 sm:p-10" delay={0.1}>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">
                  Subscribe for free
                </h3>
                <p className="text-muted-foreground text-sm">
                  Join thousands of serious candidates getting smarter every
                  week.
                </p>
              </div>

              <form
                className="mt-8 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <div className="space-y-2">
                  <label
                    htmlFor="newsletter-email"
                    className="text-sm font-medium"
                  >
                    Email address
                  </label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="you@example.com"
                    className="border-border/80 focus-visible:ring-primary h-12 rounded-xl bg-[#f9f8fe]"
                  />
                </div>

                <Button type="submit" className="h-12 w-full gap-2 rounded-xl">
                  Subscribe - it&apos;s free
                  <Send className="h-4 w-4" />
                </Button>

                <p className="text-muted-foreground text-center text-[11px]">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            </MotionReveal>
          </div>
        </Card>
      </MotionReveal>
    </section>
  );
}
