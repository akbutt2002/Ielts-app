import { withI18n } from '~/lib/i18n/with-i18n';
import { siteConfig } from '~/config/site.config';

import { MarketingLandingPage } from './_components/landing-page';

export const generateMetadata = async () => {
  return {
    title: {
      default: siteConfig.title,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.description,
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    openGraph: {
      type: 'website',
      title: siteConfig.title,
      description: siteConfig.description,
      siteName: siteConfig.name,
      url: siteConfig.url,
      images: [
        {
          url: `/opengraph-image?v=getieltsy-v2`,
          width: 1200,
          height: 630,
          alt: siteConfig.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: siteConfig.title,
      description: siteConfig.description,
      images: [`/twitter-image?v=getieltsy-v2`],
    },
  };
};

function Home() {
  return <MarketingLandingPage />;
}

export default withI18n(Home);
