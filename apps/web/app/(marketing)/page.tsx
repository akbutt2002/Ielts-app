import { withI18n } from '~/lib/i18n/with-i18n';

import { MarketingLandingPage } from './_components/landing-page';

export const generateMetadata = async () => {
  return {
    title: 'IELTS practice tests | Master your IELTS',
    description:
      'Practice Cambridge IELTS tests, get instant band scores, and prepare with a premium simulation platform.',
  };
};

function Home() {
  return <MarketingLandingPage />;
}

export default withI18n(Home);
