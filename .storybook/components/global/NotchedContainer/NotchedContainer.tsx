import React, { useRef, useState, useEffect } from "react";
import "./NotchedContainer.scss";

interface NotchedContainerProps {
  /** Content to display in the header/title area */
  title: React.ReactNode;
  /** Corner radius for the container (default: 8px) */
  radius?: number;
  /** Width of the container's border (default: 1px) */
  borderWidth?: number;
  /** Depth of the notch cut (default: 20px) */
  notchDepth?: number;
  /** Content to render inside the collapsible area */
  children: React.ReactNode;
  /** Additional CSS classes to apply to the container */
  className?: string;
  /** Whether the container is collapsed */
  isCollapsed?: boolean;
  /** Position of the notched corner */
  notchPosition?: "topRight" | "topLeft" | "bottomLeft" | "bottomRight";
}

/**
 * NotchedContainer - A collapsible container with a distinctive notched corner design
 *
 * This component creates a container with the following key features:
 * 1. A notched corner that can be positioned in any of the four corners
 * 2. Smooth expand/collapse animation with proper content transitions
 * 3. Consistent border width in both expanded and collapsed states
 * 4. Accessible expand/collapse interaction with proper ARIA attributes
 *
 * Visual Structure:
 * - Uses two layers with CSS clip-path for the design:
 *   1. Outer layer (border): Black background clipped to the outer path
 *   2. Inner layer (content): White background clipped to the inner path
 *
 * Layout System:
 * - Flexbox-based layout adapts to notch position
 * - Title position changes based on notch location
 * - Content area expands/collapses with smooth animation
 *
 * Key Calculations:
 * - Dynamic path generation based on container dimensions
 * - Precise border width maintained through path insets
 * - Title height influences notch dimensions
 *
 * Accessibility:
 * - Keyboard navigation support
 * - Proper ARIA attributes for expand/collapse
 * - Focus management for collapsed content
 *
 * @example
 * ```tsx
 * <NotchedContainer
 *   title="Section Title"
 *   notchPosition="topRight"
 *   isCollapsed={false}
 * >
 *   <div>Content goes here</div>
 * </NotchedContainer>
 * ```
 */
