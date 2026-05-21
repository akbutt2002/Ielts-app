import { withI18n } from '~/lib/i18n/with-i18n';
import { siteConfig } from '~/config/site.config';

import { MarketingLandingPage } from './_components/landing-page';

export const generateMetadata = async () => {
  return {
    title: siteConfig.title,
    description: siteConfig.description,
  };
};

function Home() {
  return <MarketingLandingPage />;
}

export default withI18n(Home);
