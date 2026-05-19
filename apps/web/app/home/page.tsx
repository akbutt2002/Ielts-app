import {
  buildIeltsListingData,
  ieltsListening,
  ieltsTests,
} from '@kit/ielts';
import { IeltsTestListing } from '@kit/ui/ielts/listing';

export default function HomePage() {
  const listing = buildIeltsListingData(ieltsTests, ieltsListening, {
    minBookNumber: 14,
    maxBookNumber: 19,
  });

  return (
    <IeltsTestListing listing={listing} />
  );
}
