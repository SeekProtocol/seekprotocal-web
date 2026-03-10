"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function animateIn(el: HTMLElement, delay = 0) {
  setTimeout(() => {
    el.style.opacity = "1";
    el.style.transform = "translate3d(0, 0, 0) scale3d(1, 1, 1)";
    el.style.filter = "blur(0px)";
    el.style.transition =
      "opacity 0.8s ease, transform 0.8s ease, filter 0.8s ease";
  }, delay);
}

export default function ScrollAnimations() {
  const pathname = usePathname();

  useEffect(() => {
    const animated = new Set<Element>();

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated.has(entry.target)) {
          animated.add(entry.target);
          animateIn(entry.target as HTMLElement);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    });

    const setup = () => {
      const elements = document.querySelectorAll("[data-w-id]");
      const heroElements: HTMLElement[] = [];

      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.style.opacity === "0" && !animated.has(el)) {
          observer.observe(el);

          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            heroElements.push(htmlEl);
          }
        }
      });

      heroElements.forEach((el, i) => {
        animated.add(el);
        animateIn(el, 200 + i * 250);
      });
    };

    setup();
    const timer = setTimeout(setup, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}
