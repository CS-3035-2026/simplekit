import { SKEvent } from "../events";
import { buildRoute } from "./buildRoute";
import type { SKElement } from "widget/element";

export function semanticDispatch(se: SKEvent, target: SKElement) {
  // build the route from root to the target
  const route = buildRoute(target);

  // capture propagation (root -> target)
  const stopPropagation = route.some((element) => {
    const handled = element.handleSemanticEventCapture(se);
    return handled;
  });

  if (stopPropagation) return;

  // bubble propagation (target -> root)
  [...route].reverse().some((element) => {
    const handled = element.handleSemanticEvent(se);
    return handled;
  });
}