export const NotchedContainer: React.FC<NotchedContainerProps> = ({
  title,
  radius = 8,
  borderWidth = 1,
  notchDepth = 20, // NOTE: Using to big or to small value will break the notch shape
  children,
  className = "",
  isCollapsed = false,
  notchPosition = "topRight",
}) => {
  // Refs for size monitoring
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  // State management
  const [titleHeight, setTitleHeight] = useState(0);
  // visuallyCollapsed syncs clip-path animation with content transition
  const [visuallyCollapsed, setVisuallyCollapsed] = useState(isCollapsed);
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  // Notch position flags for easier reference
  const isTopLeftNotch = notchPosition === "topLeft";
  const isBottomLeftNotch = notchPosition === "bottomLeft";
  const isBottomRightNotch = notchPosition === "bottomRight";
  // If none of the above, defaults to topRight

  // Standard notch measurements
  const NOTCH_DEPTH = notchDepth;
  // Ensure minimum curve offset while maintaining proportions for larger depths
  const MIN_CURVE_OFFSET = 6; // Minimum offset to maintain 90-degree angle
  const NOTCH_CURVE_OFFSET = Math.max(
    MIN_CURVE_OFFSET,
    Math.round(NOTCH_DEPTH * 0.3)
  ); // Never go below minimum offset
  const NOTCH_CURVE_WIDTH = NOTCH_CURVE_OFFSET * 2; // Full width of the notch curve

  /**
   * Generates SVG path data for container clipping
   *
   * The path creation process:
   * 1. Calculates adjusted dimensions based on inset (for border)
   * 2. Computes corner radii and notch measurements
   * 3. Generates different paths for:
   *    - Collapsed vs expanded states
   *    - Different notch positions
   *
   * Path Structure:
   * - Uses absolute/relative moves (M/m)
   * - Horizontal/vertical lines (H/V)
   * - Arc commands (A) for rounded corners
   * - Quadratic curves (Q) for notch shaping
   *
   * @param w - Container width
   * @param h - Container height
   * @param r - Corner radius
   * @param notchDepth - How far the notch cuts into the container
   * @param notchHeight - Height of the notch area
   * @param inset - Inward offset for creating border effect
   */
  const computePath = ({
    w,
    h,
    r,
    notchDepth,
    notchHeight,
    inset,
  }: {
    w: number;
    h: number;
    r: number;
    notchDepth: number;
    notchHeight: number;
    inset: number;
  }): string => {
    // Adjust measurements for inset (border)
    const i = inset;
    const r2 = Math.max(r - i, 0);
    const d = notchDepth - i;
    const nh = notchHeight - i;

    // Base coordinates
    const x0 = i;
    const y0 = i;
    const w2 = w - i;
    const h2 = h - i;

    // Notch positioning
    let notchStartX = w2 - d;
    const notchBottomY = y0 + nh;

    // Collapsed state uses simplified shapes
    if (isCollapsed) {
      notchStartX += inset;
      if (isBottomLeftNotch || isTopLeftNotch) {
        // Left-side notch in collapsed state
        // Creates a rounded rectangle with consistent border
        const bottomLeftNotchStartX = x0 + d - NOTCH_CURVE_OFFSET;
        return [
          `M${x0 + r2},${y0}`, // Start at top-left + radius
          `H${w2 - r2}`, // Top edge
          `A${r2},${r2} 0 0 1 ${w2},${y0 + r2}`, // Top-right corner
          `V${h2 - r2}`, // Right edge
          `A${r2},${r2} 0 0 1 ${w2 - r2},${h2}`, // Bottom-right corner
          `H${bottomLeftNotchStartX + r2}`, // Bottom edge
          `A${r2},${r2} 0 0 1 ${bottomLeftNotchStartX},${h2 - r2}`, // Notch corner
          `V${y0 + r2}`, // Left edge
          `A${r2},${r2} 0 0 1 ${bottomLeftNotchStartX + r2},${y0}`, // Top-left corner
          `Z`, // Close path
        ].join(" ");
      } else {
        // Right-side notch in collapsed state
        return [
          `M${x0 + r2},${y0}`, // Start at top-left + radius
          `H${notchStartX}`, // Top edge to notch
          `A${r2},${r2} 0 0 1 ${notchStartX + r2},${y0 + r2}`, // Notch corner
          `V${h2 - r2}`, // Right edge
          `A${r2},${r2} 0 0 1 ${notchStartX},${h2}`, // Bottom-right corner
          `H${x0 + r2}`, // Bottom edge
          `A${r2},${r2} 0 0 1 ${x0},${h2 - r2}`, // Bottom-left corner
          `V${y0 + r2}`, // Left edge
          `A${r2},${r2} 0 0 1 ${x0 + r2},${y0}`, // Top-left corner
          `Z`, // Close path
        ].join(" ");
      }
    }

    // Expanded state paths with full notch shapes
    if (isBottomLeftNotch) {
      // Bottom-left notch with curved corners
      return [
        `M${x0 + r2},${y0}`, // Start at top-left + radius
        `H${w2 - r2}`, // Top edge
        `A${r2},${r2} 0 0 1 ${w2},${y0 + r2}`, // Top-right corner
        `V${h2 - r2}`, // Right edge
        `A${r2},${r2} 0 0 1 ${w2 - r2},${h2}`, // Bottom-right corner
        `H${x0 + d}`, // Bottom edge to notch
        `Q${x0 + d - NOTCH_CURVE_OFFSET},${h2} ${x0 + d - NOTCH_CURVE_OFFSET},${h2 - NOTCH_CURVE_OFFSET}`, // Notch curve start
        `V${h2 - nh + NOTCH_CURVE_OFFSET}`, // Notch vertical edge
        `Q${x0 + d - NOTCH_CURVE_OFFSET},${h2 - nh} ${x0 + d - NOTCH_CURVE_WIDTH},${h2 - nh}`, // Notch curve end
        `H${x0 + r2}`, // Continue to left edge
        `A${r2},${r2} 0 0 1 ${x0},${h2 - nh - r2}`, // Corner radius
        `V${y0 + r2}`, // Left edge
        `A${r2},${r2} 0 0 1 ${x0 + r2},${y0}`, // Top-left corner
        `Z`, // Close path
      ].join(" ");
    } else if (isBottomRightNotch) {
      // Bottom-right notch (mirrors bottom-left)
      return [
        `M${x0 + r2},${y0}`, // Start at top-left + radius
        `H${w2 - r2}`, // Top edge
        `A${r2},${r2} 0 0 1 ${w2},${y0 + r2}`, // Top-right corner
        `V${h2 - nh - r2}`, // Right edge to notch
        `A${r2},${r2} 0 0 1 ${w2 - r2},${h2 - nh}`, // Notch top corner
        `H${w2 - d + NOTCH_CURVE_WIDTH}`, // Notch top edge
        `Q${w2 - d + NOTCH_CURVE_OFFSET},${h2 - nh} ${w2 - d + NOTCH_CURVE_OFFSET},${h2 - nh + NOTCH_CURVE_OFFSET}`, // Notch curve start
        `V${h2 - NOTCH_CURVE_OFFSET}`, // Notch vertical edge
        `Q${w2 - d + NOTCH_CURVE_OFFSET},${h2} ${w2 - d},${h2}`, // Notch curve end
        `H${x0 + r2}`, // Bottom edge
        `A${r2},${r2} 0 0 1 ${x0},${h2 - r2}`, // Bottom-left corner
        `V${y0 + r2}`, // Left edge
        `A${r2},${r2} 0 0 1 ${x0 + r2},${y0}`, // Top-left corner
        `Z`, // Close path
      ].join(" ");
    } else if (isTopLeftNotch) {
      // Top-left notch with curved corners
      return [
        `M${x0 + r2},${y0}`, // Start at top-left + radius
        `H${w2 - r2}`, // Top edge
        `A${r2},${r2} 0 0 1 ${w2},${y0 + r2}`, // Top-right corner
        `V${h2 - r2}`, // Right edge
        `A${r2},${r2} 0 0 1 ${w2 - r2},${h2}`, // Bottom-right corner
        `H${x0 + r2}`, // Bottom edge
        `A${r2},${r2} 0 0 1 ${x0},${h2 - r2}`, // Bottom-left corner
        `V${y0 + nh + r2}`, // Left edge to notch
        `A${r2},${r2} 0 0 1 ${x0 + r2},${y0 + nh}`, // Notch corner
        `H${x0 + d - NOTCH_CURVE_WIDTH}`, // Notch bottom edge
        `Q${x0 + d - NOTCH_CURVE_OFFSET},${y0 + nh} ${x0 + d - NOTCH_CURVE_OFFSET},${y0 + nh - NOTCH_CURVE_OFFSET}`, // Notch curve start
        `V${y0 + NOTCH_CURVE_OFFSET}`, // Notch vertical edge
        `Q${x0 + d - NOTCH_CURVE_OFFSET},${y0} ${x0 + d},${y0}`, // Notch curve end
        `H${x0 + r2}`, // Continue to start
        `Z`, // Close path
      ].join(" ");
    } else {
      // Top-right notch (default)
      return [
        `M${x0 + r2},${y0}`, // Start at top-left + radius
        `H${notchStartX}`, // Top edge to notch
        `Q${notchStartX + NOTCH_CURVE_OFFSET},${y0} ${notchStartX + NOTCH_CURVE_OFFSET},${y0 + NOTCH_CURVE_OFFSET}`, // Notch curve start
        `V${notchBottomY - NOTCH_CURVE_OFFSET}`, // Notch vertical edge
        `Q${notchStartX + NOTCH_CURVE_OFFSET},${notchBottomY} ${notchStartX + NOTCH_CURVE_WIDTH},${notchBottomY}`, // Notch curve end
        `H${w2 - r2}`, // Continue top edge
        `A${r2},${r2} 0 0 1 ${w2},${notchBottomY + r2}`, // Top-right corner
        `V${h2 - r2}`, // Right edge
        `A${r2},${r2} 0 0 1 ${w2 - r2},${h2}`, // Bottom-right corner
        `H${x0 + r2}`, // Bottom edge
        `A${r2},${r2} 0 0 1 ${x0},${h2 - r2}`, // Bottom-left corner
        `V${y0 + r2}`, // Left edge
        `A${r2},${r2} 0 0 1 ${x0 + r2},${y0}`, // Top-left corner
        `Z`, // Close path
      ].join(" ");
    }
  };

  // Generate outer path (border edge)
  const outerPath = computePath({
    w: containerSize.width,
    h: visuallyCollapsed ? titleHeight : containerSize.height,
    r: radius,
    notchDepth: NOTCH_DEPTH,
    notchHeight: titleHeight,
    inset: 0, // No inset for outer path
  });

  // Generate inner path (content area)
  const innerPath = computePath({
    w: containerSize.width,
    h: visuallyCollapsed ? titleHeight : containerSize.height,
    r: radius,
    notchDepth: NOTCH_DEPTH + borderWidth, // Adjust notch for border
    notchHeight: titleHeight + borderWidth, // Adjust height for border
    inset: borderWidth, // Inset by border width
  });

  // Create clip-path properties
  const outerClipPath = `path("${outerPath}")`;
  const innerClipPath = `path("${innerPath}")`;

  /**
   * Size monitoring effect
   * Uses ResizeObserver to track:
   * 1. Title height changes (affects notch dimensions)
   * 2. Container size changes (affects overall clipping)
   */
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.target === titleRef.current) {
          // Update title height including padding
          if (titleRef.current) {
            const computedStyle = window.getComputedStyle(titleRef.current);
            const paddingTop = parseFloat(computedStyle.paddingTop);
            const paddingBottom = parseFloat(computedStyle.paddingBottom);
            const fullHeight =
              entry.contentRect.height + paddingTop + paddingBottom;
            setTitleHeight(fullHeight);
          }
        }
        if (entry.target === containerRef.current) {
          // Update container dimensions
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });

    // Start observing size changes
    if (titleRef.current) resizeObserver.observe(titleRef.current);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Initial measurements
    if (titleRef.current) {
      const computedStyle = window.getComputedStyle(titleRef.current);
      const paddingTop = parseFloat(computedStyle.paddingTop);
      const paddingBottom = parseFloat(computedStyle.paddingBottom);
      const clientHeight = titleRef.current.getBoundingClientRect().height;
      setTitleHeight(clientHeight + paddingTop + paddingBottom);
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Update container size after collapse animation
  useEffect(() => {
    if (containerRef.current) {
      setTimeout(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setContainerSize({ width: rect.width, height: rect.height });
        }
      }, 300); // Matches CSS transition duration
    }
  }, [isCollapsed]);

  // Sync visual collapse state with prop
  useEffect(() => {
    setVisuallyCollapsed(isCollapsed);
  }, [isCollapsed]);

  return (
    <section
      ref={containerRef}
      className={`notched-container w-100 ${className} ${isCollapsed ? "collapsed" : ""}`}>
      {/* Border layer - creates the black border effect */}
      <div className="notched-bg-layer" style={{ clipPath: outerClipPath }} />

      {/* Content layer - contains title and collapsible content */}
      <div
        className="notched-content-layer d-flex flex-column"
        style={{
          clipPath: innerClipPath,
          flexDirection:
            isBottomLeftNotch || isBottomRightNotch
              ? "column"
              : "column-reverse",
        }}>
        {/* Title area - always visible */}
        <header
          ref={titleRef}
          className={`notched-title fw-bold ${
            isBottomLeftNotch || isTopLeftNotch
              ? "align-self-end"
              : "align-self-start"
          }`}
          aria-expanded={!isCollapsed}
          aria-controls="notched-content"
          style={{
            visibility: "visible",
            position: "relative",
            zIndex: 5,
            order: isBottomLeftNotch || isBottomRightNotch ? 1 : 0,
            width: `calc(100% - ${notchDepth}px)`,
          }}>
          <div className="title-content d-flex align-items-center justify-content-between m-0 p-0">
            {title}
          </div>
        </header>

        {/* Collapsible content area */}
        <article
          data-testid="notched-content"
          className={`notched-content overflow-hidden flex-grow-1 ${
            isCollapsed ? "collapsed" : "p-0"
          }`}
          aria-hidden={isCollapsed}
          tabIndex={isCollapsed ? -1 : undefined}>
          {children}
        </article>
      </div>
    </section>
  );
};

export default NotchedContainer;
