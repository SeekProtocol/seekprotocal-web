"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { isHandheld, pixelRatio, rendererOptions } from "@/lib/render-budget";
import { useNearViewport } from "@/lib/use-near-viewport";
import { MARK_HOLES, MARK_OUTLINE } from "@/lib/seek-mark";
import { useTheme } from "@/components/theme/ThemeProvider";

type Props = {
  className?: string;
  /** Visual size of the coin inside the canvas. */
  scale?: number;
  /** Idle spin speed in radians/second. */
  spin?: number;
};

/** The app's own ramp — magenta → purple → blue → mint. */
const GRADIENT_STOPS = [
  new THREE.Color("#d04cfb"),
  new THREE.Color("#a855f7"),
  new THREE.Color("#049efd"),
  new THREE.Color("#02eaa9"),
];

/**
 * Paints a 4-stop diagonal ramp across a mesh by injecting into the standard
 * material, so the extruded side walls carry the gradient too — the way the
 * physical coin render does.
 */
function gradientMaterial(extent: number) {
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.55,
    roughness: 0.28,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
  });

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uStops = {
      value: GRADIENT_STOPS.map((c) => c.clone().convertSRGBToLinear()),
    };
    shader.uniforms.uExtent = { value: extent };

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLocal;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\n  vLocal = position;"
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying vec3 vLocal;
        uniform vec3 uStops[4];
        uniform float uExtent;`
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        {
          // Diagonal sweep: upper-left is magenta, lower-right is aqua.
          float t = clamp((vLocal.x - vLocal.y) / (uExtent * 2.0) + 0.5, 0.0, 1.0);
          float s = t * 3.0;
          vec3 ramp = mix(uStops[0], uStops[1], clamp(s, 0.0, 1.0));
          ramp = mix(ramp, uStops[2], clamp(s - 1.0, 0.0, 1.0));
          ramp = mix(ramp, uStops[3], clamp(s - 2.0, 0.0, 1.0));
          diffuseColor.rgb *= ramp;
        }`
      );
  };

  return material;
}

/** Remap extruded UVs into 0..1 so any future texturing lines up. */
function normaliseUVs(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return;
  const uv = geometry.attributes.uv;
  if (!uv) return;
  const w = box.max.x - box.min.x || 1;
  const h = box.max.y - box.min.y || 1;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (uv.getX(i) - box.min.x) / w, (uv.getY(i) - box.min.y) / h);
  }
  uv.needsUpdate = true;
}

function buildMarkGeometry() {
  const shape = new THREE.Shape();
  MARK_OUTLINE.forEach(([x, y], i) =>
    i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)
  );
  shape.closePath();

  for (const hole of MARK_HOLES) {
    const path = new THREE.Path();
    hole.forEach(([x, y], i) => (i === 0 ? path.moveTo(x, y) : path.lineTo(x, y)));
    path.closePath();
    shape.holes.push(path);
  }

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.17,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.028,
    bevelSegments: 4,
    curveSegments: 1,
  });
  geometry.center();
  normaliseUVs(geometry);
  return geometry;
}

function buildRingGeometry(inner: number, outer: number) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, 0, Math.PI * 2, false);
  const hole = new THREE.Path();
  hole.absarc(0, 0, inner, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.05,
    bevelEnabled: true,
    bevelThickness: 0.018,
    bevelSize: 0.016,
    bevelSegments: 3,
    curveSegments: 84,
  });
  geometry.center();
  normaliseUVs(geometry);
  return geometry;
}

/** Lathe profile: recessed face, stepped ramp, rounded outer rim. */
function buildBodyGeometry() {
  const profile: [number, number][] = [
    [0.0, 0.085],
    [0.62, 0.085],
    [0.7, 0.088],
    [0.78, 0.1],
    [0.85, 0.135],
    [0.9, 0.152],
    [0.955, 0.152],
    [0.99, 0.132],
    [1.0, 0.09],
    [1.0, -0.09],
    [0.99, -0.132],
    [0.955, -0.152],
    [0.9, -0.152],
    [0.85, -0.135],
    [0.78, -0.1],
    [0.7, -0.088],
    [0.62, -0.085],
    [0.0, -0.085],
  ];

  const geometry = new THREE.LatheGeometry(
    profile.map(([r, h]) => new THREE.Vector2(r, h)),
    140
  );
  geometry.rotateX(Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

/** Small studio environment so the black body reads as glossy, not flat. */
function buildEnvironment(renderer: THREE.WebGLRenderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const base = ctx.createLinearGradient(0, 0, 0, 256);
  base.addColorStop(0, "#20263a");
  base.addColorStop(0.5, "#0a0d16");
  base.addColorStop(1, "#05070c");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 256);

  // Key softbox
  const key = ctx.createRadialGradient(150, 60, 10, 150, 60, 150);
  key.addColorStop(0, "#ffffff");
  key.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, 512, 256);

  // Cool rim from behind
  const rim = ctx.createRadialGradient(400, 130, 10, 400, 130, 130);
  rim.addColorStop(0, "#8fb8ff");
  rim.addColorStop(1, "rgba(143,184,255,0)");
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, 512, 256);

  const texture = new THREE.Texture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromEquirectangular(texture).texture;
  pmrem.dispose();
  texture.dispose();
  return envMap;
}

