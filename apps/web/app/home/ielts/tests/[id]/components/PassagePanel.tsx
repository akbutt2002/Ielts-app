'use client';

import { renderInstructionText } from './instruction-renderers';

export function PassagePanel({ passages }: any) {
  return (
    <section className="border-border/60 bg-background/70 min-h-0 overflow-hidden rounded-[28px] border shadow-sm">
      <div className="flex h-full min-h-0 flex-col">
        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-6">
          {passages.map(({ passage, passageNumber }: any) => (
            <article
              key={`${passage.heading ?? 'passage'}-${passageNumber}`}
              className="border-border/60 bg-background/75 hover:border-foreground/15 hover:bg-background/90 space-y-4 rounded-[26px] border p-6 shadow-sm transition-colors"
            >
              <div className="text-muted-foreground text-[11px] font-black tracking-[0.24em] uppercase">
                Reading Passage {passageNumber}
              </div>

              {passage.heading ? (
                <h3 className="text-foreground text-lg font-semibold tracking-tight">
                  {passage.heading}
                </h3>
              ) : null}

              {passage.instruction ? (
                <div className="text-muted-foreground text-sm leading-7">
                  {renderInstructionText(passage.instruction)}
                </div>
              ) : null}

              {passage.text ? (
                <div className="text-foreground/90 space-y-3 text-sm leading-7">
                  {passage.text.split(/\n+/).map((line: string, lineIdx: number) => (
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
          ))}
        </div>
      </div>
    </section>
  );
}
