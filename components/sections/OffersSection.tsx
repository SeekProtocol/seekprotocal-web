"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OFFERS, type Offer } from "@/content/offers";

/**
 * The formats a drop can take.
 *
 * The section above this one is coins, which is what everyone assumes a
 * location-based drop is. This is the rest of the range, and for a high street
 * the coin is usually the least interesting of them.
 *
 * Each card is drawn as the artefact it would be rather than as a bullet with
 * an icon: the voucher has a perforation and a code, the pass has a barcode
 * edge, the collectible has a rarity ribbon. Picking one opens the two things
 * a publisher actually asks about, which are how it redeems and what stops
 * someone redeeming it who was never there.
 */
export default function OffersSection() {
  const [active, setActive] = useState<Offer["id"]>("voucher");
  const current = OFFERS.find((offer) => offer.id === active) ?? OFFERS[0];

  const railRef = useRef<HTMLDivElement>(null);
  /** Set once someone drags, taps or focuses. The rail never resumes after. */
  const takenOver = useRef(false);

  const choose = useCallback((id: Offer["id"]) => {
    takenOver.current = true;
    setActive(id);
  }, []);

  /* The rail advances on its own while it is on screen.
   *
   * On a phone the five cards are a horizontal scroller, and a scroller with
   * no affordance is a scroller nobody scrolls: the two cards past the edge
   * may as well not exist. Cycling shows there is more without asking anyone
   * to guess.
   *
   * It stops for good the moment the reader does anything, because a carousel
   * that moves while you are reading it is worse than one that never moved. */
  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    // Desktop lays all five out at once, so there is nothing to advance.
    if (!window.matchMedia("(max-width: 720px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let onScreen = false;
    const observer = new IntersectionObserver(
      ([entry]) => (onScreen = entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(rail);

    const stop = () => {
      takenOver.current = true;
    };
    rail.addEventListener("pointerdown", stop);
    rail.addEventListener("focusin", stop);
    // A wheel or a swipe is the reader taking the wheel just as much as a tap.
    rail.addEventListener("touchstart", stop, { passive: true });

    const id = window.setInterval(() => {
      if (!onScreen || takenOver.current) return;
      setActive((prev) => {
        const at = OFFERS.findIndex((offer) => offer.id === prev);
        const next = OFFERS[(at + 1) % OFFERS.length];
        const card = rail.children[(at + 1) % OFFERS.length] as HTMLElement | undefined;
        card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
        return next.id;
      });
    }, 3600);

    return () => {
      window.clearInterval(id);
      observer.disconnect();
      rail.removeEventListener("pointerdown", stop);
      rail.removeEventListener("focusin", stop);
      rail.removeEventListener("touchstart", stop);
    };
  }, []);

  return (
    <div className="offers">
      <div className="offers-rail" role="tablist" aria-label="Drop formats" ref={railRef}>
        {OFFERS.map((offer) => (
          <button
            key={offer.id}
            type="button"
            role="tab"
            id={`offer-tab-${offer.id}`}
            aria-selected={offer.id === active}
            aria-controls={`offer-panel-${offer.id}`}
            className="offer-card"
            data-kind={offer.id}
            data-active={offer.id === active || undefined}
            style={{ ["--accent" as string]: offer.accent }}
            onClick={() => choose(offer.id)}
          >
            <OfferArtefact offer={offer} />
          </button>
        ))}
      </div>

      <div
        className="offers-detail"
        role="tabpanel"
        id={`offer-panel-${current.id}`}
        aria-labelledby={`offer-tab-${current.id}`}
        key={current.id}
        style={{ ["--accent" as string]: current.accent }}
      >
        <div className="offers-detail-head">
          <span className="t-mono offers-detail-label">{current.label}</span>
          <h3 className="t-h3">{current.headline}</h3>
          <span className="chip offers-detail-who">{current.placedBy}</span>
        </div>

        <dl className="offers-detail-body">
          <div>
            <dt className="t-mono-sm">How it redeems</dt>
            <dd className="t-body">{current.redeem}</dd>
          </div>
          <div>
            <dt className="t-mono-sm">What makes it valid</dt>
            <dd className="t-body">{current.proof}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

/** The card face. Each kind is a different physical object. */
function OfferArtefact({ offer }: { offer: Offer }) {
  return (
    <span className="offer-face">
      <span className="offer-face-top">
        <span className="t-mono-sm offer-face-kind">{offer.label}</span>
        <OfferGlyph kind={offer.id} />
      </span>

      <span className="offer-face-value">{offer.face}</span>
      <span className="t-mono-sm offer-face-fine">{offer.fine}</span>

      {/* The tear-off strip, the barcode edge and the ribbon are what make the
          five cards read as five different things at a glance. */}
      {offer.id === "voucher" && (
        <span className="offer-perforation" aria-hidden="true">
          <b>SEEK·4K2P</b>
        </span>
      )}
      {offer.id === "access" && <span className="offer-barcode" aria-hidden="true" />}
      {offer.id === "collectible" && <span className="offer-ribbon" aria-hidden="true" />}
      {offer.id === "asset" && <span className="offer-serial t-mono-sm" aria-hidden="true">1 / 250</span>}
      {offer.id === "token" && (
        <img className="offer-coin" src="/app/seek-coin-3d.png" alt="" aria-hidden="true" />
      )}
    </span>
  );
}

function OfferGlyph({ kind }: { kind: Offer["id"] }) {
  const common = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (kind) {
    case "voucher":
      return (
        <svg {...common}>
          <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h15A1.5 1.5 0 0 1 21 7.5v2a2.5 2.5 0 0 0 0 5v2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-2a2.5 2.5 0 0 0 0-5Z" />
          <path d="M14 9.5v5" strokeDasharray="1.5 2" />
        </svg>
      );
    case "asset":
      return (
        <svg {...common}>
          <path d="M3.5 8.2 12 4l8.5 4.2v7.6L12 20l-8.5-4.2Z" />
          <path d="M3.5 8.2 12 12.4l8.5-4.2M12 12.4V20" />
        </svg>
      );
    case "access":
      // A turnstile rather than a second ticket: the voucher already owns that
      // shape and at 18px the two were indistinguishable.
      return (
        <svg {...common}>
          <path d="M4 20V7.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2V20" />
          <path d="M2.5 20h19" />
          <path d="M8.5 20v-5.5h7V20" />
          <path d="M12 5.5v9" />
        </svg>
      );
    case "token":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="7.5" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "collectible":
      return (
        <svg {...common}>
          <path d="M12 3.5 14.6 9l6 .8-4.4 4.2 1.1 6-5.3-2.9L6.7 20l1.1-6L3.4 9.8l6-.8Z" />
        </svg>
      );
  }
}
