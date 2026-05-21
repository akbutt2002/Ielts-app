import { z } from 'zod';

import { siteConfig } from './site.config';

const production = process.env.NODE_ENV === 'production';
const defaultName = siteConfig.name;
const defaultTitle = siteConfig.title;
const defaultDescription = siteConfig.description;

function getConfiguredText(envValue: string | undefined, fallback: string) {
  if (!envValue) {
    return fallback;
  }

  if (/the easiest way to build|manage your saas/i.test(envValue)) {
    return fallback;
  }

  return envValue;
}

const AppConfigSchema = z
  .object({
    name: z
      .string({
        description: `This is the name of your application. Ex. "GetIeltsy"`,
        required_error: `Please provide the variable NEXT_PUBLIC_PRODUCT_NAME`,
      })
      .min(1),
    title: z
      .string({
        description: `This is the default title tag of your application.`,
        required_error: `Please provide the variable NEXT_PUBLIC_SITE_TITLE`,
      })
      .min(1),
    description: z.string({
      description: `This is the default description of your application.`,
      required_error: `Please provide the variable NEXT_PUBLIC_SITE_DESCRIPTION`,
    }),
    url: z
      .string({
        required_error: `Please provide the variable NEXT_PUBLIC_SITE_URL`,
      })
      .url({
        message: `You are deploying a production build but have entered a NEXT_PUBLIC_SITE_URL variable using http instead of https. It is very likely that you have set the incorrect URL. The build will now fail to prevent you from from deploying a faulty configuration. Please provide the variable NEXT_PUBLIC_SITE_URL with a valid URL, such as: 'https://example.com'`,
      }),
    locale: z
      .string({
        description: `This is the default locale of your application.`,
        required_error: `Please provide the variable NEXT_PUBLIC_DEFAULT_LOCALE`,
      })
      .default('en'),
    theme: z.enum(['light', 'dark', 'system']),
    production: z.boolean(),
    themeColor: z.string(),
    themeColorDark: z.string(),
  })
  .refine(
    (schema) => {
      const isCI = process.env.NEXT_PUBLIC_CI;

      if (isCI ?? !schema.production) {
        return true;
      }

      return !schema.url.startsWith('http:');
    },
    {
      message: `Please provide a valid HTTPS URL. Set the variable NEXT_PUBLIC_SITE_URL with a valid URL, such as: 'https://example.com'`,
      path: ['url'],
    },
  )
  .refine(
    (schema) => {
      return schema.themeColor !== schema.themeColorDark;
    },
    {
      message: `Please provide different theme colors for light and dark themes.`,
      path: ['themeColor'],
    },
  );

const appConfig = AppConfigSchema.parse({
  name: getConfiguredText(process.env.NEXT_PUBLIC_PRODUCT_NAME, defaultName),
  title: getConfiguredText(process.env.NEXT_PUBLIC_SITE_TITLE, defaultTitle),
  description: getConfiguredText(
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
    defaultDescription,
  ),
  url: process.env.NEXT_PUBLIC_SITE_URL ?? siteConfig.url,
  locale: process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? siteConfig.locale,
  theme: process.env.NEXT_PUBLIC_DEFAULT_THEME_MODE,
  themeColor: process.env.NEXT_PUBLIC_THEME_COLOR,
  themeColorDark: process.env.NEXT_PUBLIC_THEME_COLOR_DARK,
  production,
});

export default appConfig;
