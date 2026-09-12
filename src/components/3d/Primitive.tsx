import { createElement } from "react";
import type * as THREE from "three";

type PrimitiveProps = {
  object: THREE.Object3D;
  position?: [number, number, number];
};

/**
 * Thin wrapper around R3F's <primitive>. Built with createElement so dev-only
 * JSX source attributes (data-tsd-source) are never applied to the raw
 * three.js object, which R3F cannot set.
 */
export function Primitive({ object, ...rest }: PrimitiveProps) {
  return createElement("primitive", { object, ...rest });
}
