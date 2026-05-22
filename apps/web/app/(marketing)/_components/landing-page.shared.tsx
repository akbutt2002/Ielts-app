'use client';

import { type ReactNode } from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@kit/ui/utils';

export function MotionReveal({
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

export function SectionHeading({
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
    <div
      className={cn(
        'space-y-3',
        align === 'center' && 'text-center',
        className,
      )}
    >
      <div className="text-primary text-[11px] font-bold tracking-[0.28em] uppercase">
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
