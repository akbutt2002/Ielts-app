import { ImageResponse } from 'next/og';

import { SocialPreviewCard } from './_components/social-preview-card';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(<SocialPreviewCard />, {
    ...size,
  });
}
