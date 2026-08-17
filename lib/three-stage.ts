"use client";

import * as THREE from "three";
import { isHandheld, pixelRatio } from "@/lib/render-budget";

/**
 * One WebGL context for the whole site.
 *
 * Every scene used to build its own `WebGLRenderer`. Five scenes meant five
 * contexts, and measured on production at 1512x900 they accumulated as you
 * scrolled — 1, 2, 3, 4, 5 — to 8.68 megapixels of drawing buffer that was
 * never given back, because the latch in use-near-viewport was one-way on a
 * desktop. Worse than the memory was the churn: building a context compiles its
 * shaders and uploads its models, and that happened mid-scroll. A trace of one
 * pass down the homepage found 396ms of long tasks in six blocks, the worst 87ms
 * at the scroll positions where a scene builds. An 87ms block is five dropped
 * frames, and that is the stutter.
 *
 * Nothing here makes a context cheaper. It makes there be one.
 *
 * ## Why the canvas is offscreen and the slots are 2D
 *
 * The obvious shape is one canvas fixed behind the page, with each scene drawn
 * into its own rect by the scissor test. It does not work on this site: every
 * 3D section sits inside a section with an opaque background — `.ar-section`
 * and `.wtp` are black, the globe's section is #08080b — so a canvas behind the
 * content is a canvas nobody can see. Making it work would mean restructuring
 * the z-order of all seventeen sections, which is a great deal of risk to take
 * on for compositing alone.
 *
 * So the shared canvas is never in the document. Scenes render into it one at a
 * time, and each slot keeps an ordinary 2D canvas exactly where its WebGL canvas
 * used to sit. Per frame the slot's pixels are blitted across with `drawImage`.
 * A 2D context is cheap and is not subject to the browser's WebGL context cap,
 * so the page can hold as many slots as it likes.
 *
 * The blit was measured before this was built rather than assumed: 0.001ms for
 * one 760x900 slot and 0.013ms for three slots together, against a 16.7ms frame.
 * That is three orders of magnitude of headroom, so even a much slower path on
 * another engine stays invisible.
 *
 * ## What a scene has to give up
 *
 * A scene module owns its scene graph and nothing else. No renderer, no
 * requestAnimationFrame, no ResizeObserver, no context loss handling. The stage
 * owns all four, once.
 *
 * ## Eviction
 *
 * The renderer is kept for the whole page. Scene modules are not: on the
 * homepage the reader passes a dozen slots on the way down, and holding all
 * of their geometries and textures at once is what pushed the phone over.
 * A slot that has been out of build range (a full viewport) for long enough
 * is disposed and rebuilt on return. See `evictMs` and `evict` below.
 */

/** Renderer state a slot needs applied before it draws. Scenes differ. */
export type SlotRenderState = {
  clearColor?: number;
  clearAlpha?: number;
  toneMapping?: THREE.ToneMapping;
  toneMappingExposure?: number;
};

export type FrameContext = {
  /** Seconds since the previous frame, clamped so a backgrounded tab cannot jump. */
  dt: number;
  /** Seconds since this module was built. */
  elapsed: number;
  /** The slot's current size in CSS pixels. */
  width: number;
  height: number;
};

export type SceneModule = {
  scene: THREE.Scene;
  camera: THREE.Camera;
  /** Advance the scene. Called only when the slot is on screen. */
  update?: (ctx: FrameContext) => void;
  /** The slot changed size. Cameras and anything sized off the frame go here. */
  resize?: (width: number, height: number) => void;
  /**
   * Draw yourself, for a scene that cannot use the default single render —
   * Mobi's selective bloom is two passes and its own composer. The viewport and
   * scissor are already set to the slot; leave the renderer as you found it.
   */
  render?: (renderer: THREE.WebGLRenderer) => void;
  /** Renderer state applied before this slot draws. */
  state?: SlotRenderState;
  /** Release geometries, materials and textures. Never the renderer. */
  dispose: () => void;
};

