import React from 'react';
import { withI18n } from '~/lib/i18n/with-i18n';
import { IELTSHero } from '@kit/ui/ielts/hero';

import { 
  FeaturesSection, 
  StatsSection, 
  TestimonialsSection 
} from './_components/marketing-client-components';

function Home() {
  return (
    <main className="min-h-screen bg-background overflow-hidden">
      <IELTSHero />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
    </main>
  );
}

export default withI18n(Home);
