"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { isHandheld, pixelRatio, rendererOptions } from "@/lib/render-budget";
import { useNearViewport } from "@/lib/use-near-viewport";
import { CITIES, type City } from "@/lib/seek-cities";
import {
  DROP_COINS,
  RARITY_COLOUR,
  makeDrop,
  weightedCities,
  type Drop,
  type DropCoin,
} from "@/lib/globe-drops";
import { useTheme } from "@/components/theme/ThemeProvider";

type Props = {
  className?: string;
  /** Fires whenever a coin is picked up somewhere in the world. */
  onCollect?: (drop: Drop) => void;
  /** Fires when the visitor clicks a coin. Null when they dismiss it. */
  onSelect?: (drop: Drop | null) => void;
  /**
   * 0 keeps the default framing; 1 flies the camera down to the surface.
   * Read every frame, so the caller can scrub it from a scroll handler
   * without re-rendering.
   */
  zoomRef?: React.MutableRefObject<number>;
  /**
   * How far a full zoom actually travels. The descent needs the whole dive;
   * a zoom button wants a fraction of it, or the sphere just fills the frame
   * and turns into a pale wall.
   */
  zoomDepth?: number;
  /**
   * Set to a city name to swing the globe until that city faces the camera.
   * Cleared by the globe once the move is under way.
   */
  focusRef?: React.MutableRefObject<string | null>;
};

const R = 1;
const DEG = Math.PI / 180;

const LABELLED = new Set([
  "Dubai", "Tokyo", "New York", "London", "São Paulo",
  "Singapore", "Lagos", "Sydney", "Amsterdam", "Los Angeles",
]);

function toVector(lat: number, lon: number, radius = R, target = new THREE.Vector3()) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return target.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function buildGraticule() {
  const points: number[] = [];
  const SEG = 96;
  const v = new THREE.Vector3();
  const push = (lat: number, lon: number) => {
    toVector(lat, lon, R, v);
    points.push(v.x, v.y, v.z);
  };
  for (let lon = -180; lon < 180; lon += 30) {
    for (let i = 0; i < SEG; i++) {
      push(-90 + (180 * i) / SEG, lon);
      push(-90 + (180 * (i + 1)) / SEG, lon);
    }
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let i = 0; i < SEG; i++) {
      push(lat, -180 + (360 * i) / SEG);
      push(lat, -180 + (360 * (i + 1)) / SEG);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  return geometry;
}

/** Soft round sprite so the land dots are discs rather than squares. */
function dotTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.55, "rgba(255,255,255,0.95)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function buildArc(from: THREE.Vector3, to: THREE.Vector3, segments = 72) {
  const mid = from.clone().add(to).multiplyScalar(0.5);
  mid.normalize().multiplyScalar(1 + from.distanceTo(to) * 0.34);
  const curve = new THREE.QuadraticBezierCurve3(from.clone(), mid, to.clone());
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(segments));
  return { geometry, curve };
}

