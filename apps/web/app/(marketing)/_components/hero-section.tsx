'use client';

import Link from 'next/link';

import { motion, useReducedMotion } from 'framer-motion';

import { Avatar, AvatarFallback } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

import { BookOpen, Play } from 'lucide-react';

import { heroAvatars } from './landing-page.content';

export function HeroSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(155,143,232,0.18),transparent_34%),radial-gradient(circle_at_20%_10%,rgba(109,95,212,0.08),transparent_20%),radial-gradient(circle_at_80%_20%,rgba(155,143,232,0.08),transparent_24%)]" />

      <div className="mx-auto max-w-7xl px-4 pt-20 pb-16 text-center sm:px-6 sm:pt-24 sm:pb-20 lg:px-8 lg:pt-28 lg:pb-24">
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
                animate={{
                  scale: [0.85, 2.25, 0.85],
                  opacity: [0.65, 0.08, 0.65],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ) : null}

            <motion.span
              aria-hidden="true"
              className="bg-primary relative z-10 h-2 w-2 rounded-full shadow-[0_0_0_6px_rgba(109,95,212,0.12)]"
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [1, 1.22, 1], opacity: [1, 0.78, 1] }
              }
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </span>
          Next-gen IELTS preparation platform
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.08,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="text-foreground mx-auto mt-8 max-w-4xl text-[2.35rem] font-black tracking-tight sm:text-5xl md:text-[3.8rem] md:leading-[0.95]"
        >
          <span className="block">Master your IELTS.</span>
          <span className="text-primary block">Score higher. Faster.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.16,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="text-muted-foreground mx-auto mt-6 max-w-[500px] text-base leading-7 sm:text-lg"
        >
          The most advanced simulation platform for serious candidates.
          Practice with real Cambridge tests and get your band score instantly.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.24,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="mt-10 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="h-12 rounded-xl px-6 shadow-[0_18px_40px_rgba(109,95,212,0.2)]"
          >
            <Link href={'/auth/sign-up'} className="gap-2">
              <Play className="h-4 w-4 fill-current" />
              Start free trial
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-12 rounded-xl px-6"
          >
            <Link href={'/tests'} className="gap-2">
              <BookOpen className="h-4 w-4" />
              Browse practice tests
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.32,
            ease: [0.21, 0.47, 0.32, 0.98],
          }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <div className="flex items-center">
            {heroAvatars.map((initial, index) => (
              <Avatar
                key={initial}
                className={cn(
                  'border-background h-9 w-9 border-2',
                  index > 0 && '-ml-2',
                )}
              >
                <AvatarFallback className="text-primary bg-[#ede9fe] text-xs font-bold dark:bg-white/10">
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
