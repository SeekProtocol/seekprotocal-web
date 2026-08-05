"use client";

import { useId, useState } from "react";

export type AccordionItem = {
  question: string;
  answer: string;
};

export default function Accordion({
  items,
  className = "",
}: {
  items: AccordionItem[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className={`accordion ${className}`}>
      {items.map((item, i) => {
        const expanded = open === i;
        return (
          <div key={item.question} className="accordion-item" data-open={expanded || undefined}>
            <h3>
              <button
                type="button"
                className="accordion-trigger"
                aria-expanded={expanded}
                aria-controls={`${baseId}-panel-${i}`}
                id={`${baseId}-trigger-${i}`}
                onClick={() => setOpen(expanded ? null : i)}
              >
                <span>{item.question}</span>
                <span className="accordion-icon" aria-hidden="true" />
              </button>
            </h3>
            <div
              id={`${baseId}-panel-${i}`}
              role="region"
              aria-labelledby={`${baseId}-trigger-${i}`}
              className="accordion-panel"
              hidden={!expanded}
            >
              <p className="t-body">{item.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
