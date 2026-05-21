'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import type { JwtPayload } from '@supabase/supabase-js';

import { ChevronRight, Menu, Sparkles } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { ModeToggle } from '@kit/ui/mode-toggle';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@kit/ui/sheet';
import { cn } from '@kit/ui/utils';

import { MarketingLogo } from './marketing-logo';

const links = [
  { label: 'Home', href: '/' },
  { label: 'Practice tests', href: '#tests' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
] as const;

export function SiteHeader(_props: { user?: JwtPayload | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border/80 bg-[rgba(244,243,252,0.95)] backdrop-blur-xl transition-all duration-300 dark:bg-[#050512]/85',
        scrolled && 'shadow-[0_10px_30px_rgba(109,95,212,0.06)]',
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <MarketingLogo />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => {
            const active = link.href === '/' && pathname === '/';

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  active ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <ModeToggle className="border-border/70 bg-background/80 text-foreground h-9 w-9 rounded-full border shadow-none" />

          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link href={'/auth/sign-in'}>Sign in</Link>
          </Button>

          <Button asChild className="shadow-[0_14px_30px_rgba(109,95,212,0.22)]">
            <Link href={'/auth/sign-up'} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Get started free
            </Link>
          </Button>
        </div>

        <div className="flex items-center sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[320px] px-5 py-6">
              <SheetHeader className="text-left">
                <SheetTitle className="sr-only">Navigation menu</SheetTitle>
                <MarketingLogo />
              </SheetHeader>

              <div className="mt-8 flex flex-col gap-2">
                {links.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link
                      href={link.href}
                      className="text-foreground hover:bg-accent flex items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition-colors"
                    >
                      <span>{link.label}</span>
                      <ChevronRight className="text-muted-foreground h-4 w-4" />
                    </Link>
                  </SheetClose>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-xl border border-border/70 bg-background/80 px-3 py-3">
                  <span className="text-sm font-medium text-foreground">
                    Theme
                  </span>

                  <ModeToggle className="border-border/70 bg-background/80 text-foreground h-9 w-9 rounded-full border shadow-none" />
                </div>

                <Button variant="outline" asChild className="w-full">
                  <Link href={'/auth/sign-in'}>Sign in</Link>
                </Button>

                <Button asChild className="w-full">
                  <Link href={'/auth/sign-up'} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Get started free
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
