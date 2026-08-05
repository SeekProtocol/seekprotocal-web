export type PhaseStatus = "done" | "active" | "next";

export type Phase = {
  id: string;
  period: string;
  status: PhaseStatus;
  /**
   * A `group` opens a labelled run of items inside the phase. It exists so a
   * year that carries two distinct pushes can stay one row on the timeline: a
   * timeline's job is to answer "when", and two rows with the same date make a
   * reader stop and work out why they are separate. The answer is grouping,
   * which a heading says better than a duplicated date does.
   *
   * Both the item text and the group heading are looked up in
   * `roadmapPhases.<phase>.items.<item>` and `.groups.<group>`.
   */
  items: { id: string; done?: boolean; group?: string }[];
};

export const PHASES: Phase[] = [
  {
    id: "foundation",
    period: "2024 to Q1 2025",
    status: "done",
    items: [
      { id: "prototype", done: true },
      { id: "engine", done: true },
      { id: "settlement", done: true },
      { id: "alpha", done: true },
    ],
  },
  {
    id: "launch",
    period: "Q2 to Q4 2025",
    status: "done",
    items: [
      { id: "stores", done: true },
      { id: "wallet", done: true },
      { id: "drops", done: true },
      { id: "attestation", done: true },
      { id: "localisation", done: true },
    ],
  },
  {
    id: "scale",
    period: "2026",
    status: "active",
    items: [
      { id: "companion", done: true, group: "supply" },
      { id: "radio", done: true },
      { id: "builder", done: true },
      { id: "portal" },
      { id: "analytics" },
      { id: "tge" },
      { id: "partnerships" },

      { id: "liveEvents", group: "network" },
      { id: "seasons" },
      { id: "scanning" },
      { id: "guilds" },
      { id: "revenueShare" },
    ],
  },
  {
    id: "governance",
    period: "2027 and beyond",
    status: "next",
    items: [
      { id: "onChain" },
      { id: "treasury" },
      { id: "providers" },
      { id: "sdk" },
    ],
  },
];
