import { SKMouseEvent } from "../events";
import { SKElement, SKContainer } from "../widget";
import { buildRoute } from "./buildRoute";

const debug = false;

if (debug) console.log("load dispatch-mouse module");

// find the top element under the mouse
function findTarget(
  mx: number,
  my: number,
  element: SKElement,
): SKElement | undefined {
  // only SKContainers have children to traverse
  if ("children" in element) {
    const children = (element as SKContainer).children;

    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i];
      const target = findTarget(
        // translate to child coord system
        mx - element.x - element.padding - element.margin,
        my - element.y - element.padding - element.margin,
        child,
      );
      if (target) return target;
    }
  }

  return element.hitTest(mx, my) ? element : undefined;
}

/**
 * Dispatch mouse event to a target element with capture and bubble phases
 * @param me mouse event to dispatch
 * @param root the element tree root
 */
export function mouseDispatch(me: SKMouseEvent, root: SKElement) {
  // target is focused element if set, otherwise front-most element under mouse
  const target = focusedElement ?? findTarget(me.x, me.y, root);

  // build the route from root to the target
  const route = target ? buildRoute(target) : [];

  // error if first element isn't the root
  if (route.length === 0 || route[0] !== root) {
    throw new Error(
      "mouseDispatch: route does not start with root element",
    );
  }

  // update mouseenter/mouseexit only when no focused element
  if (!focusedElement && me.type === "mousemove") {
    const topElement = route.slice(-1)[0];
    updateEnterExit(me, topElement);
  }

  // capture propagation (root -> target)
  const stopPropagation = route.some((element) => {
    const handled = element.handleMouseEventCapture(me);
    return handled;
  });

  if (stopPropagation) return;

  // bubble propagation (target -> root)
  [...route].reverse().some((element) => {
    const handled = element.handleMouseEvent(me);
    return handled;
  });

  if (focusedElement && me.type === "mouseup") {
    if (debug) console.log(`lost mouse focus ${focusedElement}`);
    focusedElement = null;
  }
}

// last element entered by mouse
let lastElementEntered: SKElement | undefined;

// dispatch mouseenter/mouseexit with element mouse is on
function updateEnterExit(me: SKMouseEvent, el?: SKElement) {
  if (el != lastElementEntered) {
    if (lastElementEntered) {
      if (debug) console.log(`exit ${lastElementEntered}`);
      lastElementEntered.handleMouseEvent({
        ...me,
        type: "mouseexit",
      });
    }
    if (el) {
      if (debug) console.log(`enter ${el}`);
      el.handleMouseEvent({ ...me, type: "mouseenter" });
    }
    lastElementEntered = el;
  }
}

// mouse focus
let focusedElement: SKElement | null = null;

export function requestMouseFocus(element: SKElement) {
  if (focusedElement === element) return;
  focusedElement = element;
  if (debug) console.log(`gained mouse focus ${focusedElement}`);
}
