import { notFound } from 'next/navigation';

import { findIeltsTestBySlug } from '@kit/ielts';

import TestPage from './test-page';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const test = findIeltsTestBySlug(id);

  if (!test) {
    notFound();
  }

  return <TestPage test={test} />;
}