export type SceneBuilder = (ctx: {
  /** For a PMREMGenerator, an EffectComposer, or capability queries. */
  renderer: THREE.WebGLRenderer;
  width: number;
  height: number;
  /** The slot element, for pointer geometry and data attributes. */
  host: HTMLElement;
  /**
   * The visible canvas. A scene that wants pointer events binds them here
   * rather than to the renderer's canvas, which is offscreen and would never
   * see one. It is also the element whose bounding box the globe's raycaster
   * needs, since that is what the reader is actually pointing at.
   */
  view: HTMLCanvasElement;
}) => SceneModule | null;

export type SlotOptions = {
  /**
   * The descent spans a 10cm kerb and a planet 2,500 units away, and needs a
   * logarithmic depth buffer to keep them apart. That is a *renderer* setting,
   * not a scene one: three.js reads it into WebGLCapabilities and compiles it
   * into every shader the renderer builds. One shared renderer therefore has
   * one answer for every scene, and it has to be decided before the first one
   * is built. See `logDepthWanted` below for how, and why it is safe.
   */
  needsLogDepth?: boolean;
  /** Priority when several slots are visible. Lower draws first. */
  order?: number;
};

type Slot = {
  host: HTMLElement;
  /** The visible canvas, in the document, where the WebGL canvas used to be. */
  view: HTMLCanvasElement;
  ctx2d: CanvasRenderingContext2D;
  build: SceneBuilder;
  options: SlotOptions;
  module: SceneModule | null;
  /** Built lazily, the first time the slot comes within build reach. */
  built: boolean;
  width: number;
  height: number;
  bornAt: number;
  /** Close enough to draw this frame. */
  visible: boolean;
  /** Close enough to be worth building, which reaches further. */
  inBuildRange: boolean;
  /**
   * `performance.now()` the last time the slot was in build range. Used by
   * eviction: a scene that has been out of build range for long enough is
   * disposed so its geometries, textures and shader programs can be reclaimed.
   */
  lastInRangeAt: number;
};

/**
 * How fast the page is being scrolled, in viewports per second.
 *
 * Distance says nothing about speed. Flick the homepage from the hero to the
 * footer and every slot on the way passes through build reach for a few frames,
 * and the first version of this file built each one as it went: five scene
 * graphs, five sets of textures, thousands of points, for scenes nobody saw. It
 * is the most expensive possible answer to the cheapest possible gesture, and
 * on a phone it is what pushes the tab over.
 *
 * The first fix for that was to wait for the page to be still, which is what
 * use-near-viewport does. It was wrong here, and measurably: a reader scrolling
 * steadily down the page never stops for 180ms either, so nothing ever built
 * and every section arrived empty. Stillness is a proxy for the thing that
 * actually matters, and it is a bad one.
 *
 * Speed is the real discriminator. A reading-pace scroll runs at a couple of
 * thousand pixels a second; the flick that used to build all five ran at ninety
 * thousand. Anything under the threshold builds, so a reader is never made to
 * watch a scene arrive, and a flick builds nothing.
 */
const MAX_BUILD_SPEED = 4; // viewports per second
let scrollSpeed = 0;
if (typeof window !== "undefined") {
  let lastY = window.scrollY;
  let lastT = performance.now();
  window.addEventListener(
    "scroll",
    () => {
      const now = performance.now();
      const dt = now - lastT;
      /* Sampled rather than measured per event: scroll fires far more often
         than it needs to be read, and a very short interval turns rounding
         into noise that reads as a spike. */
      if (dt < 40) return;
      const y = window.scrollY;
      scrollSpeed = Math.abs(y - lastY) / (dt / 1000) / Math.max(1, window.innerHeight);
      lastY = y;
      lastT = now;
    },
    { passive: true },
  );
  /* Scroll stops firing when the page stops, and the last sample would stand
     for ever. Decayed on a timer so a stopped page reads as stopped. */
  window.setInterval(() => {
    if (performance.now() - lastT > 120) scrollSpeed = 0;
  }, 120);
}