export default function SeekCoin({ className = "", scale = 1, spin = 0.35 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;

  // Built one viewport out, not on mount. See useNearViewport.
  const nearViewport = useNearViewport(hostRef);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!nearViewport) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer(rendererOptions());
    } catch {
      return; // No WebGL — the static fallback image stays visible.
    }

    host.dataset.ready = "true";
    renderer.setClearAlpha(0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 0, 6.4);

    const envMap = buildEnvironment(renderer);
    scene.environment = envMap;

    const coin = new THREE.Group();
    coin.scale.setScalar(scale);
    scene.add(coin);

    // Body — deep matte black with a glossy clearcoat, as in the render.
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0a0a0d,
      metalness: 0.25,
      roughness: 0.42,
      clearcoat: 0.85,
      clearcoatRoughness: 0.3,
      envMapIntensity: 1.1,
    });
    const bodyGeometry = buildBodyGeometry();
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    coin.add(body);

    // Gradient ring seated in the recess.
    const ringGeometry = buildRingGeometry(0.68, 0.75);
    const ringMaterial = gradientMaterial(0.75);
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.z = 0.075;
    coin.add(ring);

    // The mark itself.
    const markGeometry = buildMarkGeometry();
    const markMaterial = gradientMaterial(0.55);
    const mark = new THREE.Mesh(markGeometry, markMaterial);
    mark.scale.setScalar(0.52);
    mark.position.z = 0.085;
    coin.add(mark);

    // Lighting on top of the environment for crisp speculars.
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-2.6, 3.2, 4.2);
    scene.add(key);

    const fillMagenta = new THREE.PointLight(0xd04cfb, 22, 14, 2);
    fillMagenta.position.set(-3.2, 2.2, 2.4);
    scene.add(fillMagenta);

    const fillMint = new THREE.PointLight(0x02eaa9, 20, 14, 2);
    fillMint.position.set(3.4, -2.2, 2.2);
    scene.add(fillMint);

    scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    // --- interaction ------------------------------------------------------
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      // Track across a generous area so the coin reacts before the cursor
      // reaches it.
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave);

    // --- sizing -----------------------------------------------------------
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setPixelRatio(pixelRatio());
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // --- render loop, paused while offscreen ------------------------------
    let visible = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "120px" }
    );
    intersectionObserver.observe(host);

    // Manual timing — THREE.Clock is deprecated and Timer buys nothing here.
    let last = performance.now();
    let elapsedTotal = 0;
    let frame = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;

      const now = performance.now();
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsedTotal += delta;
      const elapsed = elapsedTotal;

      pointer.x += (target.x - pointer.x) * 0.055;
      pointer.y += (target.y - pointer.y) * 0.055;

      if (reduced) {
        coin.rotation.set(-0.12, -0.42, 0.06);
      } else {
        // Rock around a three-quarter view. The combined swing and pointer
        // tilt is capped well short of 90° so the coin never turns edge-on.
        coin.rotation.y = THREE.MathUtils.clamp(
          -0.42 + Math.sin(elapsed * spin) * 0.4 + pointer.x * 0.2,
          -0.95,
          0.18
        );
        coin.rotation.x = -pointer.y * 0.3 + Math.sin(elapsed * 0.6) * 0.06;
        coin.rotation.z = Math.cos(elapsed * 0.45) * 0.04;
        coin.position.y = Math.sin(elapsed * 0.9) * 0.07;
      }

      renderer.toneMappingExposure = themeRef.current === "dark" ? 1.32 : 1.12;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      bodyGeometry.dispose();
      ringGeometry.dispose();
      markGeometry.dispose();
      bodyMaterial.dispose();
      ringMaterial.dispose();
      markMaterial.dispose();
      envMap.dispose();
      renderer.dispose();
      /* dispose() releases what three.js allocated; it does not release the
         context itself. Safari keeps the drawing buffer of a detached canvas
         until it feels like collecting it, which on a phone is usually after
         the next scene has already allocated its own. Asking for the loss
         explicitly frees it now. */
      renderer.forceContextLoss();
      renderer.domElement.remove();
      delete host.dataset.ready;
    };
  }, [scale, spin, nearViewport]);

  return <div ref={hostRef} className={`three-host coin-canvas ${className}`} aria-hidden="true" />;
}
