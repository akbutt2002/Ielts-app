import Link from 'next/link';

import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

import { Button } from '@kit/ui/button';

import { MarketingLogo } from './marketing-logo';

const footerLinks = [
  { href: '/auth/sign-in', label: 'Sign in' },
  { href: '/auth/sign-up', label: 'Sign up' },
  { href: '/tests', label: 'Practice tests' },
  { href: '/terms-of-service', label: 'Terms' },
  { href: '/privacy-policy', label: 'Privacy' },
  { href: '/cookie-policy', label: 'Cookies' },
] as const;

const socials = [
  { href: 'https://facebook.com', label: 'Facebook', Icon: Facebook },
  { href: 'https://instagram.com', label: 'Instagram', Icon: Instagram },
  { href: 'https://twitter.com', label: 'Twitter', Icon: Twitter },
  { href: 'https://youtube.com', label: 'YouTube', Icon: Youtube },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/80 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-5">
            <MarketingLogo />

            <p className="text-muted-foreground max-w-md text-sm leading-6">
              Next-gen IELTS practice with full-length simulations, instant
              band feedback, and a clean exam interface that keeps you
              focused.
            </p>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
              {footerLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {socials.map(({ href, label, Icon }) => (
                <Button
                  key={label}
                  asChild
                  size="icon"
                  variant="outline"
                  className="h-7 w-7 rounded-md border-border/80 bg-background hover:bg-primary/10 hover:text-primary"
                >
                  <Link href={href} aria-label={label} target="_blank" rel="noreferrer">
                    <Icon className="h-4 w-4" />
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-border/70 text-muted-foreground mt-8 border-t pt-6 text-center text-[11px]">
          &copy; 2026 IELTS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

