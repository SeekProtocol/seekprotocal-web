import { Fragment, type ReactNode } from "react";

/**
 * Renders the `**bold**` spans used in the content modules. Deliberately
 * minimal — the content is authored, not user-supplied, so a full markdown
 * parser would be weight without benefit.
 */
export default function RichText({ text }: { text: string }): ReactNode {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}
