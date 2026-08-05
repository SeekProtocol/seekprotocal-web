"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { COLLECTIBLES, RARITY_LADDER } from "@/content/collectibles";

/**
 * One continuous flight from orbit to street level.
 *
 * The earlier version claimed there was no cut and there was one. The globe
 * lived in its own coordinate frame at radius 1 and the city lived in another
 * at a span of 40, and each drove the camera with its own formula. At the
 * handover the camera teleported from a metre above a one-metre planet to
 * thirty-four metres above a city, and a crossfade was laid over the join to
 * hide it.
 *
 * They share one space now. The planet is a sphere of `R_GLOBE` city units
 * with its north pole sitting just under the city's ground plane, so the
 * ground the buildings stand on *is* the planet's surface. One camera falls
 * along one exponential altitude curve from `ALT_TOP` to `ALT_STREET`, tipping
 * from straight down to a three-quarter view and banking into the turn as it
 * goes. Nothing is switched on or off along the way: the city emerges out of
 * the haze because the haze thins, and the planet stops being a ball because
 * you are close enough that its curvature leaves the frame.
 *
 * Exponential, not linear, because that is what a descent looks like. A linear
 * altitude ramp spends most of its length in space and then slams into the
 * ground; equal scroll should buy equal *proportion* of the remaining height.
 */

const DEG = Math.PI / 180;
/** Amsterdam — the point the camera dives at. */
const TARGET = { lat: 52.37, lon: 4.9 };

const CITY_BLOCKS = 7;
const BLOCK = 4.2;
const ROAD = 1.6;

/**
 * The planet, in city units. Small enough that the horizon curves hard from
 * orbit and reads as a ball rather than a plain, large enough that by the time
 * you are a few hundred units up the curvature has left the frame on its own.
 */
const R_GLOBE = 620;
/** Altitude above the surface, at the top of the section and at the bottom. */
const ALT_TOP = 1850;
const ALT_STREET = 12;
/** The pole is tucked just under the ground plane so the two never z-fight. */
const GLOBE_SINK = 0.7;

type Props = {
  /** 0 → 1 across the descent. */
  progressRef: React.MutableRefObject<number>;
  className?: string;
};

