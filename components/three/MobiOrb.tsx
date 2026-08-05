"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { isHandheld, pixelRatio, rendererOptions } from "@/lib/render-budget";
import { useNearViewport } from "@/lib/use-near-viewport";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

export type MobiState = "idle" | "listening" | "thinking" | "speaking";

type Props = {
  className?: string;
  state?: MobiState;
  /**
   * A counter, not a boolean. Every increment fires one impulse: the body takes
   * a punch, the colour cluster spins up, the bloom flashes, and three rings
   * leave the orb. The section bumps it on tap.
   */
  pulse?: number;
};

/**
 * Colours keyed off the Spline mesh names, the same mapping the app uses —
 * 青色 cyan, 黄色 mint, 紫色 purple, 靛蓝 indigo, 红色 pink. Spline's own
 * materials do not survive the GLB export, so they are rebuilt here.
 */
const BLOB_COLOURS: Record<string, number> = {
  "青色": 0x049efd,
  "黄色": 0x22d3a5,
  "紫色": 0xa855f7,
  "靛蓝": 0x3b82f6,
  "红色": 0xd14cfb,
};

/** Blink timing from the original Unity EyeBlink: 15 a minute, 0.1s each. */
const BLINK_RATE = 15;
const BLINK_DURATION = 0.1;

/**
 * The colour cluster is bloomed on its own layer; the glass shell, eyes and
 * halo are drawn sharp on top afterwards. Blooming the eyes as well turns
 * them into one white smear, which is the whole reason for the split.
 */
const BLOOM_LAYER = 1;
const SHARP_LAYER = 0;

function colourFor(name: string) {
  for (const key of Object.keys(BLOB_COLOURS)) {
    if (name.startsWith(key)) return BLOB_COLOURS[key];
  }
  return null;
}

