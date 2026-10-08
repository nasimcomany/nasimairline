/** Keep fixed dropdowns fully inside the visible viewport (mobile-safe). */

export type ClampedDropdown = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxHeight: number;
};

type ClampOptions = {
  trigger: DOMRect;
  preferredWidth?: number;
  preferredHeight?: number;
  gap?: number;
  preferAbove?: boolean;
  margin?: number;
};

export function clampDropdownToViewport({
  trigger,
  preferredWidth,
  preferredHeight = 320,
  gap = 8,
  preferAbove = false,
  margin = 8,
}: ClampOptions): ClampedDropdown {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(
    Math.max(trigger.width, preferredWidth ?? trigger.width),
    vw - margin * 2,
  );

  let left = trigger.left;
  if (left + width > vw - margin) left = vw - width - margin;
  if (left < margin) left = margin;

  const spaceAbove = trigger.top - margin;
  const spaceBelow = vh - trigger.bottom - margin;
  const openAbove =
    preferAbove
      ? spaceAbove >= Math.min(preferredHeight, 160) || spaceAbove >= spaceBelow
      : spaceBelow < Math.min(preferredHeight, 200) && spaceAbove > spaceBelow;

  if (openAbove) {
    const maxHeight = Math.max(160, Math.min(preferredHeight, spaceAbove - gap));
    return {
      bottom: vh - trigger.top + gap,
      left,
      width,
      maxHeight,
    };
  }

  const maxHeight = Math.max(160, Math.min(preferredHeight, spaceBelow - gap));
  return {
    top: trigger.bottom + gap,
    left,
    width,
    maxHeight,
  };
}
