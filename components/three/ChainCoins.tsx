"use client";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { COIN_CHAINS } from "@/content/chains";
import { useSceneSlot } from "@/lib/use-scene-slot";
import type { SceneBuilder } from "@/lib/three-stage";

/**
 * A row of chain coins, one per network that has a model.
 *
 * The point it makes is the one the flat strip underneath cannot: that an asset
 * on any of these chains is a thing the app holds, not a logo on a compatibility
 * list. So the coins are the real stock renders, and they move.
 *
 * They **rock rather than spin**, which is the same decision the hero coin
 * documents: a full rotation passes through edge-on, and a coin edge-on is a
 * sliver with no logo on it. A row of them would spend a third of every cycle
 * being unreadable, and the whole job of this row is to be read. So each one
 * swings through a three-quarter view and back, phase-offset from its
 * neighbours so the row never moves as one block.
 *
 * One slot on the shared stage, so this costs no WebGL context. See
 * `lib/three-stage.ts` for why that matters and what a scene has to give up.
 */

/** Radians the coin swings either side of facing the reader. */
const SWING = 0.62;
/** Seconds for one there-and-back. */
const PERIOD = 7.5;
/** Gap between coin centres, in coin diameters. */
const SPACING = 1.42;

/**
 * A studio for gold.
 *
 * `SeekCoin` builds its own and they are deliberately not shared. That one lights
 * a near-black body, so it is a dark room with one hard key, and a gold coin in
 * it comes out muddy: a metal reads almost entirely as what is around it, and
 * around it there was nothing. This is a bright room with a broad overhead
 * softbox and warm bounce low down, which is what puts the band of light across
 * the rim.
 */
function buildEnvironment(renderer: THREE.WebGLRenderer) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  const base = ctx.createLinearGradient(0, 0, 0, 256);
  base.addColorStop(0, "#f2f5ff");
  base.addColorStop(0.52, "#8e97b5");
  base.addColorStop(1, "#242838");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 256);

  // Overhead softbox, wide and soft: a metal shows the shape of its key, and a
  // small one leaves a hot dot travelling across the face as the coin swings.
  const key = ctx.createRadialGradient(256, 30, 20, 256, 30, 210);
  key.addColorStop(0, "#ffffff");
  key.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = key;
  ctx.fillRect(0, 0, 512, 256);

  // Warm bounce off the floor, so the underside of the rim is not dead.
  const bounce = ctx.createRadialGradient(180, 232, 10, 180, 232, 160);
  bounce.addColorStop(0, "#ffd9a0");
  bounce.addColorStop(1, "rgba(255,217,160,0)");
  ctx.fillStyle = bounce;
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

