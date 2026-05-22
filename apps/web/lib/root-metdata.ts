import { Metadata } from 'next';

import { headers } from 'next/headers';

import appConfig from '~/config/app.config';

/**
 * @name generateRootMetadata
 * @description Generates the root metadata for the application
 */
export const generateRootMetadata = async (): Promise<Metadata> => {
  const headersStore = await headers();
  const csrfToken = headersStore.get('x-csrf-token') ?? '';
  const previewImageVersion = 'getieltsy-v2';

  return {
    title: {
      default: appConfig.title,
      template: `%s | ${appConfig.name}`,
    },
    description: appConfig.description,
    metadataBase: new URL(appConfig.url),
    applicationName: appConfig.name,
    other: {
      'csrf-token': csrfToken,
      'application-name': appConfig.name,
      'apple-mobile-web-app-title': appConfig.name,
    },
    openGraph: {
      type: 'website',
      url: appConfig.url,
      siteName: appConfig.name,
      title: appConfig.title,
      description: appConfig.description,
      images: [
        {
          url: `/opengraph-image?v=${previewImageVersion}`,
          width: 1200,
          height: 630,
          alt: appConfig.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: appConfig.title,
      description: appConfig.description,
      images: [`/twitter-image?v=${previewImageVersion}`],
    },
    icons: {
      icon: '/images/favicon/getieltsy-mark.svg',
      apple: '/images/favicon/getieltsy-mark.svg',
    },
  };
};
