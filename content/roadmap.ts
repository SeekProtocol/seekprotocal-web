export type PhaseStatus = "done" | "active" | "next";

export type Phase = {
  id: string;
  period: string;
  title: string;
  status: PhaseStatus;
  summary: string;
  /**
   * A `group` opens a labelled run of items inside the phase. It exists so a
   * year that carries two distinct pushes can stay one row on the timeline: a
   * timeline's job is to answer "when", and two rows with the same date make a
   * reader stop and work out why they are separate. The answer is grouping,
   * which a heading says better than a duplicated date does.
   */
  items: { text: string; done?: boolean; group?: string }[];
};

export const PHASES: Phase[] = [
  {
    id: "foundation",
    period: "2024 to Q1 2025",
    title: "Foundation",
    status: "done",
    summary:
      "Proving the core idea worked at all: could a phone confirm someone was somewhere, reliably enough to release something of value?",
    items: [
      { text: "Proof-of-location prototype using GNSS and motion continuity", done: true },
      { text: "AR rendering engine with persistent world anchoring", done: true },
      { text: "Solana settlement layer and asset definitions", done: true },
      { text: "Internal alpha across three test cities", done: true },
    ],
  },
  {
    id: "launch",
    period: "Q2 to Q4 2025",
    title: "Public launch",
    status: "done",
    summary:
      "Getting SeekAR into real hands, on both app stores, with an onboarding flow that does not assume the user has ever held a private key.",
    items: [
      { text: "SeekAR released on iOS and Android", done: true },
      { text: "Social-login wallet with optional self-custody export", done: true },
      { text: "Location-based drops and quest system", done: true },
      { text: "Device attestation via Play Integrity and App Attest", done: true },
      { text: "Site and app localised into eight languages", done: true },
    ],
  },
  {
    id: "scale",
    period: "2026",
    title: "Opening it up",
    status: "active",
    summary:
      "The year the network stops being ours to fill. Anyone can place assets without talking to us first, the token that funds them goes public, and the reasons to come back stop being things you do alone.",
    items: [
      { group: "Supply side", text: "AI companion with camera-aware contextual guidance", done: true },
      { text: "Radio fingerprinting added to the verification stack", done: true },
      { text: "Drag-and-drop campaign builder for smaller publishers", done: true },
      { text: "Self-serve business portal for venues and brands" },
      { text: "Verified-arrival analytics and cost-per-visit reporting" },
      { text: "Token generation event" },
      { text: "Major partnerships" },

      { group: "Network effects", text: "Live event mode for festivals, matches and conferences" },
      { text: "Seasons, with their own ladders and rewards" },
      { text: "Gamified object scanning" },
      { text: "Guilds, team quests and shared reward pools" },
      { text: "Creator revenue share on placed assets" },
    ],
  },
  {
    id: "governance",
    period: "2027 and beyond",
    title: "Handing over the parameters",
    status: "next",
    summary:
      "Governance follows real fee flow rather than preceding it. Voting on an economy with no volume is theatre, so this comes last on purpose.",
    items: [
      { text: "On-chain governance for protocol parameters" },
      { text: "Community treasury allocation" },
      { text: "Third-party verification providers" },
      { text: "Open SDK for external applications on the protocol" },
    ],
  },
];

export const ROADMAP_NOTE =
  "Dates describe intent, not commitments. Anything not yet marked complete may move, and we would rather say so than quietly reshuffle the chart.";
