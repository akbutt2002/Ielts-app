import { BandScoreSection } from './band-score-section';
import { FeaturesSection } from './features-section';
import { HeroSection } from './hero-section';
import { NewsletterSection } from './newsletter-section';
import { PracticeSection } from './practice-section';
import { StatsSection } from './stats-section';
import { TestimonialsSection } from './testimonials-section';

export function MarketingLandingPage() {
  return (
    <main className="bg-background text-foreground overflow-x-hidden">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <PracticeSection />
      <BandScoreSection />
      <TestimonialsSection />
      <NewsletterSection />
    </main>
  );
}
