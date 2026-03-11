"use client";

import { useEffect, useRef } from "react";

const TEXTS = ["UNLIMITED ASSETS.", "REAL ENGAGEMENT.", "SEEK. COLLECT. EARN"];
const CLASSES = ["metrics-1st", "metrics-2nd", "metrics-3rd"];

export default function MetricsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let ticking = false;

    const stickyWrapper = section.querySelector('.metrics-sticky-wrapper') as HTMLElement | null;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const rect = section.getBoundingClientRect();
        const sectionHeight = section.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrollableDistance = sectionHeight - viewportHeight;

        if (scrollableDistance <= 0) return;

        const scrolled = -rect.top;
        const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

        const n = TEXTS.length;
        const containerHeight = stickyWrapper?.offsetHeight || viewportHeight;

        itemRefs.current.forEach((item, i) => {
          if (!item) return;

          const centerAt = i / (n - 1);
          const distance = progress - centerAt;
          const offsetPx = -distance * (containerHeight + item.offsetHeight);

          const absDist = Math.abs(distance) * (n - 1);
          const opacity = Math.max(0, 1 - absDist * 1.8);

          item.style.transform = `translate(0, ${offsetPx}px)`;
          item.style.opacity = String(opacity);
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={sectionRef} className="metrics-01">
      <div className="container-2 _02">
        <div className="metrics-sticky-wrapper">
          {TEXTS.map((text, i) => (
            <div
              key={text}
              ref={(el) => { itemRefs.current[i] = el; }}
              className={CLASSES[i]}
            >
              <div className="text-wrapper">
                <h2 className="metrics-text">{text}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
