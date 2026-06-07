'use client';

import { normalizeInstructionFragment } from '../utils/instruction-formatter';

function resolvePassageCardContent(passage: any) {
  const heading = String(passage?.heading ?? '').trim();
  const instruction = String(passage?.instruction ?? '').trim();
  const lines = String(passage?.text ?? '')
    .split(/\r?\n+/)
    .map((line) => normalizeInstructionFragment(line))
    .filter(Boolean);

  if (/^You should spend about\b/i.test(heading) && lines.length >= 2) {
    const titleLineIndex = lines.findIndex(
      (line, index) => index > 0 && /^below\.?$/i.test(line),
    );

    if (titleLineIndex !== -1 && lines[titleLineIndex + 1]) {
      const introLines = lines.slice(0, titleLineIndex + 1);
      const titleLine = lines[titleLineIndex + 1] ?? '';
      const bodyLines = lines.slice(titleLineIndex + 2);

      return {
        heading: titleLine,
        instruction: [heading, ...introLines]
          .filter(Boolean)
          .join(' ')
          .replace(/\s+,/g, ','),
        bodyLines,
      };
    }
  }

  return {
    heading,
    instruction,
    bodyLines: lines,
  };
}

export function PassagePanel({ passages }: any) {
  return (
    <section className="border-border/60 bg-background/70 min-h-0 overflow-hidden rounded-[28px] border shadow-sm">
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
          {passages.map(({ passage, passageNumber }: any) => (
            (() => {
              const { heading, instruction, bodyLines } =
                resolvePassageCardContent(passage);

              return (
              <article
                key={`${passage.heading ?? 'passage'}-${passageNumber}`}
                className="border-border/60 bg-background/75 hover:border-foreground/15 hover:bg-background/90 space-y-4 rounded-[26px] border p-6 shadow-sm transition-colors"
              >
                <div className="text-muted-foreground text-[11px] font-black tracking-[0.24em] uppercase">
                  Reading Passage {passageNumber}
                </div>

              {heading ? (
                <h3 className="text-foreground text-lg font-semibold tracking-tight">
                  {heading}
                </h3>
              ) : null}

              {instruction ? (
                <div className="text-muted-foreground text-sm leading-7">
                  {instruction}
                </div>
              ) : null}

              {bodyLines.length > 0 ? (
                <div className="text-foreground/90 space-y-3 text-sm leading-7">
                  {bodyLines.map((line: string, lineIdx: number) => (
                    <p
                      key={`${passageNumber}-${lineIdx}-${line}`}
                      className="whitespace-pre-wrap"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              ) : null}
              </article>
              );
            })()
          ))}
        </div>
      </div>
    </section>
  );
}
