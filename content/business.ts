/**
 * The business page, in structure only. The copy lives in
 * `messages/<locale>.json` under `useCases` and `measurement`.
 */

export const USE_CASES = [
  { id: "retail" },
  { id: "events" },
  { id: "token" },
  { id: "tourism" },
];

/* The four setup steps used to live here as prose. They are now the four steps
   of the interactive console in `components/business/DeployConsole.tsx`, which
   says the same thing by letting someone do it. */

export const MEASUREMENT = [
  { id: "counted" },
  { id: "when" },
  { id: "receive" },
  { id: "never" },
];
