const defaultSiteUrl = 'https://getieltsy.vercel.app';

export const siteConfig = {
  name: 'GetIeltsy',
  title: 'GetIeltsy | IELTS preparation platform',
  description:
    'Prepare smarter for IELTS with realistic practice tests, instant scoring, and clear performance insights.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl,
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'en',
} as const;
