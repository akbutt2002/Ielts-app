import {
  Award,
  BarChart3,
  BookOpen,
  Clock3,
  CircleHelp,
  Eye,
  FileText,
  GraduationCap,
  Headphones,
  LayoutGrid,
  RefreshCcw,
  Trophy,
  Target,
  Users,
} from 'lucide-react';

export const stats = [
  { icon: Users, value: '50k+', label: 'Active students' },
  { icon: Award, value: '94%', label: 'Success rate' },
  { icon: FileText, value: '72+', label: 'Practice tests' },
  { icon: Trophy, value: '9.0', label: 'Max band score' },
] as const;

export const features = [
  {
    icon: Clock3,
    title: 'Real exam timing',
    description:
      '60-minute timed simulations that mirror the actual IELTS environment down to the second.',
  },
  {
    icon: BarChart3,
    title: 'Instant band score',
    description:
      'Get your estimated IELTS band score immediately after submitting each practice test.',
  },
  {
    icon: BookOpen,
    title: 'Cambridge 14-19',
    description:
      'Full library of Cambridge tests for General Reading, Academic Reading, and Listening.',
  },
  {
    icon: Eye,
    title: 'Answer review',
    description:
      'Review every question with correct answers highlighted after each test submission.',
  },
  {
    icon: Target,
    title: 'Band target tracking',
    description:
      'See exactly how many more correct answers you need to reach your target band score.',
  },
  {
    icon: LayoutGrid,
    title: 'Real exam layout',
    description:
      'Side-by-side passage and question panels replicate the actual IELTS interface.',
  },
] as const;

export const practiceCards = [
  {
    label: 'General',
    pillClassName:
      'bg-[#EEEDFE] text-[#534AB7] dark:bg-[#534AB7]/15 dark:text-[#D7D4FF]',
    topClassName: 'bg-[#ede9fe] dark:bg-[#2a2749]',
    icon: BookOpen,
    title: 'General Reading Test 1',
    meta: 'Cambridge 19 - General reading',
    description:
      'Full-length simulation with 3 sections, real passages and complete answer key.',
  },
  {
    label: 'Academic',
    pillClassName:
      'bg-[#E6F1FB] text-[#185FA5] dark:bg-[#185FA5]/15 dark:text-[#C8DFF4]',
    topClassName: 'bg-[#e8eeff] dark:bg-[#1b274a]',
    icon: GraduationCap,
    title: 'Academic Reading Test 1',
    meta: 'Cambridge 19 - Academic reading',
    description:
      'Cambridge passages with band-level scoring and detailed answer explanations.',
  },
  {
    label: 'Listening',
    pillClassName:
      'bg-[#DFF3E8] text-[#2B6B3F] dark:bg-[#2B6B3F]/15 dark:text-[#C3E4CF]',
    topClassName: 'bg-[#e8f5ee] dark:bg-[#1c2e28]',
    icon: Headphones,
    title: 'Listening Test 1',
    meta: 'Cambridge 19 - Listening',
    description:
      'Full-length listening simulation with 4 parts and real audio playback.',
  },
] as const;

export const bandBars = [
  { band: 'Band 9', percent: 98, score: '39+' },
  { band: 'Band 8', percent: 93, score: '37+' },
  { band: 'Band 7', percent: 85, score: '34+' },
  { band: 'Band 6', percent: 68, score: '27+' },
  { band: 'Band 5', percent: 58, score: '23+' },
] as const;

export const bandRows = [
  {
    icon: Clock3,
    title: '60 minutes',
    description: 'Per reading test',
  },
  {
    icon: CircleHelp,
    title: '40 questions',
    description: 'Per test',
  },
  {
    icon: RefreshCcw,
    title: 'Unlimited retries',
    description: 'Practice as much as you want',
  },
  {
    icon: Trophy,
    title: 'Instant results',
    description: 'Band score shown after submission',
  },
] as const;

export const testimonials = [
  {
    name: 'Sarah Jenkins',
    band: 'Band 8.5',
    quote:
      'The simulation tests are incredibly accurate. I felt so much more confident on my actual exam day.',
  },
  {
    name: 'Ahmed Raza',
    band: 'Band 7.5',
    quote:
      'Best platform for IELTS prep. The instant band score kept me motivated throughout my preparation.',
  },
  {
    name: 'Lin Wei',
    band: 'Band 8.0',
    quote:
      'Clean, fast, and very professional. The interface makes studying feel less like a chore.',
  },
] as const;

export const heroAvatars = ['S', 'A', 'L', 'R', 'M'] as const;
export const newsletterAvatars = ['A', 'B', 'C', 'D'] as const;