/**
 * Whether the shared renderer is created with a logarithmic depth buffer.
 *
 * Decided once, from the same test as `.scene-scrubbed` and `isHandheld()`,
 * because the only scene that needs it is the descent and the descent is
 * `display: none` on a handheld. So a phone gets a renderer without it and
 * never builds the scene that would have wanted it, and a desktop gets one with
 * it and pays a fragment cost on the other four.
 *
 * That cost is real — writing gl_FragDepth defeats early-z — and it is still
 * far below what five contexts with multisampling were costing.
 *
 * The coupling is deliberate but it is a coupling, so `registerSlot` shouts in
 * development if a slot ever asks for log depth on a renderer that does not
 * have it. Silently drawing a descent with a broken depth buffer is the failure
 * this guards against.
 */
function logDepthWanted() {
  return !isHandheld();
}

class Stage {
  renderer: THREE.WebGLRenderer | null = null;
  private slots = new Set<Slot>();
  private frame = 0;
  private last = 0;
  private logDepth = false;
  private contextLost = false;
  /** The shared drawing buffer, sized to the largest slot that has been seen. */
  private bufferW = 0;
  private bufferH = 0;
  /**
   * How long a slot may stay built after leaving build range before it is
   * disposed. One context is cheap; the geometries, textures and shader
   * programs uploaded into it are not, and on a page that scrolls to 18,000px
   * they accumulated until Safari killed the tab. Eviction runs on build range
   * (a whole viewport), not draw range, so a small back-scroll never crosses
   * it and the reader never watches a scene rebuild after leaving it.
   *
   * Handhelds are the reason this exists; desktop keeps a longer window so a
   * reader panning up and down the page does not pay for a rebuild each time.
   * Set on first `ensureRenderer` because `isHandheld()` needs `window`.
   */
  private evictMs = 45_000;

