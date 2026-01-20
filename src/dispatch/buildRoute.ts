import type { SKElement } from "widget";

// builds route from root to target in element tree
export function buildRoute(target: SKElement): SKElement[] {
  return target.parent
    ? [...buildRoute(target.parent), target]
    : [target];
}
