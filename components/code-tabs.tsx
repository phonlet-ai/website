'use client';
import { useRef, useState, type KeyboardEvent } from 'react';
import { CodeBlock } from '@/components/code-block';

export type CodeTab = { id: string; label: string; title: string; code: string; note: string };

// One code window, one tab per platform (WAI-ARIA tabs: arrow keys, Home and End move between
// tabs; only the selected tab is in the Tab order).
export function CodeTabs({ tabs, label }: { tabs: readonly CodeTab[]; label: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const select = (index: number) => {
    const next = (index + tabs.length) % tabs.length;
    setActive(next);
    refs.current[next]?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const moves: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    const target = moves[event.key];
    if (target === undefined) return;
    event.preventDefault();
    select(target);
  };
  return (
    <div className="code-tabs">
      <div className="code-tab-list" role="tablist" aria-label={label}>
        {tabs.map((item, i) => (
          <button
            key={item.id}
            ref={(node) => {
              refs.current[i] = node;
            }}
            id={`code-tab-${item.id}`}
            role="tab"
            type="button"
            aria-selected={i === active}
            aria-controls={`code-panel-${item.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={onKeyDown}
          >
            {item.label}
          </button>
        ))}
      </div>
      {tabs.map((item, i) => (
        <div
          key={item.id}
          id={`code-panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`code-tab-${item.id}`}
          hidden={i !== active}
        >
          <CodeBlock code={item.code} title={item.title} note={item.note} />
        </div>
      ))}
    </div>
  );
}