export default function SeekGlobe({
  className = "",
  onCollect,
  onSelect,
  zoomRef,
  zoomDepth = 1,
  focusRef,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const labelLayerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const collectRef = useRef(onCollect);
  collectRef.current = onCollect;
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  // Built one viewport out, not on mount. See useNearViewport.
  const nearViewport = useNearViewport(hostRef);

  useEffect(() => {
    const host = hostRef.current;
    const labelLayer = labelLayerRef.current;
    if (!host || !labelLayer) return;
    if (!nearViewport) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer(rendererOptions());
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
      cursor: "grab",
      touchAction: "pan-y",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0.3, 4.35);
    camera.lookAt(0, 0, 0);

    const world = new THREE.Group();
    world.rotation.x = 0.3;
    scene.add(world);
    const globe = new THREE.Group();
    world.add(globe);

    const palette = {
      light: {
        base: new THREE.Color("#f2f5fd"),
        shade: new THREE.Color("#9fadd2"),
        shadeAmount: 0.92,
        land: new THREE.Color("#0d1738"),
        landOpacity: 0.9,
        coast: new THREE.Color("#1b2a5e"),
        coastOpacity: 0.5,
        graticule: new THREE.Color("#4a5a92"),
        graticuleOpacity: 0.16,
        glow: new THREE.Color("#049efd"),
        glowStrength: 0.22,
      },
      dark: {
        base: new THREE.Color("#0a0a0f"),
        shade: new THREE.Color("#000000"),
        shadeAmount: 1,
        land: new THREE.Color("#2a80ff"),
        landOpacity: 0.85,
        coast: new THREE.Color("#4f9dff"),
        coastOpacity: 0.35,
        graticule: new THREE.Color("#3f5db5"),
        graticuleOpacity: 0.22,
        glow: new THREE.Color("#049efd"),
        glowStrength: 0.5,
      },
    };

    // --- body -------------------------------------------------------------
    const bodyMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uBase: { value: palette.light.base.clone() },
        uShade: { value: palette.light.shade.clone() },
        uAmount: { value: palette.light.shadeAmount },
      },
      vertexShader: `
        varying vec3 vNormal; varying vec3 vView;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uBase; uniform vec3 uShade; uniform float uAmount;
        varying vec3 vNormal; varying vec3 vView;
        void main() {
          float rim = pow(1.0 - abs(dot(vNormal, vView)), 2.2);
          float lambert = clamp(dot(vNormal, normalize(vec3(-0.45, 0.6, 0.66))), 0.0, 1.0);
          float shade = clamp(rim * 0.9 + (1.0 - lambert) * 0.5, 0.0, 1.0);
          gl_FragColor = vec4(mix(uBase, uShade, shade * uAmount), 1.0);
        }`,
    });
    const bodyGeometry = new THREE.SphereGeometry(R * 0.99, 64, 48);
    globe.add(new THREE.Mesh(bodyGeometry, bodyMaterial));

    const graticuleGeometry = buildGraticule();
    const graticuleMaterial = new THREE.LineBasicMaterial({
      color: palette.light.graticule,
      transparent: true,
      opacity: palette.light.graticuleOpacity,
    });
    globe.add(new THREE.LineSegments(graticuleGeometry, graticuleMaterial));

    const glowMaterial = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: palette.light.glow.clone() },
        uStrength: { value: palette.light.glowStrength },
      },
      vertexShader: `
        varying vec3 vNormal; varying vec3 vView;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          vView = normalize(-mv.xyz);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor; uniform float uStrength;
        varying vec3 vNormal; varying vec3 vView;
        void main() {
          float f = pow(1.0 - abs(dot(vNormal, vView)), 3.0);
          gl_FragColor = vec4(uColor, f * uStrength);
        }`,
    });
    const glowGeometry = new THREE.SphereGeometry(R * 1.05, 64, 48);
    globe.add(new THREE.Mesh(glowGeometry, glowMaterial));

    // --- real land --------------------------------------------------------
    const landTexture = dotTexture();
    const landMaterial = new THREE.PointsMaterial({
      size: 0.0195,
      map: landTexture,
      transparent: true,
      opacity: palette.light.landOpacity,
      color: palette.light.land,
      depthWrite: false,
      sizeAttenuation: true,
    });
    let landGeometry: THREE.BufferGeometry | null = null;
    const coastMaterial = new THREE.LineBasicMaterial({
      color: palette.light.coast,
      transparent: true,
      opacity: palette.light.coastOpacity,
    });
    let coastGeometry: THREE.BufferGeometry | null = null;

    const applyPalette = (p: typeof palette.light) => {
      bodyMaterial.uniforms.uBase.value.copy(p.base);
      bodyMaterial.uniforms.uShade.value.copy(p.shade);
      bodyMaterial.uniforms.uAmount.value = p.shadeAmount;
      graticuleMaterial.color.copy(p.graticule);
      graticuleMaterial.opacity = p.graticuleOpacity;
      glowMaterial.uniforms.uColor.value.copy(p.glow);
      glowMaterial.uniforms.uStrength.value = p.glowStrength;
      landMaterial.color.copy(p.land);
      landMaterial.opacity = p.landOpacity;
      coastMaterial.color.copy(p.coast);
      coastMaterial.opacity = p.coastOpacity;
    };

    let cancelled = false;
    Promise.all([
      fetch("/app/geo/land-dots.json").then((r) => r.json()),
      fetch("/app/geo/coastlines.json").then((r) => r.json()),
    ])
      .then(([dots, coasts]: [[number, number][], [number, number][][]]) => {
        if (cancelled) return;

        const positions = new Float32Array(dots.length * 3);
        const v = new THREE.Vector3();
        dots.forEach(([lat, lon], i) => {
          toVector(lat, lon, R * 1.004, v);
          positions.set([v.x, v.y, v.z], i * 3);
        });
        landGeometry = new THREE.BufferGeometry();
        landGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        globe.add(new THREE.Points(landGeometry, landMaterial));

        const segs: number[] = [];
        for (const ring of coasts) {
          for (let i = 0; i < ring.length - 1; i++) {
            toVector(ring[i][0], ring[i][1], R * 1.005, v);
            segs.push(v.x, v.y, v.z);
            toVector(ring[i + 1][0], ring[i + 1][1], R * 1.005, v);
            segs.push(v.x, v.y, v.z);
          }
        }
        coastGeometry = new THREE.BufferGeometry();
        coastGeometry.setAttribute("position", new THREE.Float32BufferAttribute(segs, 3));
        globe.add(new THREE.LineSegments(coastGeometry, coastMaterial));

        host.dataset.geo = "true";
      })
      .catch(() => {
        /* geography unavailable — the graticule alone still reads as a globe */
      });

    // --- coins ------------------------------------------------------------
    // A mix of SEEK and the memecoins that actually spawn, so the globe shows
    // what is out there rather than one repeated token.
    const loader = new THREE.TextureLoader();
    const coinTextures = DROP_COINS.map((coin) => {
      const texture = loader.load(coin.image);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 4;
      return texture;
    });

    const coinGroup = new THREE.Group();
    globe.add(coinGroup);
    const pulseGeometry = new THREE.RingGeometry(0.018, 0.024, 28);
    const stemGeometry = new THREE.CylinderGeometry(0.0022, 0.0022, 1, 6);
    const baseGeometry = new THREE.CircleGeometry(0.014, 20);
    const stemMaterial = new THREE.MeshBasicMaterial({
      color: 0x049efd, transparent: true, opacity: 0.32,
    });
    const baseMaterial = new THREE.MeshBasicMaterial({
      color: 0x049efd, transparent: true, opacity: 0.7,
    });

    type CoinNode = {
      city: City;
      anchor: THREE.Vector3;
      sprite: THREE.Sprite;
      material: THREE.SpriteMaterial;
      stem: THREE.Mesh;
      base: THREE.Mesh;
      lift: number;
      size: number;
      phase: number;
      kick: number;
      /** The coin this pin carries, and the sprite it is drawing. */
      coin: DropCoin;
      /** Most recent pickup at this city, shown when clicked. */
      drop: Drop;
    };

    const coins: CoinNode[] = CITIES.map((city, index) => {
      const anchor = toVector(city.lat, city.lon, R * 1.004, new THREE.Vector3());
      const size = 0.055 + city.weight * 0.055;
      const lift = 0.05 + city.weight * 0.055;

      // SEEK shows up roughly every third pin; the rest cycle the memecoins.
      const coinIndex = index % 3 === 0 ? 0 : 1 + (index % (DROP_COINS.length - 1));
      const coin = DROP_COINS[coinIndex];
      const material = new THREE.SpriteMaterial({
        map: coinTextures[coinIndex], transparent: true, depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.scale.setScalar(size);
      sprite.position.copy(anchor).multiplyScalar(1 + lift);
      coinGroup.add(sprite);

      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.scale.y = lift;
      stem.position.copy(anchor).multiplyScalar(1 + lift / 2);
      stem.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), anchor.clone().normalize());
      coinGroup.add(stem);

      const base = new THREE.Mesh(baseGeometry, baseMaterial);
      base.position.copy(anchor);
      base.lookAt(anchor.clone().multiplyScalar(2));
      base.scale.setScalar(0.6 + city.weight * 0.7);
      coinGroup.add(base);

      const node: CoinNode = {
        city, anchor, sprite, material, stem, base, lift, size,
        phase: Math.random() * Math.PI * 2,
        kick: 0,
        coin,
        drop: makeDrop(city, coin),
      };
      sprite.userData.node = node;
      return node;
    });

    // Ring that marks the coin the visitor picked.
    const selectionMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, transparent: true, opacity: 0.9,
      side: THREE.DoubleSide, depthWrite: false,
    });
    const selectionGeometry = new THREE.RingGeometry(0.026, 0.032, 32);
    const selectionRing = new THREE.Mesh(selectionGeometry, selectionMaterial);
    selectionRing.visible = false;
    coinGroup.add(selectionRing);
    let selected: CoinNode | null = null;

    type Pulse = { mesh: THREE.Mesh; life: number; material: THREE.MeshBasicMaterial };
    const pulses: Pulse[] = [];
    const firePulse = (node: CoinNode, colour: string) => {
      const material = new THREE.MeshBasicMaterial({
        color: colour, transparent: true, opacity: 0.95,
        side: THREE.DoubleSide, depthWrite: false,
      });
      const ring = new THREE.Mesh(pulseGeometry, material);
      ring.position.copy(node.anchor);
      ring.lookAt(node.anchor.clone().multiplyScalar(2));
      coinGroup.add(ring);
      pulses.push({ mesh: ring, life: 0, material });
    };

    // --- arcs -------------------------------------------------------------
    type Arc = {
      line: THREE.Line; material: THREE.LineBasicMaterial;
      geometry: THREE.BufferGeometry; head: THREE.Mesh;
      curve: THREE.QuadraticBezierCurve3; total: number;
    };
    const arcs: Arc[] = [];
    const arcGroup = new THREE.Group();
    globe.add(arcGroup);
    const headGeometry = new THREE.SphereGeometry(0.012, 10, 10);
    const ARC_COLOURS = ["#d04cfb", "#049efd", "#02eaa9", "#a855f7"];

    const spawnArc = () => {
      if (arcs.length > 12) return;
      const a = coins[Math.floor(Math.random() * coins.length)];
      let b = coins[Math.floor(Math.random() * coins.length)];
      let guard = 0;
      while (b === a && guard++ < 8) b = coins[Math.floor(Math.random() * coins.length)];

      const colour = ARC_COLOURS[Math.floor(Math.random() * ARC_COLOURS.length)];
      const { geometry, curve } = buildArc(
        a.anchor.clone().multiplyScalar(1.004),
        b.anchor.clone().multiplyScalar(1.004)
      );
      const material = new THREE.LineBasicMaterial({ color: colour, transparent: true, opacity: 0 });
      const line = new THREE.Line(geometry, material);
      arcGroup.add(line);
      const head = new THREE.Mesh(headGeometry, new THREE.MeshBasicMaterial({ color: colour, transparent: true }));
      arcGroup.add(head);
      arcs.push({ line, material, geometry, head, curve, total: 0 });
    };

    // --- labels -----------------------------------------------------------
    // Every city gets one. Hubs are always on; the rest are revealed by zoom,
    // and even then only the ones near the centre of the visible disc, which
    // is what keeps a close-up from turning into a wall of text.
    const labelNodes = coins.map((coin) => {
      const hub = LABELLED.has(coin.city.name);
      const el = document.createElement("span");
      el.className = "globe-label";
      if (!hub) el.dataset.minor = "true";
      el.innerHTML =
        `<b>${coin.city.name}</b><i>${coin.city.country}</i>` +
        `<u>${coin.coin.symbol}</u>`;
      labelLayer.appendChild(el);
      return { coin, el, hub, shown: false };
    });
    labelNodes.sort((a, b) => Number(b.hub) - Number(a.hub));
    const projected = new THREE.Vector3();
    /** Reused each frame by the label declutter. */
    const placed: { x: number; y: number }[] = [];

    // --- live events ------------------------------------------------------
    const pool = weightedCities();
    const byName = new Map(coins.map((c) => [c.city.name, c]));

    const emit = () => {
      const city = pool[Math.floor(Math.random() * pool.length)];
      const node = byName.get(city.name);
      if (!node) return;
      const drop = makeDrop(city, node.coin);
      node.drop = drop;
      node.kick = 1;
      firePulse(node, RARITY_COLOUR[drop.rarity]);
      collectRef.current?.(drop);
    };

    const emitTimer = window.setInterval(emit, 850);
    const arcTimer = window.setInterval(spawnArc, 1100);
    spawnArc();
    emit();

    // --- pointer: drag, hover, click --------------------------------------
    const raycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let velocity = 0.0014;
    let tiltVelocity = 0;
    let hovered: CoinNode | null = null;

    const setNdc = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickCoin = () => {
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(
        coins.filter((c) => c.sprite.visible).map((c) => c.sprite),
        false
      );
      return (hits[0]?.object.userData.node as CoinNode | undefined) ?? null;
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      swing = null;
      moved = 0;
      lastX = event.clientX;
      lastY = event.clientY;
      renderer.domElement.style.cursor = "grabbing";
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      setNdc(event);
      if (dragging) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        moved += Math.abs(dx) + Math.abs(dy);
        lastX = event.clientX;
        lastY = event.clientY;
        globe.rotation.y += dx * 0.005;
        world.rotation.x = THREE.MathUtils.clamp(world.rotation.x + dy * 0.004, -0.55, 0.9);
        velocity = dx * 0.0006;
        tiltVelocity = dy * 0.0004;
        return;
      }
      const hit = pickCoin();
      if (hit !== hovered) {
        hovered = hit;
        renderer.domElement.style.cursor = hit ? "pointer" : "grab";
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      const wasDragging = dragging;
      dragging = false;
      renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
      try {
        renderer.domElement.releasePointerCapture(event.pointerId);
      } catch {
        /* already released */
      }
      // A drag that barely moved is a tap on whatever is under the pointer.
      if (wasDragging && moved < 6) {
        setNdc(event);
        const hit = pickCoin();
        if (hit) {
          selected = hit;
          hit.kick = 1;
          firePulse(hit, RARITY_COLOUR[hit.drop.rarity]);
          selectRef.current?.(hit.drop);
        } else if (selected) {
          selected = null;
          selectRef.current?.(null);
        }
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerUp);

    // --- sizing -----------------------------------------------------------
    /* Chrome the labels have to keep out of.
     *
     * The declutter below already stops labels landing on each other, but it
     * knew nothing about the HTML sitting over the globe, so the live badge and
     * the leaderboard were being written straight through. It shows worst on a
     * phone, where the globe is barely wider than a label and the badge takes
     * the whole top-left corner.
     *
     * Measured on resize rather than per frame: these are layout reads, and a
     * layout read inside a render loop is the thing that made the descent
     * stutter. None of them move while you scroll. */
    const reserved: { x: number; y: number }[] = [];

    const measureChrome = () => {
      reserved.length = 0;
      const stage = host.parentElement;
      if (!stage) return;
      const frame = host.getBoundingClientRect();
      stage.querySelectorAll<HTMLElement>(".globe-live, .globe-leaders").forEach((el) => {
        const box = el.getBoundingClientRect();
        if (!box.width) return;
        const left = box.left - frame.left;
        const top = box.top - frame.top;
        // The collision test uses a fixed half-width, so a wide badge needs
        // several seeds along it to be covered end to end.
        for (let x = left; x < left + box.width + 60; x += 60) {
          reserved.push({ x, y: top + box.height / 2 });
        }
      });
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setPixelRatio(pixelRatio());
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      measureChrome();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    let visible = true;
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => (visible = entry.isIntersecting),
      { rootMargin: "120px" }
    );
    intersectionObserver.observe(host);

    // --- spin to a city ---------------------------------------------------
    // Solve the two rotations that put a point on the sphere facing the
    // camera: the spin that zeroes its x, then the tilt that zeroes its y.
    let swing: { spin: number; tilt: number } | null = null;

    const aimAt = (city: City) => {
      const p = toVector(city.lat, city.lon, 1, new THREE.Vector3());
      const spin = Math.atan2(-p.x, p.z);
      const qz = -p.x * Math.sin(spin) + p.z * Math.cos(spin);
      const tilt = Math.atan2(p.y, qz);
      // Keep the requested spin within half a turn of where we are, so the
      // globe takes the short way round.
      const current = globe.rotation.y;
      const delta = ((spin - current + Math.PI) % (Math.PI * 2)) - Math.PI;
      swing = {
        spin: current + delta,
        tilt: THREE.MathUtils.clamp(tilt, -0.55, 0.9),
      };
    };

    // --- loop -------------------------------------------------------------
    let last = performance.now();
    let elapsed = 0;
    let frame = 0;
    let appliedTheme = "";
    let zoomShown = 0;
    const cameraDir = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    const facingVec = new THREE.Vector3();

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;

      const now = performance.now();
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += delta;

      if (appliedTheme !== themeRef.current) {
        appliedTheme = themeRef.current;
        applyPalette(appliedTheme === "dark" ? palette.dark : palette.light);
        labelLayer.dataset.theme = appliedTheme;
      }

      // A requested city takes priority over the idle spin until it lands.
      if (focusRef?.current) {
        const city = CITIES.find((c) => c.name === focusRef.current);
        focusRef.current = null;
        if (city) aimAt(city);
      }

      if (swing) {
        globe.rotation.y += (swing.spin - globe.rotation.y) * 0.07;
        world.rotation.x += (swing.tilt - world.rotation.x) * 0.07;
        velocity = 0;
        if (
          Math.abs(swing.spin - globe.rotation.y) < 0.002 &&
          Math.abs(swing.tilt - world.rotation.x) < 0.002
        ) {
          swing = null;
        }
      } else if (!dragging && !reduced) {
        velocity += (0.0014 - velocity) * 0.02;
        globe.rotation.y += velocity * (delta * 60);
        tiltVelocity *= 0.94;
        world.rotation.x = THREE.MathUtils.clamp(
          world.rotation.x + tiltVelocity * (delta * 60), -0.55, 0.9
        );
      }

      // Scrubbed descent: the camera drops toward the surface and narrows,
      // which is what makes it read as flying in rather than scaling up.
      // The scroll-driven caller writes zoomRef every frame, so easing here
      // costs it nothing; a button press gets a glide instead of a jump.
      const wanted = zoomRef ? Math.min(1, Math.max(0, zoomRef.current)) : 0;
      zoomShown += (wanted - zoomShown) * 0.12;
      const zoom = Math.abs(wanted - zoomShown) < 0.001 ? wanted : zoomShown;
      const eased = zoom * zoom * (3 - 2 * zoom) * zoomDepth;
      camera.position.z = 4.35 - eased * 1.95;
      camera.position.y = 0.3 - eased * 0.18;
      camera.fov = 34 - eased * 5;
      camera.updateProjectionMatrix();
      camera.lookAt(0, 0, 0);

      camera.getWorldDirection(cameraDir);
      globe.getWorldQuaternion(worldQuat);

      for (const coin of coins) {
        if (coin.kick > 0) coin.kick = Math.max(0, coin.kick - delta * 2.2);
        const bob = reduced ? 0 : Math.sin(elapsed * 1.6 + coin.phase) * 0.012;
        const isHot = coin === hovered || coin === selected;
        const lift = coin.lift + bob + coin.kick * 0.05 + (isHot ? 0.03 : 0);

        coin.sprite.position.copy(coin.anchor).multiplyScalar(1 + lift);
        coin.sprite.scale.setScalar(
          coin.size * (1 + coin.kick * 0.45 + (isHot ? 0.3 : 0)) * (1 + zoom * 0.35)
        );

        facingVec.copy(coin.anchor).applyQuaternion(worldQuat).normalize();
        const facing = facingVec.dot(cameraDir.clone().negate());
        const fade = THREE.MathUtils.clamp((facing - 0.06) * 6, 0, 1);
        coin.material.opacity = fade;
        coin.sprite.visible = fade > 0.01;
        coin.stem.visible = fade > 0.25;
        coin.base.visible = fade > 0.25;
      }

      if (selected) {
        selectionRing.visible = selected.sprite.visible;
        selectionRing.position.copy(selected.anchor);
        selectionRing.lookAt(selected.anchor.clone().multiplyScalar(2));
        const beat = 1 + Math.sin(elapsed * 3.4) * 0.12;
        selectionRing.scale.setScalar(beat);
        selectionMaterial.color.set(RARITY_COLOUR[selected.drop.rarity]);
      } else {
        selectionRing.visible = false;
      }

      // Screen-space declutter: hubs are placed first and minor labels that
      // would land on top of something already placed are dropped for this
      // frame. Without it a zoomed-in continent stacks a dozen labels.
      placed.length = 0;
      // The overlay chrome occupies the frame before any label does.
      for (const spot of reserved) placed.push(spot);

      for (const label of labelNodes) {
        // Minor cities need both zoom and a face-on position to appear.
        const threshold = label.hub ? 0.55 : 0.95;
        const allowed = label.hub || zoom > 0.3;
        if (!allowed || label.coin.material.opacity < threshold) {
          if (label.shown) {
            label.el.style.opacity = "0";
            label.shown = false;
          }
          continue;
        }
        projected.copy(label.coin.sprite.position);
        label.coin.sprite.parent?.localToWorld(projected);
        projected.project(camera);
        const x = (projected.x * 0.5 + 0.5) * host.clientWidth;
        const y = (-projected.y * 0.5 + 0.5) * host.clientHeight;

        let collides = false;
        for (const p of placed) {
          if (Math.abs(p.x - x) < 92 && Math.abs(p.y - y) < 22) {
            collides = true;
            break;
          }
        }
        if (collides) {
          if (label.shown) {
            label.el.style.opacity = "0";
            label.shown = false;
          }
          continue;
        }
        placed.push({ x, y });

        label.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        // A label sits to the right of its pin, which runs it off the stage for
        // any city near the right limb. On a phone the stage is barely wider
        // than the label itself, so it came back clipped mid-word. Past this
        // point the label hangs off the other side instead.
        label.el.toggleAttribute("data-flip", x > host.clientWidth - 130);
        if (!label.shown) {
          label.el.style.opacity = "1";
          label.shown = true;
        }
      }
      labelLayer.dataset.detail = zoom > 0.55 ? "true" : "false";

      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.total += delta;
        const progress = Math.min(arc.total / 1.7, 1);
        const count = arc.geometry.getAttribute("position").count;
        arc.geometry.setDrawRange(0, Math.max(2, Math.floor(count * progress)));
        arc.material.opacity = arc.total < 1.7 ? 0.6 : Math.max(0, 0.6 - (arc.total - 1.7) * 0.55);
        arc.head.position.copy(arc.curve.getPoint(progress));
        (arc.head.material as THREE.MeshBasicMaterial).opacity = arc.material.opacity / 0.6;
        arc.head.visible = progress < 1;
        if (arc.total > 3.2) {
          arcGroup.remove(arc.line, arc.head);
          arc.geometry.dispose();
          arc.material.dispose();
          (arc.head.material as THREE.Material).dispose();
          arcs.splice(i, 1);
        }
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
        const pulse = pulses[i];
        pulse.life += delta;
        const t = pulse.life / 1.4;
        pulse.mesh.scale.setScalar(1 + t * 4);
        pulse.material.opacity = Math.max(0, 0.95 * (1 - t));
        if (t >= 1) {
          coinGroup.remove(pulse.mesh);
          pulse.material.dispose();
          pulses.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.clearInterval(emitTimer);
      window.clearInterval(arcTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerUp);
      labelNodes.forEach((l) => l.el.remove());
      arcs.forEach((arc) => {
        arc.geometry.dispose();
        arc.material.dispose();
        (arc.head.material as THREE.Material).dispose();
      });
      pulses.forEach((p) => p.material.dispose());
      coins.forEach((c) => c.material.dispose());
      landGeometry?.dispose();
      coastGeometry?.dispose();
      bodyGeometry.dispose();
      graticuleGeometry.dispose();
      glowGeometry.dispose();
      pulseGeometry.dispose();
      stemGeometry.dispose();
      baseGeometry.dispose();
      headGeometry.dispose();
      selectionGeometry.dispose();
      bodyMaterial.dispose();
      graticuleMaterial.dispose();
      glowMaterial.dispose();
      landMaterial.dispose();
      coastMaterial.dispose();
      stemMaterial.dispose();
      baseMaterial.dispose();
      selectionMaterial.dispose();
      landTexture.dispose();
      coinTextures.forEach((t) => t.dispose());
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
  }, [zoomDepth, nearViewport]);

  return (
    <div
      ref={hostRef}
      className={`three-host globe-canvas ${className}`}
      role="img"
      aria-label="Interactive globe showing SeekAR collection activity worldwide"
    >
      <div ref={labelLayerRef} className="globe-labels" aria-hidden="true" />
    </div>
  );
}
