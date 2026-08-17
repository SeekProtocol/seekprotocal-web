"use client";

import { useEffect, useRef } from "react";
import { getStage, type SceneBuilder, type SlotOptions } from "@/lib/three-stage";
import { isOff } from "@/lib/bisect";

/**
 * Mount a scene into the shared stage.
 *
 * Replaces the four things every scene component used to own: a renderer, a
 * requestAnimationFrame loop, a ResizeObserver, and the build gate from
 * use-near-viewport. The stage owns the first three once for the whole page,
 * and it decides when to build from the slot's own geometry, so the hysteresis
 * that gate needed — a settle delay, a linger, a release margin held apart from
 * the build margin — is not replaced by anything. It stops being a problem to
 * solve.
 *
 * The builder is called the first time the slot comes within build reach, and
 * again after eviction: what one context saves in setup, a dozen simultaneous
 * scene graphs undo in retained memory, so the stage disposes a slot's module
 * after it has been out of build range long enough. The builder must therefore
 * be a pure factory — build a fresh scene from the ctx it is given, hold no
 * state across calls.
 *
 * Returns the two refs the component has to place: `hostRef` on the element
 * whose box defines the slot, and `viewRef` on the canvas that shows it.
 */
export function useSceneSlot(build: SceneBuilder, options: SlotOptions = {}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);

  /* Read through a ref so a builder that closes over props does not tear the
     slot down and rebuild it on every render. Scenes are expensive to build and
     cheap to keep; that is the whole point of this file. */
  const buildRef = useRef(build);
  buildRef.current = build;

  const order = options.order;
  const needsLogDepth = options.needsLogDepth;

  useEffect(() => {
    const host = hostRef.current;
    const view = viewRef.current;
    if (!host || !view) return;
    /* ?3d=off. One return covers every scene on the site. See lib/bisect.ts. */
    if (isOff("3d")) return;

    return getStage().registerSlot(
      host,
      view,
      (ctx) => buildRef.current(ctx),
      { order, needsLogDepth },
    );
  }, [order, needsLogDepth]);

  return { hostRef, viewRef };
}