function buildChainCoins(): SceneBuilder {
  return ({ renderer, width, height }) => {
    if (COIN_CHAINS.length === 0) return null;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(26, width / height || 1, 0.1, 100);

    const envMap = buildEnvironment(renderer);
    scene.environment = envMap;

    /* The environment does the colour; these two do the shine. An image-based
       light alone is a broad even wash, and the thing that makes the stock
       render look like polished metal is a hard highlight travelling across the
       rim, which only a punctual light gives you. */
    const key = new THREE.DirectionalLight(0xfff4e0, 2.4);
    key.position.set(-1.6, 2.4, 3.2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x9ec4ff, 0.7);
    fill.position.set(2.4, -1.2, 1.6);
    scene.add(fill);

    /* The stock materials are plain Principled BSDFs with no textures, so they
       arrive as MeshStandardMaterial and need nothing rebuilt. That is not true
       of every export: Mobi's Spline materials did not survive and had to be
       reconstructed from the mesh names. These did, so leave them alone and
       only lift the environment response, which no exporter can know. */
    const coins: { group: THREE.Group; index: number; phase: number }[] = [];
    const disposables: (THREE.BufferGeometry | THREE.Material)[] = [];
    let disposed = false;

    const row = new THREE.Group();
    scene.add(row);

    const draco = new DRACOLoader();
    draco.setDecoderPath("/app/3d/draco/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    COIN_CHAINS.forEach((chain, i) => {
      loader.load(
        `/app/3d/coins/${chain.coin}`,
        (gltf) => {
          if (disposed) return;
          const model = gltf.scene;

          model.traverse((child) => {
            if (!(child instanceof THREE.Mesh)) return;
            const material = child.material as THREE.MeshStandardMaterial;
            /* Leave metalness and roughness where the export put them.
               Pushing the metal to 0.92 was tried first, on the theory that
               gold is a metal, and it came out bronze: at that value almost
               none of the base colour reaches the diffuse term, so the coin
               stops being gold-coloured and becomes a mirror of whatever is
               around it. The stock 0.5 is what makes it read as gold. The one
               thing the exporter cannot know is how bright the room is. */
            material.envMapIntensity = 2.1;
            material.roughness = Math.max(0.16, material.roughness - 0.06);
            material.needsUpdate = true;
          });

          /* The exporter centres and normalises to a 1-unit diameter, so
             position is the only thing left to decide, and `layout` owns that
             because it depends on the slot shape rather than on the model. */
          const group = new THREE.Group();
          group.add(model);
          row.add(group);

          // Spread the phases across the cycle rather than by a fixed step, so
          // adding a fifth coin does not put two of them in lockstep.
          coins.push({ group, index: i, phase: (i / COIN_CHAINS.length) * Math.PI * 2 });
          layout();
        },
        undefined,
        (err) => console.error(`chain coin ${chain.id} failed to load`, err),
      );
    });

    /* Columns the row is currently laid out in, and the slot aspect that chose
       it. One row is the intent; a phone is where it stops fitting. */
    let cols = COIN_CHAINS.length;
    let slotAspect = width / height || 1;

    /**
     * Place the coins in a `cols` wide grid, centred on the origin.
     *
     * Kept apart from the camera because it runs on two different triggers: a
     * coin finishing its download, and the slot changing shape. Neither implies
     * the other, and doing both in one function meant a coin that arrived late
     * landed at the origin and stayed there.
     */
    function layout() {
      const rows = Math.ceil(COIN_CHAINS.length / cols);
      for (const { group, index } of coins) {
        const col = index % cols;
        const rowIndex = Math.floor(index / cols);
        /* Centre the last row on its own count rather than on `cols`, so five
           coins over two rows do not leave a hole where the sixth would be. */
        const inRow = Math.min(cols, COIN_CHAINS.length - rowIndex * cols);
        group.position.x = (col - (inRow - 1) / 2) * SPACING;
        group.position.z = 0;
        group.userData.baseY = ((rows - 1) / 2 - rowIndex) * SPACING;
      }
    }

    /**
     * Fit the grid to the slot.
     *
     * A single row is what the section wants, and it is what a desktop gets.
     * On a phone four coins across a 350px slot come out about 60px each, which
     * is below the point where a chain logo is a chain logo, so the row folds
     * to two columns and the box gets taller instead.
     */
    function frame(w: number, h: number) {
      slotAspect = w / h || 1;
      camera.aspect = slotAspect;

      const n = COIN_CHAINS.length;
      // One row needs roughly n * SPACING of width per unit of height. If the
      // slot is meaningfully narrower than that, halve the columns.
      const wanted = n * SPACING;
      const next = slotAspect < wanted * 0.72 ? Math.ceil(n / 2) : n;
      if (next !== cols) {
        cols = next;
        layout();
      }

      const rows = Math.ceil(n / cols);
      /* Half the grid plus a coin's radius, and just enough margin to clear the
         bob and the tilt. It was 0.28, which is over half a coin radius of air
         on every side and is why the coins read small inside their own box:
         the box was the right size and the camera was standing too far back.
         A coin's furthest excursion is its radius plus the 0.045 bob, so 0.09
         is comfortable and anything more is wasted frame. */
      const spanX = ((cols - 1) * SPACING + 1) / 2 + 0.09;
      const spanY = ((rows - 1) * SPACING + 1) / 2 + 0.09;
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const distY = spanY / Math.tan(fov / 2);
      const distX = spanX / (Math.tan(fov / 2) * slotAspect);
      camera.position.set(0, 0, Math.max(distX, distY));
      camera.updateProjectionMatrix();
    }
    frame(width, height);

    return {
      scene,
      camera,
      state: {
        clearAlpha: 0,
        /* The stage defaults to no tone mapping, which is right for the flat
           brand surfaces but not here: a polished metal sends values well past
           1 and a hard clip turns the whole rim into a white band. */
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.25,
      },
      update: ({ elapsed }) => {
        for (const { group, phase } of coins) {
          const baseY = (group.userData.baseY as number) ?? 0;
          if (reduced) {
            // Held at a three-quarter view rather than square on. Still the
            // most legible angle, and it still says "this is an object".
            group.rotation.y = SWING * 0.45;
            group.rotation.x = -0.12;
            group.position.y = baseY;
            continue;
          }
          const t = (elapsed / PERIOD) * Math.PI * 2 + phase;
          group.rotation.y = Math.sin(t) * SWING;
          // A quarter-speed tilt and a small rise, so the row breathes instead
          // of reading as a set of metronomes.
          group.rotation.x = Math.sin(t * 0.5) * 0.1 - 0.08;
          group.position.y = baseY + Math.sin(t * 0.5 + 1.1) * 0.045;
        }
      },
      resize: frame,
      dispose: () => {
        disposed = true;
        draco.dispose();
        row.traverse((child) => {
          if (!(child instanceof THREE.Mesh)) return;
          child.geometry.dispose();
          const material = child.material;
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        });
        disposables.forEach((d) => d.dispose());
        key.dispose();
        fill.dispose();
        envMap.dispose();
      },
    };
  };
}

export default function ChainCoins({ label }: { label: string }) {
  const { hostRef, viewRef } = useSceneSlot(buildChainCoins());

  if (COIN_CHAINS.length === 0) return null;

  return (
    <div
      ref={hostRef}
      className="chain-coins"
      role="img"
      aria-label={label}
      /* The box is sized from the count, not from a guess: one coin in a box
         cut for four is a coin lost in a field. See app/components.css. */
      style={{ "--coins": COIN_CHAINS.length } as React.CSSProperties}
    >
      <canvas ref={viewRef} className="chain-coins-view" />
    </div>
  );
}
