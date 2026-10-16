import React from 'react';

export interface PopoverPosition {
  style: React.CSSProperties;
  placeAbove: boolean;
  maxAvailableHeight: number;
}

/**
 * Calculates smart viewport-aware positioning for floating popovers.
 * Automatically flips above the anchor when near the bottom of the screen
 * and dynamically clamps maxHeight so it never overflows the viewport.
 */
export function calculatePopoverPosition(
  anchorRect: DOMRect | null,
  popoverWidth = 260,
  preferredMaxHeight = 360
): PopoverPosition {
  if (!anchorRect) {
    return {
      style: {
        position: 'fixed',
        top: '100px',
        left: '100px',
        width: `${popoverWidth}px`,
        maxHeight: `${preferredMaxHeight}px`,
      },
      placeAbove: false,
      maxAvailableHeight: preferredMaxHeight,
    };
  }

  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  const spaceBelow = viewportHeight - anchorRect.bottom - 10;
  const spaceAbove = anchorRect.top - 10;

  // If space below is constrained (< 280px) and there is more space above, flip ABOVE
  const placeAbove = spaceBelow < 280 && spaceAbove > spaceBelow;

  const maxAvailableHeight = placeAbove
    ? Math.min(preferredMaxHeight, Math.max(140, spaceAbove))
    : Math.min(preferredMaxHeight, Math.max(140, spaceBelow));

  const left = Math.max(8, Math.min(anchorRect.left, viewportWidth - popoverWidth - 12));

  if (placeAbove) {
    return {
      style: {
        position: 'fixed',
        bottom: `${viewportHeight - anchorRect.top + 4}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
        maxHeight: `${maxAvailableHeight}px`,
      },
      placeAbove: true,
      maxAvailableHeight,
    };
  }

  return {
    style: {
      position: 'fixed',
      top: `${anchorRect.bottom + 4}px`,
      left: `${left}px`,
      width: `${popoverWidth}px`,
      maxHeight: `${maxAvailableHeight}px`,
    },
    placeAbove: false,
    maxAvailableHeight,
  };
}
