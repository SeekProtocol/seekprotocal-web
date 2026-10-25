import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { IPAD_LANDSCAPE, IPAD_TILT, WATCHES, type Capture } from "@/content/devices";

/* Homepage-only, like PhoneFrame, so it takes the same route-scoped sheet. */
import "@/app/app-ui.css";

/**
 * The tablet and watch mockups. Same construction as PhoneFrame: the screen
 * is punched out of the artwork, the content sits behind it at the device's
 * own logical size, and one scale factor brings it down to the rendered width.
 * Measurements and their sources are in `content/devices.ts`.
 */

const apertureVars = (a: { left: number; top: number; width: number; height: number }) => ({
  ["--ap-left" as string]: a.left,
  ["--ap-top" as string]: a.top,
  ["--ap-w" as string]: a.width,
  ["--ap-h" as string]: a.height,
});

/**
 * iPad Pro 11 in landscape. `children` is drawn at 1194 x 834.
 * Width is set by the stylesheet (`--tablet-w-n`), which steps down with the
 * viewport.
 */
export function TabletLandscape({ children, label }: { children: ReactNode; label: string }) {
  const { aperture, screen } = IPAD_LANDSCAPE;
  return (
    <figure
      className="tablet"
      aria-label={label}
      style={
        {
          ...apertureVars(aperture),
          ["--screen-w" as string]: screen.width,
          ["--screen-h" as string]: screen.height,
        } as CSSProperties
      }
    >
      <div className="tablet-screen" aria-hidden="true">
        <div className="tablet-viewport">{children}</div>
      </div>
      <Image
        src={IPAD_LANDSCAPE.src}
        alt=""
        loading="lazy"
        className="tablet-art"
        width={IPAD_LANDSCAPE.width}
        height={IPAD_LANDSCAPE.height}
        sizes="(max-width: 768px) 100vw, 760px"
        draggable={false}
      />
    </figure>
  );
}

/**
 * iPad Pro 11 in portrait, turned away to the right. `children` is drawn at
 * 834 x 1194 and projected onto the screen with IPAD_TILT.matrix. The whole
 * stage is laid out at the source's 2209 px and scaled down in one transform,
 * because the matrix is in those px.
 */
export function TabletTilt({ children, label }: { children: ReactNode; label: string }) {
  return (
    <figure className="tablet-tilt" aria-label={label}>
      <div className="tablet-tilt-stage">
        <div
          className="tablet-tilt-screen"
          aria-hidden="true"
          style={{
            width: IPAD_TILT.screen.width,
            height: IPAD_TILT.screen.height,
            transform: IPAD_TILT.matrix,
          }}
        >
          {children}
        </div>
        <Image
          src={IPAD_TILT.src}
          alt=""
          loading="lazy"
          className="tablet-tilt-art"
          width={1200}
          height={1224}
          sizes="(max-width: 768px) 90vw, 560px"
          draggable={false}
        />
      </div>
    </figure>
  );
}

/**
 * Captures that take turns on a screen, on a CSS timer: each holds for
 * `--hold`, staggered by `--i`, so there is no script. Reduced motion shows
 * the first. Captures are 4:3 and the iPad Pro 11 is not quite, so they cover
 * the screen and lose a sliver; `position` says which edge to keep.
 */
export function ScreenSlides({
  slides,
  sizes,
  position = "50% 50%",
}: {
  slides: Capture[];
  sizes: string;
  position?: string;
}) {
  return (
    <div className="screen-slides" data-count={slides.length}>
      {slides.map((slide, i) => (
        <Image
          key={slide.id}
          src={slide.src}
          alt=""
          loading="lazy"
          width={slide.width}
          height={slide.height}
          sizes={sizes}
          className="screen-slide"
          style={{ ["--i" as string]: i, objectPosition: position } as CSSProperties}
        />
      ))}
    </div>
  );
}

type WatchModel = keyof typeof WATCHES;

/**
 * A watch with a live face. `children` is drawn at the watch's own points
 * (WATCHES[model].screen) and scaled to the aperture, like the tablets.
 */
export function Watch({
  model,
  className = "",
  children,
}: {
  model: WatchModel;
  className?: string;
  children: ReactNode;
}) {
  const spec = WATCHES[model];
  const round = "round" in spec && spec.round;
  return (
    <div
      className={`watch ${round ? "watch-round" : ""} ${className}`}
      style={
        {
          ...apertureVars(spec.aperture),
          ["--screen-w" as string]: spec.screen.width,
          ["--screen-h" as string]: spec.screen.height,
        } as CSSProperties
      }
    >
      <div className="watch-screen">
        <div className="watch-viewport">{children}</div>
      </div>
      <Image
        src={spec.src}
        alt=""
        loading="lazy"
        className="watch-art"
        width={spec.width}
        height={spec.height}
        sizes="300px"
        draggable={false}
      />
    </div>
  );
}
