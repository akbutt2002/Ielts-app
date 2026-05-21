'use client';

import Link from 'next/link';

import { BookOpen } from 'lucide-react';

import { cn } from '@kit/ui/utils';

export function MarketingLogo({ className }: { className?: string }) {
  return (
    <Link
      href={'/'}
      className={cn('inline-flex items-center gap-2.5 transition-opacity hover:opacity-90', className)}
      aria-label={'IELTS home'}
    >
      <span className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl shadow-[0_12px_24px_rgba(109,95,212,0.22)]">
        <BookOpen className="h-5 w-5" />
      </span>

      <span className="text-foreground text-lg font-black tracking-tight uppercase">
        IELTS
      </span>
    </Link>
  );
}