  private ensureRenderer(): THREE.WebGLRenderer | null {
    if (this.renderer) return this.renderer;
    this.logDepth = logDepthWanted();
    this.evictMs = isHandheld() ? 8_000 : 45_000;
    try {
      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        /* Off everywhere, not only on handhelds as before. Multisample buffers
           were the largest single line in the old five-context bill, and with
           one context the pixel budget is spent on resolution instead. */
        antialias: false,
        powerPreference: "high-performance",
        logarithmicDepthBuffer: this.logDepth,
        /* Deliberately NOT preserveDrawingBuffer.
           It was set at first, on the theory that a buffer read back by
           drawImage has to survive. It does not: the buffer is only cleared
           before the next *compositing* step, this canvas is never in the
           document and so is never composited, and the blit happens in the same
           task as the render. Asking for preservation costs a driver-side copy
           on every frame for a guarantee that is not needed. */
      });
    } catch {
      return null; // No WebGL. Every slot keeps whatever fallback it renders.
    }
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.setPixelRatio(pixelRatio());
    /* Slots draw one at a time into the shared buffer, each clearing only its
       own rect, so nothing is cleared behind the scene's back. */
    this.renderer.autoClear = false;

    const canvas = this.renderer.domElement;
    canvas.addEventListener("webglcontextlost", this.onContextLost);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored);
    return this.renderer;
  }

  /**
   * A lost context is not a crash to recover from cleverly. Safari drops one
   * under memory pressure and the honest response is to stop drawing rather
   * than to spin a loop that reallocates everything and asks to be killed
   * again. The slots keep their last blitted frame, which reads as a still.
   */
  private onContextLost = (event: Event) => {
    event.preventDefault();
    this.contextLost = true;
  };

  private onContextRestored = () => {
    this.contextLost = false;
    /* Everything three.js uploaded went with the context. Rebuild each live
       module from its builder rather than trying to revive the old graph. */
    for (const slot of this.slots) {
      if (!slot.built) continue;
      slot.module?.dispose();
      slot.module = null;
      slot.built = false;
    }
  };

  registerSlot(
    host: HTMLElement,
    view: HTMLCanvasElement,
    build: SceneBuilder,
    options: SlotOptions = {},
  ): () => void {
    const ctx2d = view.getContext("2d", { alpha: true });
    if (!ctx2d) return () => {};

    if (
      process.env.NODE_ENV !== "production" &&
      options.needsLogDepth &&
      !logDepthWanted()
    ) {
      console.warn(
        "[three-stage] A slot asked for a logarithmic depth buffer on a renderer " +
          "built without one. See logDepthWanted() in lib/three-stage.ts: the " +
          "shared renderer decides this once, from isHandheld(), because the only " +
          "scene that needs it is hidden on a handheld. If that is no longer true, " +
          "that function is what has to change.",
      );
    }

    const slot: Slot = {
      host,
      view,
      ctx2d,
      build,
      options,
      module: null,
      built: false,
      width: 0,
      height: 0,
      bornAt: performance.now(),
      visible: false,
      inBuildRange: false,
      lastInRangeAt: 0,
    };
    this.slots.add(slot);
    this.start();

    return () => {
      this.slots.delete(slot);
      slot.module?.dispose();
      slot.module = null;
      if (this.slots.size === 0) this.stop();
    };
  }

  private start() {
    if (this.frame) return;
    this.last = performance.now();
    const tick = () => {
      this.frame = requestAnimationFrame(tick);
      this.render();
    };
    this.frame = requestAnimationFrame(tick);
  }

  private stop() {
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    /* The renderer is kept. A page with no slots on screen is the ordinary
       case between two sections, and tearing the context down and building it
       again is the exact cost this file exists to remove. */
  }

  /**
   * How near a slot has to be to be built, and to be drawn. They are not the
   * same number and the first version's mistake was making them one.
   *
   * With a single reach of a quarter of a viewport, a scene started building
   * when it was almost on screen and the reader watched it arrive. The scenes
   * used to build a whole viewport ahead — that is what use-near-viewport's
   * BUILD_REACH was — so by the time you got there it was already running.
   * Drawing, on the other hand, is per frame and wasted on anything off screen,
   * so it keeps the tight margin.
   */
  private static BUILD_REACH = 1;
  private static DRAW_REACH = 0.15;

  private measure(slot: Slot) {
    const box = slot.host.getBoundingClientRect();
    /* A display:none host has no box at all, which is how the two scrubbed
       sections are hidden on a handheld. Zero width is not "at the origin", it
       is "not on the page", and it must not read as visible. */
    if (box.width <= 0 || box.height <= 0) {
      slot.inBuildRange = false;
      slot.visible = false;
      return;
    }
    const vh = window.innerHeight;
    const build = vh * Stage.BUILD_REACH;
    const draw = vh * Stage.DRAW_REACH;
    slot.inBuildRange = box.bottom > -build && box.top < vh + build;
    slot.visible = box.bottom > -draw && box.top < vh + draw;
    slot.width = Math.round(box.width);
    slot.height = Math.round(box.height);
  }

  /**
   * Free the scene graph a slot is holding, without unregistering the slot.
   *
   * The renderer stays: that is what this file exists to keep. What goes are
   * the module's geometries, materials, textures and shader programs, plus
   * the 2D canvas's backing store — a DOM canvas holds its bitmap for as long
   * as its element lives, and on a page with a dozen slots that adds up on
   * its own. When the slot comes back into build range the render loop will
   * rebuild the module and size the canvas back.
   */
  private evict(slot: Slot) {
    slot.module?.dispose();
    slot.module = null;
    slot.built = false;
    slot.view.width = 0;
    slot.view.height = 0;
    delete slot.host.dataset.ready;
  }

  private render() {
    const renderer = this.ensureRenderer();
    if (!renderer || this.contextLost) return;

    const now = performance.now();
    const dt = Math.min((now - this.last) / 1000, 0.05);
    this.last = now;

    for (const slot of this.slots) this.measure(slot);

    /* Track last-in-range time and dispose slots that have been out of build
       range long enough. The bill this pays down is not the renderer — that
       one context is deliberate — but everything each scene uploaded into it:
       a slot the reader passed twenty screens ago is holding geometries and
       textures with no chance of being seen without a rebuild that would run
       long before it was drawn again. */
    for (const slot of this.slots) {
      if (slot.inBuildRange) {
        slot.lastInRangeAt = now;
      } else if (slot.built && now - slot.lastInRangeAt > this.evictMs) {
        this.evict(slot);
      }
    }

    /* Building runs on the wide reach and only below the speed threshold, so a
       scene is ready before the reader arrives and a flick past it builds
       nothing. At most one per frame: five scene graphs in a single task is the
       stutter, whether it happens mid-flick or not, and spreading them over
       consecutive frames costs nothing anyone can see. */
    if (scrollSpeed < MAX_BUILD_SPEED) {
      for (const slot of this.slots) {
        if (slot.built || !slot.inBuildRange) continue;
        slot.module = slot.build({
          renderer,
          width: slot.width,
          height: slot.height,
          host: slot.host,
          view: slot.view,
        });
        slot.built = true;
        slot.bornAt = now;
        if (slot.module) {
          slot.module.resize?.(slot.width, slot.height);
          slot.host.dataset.ready = "true";
        }
        break;
      }
    }

    const live = [...this.slots]
      .filter((s) => s.visible && s.built)
      .sort((a, b) => (a.options.order ?? 0) - (b.options.order ?? 0));
    if (live.length === 0) return;

    /* The shared buffer only ever grows, to the largest slot seen so far.
       Resizing reallocates the drawing buffer, so doing it per slot per frame
       would reintroduce exactly the churn this replaces. */
    let needW = this.bufferW;
    let needH = this.bufferH;
    for (const slot of live) {
      needW = Math.max(needW, slot.width);
      needH = Math.max(needH, slot.height);
    }
    if (needW !== this.bufferW || needH !== this.bufferH) {
      this.bufferW = needW;
      this.bufferH = needH;
      renderer.setPixelRatio(pixelRatio());
      renderer.setSize(needW, needH, false);
    }

    for (const slot of live) {
      const mod = slot.module;
      if (!mod) continue;

      /* The visible canvas carries the slot's own backing store, at the same
         ratio the renderer draws at, so the blit is one to one. */
      const dpr = pixelRatio();
      const pxW = Math.round(slot.width * dpr);
      const pxH = Math.round(slot.height * dpr);
      if (slot.view.width !== pxW || slot.view.height !== pxH) {
        slot.view.width = pxW;
        slot.view.height = pxH;
        mod.resize?.(slot.width, slot.height);
      }

      mod.update?.({
        dt,
        elapsed: (now - slot.bornAt) / 1000,
        width: slot.width,
        height: slot.height,
      });

      /* Draw at the top-left of the shared buffer. In GL the origin is bottom
         left, so the viewport's y is measured from the bottom of the buffer —
         which puts the rect at the top in the drawImage coordinates used below,
         and lets the source rect be a plain (0, 0, w, h). */
      const y = this.bufferH - slot.height;
      renderer.setViewport(0, y, slot.width, slot.height);
      renderer.setScissor(0, y, slot.width, slot.height);
      renderer.setScissorTest(true);

      const state = mod.state ?? {};
      renderer.setClearColor(state.clearColor ?? 0x000000, state.clearAlpha ?? 0);
      renderer.toneMapping = state.toneMapping ?? THREE.NoToneMapping;
      renderer.toneMappingExposure = state.toneMappingExposure ?? 1;
      renderer.clear(true, true, true);

      if (mod.render) mod.render(renderer);
      else renderer.render(mod.scene, mod.camera);

      renderer.setScissorTest(false);

      slot.ctx2d.clearRect(0, 0, pxW, pxH);
      slot.ctx2d.drawImage(renderer.domElement, 0, 0, pxW, pxH, 0, 0, pxW, pxH);
    }
  }
}

let stage: Stage | null = null;

/** The one stage. Created on first use, never torn down. */
export function getStage(): Stage {
  stage ??= new Stage();
  return stage;
}