export default function MobiOrb({ className = "", state = "idle", pulse = 0 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  /* The render loop is set up once and reads both of these every frame, so the
     props are mirrored into refs rather than being closed over. Written from an
     effect rather than during render: assigning to a ref while rendering is the
     thing React tells you not to do, and the loop cannot see the difference. */
  const stateRef = useRef(state);
  const pulseRef = useRef(pulse);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    pulseRef.current = pulse;
  }, [pulse]);

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
      return;
    }

    // Opaque black rather than a transparent canvas: the bloom composite
    // writes a full-coverage quad, so alpha cannot survive the pass chain.
    // The section behind this is black in both themes, so it joins seamlessly.
    renderer.setClearColor(0x000000, 1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    host.dataset.ready = "true";
    host.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      width: "100%",
      height: "100%",
      display: "block",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    camera.position.set(0, 0, 5);

    const root = new THREE.Group();
    const body = new THREE.Group();
    root.add(body);
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(-2, 3, 4);
    scene.add(key);

    /* Bloom is what turns eight discrete blobs into one iridescent mass: the
       model alone renders as separate spheres.
       `UnrealBloomPass` keeps a mip chain of render targets, five levels of
       them, on top of the composer's own two. On a phone, where five WebGL
       contexts are already close to what Safari will tolerate, those are the
       cheapest megabytes on the page to give back. The pass runs at half
       resolution there, which on a small screen is not a difference anyone can
       point at. */
    const bloomScale = isHandheld() ? 0.5 : 1;
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(1, 1),
      0.62, // strength
      0.72, // radius
      0.28 // threshold — only the colour cluster and the eyes clear it
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* Shockwave. Three rings leave the orb on a tap, staggered, drawn sharp
       over the bloom so they read as an emitted signal rather than more glow.
       They sit in the XY plane at the origin with the camera on +Z, so they
       already face the reader and never need billboarding. */
    const ringGeometry = new THREE.RingGeometry(0.86, 1, 128);
    const rings = [0, 1, 2].map((i) => {
      const material = new THREE.MeshBasicMaterial({
        color: i === 1 ? 0xd14cfb : 0x49b8ff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(ringGeometry, material);
      mesh.layers.set(SHARP_LAYER);
      mesh.renderOrder = 30;
      mesh.visible = false;
      scene.add(mesh);
      return { mesh, material, delay: i * 0.12, t: Infinity };
    });

    const blobs: THREE.Mesh[] = [];
    /** Base Y scale is kept per eye — blinking multiplies it rather than
     *  replacing it, which would stretch whatever the export shipped. */
    const eyes: { mesh: THREE.Object3D; baseY: number }[] = [];
    let colourRoot: THREE.Object3D | null = null;
    const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];

    let frame = 0;
    let disposed = false;

    const loader = new GLTFLoader();
    loader.load(
      "/app/3d/mobi-orb.glb",
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;

        model.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;

          // The node carries the identity; the mesh itself is unnamed.
          const name = child.name || child.parent?.name || "";
          const parentName = child.parent?.name ?? "";
          const label = name || parentName;

          const blobColour = colourFor(label) ?? colourFor(parentName);

          if (blobColour !== null) {
            // Solid rather than additive — overlapping additive blobs wash out
            // to white. The bloom pass supplies the glow instead.
            const material = new THREE.MeshBasicMaterial({ color: blobColour });
            child.material = material;
            child.renderOrder = 1;
            child.layers.set(BLOOM_LAYER);
            disposables.push(material);
            blobs.push(child);
            // 青色 is the cluster itself and the parent of the other blobs;
            // taking child.parent here would grab the whole scene and spin the
            // eyes with it.
            if (label.startsWith("青色") && !colourRoot) colourRoot = child;
            return;
          }

          if (parentName.startsWith("眼睛") || label.startsWith("眼睛")) {
            const material = new THREE.MeshBasicMaterial({
              color: 0xffffff,
              toneMapped: false,
              depthTest: false,
              depthWrite: false,
            });
            child.material = material;
            child.renderOrder = 40;
            child.layers.set(SHARP_LAYER);
            // The export sizes them for the app's own camera; on this framing
            // they need lifting to read against the colour cluster behind.
            child.scale.multiplyScalar(1.5);
            disposables.push(material);
            eyes.push({ mesh: child, baseY: child.scale.y });
            return;
          }

          if (parentName.startsWith("玻璃球") || label === "Sphere") {
            // Fresnel glass — bright at the rim, near clear head-on.
            const material = new THREE.ShaderMaterial({
              transparent: true,
              depthWrite: false,
              side: THREE.FrontSide,
              blending: THREE.AdditiveBlending,
              uniforms: { uTime: { value: 0 } },
              vertexShader: `
                varying vec3 vNormal;
                varying vec3 vView;
                void main() {
                  vNormal = normalize(normalMatrix * normal);
                  vec4 mv = modelViewMatrix * vec4(position, 1.0);
                  vView = normalize(-mv.xyz);
                  gl_Position = projectionMatrix * mv;
                }
              `,
              fragmentShader: `
                varying vec3 vNormal;
                varying vec3 vView;
                void main() {
                  float f = dot(vNormal, vView);
                  float rim = pow(1.0 - abs(f), 2.6);
                  // A soft highlight up and left, the way a lit glass ball reads.
                  float spec = pow(clamp(dot(vNormal, normalize(vec3(-0.5, 0.7, 0.5))), 0.0, 1.0), 30.0);
                  vec3 col = vec3(1.0) * (rim * 0.42 + spec * 0.5);
                  gl_FragColor = vec4(col, rim * 0.5 + spec * 0.5);
                }
              `,
            });
            child.material = material;
            child.renderOrder = 10;
            child.layers.set(SHARP_LAYER);
            disposables.push(material);
            return;
          }

          if (label.startsWith("Ellipse")) {
            const material = new THREE.MeshBasicMaterial({
              color: 0x6aa9ff,
              transparent: true,
              opacity: 0.14,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            });
            child.material = material;
            child.renderOrder = 0;
            child.layers.set(BLOOM_LAYER);
            disposables.push(material);
            return;
          }

          child.visible = false;
        });

        // Normalise whatever scale the export came at into a unit ball.
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3()).length();
        const centre = box.getCenter(new THREE.Vector3());
        model.position.sub(centre);
        const wrapper = new THREE.Group();
        wrapper.add(model);
        wrapper.scale.setScalar(2.6 / (size || 1));
        body.add(wrapper);

        setLoaded(true);
      },
      undefined,
      () => {
        /* model unavailable — the CSS fallback orb stays visible */
      }
    );

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      const dpr = pixelRatio();
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      composer.setPixelRatio(dpr * bloomScale);
      composer.setSize(w, h);
      bloom.setSize(w * bloomScale, h * bloomScale);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    let visible = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => (visible = entry.isIntersecting),
      { rootMargin: "150px" }
    );
    intersectionObserver.observe(host);

    /* Pointer makes Mobi look toward the cursor.
     *
     * The offset used to be unclamped, and this is a window listener, so a
     * cursor parked three stage-widths away produced a target of 6 and a
     * rotation of 2.5 radians: you arrived at the section and Mobi had his
     * back to you. `tanh` keeps the pull inside ±1 however far away the
     * pointer is, so the head turns and never spins round, and the resting
     * state with no pointer movement is square on to the reader. */
    const target = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      target.x = Math.tanh(nx * 0.85);
      target.y = Math.tanh(ny * 0.85);
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // Off a pointer device there is nothing to follow, so he stays square on.
    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
    };
    host.addEventListener("pointerleave", onPointerLeave);

    let last = performance.now();
    let elapsed = 0;
    let blinkTimer = 60 / BLINK_RATE;
    let blinkLeft = 0;
    let intensity = 0;
    /** 1 the instant a tap lands, decaying to nothing over about a second. */
    let impulse = 0;
    let seenPulse = pulseRef.current;
    const look = { x: 0, y: 0 };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;

      const now = performance.now();
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += delta;

      const targetIntensity =
        stateRef.current === "speaking" ? 1 : stateRef.current === "thinking" ? 0.6 : stateRef.current === "listening" ? 0.35 : 0.12;
      intensity += (targetIntensity - intensity) * 0.06;

      // ---- tap impulse ---------------------------------------------------
      if (pulseRef.current !== seenPulse) {
        seenPulse = pulseRef.current;
        impulse = 1;
        rings.forEach((ring) => (ring.t = -ring.delay));
      }
      // Frame-rate independent decay, so a 120 Hz screen sees the same curve.
      impulse *= Math.pow(0.012, delta);
      if (impulse < 0.001) impulse = 0;

      for (const ring of rings) {
        if (ring.t === Infinity) continue;
        ring.t += delta / 1.05;
        if (ring.t >= 1) {
          ring.t = Infinity;
          ring.mesh.visible = false;
          continue;
        }
        if (ring.t < 0) continue;
        ring.mesh.visible = true;
        // Out fast, then easing to a stop, the way a shockwave loses energy.
        // Kept inside the frustum: the camera sees 1.34 units either side
        // of centre, so anything past that leaves the shot before it is read.
        const eased = 1 - Math.pow(1 - ring.t, 2.4);
        ring.mesh.scale.setScalar(0.58 + eased * 0.72);
        ring.material.opacity = Math.pow(1 - ring.t, 1.6);
      }

      look.x += (target.x - look.x) * 0.05;
      look.y += (target.y - look.y) * 0.05;

      if (!reduced) {
        root.rotation.y = look.x * 0.42 + Math.sin(elapsed * 0.4) * 0.06;
        root.rotation.x = -look.y * 0.3 + Math.sin(elapsed * 0.55) * 0.04;
        root.position.y = Math.sin(elapsed * 0.9) * 0.07;

        // Speaking squashes the body slightly on each beat. A tap punches it
        // outward on top of that and lets it settle back with a small bounce.
        const squash = 1 + Math.sin(elapsed * 7) * 0.03 * intensity;
        const punch = 1 + impulse * 0.18 - Math.pow(impulse, 3) * 0.09;
        body.scale.set((1 / squash) * punch, squash * punch, (1 / squash) * punch);

        // The colour cluster only churns while thinking, and spins up hard for
        // the moment after a tap whatever state it is in.
        const churn = stateRef.current === "thinking" ? 0.5 : 0.08;
        if (colourRoot) {
          colourRoot.rotation.y += delta * (churn + impulse * 5.5);
          colourRoot.rotation.z += delta * (churn * 0.5 + impulse * 2.2);
        }

        // Blink
        blinkTimer -= delta;
        if (blinkTimer <= 0) {
          blinkLeft = BLINK_DURATION;
          blinkTimer = 60 / BLINK_RATE;
        }
        // A tap widens the eyes for a moment, which is most of what makes the
        // orb read as having noticed you rather than merely lit up.
        const startle = 1 + impulse * 0.4;
        if (blinkLeft > 0) {
          blinkLeft -= delta;
          const t = Math.max(0, blinkLeft / BLINK_DURATION);
          const openness = Math.max(0.06, Math.abs(t - 0.5) * 2);
          eyes.forEach((eye) => eye.mesh.scale.setY(eye.baseY * openness * startle));
        } else {
          eyes.forEach((eye) => eye.mesh.scale.setY(eye.baseY * startle));
        }
      }

      // Speaking drives the glow, so the orb brightens as it talks, and a tap
      // flashes it well past anything the states reach on their own.
      bloom.strength = 0.55 + intensity * 0.5 + impulse * 1.1;

      // Pass one: the colour cluster, bloomed.
      camera.layers.set(BLOOM_LAYER);
      composer.render();

      // Pass two: glass, eyes and halo drawn sharp over the top.
      camera.layers.set(SHARP_LAYER);
      renderer.autoClear = false;
      renderer.clearDepth();
      renderer.render(scene, camera);
      renderer.autoClear = true;
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) child.geometry?.dispose();
      });
      rings.forEach((ring) => ring.material.dispose());
      ringGeometry.dispose();
      disposables.forEach((d) => d.dispose());
      composer.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete host.dataset.ready;
    };
  }, [nearViewport]);

  return (
    <div className={`mobi ${className}`} data-loaded={loaded || undefined}>
      <span className="mobi-fallback" aria-hidden="true" />
      <div ref={hostRef} className="three-host mobi-canvas" aria-hidden="true" />
    </div>
  );
}
