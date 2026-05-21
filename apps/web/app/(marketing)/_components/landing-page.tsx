'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronRight,
  CircleHelp,
  Clock3,
  Eye,
  FileText,
  GraduationCap,
  Headphones,
  LayoutGrid,
  Play,
  RefreshCcw,
  Send,
  Star,
  Target,
  Trophy,
  Users,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { cn } from '@kit/ui/utils';

const stats = [
  { icon: Users, value: '50k+', label: 'Active students' },
  { icon: Award, value: '94%', label: 'Success rate' },
  { icon: FileText, value: '72+', label: 'Practice tests' },
  { icon: Trophy, value: '9.0', label: 'Max band score' },
] as const;

const features = [
  {
    icon: Clock3,
    title: 'Real exam timing',
    description: '60-minute timed simulations that mirror the actual IELTS environment down to the second.',
  },
  {
    icon: BarChart3,
    title: 'Instant band score',
    description: 'Get your estimated IELTS band score immediately after submitting each practice test.',
  },
  {
    icon: BookOpen,
    title: 'Cambridge 14-19',
    description: 'Full library of Cambridge tests for General Reading, Academic Reading, and Listening.',
  },
  {
    icon: Eye,
    title: 'Answer review',
    description: 'Review every question with correct answers highlighted after each test submission.',
  },
  {
    icon: Target,
    title: 'Band target tracking',
    description: 'See exactly how many more correct answers you need to reach your target band score.',
  },
  {
    icon: LayoutGrid,
    title: 'Real exam layout',
    description: 'Side-by-side passage and question panels replicate the actual IELTS interface.',
  },
] as const;

const practiceCards = [
  {
    label: 'General',
    pillClassName: 'bg-[#EEEDFE] text-[#534AB7] dark:bg-[#534AB7]/15 dark:text-[#D7D4FF]',
    topClassName: 'bg-[#ede9fe] dark:bg-[#2a2749]',
    icon: BookOpen,
    title: 'General Reading Test 1',
    meta: 'Cambridge 19 - General reading',
    description: 'Full-length simulation with 3 sections, real passages and complete answer key.',
  },
  {
    label: 'Academic',
    pillClassName: 'bg-[#E6F1FB] text-[#185FA5] dark:bg-[#185FA5]/15 dark:text-[#C8DFF4]',
    topClassName: 'bg-[#e8eeff] dark:bg-[#1b274a]',
    icon: GraduationCap,
    title: 'Academic Reading Test 1',
    meta: 'Cambridge 19 - Academic reading',
    description: 'Cambridge passages with band-level scoring and detailed answer explanations.',
  },
  {
    label: 'Listening',
    pillClassName: 'bg-[#DFF3E8] text-[#2B6B3F] dark:bg-[#2B6B3F]/15 dark:text-[#C3E4CF]',
    topClassName: 'bg-[#e8f5ee] dark:bg-[#1c2e28]',
    icon: Headphones,
    title: 'Listening Test 1',
    meta: 'Cambridge 19 - Listening',
    description: 'Full-length listening simulation with 4 parts and real audio playback.',
  },
] as const;

const bandBars = [
  { band: 'Band 9', percent: 98, score: '39+' },
  { band: 'Band 8', percent: 93, score: '37+' },
  { band: 'Band 7', percent: 85, score: '34+' },
  { band: 'Band 6', percent: 68, score: '27+' },
  { band: 'Band 5', percent: 58, score: '23+' },
] as const;

const bandRows = [
  {
    icon: Clock3,
    title: '60 minutes',
    description: 'Per reading test',
  },
  {
    icon: CircleHelp,
    title: '40 questions',
    description: 'Per test',
  },
  {
    icon: RefreshCcw,
    title: 'Unlimited retries',
    description: 'Practice as much as you want',
  },
  {
    icon: Trophy,
    title: 'Instant results',
    description: 'Band score shown after submission',
  },
] as const;

const testimonials = [
  {
    name: 'Sarah Jenkins',
    band: 'Band 8.5',
    quote:
      'The simulation tests are incredibly accurate. I felt so much more confident on my actual exam day.',
  },
  {
    name: 'Ahmed Raza',
    band: 'Band 7.5',
    quote:
      'Best platform for IELTS prep. The instant band score kept me motivated throughout my preparation.',
  },
  {
    name: 'Lin Wei',
    band: 'Band 8.0',
    quote: 'Clean, fast, and very professional. The interface makes studying feel less like a chore.',
  },
] as const;

