import type * as THREE from "three";

/** World anchors (island groups) registered from inside the Canvas. */
export const anchorRegistry = new Map<string, THREE.Object3D>();

/** Label pill elements registered from the DOM overlay. */
export const pillRegistry = new Map<string, HTMLDivElement>();

/** Lens-flare ghost elements registered from the DOM overlay. */
export const ghostRegistry = new Map<number, HTMLDivElement>();
