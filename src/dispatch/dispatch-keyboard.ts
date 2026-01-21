import { SKKeyboardEvent } from "../events";
import { SKElement } from "../widget";
import { buildRoute } from "./buildRoute";

const debug = false;

if (debug) console.log("load dispatch-keyboard module");

let focusedElement: SKElement | null = null;

export function requestKeyboardFocus(
  element: SKElement | null = null,
) {
  // nothing to do if already focused
  if (focusedElement == element) return;
  // if send focusout to old element if there was one
  if (focusedElement) {
    focusedElement.handleKeyboardEvent({
      type: "focusout",
      timeStamp: performance.now(),
      key: null,
    } as SKKeyboardEvent);
    if (debug) console.log(`lost keyboard focus ${focusedElement}`);
  }
  // send focus in to new element
  if (element) {
    element.handleKeyboardEvent({
      type: "focusin",
      timeStamp: performance.now(),
      key: null,
    } as SKKeyboardEvent);
    if (debug) console.log(`gained keyboard focus ${focusedElement}`);
  }

  focusedElement = element;
}

/**
 * Dispatch keyboard event to focused element
 * @param ke keyboard event to dispatch
 * @param root the element tree root
 */
export function keyboardDispatch(
  ke: SKKeyboardEvent,
  root: SKElement,
) {
  if (debug)
    console.log(
      `keyboardDispatch ${ke} ${focusedElement || "no focus"}`,
    );

  // policy: if nothing focused, send to root (for global shortcuts)
  const target = focusedElement ?? root;

  // build the route from root to the target
  const route = target ? buildRoute(target) : [];

  // capture propagation (root -> target)
  const stopPropagation = route.some((element) => {
    const handled = element.handleKeyboardEventCapture(ke);
    return handled;
  });

  if (stopPropagation) return;

  // bubble propagation (target -> root)
  [...route].reverse().some((element) => {
    const handled = element.handleKeyboardEvent(ke);
    return handled;
  });
}