const heroAvatars = ['S', 'A', 'L', 'R', 'M'] as const;
const newsletterAvatars = ['A', 'B', 'C', 'D'] as const;

export function MarketingLandingPage() {
  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <PracticeSection />
      <BandScoreSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}

function MotionReveal({
  children,
  className,
  delay = 0,
  y = 18,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: reduceMotion ? 0 : 0.55,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}

function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(155,143,232,0.18),transparent_34%),radial-gradient(circle_at_20%_10%,rgba(109,95,212,0.08),transparent_20%),radial-gradient(circle_at_80%_20%,rgba(155,143,232,0.08),transparent_24%)]" />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 text-center sm:px-6 sm:pb-20 sm:pt-24 lg:px-8 lg:pb-24 lg:pt-28">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="bg-card text-primary border-border/70 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm"
        >
          <span className="relative inline-flex h-2 w-2 shrink-0 items-center justify-center">
            {!reduceMotion ? (
              <motion.span
                aria-hidden="true"
                className="bg-primary/25 absolute -inset-2 rounded-full blur-[1px]"
                animate={{ scale: [0.85, 2.25, 0.85], opacity: [0.65, 0.08, 0.65] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
            ) : null}

            <motion.span
              aria-hidden="true"
              className="bg-primary relative z-10 h-2 w-2 rounded-full shadow-[0_0_0_6px_rgba(109,95,212,0.12)]"
              animate={
                reduceMotion ? undefined : { scale: [1, 1.22, 1], opacity: [1, 0.78, 1] }
              }
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
          Next-gen IELTS preparation platform
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mx-auto mt-8 max-w-4xl text-[2.35rem] font-black tracking-tight text-foreground sm:text-5xl md:text-[3.8rem] md:leading-[0.95]"
        >
          <span className="block">Master your IELTS.</span>
          <span className="block text-primary">Score higher. Faster.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="text-muted-foreground mx-auto mt-6 max-w-[500px] text-base leading-7 sm:text-lg"
        >
          The most advanced simulation platform for serious candidates.
          Practice with real Cambridge tests and get your band score instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.24, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-10 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" className="h-12 rounded-xl px-6 shadow-[0_18px_40px_rgba(109,95,212,0.2)]">
            <Link href={'/auth/sign-up'} className="gap-2">
              <Play className="h-4 w-4 fill-current" />
              Start free trial
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-12 rounded-xl px-6">
            <Link href={'/tests'} className="gap-2">
              <BookOpen className="h-4 w-4" />
              Browse practice tests
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <div className="flex items-center">
            {heroAvatars.map((initial, index) => (
              <Avatar
                key={initial}
                className={cn('h-9 w-9 border-2 border-background', index > 0 && '-ml-2')}
              >
                <AvatarFallback className="bg-[#ede9fe] text-primary text-xs font-bold dark:bg-white/10">
                  {initial}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>

          <p className="text-muted-foreground text-sm sm:text-base">
            Joined by <span className="text-foreground font-bold">50,000+</span>{' '}
            students this year
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <MotionReveal>
        <Card className="rounded-[18px] border-border/70 bg-card shadow-[0_18px_48px_rgba(109,95,212,0.12)]">
          <div className="grid grid-cols-2 divide-x divide-y divide-border/70 lg:grid-cols-4 lg:divide-y-0">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div key={stat.label} className="flex flex-col gap-4 p-6 sm:p-8">
                  <span className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-[9px]">
                    <Icon className="h-5 w-5" />
                  </span>

                  <div className="space-y-1">
                    <div className="text-[2rem] font-black tracking-tight sm:text-[2.15rem]">
                      {stat.value}
                    </div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
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

function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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
              <Card className="group rounded-[14px] border-border/80 bg-card p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b3aee8] hover:shadow-[0_18px_40px_rgba(109,95,212,0.12)]">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <span className="bg-[#ede9fe] text-primary flex h-[38px] w-[38px] items-center justify-center rounded-[10px] dark:bg-primary/10">
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

function PracticeSection() {
  return (
    <section id="tests" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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
            <MotionReveal key={card.title} delay={index * 0.08} className="block">
              <Link href={'/tests'} className="group block" aria-label={card.title}>
                <Card className="overflow-hidden rounded-[18px] border-border/80 bg-card transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-[#b3aee8] group-hover:shadow-[0_18px_45px_rgba(109,95,212,0.14)]">
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
                        'absolute right-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]',
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

                    <h3 className="text-base font-bold tracking-tight">{card.title}</h3>

                    <p className="text-muted-foreground text-sm leading-6">
                      {card.description}
                    </p>

                    <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-4">
                      <span className="text-foreground text-sm font-medium">
                        40 questions · 60 min
                      </span>

                      <span className="bg-background text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full border border-border/70 transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary">
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

function BandScoreSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;

    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
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
        <Card className="rounded-[18px] border-border/80 bg-card shadow-[0_18px_48px_rgba(109,95,212,0.12)]">
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

                    <div className="bg-[#ece9f8] dark:bg-white/10 h-1.5 overflow-hidden rounded-full">
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
                      className="rounded-[12px] border border-[#dddaf0] bg-card px-5 py-4 dark:border-white/10 dark:bg-white/5"
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

function TestimonialsSection() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
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
            <Card className="rounded-[20px] border-border/80 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b3aee8] hover:shadow-[0_18px_45px_rgba(109,95,212,0.12)]">
              <CardContent className="p-6">
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star
                      key={starIndex}
                      className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]"
                    />
                  ))}
                </div>

                <p className="text-foreground mt-6 text-sm italic leading-7">
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
                      <div className="text-sm font-bold">{testimonial.name}</div>
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

function NewsletterSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <MotionReveal>
        <Card className="overflow-hidden rounded-[20px] border-border/80 bg-card shadow-[0_24px_60px_rgba(109,95,212,0.16)]">
          <div className="grid lg:grid-cols-2">
            <MotionReveal className="bg-[#4f3fbf] p-8 text-white sm:p-10" delay={0.05}>
              <div className="space-y-4">
                <div className="text-[#d8d4ff] text-[11px] font-bold uppercase tracking-[0.28em]">
                  Stay updated
                </div>

                <h2 className="max-w-md text-3xl font-black tracking-tight text-white">
                  Get IELTS tips in your inbox every week
                </h2>

                <p className="max-w-md text-sm leading-7 text-[#d8d4ff]">
                  Expert preparation strategies, new Cambridge test releases, and
                  band score tips - all free.
                </p>
              </div>

              <div className="mt-8 flex items-center gap-3">
                <div className="flex">
                  {newsletterAvatars.map((initial, index) => (
                    <Avatar
                      key={initial}
                      className={cn('h-8 w-8 border-2 border-[#4f3fbf]', index > 0 && '-ml-2')}
                    >
                      <AvatarFallback className="bg-white text-[#4f3fbf] text-[11px] font-bold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>

                <p className="text-sm text-[#d8d4ff]">
                  <span className="font-bold text-white">50,000+</span> subscribers
                </p>
              </div>
            </MotionReveal>

            <MotionReveal className="bg-card p-8 sm:p-10" delay={0.1}>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold tracking-tight">Subscribe for free</h3>
                <p className="text-muted-foreground text-sm">
                  Join thousands of serious candidates getting smarter every week.
                </p>
              </div>

              <form
                className="mt-8 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                }}
              >
                <div className="space-y-2">
                  <label htmlFor="newsletter-email" className="text-sm font-medium">
                    Email address
                  </label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-[#f9f8fe] border-border/80 focus-visible:ring-primary h-12 rounded-xl"
                  />
                </div>

                <Button type="submit" className="h-12 w-full rounded-xl gap-2">
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

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', align === 'center' && 'text-center', className)}>
      <div className="text-primary text-[11px] font-bold uppercase tracking-[0.28em]">
        {eyebrow}
      </div>
      <h2 className="text-foreground text-[2rem] font-black tracking-tight sm:text-[2.25rem]">
        {title}
      </h2>
      <p
        className={cn(
          'text-muted-foreground text-sm leading-7 sm:text-[15px]',
          align === 'center' ? 'mx-auto max-w-[460px]' : 'max-w-[460px]',
        )}
      >
        {subtitle}
      </p>
    </div>
  );
}
