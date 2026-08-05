"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { listCopy, withCopy } from "@/lib/content-i18n";
import PixelAvatar from "@/components/ui/PixelAvatar";

/**
 * The social layer in the app's own shapes.
 *
 * Chat is threaded rows, not left/right bubbles: avatar, rank, name, time,
 * then the text. Values below are lifted from `components/chat/ChatView.tsx`
 * — CHAT_SURFACE #17171A with rows at 5.5% white and a rim brighter along the
 * top than down the sides, so a row reads as lit from above. The composer
 * goes the other way, a step darker, so it recedes under the conversation.
 */
const THREAD = [
  {
    id: "spot",
    who: "nova",
    rank: "PATHFINDER",
    // A 3D avatar from the app, the way most players actually appear.
    avatar: "/app/avatars/avatar-1.png",
    tone: 0,
    time: "18:04",
  },
  { id: "coming", who: "pike", rank: "RANGER", avatar: null, tone: 1, time: "18:04" },
  {
    id: "sent",
    who: "wren",
    rank: "APEX",
    avatar: "/app/avatars/avatar-4.png",
    tone: 2,
    time: "18:05",
  },
  { id: "missed", who: "pike", rank: "RANGER", avatar: null, tone: 1, time: "18:09" },
];

const REFERRAL_STATS = [
  { id: "invited", value: "24" },
  { id: "active", value: "17" },
  { id: "share", value: "5%" },
];

export default function SocialSection() {
  const t = useTranslations("socialSection");
  const thread = withCopy(t, THREAD, ["text"]);
  const stats = withCopy(t, REFERRAL_STATS, ["label"]);
  const [shown, setShown] = useState(1);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(THREAD.length);
      return;
    }
    if (shown >= THREAD.length) return;
    const id = window.setTimeout(() => setShown((n) => n + 1), 1500);
    return () => window.clearTimeout(id);
  }, [shown]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("SEEK-NOVA-24");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the code is on screen either way */
    }
  };

  return (
    <div className="social">
      <div className="social-copy">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2 className="t-h2">{t("title")}</h2>
        <p className="t-lead" style={{ marginTop: "1.25rem" }}>
          {t("lead")}
        </p>

        <ul className="showcase-points" style={{ marginTop: "2rem" }}>
          {listCopy(t, "points").map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="social-panels">
        {/* Rendered on the app's chat surface rather than the page's. */}
        <div className="chat-surface">
          <div className="chat-head">
            <span className="chat-head-title">
              <b>Laser Eyes</b>
              <i>{t("online", { count: 412 })}</i>
            </span>
            <span className="chat-lock">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="4" y="10" width="16" height="11" rx="2.5" stroke="currentColor" strokeWidth="2.2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2.2" />
              </svg>
              {t("encrypted")}
            </span>
          </div>

          <ul className="chat-thread">
            {thread.slice(0, shown).map((row, i) => (
              <li key={i} className="chat-row">
                <span className="chat-avatar">
                  {row.avatar ? (
                    <img src={row.avatar} alt="" loading="lazy" />
                  ) : (
                    <PixelAvatar seed={row.who} size={36} />
                  )}
                </span>
                <span className="chat-details">
                  <span className="chat-row-head">
                    <b className="chat-name">{row.who}</b>
                    <em className="chat-rank">{row.rank}</em>
                    <i className="chat-date">{row.time}</i>
                  </span>
                  <span className="chat-content">{row.text}</span>
                </span>
              </li>
            ))}
            {shown < THREAD.length && (
              <li className="chat-typing" aria-hidden="true">
                <span /><span /><span />
              </li>
            )}
          </ul>

          <div className="chat-composer">
            <span>{t("composer")}</span>
            <span className="chat-timer" title={t("disappearing")}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2.2" />
                <path d="M12 9v4l2.5 2M9 2h6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
              24h
            </span>
          </div>
        </div>

        <div className="social-referral glass">
          <p className="t-mono">{t("yourCode")}</p>
          <button type="button" className="social-code" onClick={copy}>
            <span>SEEK-NOVA-24</span>
            <em>{copied ? t("copied") : t("copy")}</em>
          </button>

          <dl className="social-referral-stats">
            {stats.map((stat) => (
              <div key={stat.id}>
                <dt className="t-mono-sm">{stat.label}</dt>
                <dd className="t-num">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
