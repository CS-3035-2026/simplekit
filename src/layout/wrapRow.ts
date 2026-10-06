import { SKElement } from "../widget";
import type { LayoutMethod, Size } from ".";
import { Settings } from "../settings";

type WrapLayoutProps = {
  gap?: number;
};

export class WrapRowLayout implements LayoutMethod {
  constructor({ gap = 0 }: WrapLayoutProps = {}) {
    this.gap = gap;
  }

  private gap: number;

  measure(elements: SKElement[], width?: number) {
    // measure all children first
    elements.forEach((el) => {
      el.measure();
    });

    // measure the natural single-row width
    const minWidth =
      elements.reduce((acc, el) => acc + el.intrinsicWidth, 0) +
      Math.max(0, elements.length - 1) * this.gap;

    let minHeight = 0;
    if (width === undefined) {
      minHeight = elements.reduce(
        (acc, el) => Math.max(acc, el.intrinsicHeight),
        0,
      );
    } else {
      let x = 0;
      let y = 0;
      let rowHeight = 0;

      elements.forEach((el) => {
        if (x > 0 && x + el.intrinsicWidth > width) {
          y += rowHeight + this.gap;
          x = 0;
          rowHeight = 0;
        }

        rowHeight = Math.max(rowHeight, el.intrinsicHeight);
        x += el.intrinsicWidth + this.gap;
        minHeight = Math.max(minHeight, y + rowHeight);
      });
    }

    // return minimum layout size
    return {
      width: minWidth,
      height: minHeight,
    };
  }

  layout(width: number, height: number, elements: SKElement[]) {
    const newBounds: Size = { width: 0, height: 0 };

    let x = 0;
    let y = 0;
    let rowHeight = 0;

    elements.forEach((el) => {
      // layout the element
      el.layout(el.intrinsicWidth, el.intrinsicHeight);

      if (Settings.layoutWarnings && el.intrinsicWidth > width) {
        console.warn(`element ${el.toString()} horizontal overflow`);
      }

      if (x > 0 && x + el.intrinsicWidth > width) {
        x = 0;
        y += rowHeight + this.gap;
        rowHeight = 0;
      }

      // set the element position
      el.x = x;
      el.y = y;

      // update the row height
      rowHeight = Math.max(rowHeight, el.intrinsicHeight);
      // get x ready for next element
      x += el.intrinsicWidth + this.gap;

      // update bounds that were actually used
      newBounds.width = Math.max(newBounds.width, x - this.gap);
      newBounds.height = Math.max(newBounds.height, y + rowHeight);
    });

    // warn if rows of elements overflow
    if (Settings.layoutWarnings && newBounds.height > height) {
      console.warn(
        `${(newBounds.height - height).toFixed(1)} vertical overflow`,
      );
    }

    return newBounds;
  }
}
