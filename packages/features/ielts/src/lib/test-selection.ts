import ieltsListening from './ielts_listening.json';
import ieltsTests from './ielts_tests.json';

export type IeltsTestRecord = Record<string, unknown> & {
  title: string;
  test_type?: string;
  total_answers?: number;
};

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function getAllIeltsTests(): IeltsTestRecord[] {
  return [...(ieltsTests as IeltsTestRecord[]), ...(ieltsListening as IeltsTestRecord[])];
}

export function findIeltsTestBySlug(slug: string): IeltsTestRecord | undefined {
  return getAllIeltsTests().find((test) => slugify(test.title) === slug);
}
