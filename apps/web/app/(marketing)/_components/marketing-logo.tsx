'use client';

import Link from 'next/link';

import { cn } from '@kit/ui/utils';

export function MarketingLogo({ className }: { className?: string }) {
  return (
    <Link
      href={'/'}
      className={cn('inline-flex items-center gap-2.5 transition-opacity hover:opacity-90', className)}
      aria-label={'GetIeltsy home'}
    >
      <img
        src="/images/favicon/getieltsy-mark.svg"
        alt=""
        aria-hidden="true"
        className="h-9 w-9 shrink-0 rounded-xl shadow-[0_12px_24px_rgba(109,95,212,0.22)]"
      />

      <span className="text-foreground text-lg font-black tracking-tight uppercase">
        GetIeltsy
      </span>
    </Link>
  );
}