function toVector(lat: number, lon: number, radius = 1, target = new THREE.Vector3()) {
  const phi = (90 - lat) * DEG;
  const theta = (lon + 180) * DEG;
  return target.set(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/**
 * A disc that is solid in the middle and falls to nothing at the rim.
 *
 * The city's ground plane has to be big enough to read as ground from a few
 * hundred units up, and any plane big enough to do that shows its own straight
 * edge somewhere in the frame. Faded out well before the rim it simply stops
 * being there, and the planet's own curve carries on behind it.
 */
function groundFadeTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.42, "rgba(255,255,255,1)");
  g.addColorStop(0.78, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function dotTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.55, "rgba(255,255,255,0.95)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export default function WorldToPhone({ progressRef, className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  /* No theme subscription here on purpose. The scene is night in both themes,
     the section it sits in is `.section-inverse`, and the ref this used to
     mirror the theme into was never read by anything. */

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      // Logarithmic depth: the scene now spans from a 10cm kerb to a planet
      // 2,500 units away, and a linear buffer cannot hold both.
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        logarithmicDepthBuffer: true,
      });
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
    const camera = new THREE.PerspectiveCamera(42, 1, 0.4, 9000);

    /* Haze is what makes the descent read as distance rather than as a zoom.
       From orbit it buries the city completely, so the ground arrives out of
       nothing instead of being switched on; at street level it is a thin
       depth cue between the near blocks and the far ones. Density is driven
       off altitude in the loop, because the distances shrink with it. */
    const fog = new THREE.FogExp2(0x02040c, 0.0009);
    scene.fog = fog;

    const disposables: (THREE.BufferGeometry | THREE.Material | THREE.Texture)[] = [];
    const track = <T extends THREE.BufferGeometry | THREE.Material | THREE.Texture>(x: T) => {
      disposables.push(x);
      return x;
    };

    // =====================================================================
    // ORBIT — the globe
    // =====================================================================
    /* The planet lives in the same space as the city, at city scale, with its
       north pole just under the ground plane. Everything inside it is still
       modelled on a unit sphere, so the group carries the scale and the sink. */
    const globeGroup = new THREE.Group();
    globeGroup.scale.setScalar(R_GLOBE);
    globeGroup.position.y = -R_GLOBE - GLOBE_SINK;
    scene.add(globeGroup);

    const targetDir = toVector(TARGET.lat, TARGET.lon).normalize();
    // Rotate the world so the dive target sits at the top of the sphere; the
    // camera then only has to come straight down.
    const align = new THREE.Quaternion().setFromUnitVectors(
      targetDir,
      new THREE.Vector3(0, 1, 0)
    );
    globeGroup.quaternion.copy(align);

    const spinner = new THREE.Group();
    globeGroup.add(spinner);

    const bodyMaterial = track(
      new THREE.ShaderMaterial({
        uniforms: {
          uBase: { value: new THREE.Color("#0b1024") },
          uShade: { value: new THREE.Color("#01030a") },
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
          uniform vec3 uBase; uniform vec3 uShade;
          varying vec3 vNormal; varying vec3 vView;
          void main() {
            float rim = pow(1.0 - abs(dot(vNormal, vView)), 2.2);
            float lambert = clamp(dot(vNormal, normalize(vec3(-0.4, 0.7, 0.6))), 0.0, 1.0);
            gl_FragColor = vec4(mix(uBase, uShade, clamp(rim * 0.8 + (1.0 - lambert) * 0.55, 0.0, 1.0)), 1.0);
          }`,
      })
    );
    const bodyGeometry = track(new THREE.SphereGeometry(0.995, 64, 48));
    spinner.add(new THREE.Mesh(bodyGeometry, bodyMaterial));

    const atmosphere = track(
      new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        // The sky is not subject to the haze; it is what the haze is made of.
        fog: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uColor: { value: new THREE.Color("#049efd") },
          /* A ShaderMaterial ignores `material.opacity`, so the sky needs its
             own uniform to be faded by. It used to be assigned every frame and
             quietly do nothing. */
          uFade: { value: 1 },
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
          uniform vec3 uColor; uniform float uFade;
          varying vec3 vNormal; varying vec3 vView;
          void main() {
            float f = pow(1.0 - abs(dot(vNormal, vView)), 3.0);
            gl_FragColor = vec4(uColor, f * 0.75 * uFade);
          }`,
      })
    );
    const atmoGeometry = track(new THREE.SphereGeometry(1.06, 48, 32));
    globeGroup.add(new THREE.Mesh(atmoGeometry, atmosphere));

    const landTexture = track(dotTexture());
    const landMaterial = track(
      new THREE.PointsMaterial({
        /* Screen size, not world size. With attenuation on, a dot map drawn at
           city scale is either invisible from orbit or the size of a district
           at street level. Held at a couple of pixels it reads as a map the
           whole way down, and the dots simply spread apart as you approach,
           which is what zooming into a map looks like. */
        size: 2.4,
        sizeAttenuation: false,
        map: landTexture,
        color: new THREE.Color("#2f7bff"),
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
        fog: false,
      })
    );
    let landPoints: THREE.Points | null = null;

    let cancelled = false;
    fetch("/app/geo/land-dots.json")
      .then((r) => r.json())
      .then((dots: [number, number][]) => {
        if (cancelled) return;
        const arr = new Float32Array(dots.length * 3);
        const v = new THREE.Vector3();
        dots.forEach(([lat, lon], i) => {
          toVector(lat, lon, 1.004, v);
          arr.set([v.x, v.y, v.z], i * 3);
        });
        const g = track(new THREE.BufferGeometry());
        g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
        landPoints = new THREE.Points(g, landMaterial);
        spinner.add(landPoints);
      })
      .catch(() => {
        /* geography unavailable — the sphere alone still reads */
      });

    // =====================================================================
    // STREET LEVEL — the city
    // =====================================================================
    const cityGroup = new THREE.Group();
    cityGroup.visible = false;
    scene.add(cityGroup);

    const span = CITY_BLOCKS * (BLOCK + ROAD);

    // Ground
    const groundMaterial = track(
      new THREE.MeshBasicMaterial({
        color: 0x05070f,
        transparent: true,
        opacity: 1,
        alphaMap: track(groundFadeTexture()),
        depthWrite: false,
      })
    );
    const groundGeometry = track(new THREE.PlaneGeometry(span * 7, span * 7));
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    // The planet's pole sits GLOBE_SINK below this, so the two never meet.
    ground.position.y = 0;
    cityGroup.add(ground);

    // Roads, drawn as glowing lines rather than geometry
    const roadPoints: number[] = [];
    const half = span / 2;
    for (let i = 0; i <= CITY_BLOCKS; i++) {
      const at = -half + i * (BLOCK + ROAD);
      roadPoints.push(-half - ROAD, 0.02, at, half + ROAD, 0.02, at);
      roadPoints.push(at, 0.02, -half - ROAD, at, 0.02, half + ROAD);
    }
    const roadGeometry = track(new THREE.BufferGeometry());
    roadGeometry.setAttribute("position", new THREE.Float32BufferAttribute(roadPoints, 3));
    const roadMaterial = track(
      new THREE.LineBasicMaterial({ color: 0x2f8fff, transparent: true, opacity: 0.55 })
    );
    cityGroup.add(new THREE.LineSegments(roadGeometry, roadMaterial));

    // Buildings — one instanced mesh, so a whole skyline costs one draw call
    const boxGeometry = track(new THREE.BoxGeometry(1, 1, 1));
    const buildingMaterial = track(
      new THREE.MeshLambertMaterial({ color: 0x141d35, transparent: true, opacity: 1 })
    );

    /* Lit windows.
     *
     * A night city of untextured boxes reads as a bar chart. This is the one
     * change that makes it read as somewhere people are: floors banded off the
     * world height, columns off whichever horizontal axis faces the camera,
     * and a hash of the two deciding which are on. No texture, no extra draw
     * call, and it survives the buildings being scaled every frame while they
     * grow, because everything is derived from world position.
     */
    let windowShader: { uniforms: Record<string, { value: number }> } | null = null;
    buildingMaterial.onBeforeCompile = (shader) => {
      shader.uniforms.uWindow = { value: 0 };
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vLocalPos;\nvarying vec3 vCityPos;"
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
           vLocalPos = position;
           #ifdef USE_INSTANCING
             vCityPos = (modelMatrix * instanceMatrix * vec4(position, 1.0)).xyz;
           #else
             vCityPos = (modelMatrix * vec4(position, 1.0)).xyz;
           #endif`
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uWindow;\nvarying vec3 vLocalPos;\nvarying vec3 vCityPos;"
        )
        .replace(
          "#include <opaque_fragment>",
          `{
             vec3 a = abs(vLocalPos);
             // Roofs have no windows, and the box's own faces tell us which is
             // which: a side face pins one of |x| or |z| to a half.
             float side = step(0.46, max(a.x, a.z)) * step(a.y, 0.47);
             // The horizontal axis of the face you are looking at.
             float u = a.x > a.z ? vCityPos.z : vCityPos.x;
             float row = floor(vCityPos.y * 3.1);
             float col = floor(u * 3.4);
             float inRow = step(0.18, fract(vCityPos.y * 3.1)) * step(fract(vCityPos.y * 3.1), 0.66);
             float inCol = step(0.22, fract(u * 3.4)) * step(fract(u * 3.4), 0.72);
             // Which ones are on. Stable per window, so they do not flicker as
             // the building grows underneath them.
             float seed = fract(sin(row * 12.9898 + col * 78.233) * 43758.5453);
             float lit = side * inRow * inCol * step(0.44, seed);
             // Two lamp temperatures, so the block is not one flat colour.
             vec3 warm = vec3(1.0, 0.84, 0.58);
             vec3 cool = vec3(0.55, 0.78, 1.0);
             outgoingLight += mix(cool, warm, step(0.72, seed)) * lit * uWindow;
           }
           #include <opaque_fragment>`
        );

      windowShader = shader as unknown as { uniforms: Record<string, { value: number }> };
    };
    const perBlock = 3;
    const buildingCount = CITY_BLOCKS * CITY_BLOCKS * perBlock;
    const buildings = new THREE.InstancedMesh(boxGeometry, buildingMaterial, buildingCount);
    const heights = new Float32Array(buildingCount);
    const dummy = new THREE.Object3D();

    let n = 0;
    for (let bx = 0; bx < CITY_BLOCKS; bx++) {
      for (let bz = 0; bz < CITY_BLOCKS; bz++) {
        const cx = -half + bx * (BLOCK + ROAD) + BLOCK / 2 + ROAD / 2;
        const cz = -half + bz * (BLOCK + ROAD) + BLOCK / 2 + ROAD / 2;
        for (let k = 0; k < perBlock; k++) {
          const w = 0.9 + Math.random() * 1.3;
          const d = 0.9 + Math.random() * 1.3;
          // Taller towards the middle, so the skyline has a centre.
          const distance = Math.hypot(cx, cz) / half;
          const h = (0.6 + Math.random() * 2.6) * (1.5 - distance * 0.8);
          heights[n] = h;
          dummy.position.set(
            cx + (Math.random() - 0.5) * (BLOCK - w),
            h / 2,
            cz + (Math.random() - 0.5) * (BLOCK - d)
          );
          dummy.scale.set(w, h, d);
          dummy.rotation.y = 0;
          dummy.updateMatrix();
          buildings.setMatrixAt(n, dummy.matrix);
          n++;
        }
      }
    }
    buildings.instanceMatrix.needsUpdate = true;
    cityGroup.add(buildings);

    const cityLight = new THREE.DirectionalLight(0xbcd4ff, 1.5);
    cityLight.position.set(-6, 12, 8);
    cityGroup.add(cityLight);
    cityGroup.add(new THREE.AmbientLight(0x233355, 1.5));

    // Coins standing on the streets
    const loader = new THREE.TextureLoader();
    /**
     * Drops stand at road intersections, not inside blocks.
     *
     * The ground rings and stems are flat geometry a few centimetres off the
     * street, so anywhere they overlapped a building footprint they were cut
     * in half by it. Roads run at multiples of BLOCK + ROAD from the edge, so
     * these coordinates are the crossings between them — which is also where
     * a drop belongs.
     */
    const LANE = BLOCK + ROAD;
    const lane = (n: number) => n * LANE - LANE / 2;
    // Kept inside the band the portrait frame shows, so none of them ends up
    // behind the status bar or the tab bar once the phone closes in.
    const coinSpots = [
      { x: lane(0), z: lane(-1), coin: COLLECTIBLES[4] },
      { x: lane(1), z: lane(0), coin: COLLECTIBLES[0] },
      { x: lane(0), z: lane(1), coin: COLLECTIBLES[6] },
      { x: lane(0), z: lane(2), coin: COLLECTIBLES[5] },
      { x: lane(1), z: lane(2), coin: COLLECTIBLES[7] },
    ];
    // A soft radial disc, used as the glow behind each coin.
    const glowTexture = track(dotTexture());

    const citySprites = coinSpots.map((spot) => {
      const rarity = RARITY_LADDER[spot.coin.rarity];

      // Several of the coin artworks are near-black, which vanishes against a
      // night city. Each one gets a halo in its own rarity colour behind it.
      const glowMaterial = track(
        new THREE.SpriteMaterial({
          map: glowTexture,
          color: new THREE.Color(rarity.colour),
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const glow = new THREE.Sprite(glowMaterial);
      glow.scale.setScalar(4.6);
      glow.position.set(spot.x, 3.2, spot.z);
      cityGroup.add(glow);

      const texture = track(loader.load(spot.coin.image));
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = track(
        new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false })
      );
      const sprite = new THREE.Sprite(material);
      sprite.scale.setScalar(1.9);
      sprite.position.set(spot.x, 3.2, spot.z);
      sprite.renderOrder = 4;
      cityGroup.add(sprite);

      // A stem down to the street, so the coin reads as standing on a point.
      const stemMaterial = track(
        new THREE.MeshBasicMaterial({
          color: rarity.colour,
          transparent: true,
          opacity: 0.4,
        })
      );
      const stemGeometry = track(new THREE.CylinderGeometry(0.035, 0.035, 3.2, 6));
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.position.set(spot.x, 1.6, spot.z);
      cityGroup.add(stem);

      const ringMaterial = track(
        new THREE.MeshBasicMaterial({
          color: rarity.colour,
          transparent: true,
          opacity: 0.9,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      const ringGeometry = track(new THREE.RingGeometry(0.7, 0.86, 40));
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(spot.x, 0.24, spot.z);
      cityGroup.add(ring);

      return {
        sprite, glow, glowMaterial, stem, stemMaterial, ring, ringMaterial,
        phase: Math.random() * Math.PI * 2,
      };
    });

    // You, on the ground
    const meMaterial = track(
      new THREE.MeshBasicMaterial({ color: 0x2f8fff, transparent: true, opacity: 0.22, side: THREE.DoubleSide })
    );
    // Sized to sit inside the junction it stands on, so its edge never runs
    // under a building.
    const meGeometry = track(new THREE.CircleGeometry(1.9, 40));
    const meHalo = new THREE.Mesh(meGeometry, meMaterial);
    meHalo.rotation.x = -Math.PI / 2;
    meHalo.position.set(lane(1), 0.24, lane(1));
    cityGroup.add(meHalo);

    const meDotMaterial = track(new THREE.MeshBasicMaterial({ color: 0xffffff }));
    const meDotGeometry = track(new THREE.CircleGeometry(0.45, 24));
    const meDot = new THREE.Mesh(meDotGeometry, meDotMaterial);
    meDot.rotation.x = -Math.PI / 2;
    meDot.position.set(lane(1), 0.3, lane(1));
    // Always a whole circle: it is the one marker that must never be sliced.
    meDotMaterial.depthTest = false;
    meDot.renderOrder = 6;
    cityGroup.add(meDot);

    // A scan that sweeps the block, the way a lidar pass reads
    const scanMaterial = track(
      new THREE.MeshBasicMaterial({
        color: 0x02eaa9,
        transparent: true,
        opacity: 0.07,
        side: THREE.DoubleSide,
        depthWrite: false,
      })
    );
    const scanGeometry = track(new THREE.PlaneGeometry(span * 2.4, 1.8));
    const scan = new THREE.Mesh(scanGeometry, scanMaterial);
    scan.rotation.x = -Math.PI / 2;
    cityGroup.add(scan);

    // =====================================================================
    // SIZING
    // =====================================================================
    let lastW = 0;
    let lastH = 0;
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      // The frame animates every frame while it closes; only rebuild the
      // drawing buffer when the change is worth the reallocation.
      if (Math.abs(w - lastW) < 4 && Math.abs(h - lastH) < 4) return;
      lastW = w;
      lastH = h;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    let visible = true;
    const intersectionObserver = new IntersectionObserver(
      ([e]) => (visible = e.isIntersecting),
      { rootMargin: "150px" }
    );
    intersectionObserver.observe(host);

    // =====================================================================
    // LOOP
    // =====================================================================
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const between = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
    const ease = (t: number) => t * t * (3 - 2 * t);

    /** Where the buildings have finished growing out of the ground. */
    const CITY_FROM = 900;
    const CITY_TO = 240;
    /** Where the viewport starts closing to the size of a screen. */
    const FRAME_FROM = 0.72;
    const FRAME_TO = 0.94;
    /** The descent itself is over before the frame starts closing. */
    const DIVE_TO = 0.8;

    let last = performance.now();
    let elapsed = 0;
    let frame = 0;
    /** Cheap guards: neither of these is worth redoing on a settled frame. */
    let lastGrow = -1;
    let lastCityIn = -1;

    const lookTarget = new THREE.Vector3();

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;

      const now = performance.now();
      const delta = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += delta;

      const p = clamp01(progressRef.current);

      // ---- the descent ---------------------------------------------------
      // One exponential fall. Equal scroll buys equal proportion of the height
      // that is left, which is what a descent actually feels like.
      const dive = ease(between(p, 0, DIVE_TO));
      const framed = ease(between(p, FRAME_FROM, FRAME_TO));
      const alt = ALT_TOP * Math.pow(ALT_STREET / ALT_TOP, dive);

      /* The camera tips from straight down to a three-quarter view as it falls.
         Straight down at the top is what lets the planet read as a ball rather
         than as a wall, and it is also why there is no join: from directly
         above, a sphere and a plane look the same once you are close enough. */
      const tip = ease(dive);
      const back = alt * (0.05 + tip * 2.1);
      // A slow drift across the target, and a bank into it. Banking is most of
      // what separates a camera move from a slider.
      const drift = Math.sin(elapsed * 0.09) * (0.06 + tip * 0.02);
      const bank = drift * 0.35 * (1 - framed);

      camera.up.set(Math.sin(bank), Math.cos(bank), 0);
      camera.position.set(
        drift * alt * 0.9,
        alt + framed * 2,
        back
      );
      lookTarget.set(0, tip * 4.6 + framed * -3.4, tip * -6.5 + framed * 1.5);
      camera.lookAt(lookTarget);
      camera.fov = 42 - tip * 9 + framed * 4;
      camera.updateProjectionMatrix();

      /* Haze is a depth cue, not a curtain.
       *
       * The camera's distance to the city is roughly proportional to altitude,
       * so a density proportional to 1/altitude holds the *amount* of haze
       * steady across the whole flight: the far blocks always sit a little
       * back from the near ones, whether you are fifteen units up or fifteen
       * hundred.
       *
       * The first version capped the density, and the cap, tuned at street
       * level, buried the city completely from a hundred units up. Hiding the
       * city from orbit is `cityIn`'s job. This only has to give depth. */
      fog.density = 0.28 / Math.max(alt, 18);

      // ---- the planet ----------------------------------------------------
      // It never switches off; it simply ends up under the ground.
      const orbital = 1 - clamp01((ALT_TOP * 0.32 - alt) / (ALT_TOP * 0.28));
      spinner.rotation.y += delta * 0.05 * orbital;
      landMaterial.opacity = 0.9 * clamp01((alt - 190) / 420);
      landMaterial.size = 2.4;
      /* The sky goes as the frame closes.
       *
       * Once the viewport is a phone screen, the top of that portrait strip was
       * filled with the horizon glow, which put a blue band above the map. The
       * app does not render sky, so neither does this. */
      atmosphere.uniforms.uFade.value = 1 - framed;

      // ---- the city ------------------------------------------------------
      // Emerges out of the haze as the haze thins. There is no threshold at
      // which it appears, only an altitude at which you can see it.
      const cityIn = ease(clamp01((CITY_FROM - alt) / (CITY_FROM - CITY_TO)));
      cityGroup.visible = cityIn > 0.001;

      if (cityIn > 0.001) {
        if (Math.abs(cityIn - lastCityIn) > 0.001) {
          lastCityIn = cityIn;
          buildingMaterial.opacity = cityIn;
          roadMaterial.opacity = 0.55 * cityIn;
          groundMaterial.opacity = cityIn;
          if (windowShader) windowShader.uniforms.uWindow.value = cityIn * 1.25;
        }

        /* Buildings grow out of the ground as the city arrives. This used to
           decompose and re-upload all 147 instance matrices on every frame for
           the whole rest of the section, long after they had finished growing.
           It runs while the value is actually moving and then stops. */
        const grow = cityIn;
        if (Math.abs(grow - lastGrow) > 0.002) {
          lastGrow = grow;
          for (let i = 0; i < buildingCount; i++) {
            buildings.getMatrixAt(i, dummy.matrix);
            dummy.matrix.decompose(dummy.position, dummy.quaternion, dummy.scale);
            const h = heights[i] * Math.max(0.02, grow);
            dummy.scale.y = h;
            dummy.position.y = h / 2;
            dummy.updateMatrix();
            buildings.setMatrixAt(i, dummy.matrix);
          }
          buildings.instanceMatrix.needsUpdate = true;
        }

        citySprites.forEach((entry, i) => {
          const bob = Math.sin(elapsed * 1.5 + entry.phase) * 0.3;
          entry.sprite.position.y = 3.2 + bob;
          entry.glow.position.y = 3.2 + bob;
          entry.sprite.material.opacity = cityIn;
          entry.glowMaterial.opacity = (0.55 + Math.sin(elapsed * 2 + entry.phase) * 0.15) * cityIn;
          entry.stemMaterial.opacity = 0.35 * cityIn;
          const pulse = (elapsed * 0.55 + i * 0.2) % 1;
          entry.ring.scale.setScalar(1 + pulse * 2.2);
          entry.ringMaterial.opacity = (1 - pulse) * 0.85 * cityIn;
        });

        meMaterial.opacity = 0.22 * cityIn;
        meDotMaterial.opacity = cityIn;
        meHalo.scale.setScalar(1 + Math.sin(elapsed * 1.6) * 0.12);

        scanMaterial.opacity = 0.07 * cityIn;
        scan.position.z = ((elapsed * 9) % (span * 2)) - span;
        scan.position.y = 0.04;
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      buildings.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
      delete host.dataset.ready;
    };
  }, [progressRef]);

  return <div ref={hostRef} className={`wtp-canvas ${className}`} aria-hidden="true" />;
}
