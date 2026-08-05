"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "@/components/theme/ThemeProvider";

/**
 * The AR pipeline, told as one continuous 3D shot driven by the scroll.
 *
 * Stage by stage the same points do all the work: they start as unstructured
 * camera noise, resolve into tracked features, settle onto a found plane, and
 * finally hold still while the drop anchors to them. Nothing is cut — the
 * point is that anchoring is a thing that happens *to* a scene, not a sticker
 * placed on top of it.
 */
const POINTS = 2600;

type Props = {
  /** 0 → 1 across the story. */
  progressRef: React.MutableRefObject<number>;
  className?: string;
};

export default function ARStory({ progressRef, className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  /* The render loop is set up once and reads this every frame, so the prop is
     mirrored into a ref. Written from an effect rather than during render:
     assigning to a ref while rendering is the thing React tells you not to do,
     and a frame's delay is invisible here. */
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return;
    }

    host.dataset.ready = "true";
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      width: "100%",
      height: "100%",
      display: "block",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);

    const world = new THREE.Group();
    scene.add(world);

    // --- the scene the camera is looking at -------------------------------
    // A street corner: a ground plane and two building faces, sampled as
    // points. Every point knows where it starts (noise) and where it belongs.
    const scattered = new Float32Array(POINTS * 3);
    const settled = new Float32Array(POINTS * 3);
    const positions = new Float32Array(POINTS * 3);
    const tints = new Float32Array(POINTS * 3);

    const colourFeature = new THREE.Color("#02eaa9");
    const colourPlane = new THREE.Color("#049efd");
    const colourWall = new THREE.Color("#c7d4f5");

    for (let i = 0; i < POINTS; i++) {
      // Scattered: a loose cloud in front of the camera.
      scattered[i * 3] = (Math.random() - 0.5) * 9;
      scattered[i * 3 + 1] = (Math.random() - 0.5) * 6;
      scattered[i * 3 + 2] = (Math.random() - 0.5) * 9;

      const roll = Math.random();
      let x: number, y: number, z: number;
      let tint = colourWall;

      if (roll < 0.46) {
        // Ground
        x = (Math.random() - 0.5) * 8;
        z = (Math.random() - 0.5) * 8;
        y = -1.5 + Math.random() * 0.03;
        tint = colourPlane;
      } else if (roll < 0.73) {
        // Left facade
        x = -3.1 + Math.random() * 0.08;
        y = -1.5 + Math.random() * 3.6;
        z = (Math.random() - 0.5) * 7;
      } else {
        // Rear facade
        x = (Math.random() - 0.5) * 7;
        y = -1.5 + Math.random() * 3.6;
        z = -3.1 + Math.random() * 0.08;
      }

      // A scatter of tracked corners, brighter than the rest.
      if (Math.random() < 0.07) tint = colourFeature;

      settled[i * 3] = x;
      settled[i * 3 + 1] = y;
      settled[i * 3 + 2] = z;
      positions.set([scattered[i * 3], scattered[i * 3 + 1], scattered[i * 3 + 2]], i * 3);
      tints.set([tint.r, tint.g, tint.b], i * 3);
    }

    const cloudGeometry = new THREE.BufferGeometry();
    cloudGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    cloudGeometry.setAttribute("color", new THREE.BufferAttribute(tints, 3));

    // Round sprite so points are discs, not squares.
    const dotCanvas = document.createElement("canvas");
    dotCanvas.width = dotCanvas.height = 32;
    const dctx = dotCanvas.getContext("2d")!;
    const grad = dctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.5, "rgba(255,255,255,0.9)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    dctx.fillStyle = grad;
    dctx.fillRect(0, 0, 32, 32);
    const dotTexture = new THREE.CanvasTexture(dotCanvas);

    const cloudMaterial = new THREE.PointsMaterial({
      size: 0.075,
      map: dotTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      sizeAttenuation: true,
    });
    world.add(new THREE.Points(cloudGeometry, cloudMaterial));

    // --- the detected plane -----------------------------------------------
    const planeGeometry = new THREE.PlaneGeometry(6, 6, 12, 12);
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: 0x049efd,
      wireframe: true,
      transparent: true,
      opacity: 0,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.49;
    world.add(plane);

    const planeFillGeometry = new THREE.PlaneGeometry(6, 6);
    const planeFillMaterial = new THREE.MeshBasicMaterial({
      color: 0x049efd,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const planeFill = new THREE.Mesh(planeFillGeometry, planeFillMaterial);
    planeFill.rotation.x = -Math.PI / 2;
    planeFill.position.y = -1.495;
    world.add(planeFill);

    // --- the anchor -------------------------------------------------------
    const anchorGroup = new THREE.Group();
    anchorGroup.position.set(0.4, -1.48, 0.6);
    world.add(anchorGroup);

    const ringGeometry = new THREE.RingGeometry(0.42, 0.46, 48);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x02eaa9,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const anchorRing = new THREE.Mesh(ringGeometry, ringMaterial);
    anchorRing.rotation.x = -Math.PI / 2;
    anchorGroup.add(anchorRing);

    // Unit-length so the tick can stretch it to reach exactly the underside
    // of the drop; a fixed length would run straight through the coin's face.
    const BEAM_UNIT = 1;
    const beamGeometry = new THREE.CylinderGeometry(0.012, 0.012, BEAM_UNIT, 8);
    const beamMaterial = new THREE.MeshBasicMaterial({
      color: 0x02eaa9,
      transparent: true,
      opacity: 0,
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    anchorGroup.add(beam);

    const coinTexture = new THREE.TextureLoader().load("/app/seek-coin-3d.png");
    coinTexture.colorSpace = THREE.SRGBColorSpace;
    const coinMaterial = new THREE.SpriteMaterial({
      map: coinTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    /* The coin artwork is a dark render, and this scene is a black street at
       night: on a phone it disappeared into the background entirely. A halo in
       the brand blue goes behind it, additively, so the thing the whole section
       is about is the brightest object in the frame. */
    const coinGlowMaterial = new THREE.SpriteMaterial({
      map: dotTexture,
      color: new THREE.Color(0x6fc8ff),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const coinGlow = new THREE.Sprite(coinGlowMaterial);
    coinGlow.renderOrder = 4;
    anchorGroup.add(coinGlow);

    const coin = new THREE.Sprite(coinMaterial);
    coin.scale.setScalar(1.1);
    // Draw after the beam so the coin is never sliced by it.
    coin.renderOrder = 5;
    anchorGroup.add(coin);

    /* A second pass of the same sprite, added on top of the first.
     *
     * The artwork is not dark: it is a black coin body carrying a vivid mark,
     * and against a black street only the body reads. A gamma curve lifts it
     * but pulls every channel toward white, so the pink and blue of the mark
     * come out grey, which is worse than dark. Adding the sprite to itself
     * scales each channel by what is already there: the black body gains
     * almost nothing, the mark and the rim roughly double, and the hue is
     * untouched because the ratios between channels do not change. */
    const coinBoostMaterial = new THREE.SpriteMaterial({
      map: coinTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
    });
    const coinBoost = new THREE.Sprite(coinBoostMaterial);
    coinBoost.renderOrder = 6;
    anchorGroup.add(coinBoost);

    // --- sizing -----------------------------------------------------------
    /* The subject is a street corner, which is wide. A fixed vertical FOV on a
       portrait viewport therefore narrows the horizontal field until the corner
       falls outside the frame and a phone gets an empty scene with a few points
       drifting in it. Below the design aspect the horizontal field is held and
       the vertical one opens instead, so the whole corner stays in shot. */
    const BASE_FOV = 38;
    const DESIGN_ASPECT = 16 / 9;
    /** How far to drop the aim so a portrait frame keeps the subject clear. */
    let lift = 0;
    /* The drop is drawn larger on a phone and smaller on a desktop. On a phone
       the copy is stacked underneath it and the coin is the whole frame; on a
       desktop the copy sits beside it, and a coin sized for portrait runs
       straight through the paragraph. */
    let coinK = 1;
    const H_FOV =
      2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(BASE_FOV) / 2) * DESIGN_ASPECT);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.fov =
        camera.aspect < DESIGN_ASPECT
          ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(H_FOV / 2) / camera.aspect))
          : BASE_FOV;
      // The copy sits over the lower half on a portrait screen, so the aim
      // drops and the subject rides above it rather than behind it.
      lift = camera.aspect < 1 ? 1.15 * (1 - camera.aspect) : 0;
      coinK = camera.aspect < 1 ? 1.45 : 1;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    let visible = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => (visible = entry.isIntersecting),
      { rootMargin: "100px" }
    );
    intersectionObserver.observe(host);

    // --- loop -------------------------------------------------------------
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    /** Smooth ramp between two progress marks. */
    const between = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
    const easeInOut = (t: number) => t * t * (3 - 2 * t);

    let last = performance.now();
    let elapsed = 0;
    let frame = 0;
    let appliedTheme = "";

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;

      const now = performance.now();
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += delta;

      if (appliedTheme !== themeRef.current) {
        appliedTheme = themeRef.current;
        cloudMaterial.opacity = 1;
      }

      const p = clamp01(progressRef.current);

      // 1 · the cloud resolves from noise into the scene
      const settle = easeInOut(between(p, 0.05, 0.45));
      const pos = cloudGeometry.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < POINTS; i++) {
        const i3 = i * 3;
        // A little residual jitter keeps it alive rather than frozen.
        const jitter = (1 - settle) * 0.0;
        pos.array[i3] = scattered[i3] + (settled[i3] - scattered[i3]) * settle + jitter;
        pos.array[i3 + 1] = scattered[i3 + 1] + (settled[i3 + 1] - scattered[i3 + 1]) * settle;
        pos.array[i3 + 2] = scattered[i3 + 2] + (settled[i3 + 2] - scattered[i3 + 2]) * settle;
      }
      pos.needsUpdate = true;
      cloudMaterial.size = 0.075 - 0.021 * settle;

      // 2 · the plane is found
      const planeIn = easeInOut(between(p, 0.4, 0.62));
      planeMaterial.opacity = planeIn * 0.5;
      planeFillMaterial.opacity = planeIn * 0.07;
      plane.scale.setScalar(0.6 + planeIn * 0.4);
      planeFill.scale.setScalar(0.6 + planeIn * 0.4);

      // 3 · the anchor locks and the drop arrives
      const anchorIn = easeInOut(between(p, 0.58, 0.78));
      ringMaterial.opacity = anchorIn * 0.9;
      beamMaterial.opacity = anchorIn * 0.35;
      anchorRing.scale.setScalar(0.4 + anchorIn * 0.6 + Math.sin(elapsed * 2) * 0.02 * anchorIn);

      const coinIn = easeInOut(between(p, 0.66, 0.86));
      coinMaterial.opacity = coinIn;
      coin.position.y = 2.4 - 1.55 * coinIn + Math.sin(elapsed * 1.4) * 0.05 * coinIn;
      // The drop is what the whole section is about, so it is drawn at a size
      // that says so, scaled to the shape of the frame it is in.
      coin.scale.setScalar((0.5 + 0.6 * coinIn) * coinK);

      coinBoost.position.copy(coin.position);
      coinBoost.scale.copy(coin.scale);
      coinBoostMaterial.opacity = coinIn * 0.32;

      // The halo tracks the coin and breathes, so it reads as lit rather than
      // as a blur behind a sticker.
      coinGlow.position.copy(coin.position);
      coinGlow.scale.setScalar(coin.scale.x * (2.1 + Math.sin(elapsed * 1.6) * 0.14));
      coinGlowMaterial.opacity = coinIn * 0.95;

      // The beam runs from the ring up to the coin's underside and stops.
      const coinRadius = coin.scale.x * 0.42;
      const beamLength = Math.max(0.02, coin.position.y - coinRadius);
      beam.scale.y = beamLength / BEAM_UNIT;
      beam.position.y = beamLength / 2;

      // 4 · it holds still while the camera keeps moving
      const hold = between(p, 0.82, 1);
      cloudMaterial.opacity = 1 - hold * 0.35;

      // Camera arcs around the corner across the whole story.
      const angle = -0.55 + p * 1.15;
      const radius = 8.4 - p * 2.6;
      camera.position.set(
        Math.sin(angle) * radius,
        1.5 + Math.sin(elapsed * 0.25) * 0.12 - p * 0.5,
        Math.cos(angle) * radius
      );
      camera.lookAt(0, -0.5 + p * 0.35 - lift, 0);

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      cloudGeometry.dispose();
      planeGeometry.dispose();
      planeFillGeometry.dispose();
      ringGeometry.dispose();
      beamGeometry.dispose();
      cloudMaterial.dispose();
      planeMaterial.dispose();
      planeFillMaterial.dispose();
      ringMaterial.dispose();
      beamMaterial.dispose();
      coinMaterial.dispose();
      coinGlowMaterial.dispose();
      coinBoostMaterial.dispose();
      dotTexture.dispose();
      coinTexture.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete host.dataset.ready;
    };
  }, [progressRef]);

  return <div ref={hostRef} className={`ar-canvas ${className}`} aria-hidden="true" />;
}
