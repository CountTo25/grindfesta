import { writable, type Readable } from "svelte/store";

const GLASS_SELECTOR = ".glass_surface, .glass_menu, .glass_card, .glass_control";
const CANVAS_CLASS = "glass_reflection_canvas";
const GLASS_REFLECTIONS_STORAGE_KEY = "grindfesta:glass-reflections";
const GLOW_RADIUS = 112;
const INTERIOR_RADIUS = 72;
const EDGE_WIDTH = 2;
const MAX_PIXEL_RATIO = 1.5;

type GlowHost = Window & {
  __grindfesta_glass_glow_cleanup__?: () => void;
};

type CornerRadii = [number, number, number, number];

type AffineTransform = {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
};

type RoundedRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type GlassTarget = {
  element: HTMLElement;
  bounds: DOMRect | null;
  localRect: RoundedRect | null;
  transform: AffineTransform | null;
  inverseTransform: AffineTransform | null;
  visibleRect: DOMRectReadOnly | null;
  radii: CornerRadii;
  accent: [number, number, number];
  occludesReflection: boolean;
};

type ScrollFadeRegion = {
  rect: DOMRect;
  size: number;
  before: boolean;
  after: boolean;
};

function readGlassReflectionsPreference(): boolean {
  try {
    return localStorage.getItem(GLASS_REFLECTIONS_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

const glassReflectionsPreference = writable(
  readGlassReflectionsPreference(),
  (set) => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== GLASS_REFLECTIONS_STORAGE_KEY) return;
      set(event.newValue !== "off");
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  },
);

export const glassReflectionsEnabled: Readable<boolean> = {
  subscribe: glassReflectionsPreference.subscribe,
};

export function setGlassReflectionsEnabled(enabled: boolean): void {
  glassReflectionsPreference.set(enabled);

  try {
    localStorage.setItem(
      GLASS_REFLECTIONS_STORAGE_KEY,
      enabled ? "on" : "off",
    );
  } catch {
    // The live setting still works if storage is unavailable.
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function nearestPointOnRoundedEdge(
  x: number,
  y: number,
  rect: RoundedRect,
  radii: CornerRadii,
): { x: number; y: number } {
  const radius = clamp(
    Math.max(...radii),
    0,
    Math.min(rect.width, rect.height) / 2,
  );
  const centerX = (rect.left + rect.right) / 2;
  const centerY = (rect.top + rect.bottom) / 2;
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  const innerWidth = halfWidth - radius;
  const innerHeight = halfHeight - radius;
  const relativeX = x - centerX;
  const relativeY = y - centerY;
  const innerX = clamp(relativeX, -innerWidth, innerWidth);
  const innerY = clamp(relativeY, -innerHeight, innerHeight);
  const deltaX = relativeX - innerX;
  const deltaY = relativeY - innerY;
  const cornerDistance = Math.hypot(deltaX, deltaY);

  if (cornerDistance > 0) {
    return {
      x: centerX + innerX + (deltaX / cornerDistance) * radius,
      y: centerY + innerY + (deltaY / cornerDistance) * radius,
    };
  }

  if (halfWidth - Math.abs(relativeX) < halfHeight - Math.abs(relativeY)) {
    return { x: relativeX < 0 ? rect.left : rect.right, y };
  }
  return { x, y: relativeY <= 0 ? rect.top : rect.bottom };
}

function readRadius(value: string): number {
  const radius = Number.parseFloat(value);
  return Number.isFinite(radius) ? radius : 0;
}

function multiplyTransforms(
  outer: AffineTransform,
  inner: AffineTransform,
): AffineTransform {
  return {
    a: outer.a * inner.a + outer.c * inner.b,
    b: outer.b * inner.a + outer.d * inner.b,
    c: outer.a * inner.c + outer.c * inner.d,
    d: outer.b * inner.c + outer.d * inner.d,
    e: outer.a * inner.e + outer.c * inner.f + outer.e,
    f: outer.b * inner.e + outer.d * inner.f + outer.f,
  };
}

function invertTransform(transform: AffineTransform): AffineTransform | null {
  const determinant = transform.a * transform.d - transform.b * transform.c;
  if (Math.abs(determinant) < Number.EPSILON) return null;

  return {
    a: transform.d / determinant,
    b: -transform.b / determinant,
    c: -transform.c / determinant,
    d: transform.a / determinant,
    e: (transform.c * transform.f - transform.d * transform.e) / determinant,
    f: (transform.b * transform.e - transform.a * transform.f) / determinant,
  };
}

function transformPoint(
  transform: AffineTransform,
  x: number,
  y: number,
): { x: number; y: number } {
  return {
    x: transform.a * x + transform.c * y + transform.e,
    y: transform.b * x + transform.d * y + transform.f,
  };
}

function readBorderBoxLength(
  element: HTMLElement,
  style: CSSStyleDeclaration,
  axis: "width" | "height",
): number {
  const length = readRadius(style[axis]);
  if (length <= 0) {
    return axis === "width" ? element.offsetWidth : element.offsetHeight;
  }
  if (style.boxSizing === "border-box") return length;

  const additions = axis === "width"
    ? [
        style.paddingLeft,
        style.paddingRight,
        style.borderLeftWidth,
        style.borderRightWidth,
      ]
    : [
        style.paddingTop,
        style.paddingBottom,
        style.borderTopWidth,
        style.borderBottomWidth,
      ];

  return length + additions.reduce((sum, value) => sum + readRadius(value), 0);
}

function readElementTransform(
  element: HTMLElement,
  bounds: DOMRect,
  style: CSSStyleDeclaration,
): {
  localRect: RoundedRect;
  transform: AffineTransform;
  inverseTransform: AffineTransform | null;
} {
  const width = readBorderBoxLength(element, style, "width");
  const height = readBorderBoxLength(element, style, "height");
  const localRect = {
    left: 0,
    top: 0,
    right: width,
    bottom: height,
    width,
    height,
  };
  let linearTransform: AffineTransform = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0,
  };

  for (
    let current: HTMLElement | null = element;
    current;
    current = current.parentElement
  ) {
    const value = getComputedStyle(current).transform;
    if (value === "none") continue;

    const matrix = new DOMMatrixReadOnly(value);
    linearTransform = multiplyTransforms(
      {
        a: matrix.a,
        b: matrix.b,
        c: matrix.c,
        d: matrix.d,
        e: 0,
        f: 0,
      },
      linearTransform,
    );
  }

  const corners = [
    transformPoint(linearTransform, 0, 0),
    transformPoint(linearTransform, width, 0),
    transformPoint(linearTransform, 0, height),
    transformPoint(linearTransform, width, height),
  ];
  const minimumX = Math.min(...corners.map(({ x }) => x));
  const minimumY = Math.min(...corners.map(({ y }) => y));
  const transform = {
    ...linearTransform,
    e: bounds.left - minimumX,
    f: bounds.top - minimumY,
  };

  return {
    localRect,
    transform,
    inverseTransform: invertTransform(transform),
  };
}

function readAccentColor(style: CSSStyleDeclaration): [number, number, number] {
  const value = style.getPropertyValue("--ui_accent");
  const channels = value.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  return channels?.length === 3
    ? [channels[0], channels[1], channels[2]]
    : [155, 116, 255];
}

function mountGlassEdgeGlow() {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (
    window.matchMedia(
      "(prefers-reduced-transparency: reduce), (prefers-contrast: more)",
    ).matches
  ) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = CANVAS_CLASS;
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);

  const context = canvas.getContext("2d", {
    alpha: true,
  });
  if (!context) {
    canvas.remove();
    return;
  }

  const targets = new Map<HTMLElement, GlassTarget>();
  const visibleTargets = new Set<GlassTarget>();
  const canvasSize = GLOW_RADIUS * 2;
  let pixelRatio = 1;
  let pointerX = 0;
  let pointerY = 0;
  let hasPointer = false;
  let frame: number | null = null;
  let geometryDirty = true;
  let movingGeometryCount = 0;
  const movingGeometryTargets = new Map<EventTarget, number>();
  let renderTargets: GlassTarget[] = [];
  let scrollFadeRegions: ScrollFadeRegion[] = [];

  const resizeCanvas = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    canvas.width = Math.round(canvasSize * pixelRatio);
    canvas.height = Math.round(canvasSize * pixelRatio);
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
  };

  const clearReflection = () => {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
  };

  const cacheGeometry = () => {
    for (const target of visibleTargets) {
      target.bounds = target.element.getBoundingClientRect();
      const style = getComputedStyle(target.element);
      const geometry = readElementTransform(target.element, target.bounds, style);
      target.localRect = geometry.localRect;
      target.transform = geometry.transform;
      target.inverseTransform = geometry.inverseTransform;
      target.accent = readAccentColor(style);
      target.radii = [
        readRadius(style.borderTopLeftRadius),
        readRadius(style.borderTopRightRadius),
        readRadius(style.borderBottomRightRadius),
        readRadius(style.borderBottomLeftRadius),
      ];
    }

    renderTargets = [...visibleTargets].sort(
      (left, right) =>
        Number(left.occludesReflection) - Number(right.occludesReflection),
    );

    scrollFadeRegions = Array.from(
      document.querySelectorAll<HTMLElement>(".glass_scroll_fade"),
    ).map((element) => {
      const style = getComputedStyle(element);
      return {
        rect: element.getBoundingClientRect(),
        size: readRadius(style.getPropertyValue("--scroll-fade-size")) || 32,
        before: element.hasAttribute("data-scroll-before"),
        after: element.hasAttribute("data-scroll-after"),
      };
    });

    geometryDirty = false;
  };

  const eraseScrollFade = (
    region: ScrollFadeRegion,
    originX: number,
    originY: number,
    edge: "before" | "after",
  ) => {
    const left = region.rect.left - originX;
    const top =
      (edge === "before" ? region.rect.top : region.rect.bottom - region.size) -
      originY;
    const gradient = context.createLinearGradient(
      0,
      top,
      0,
      top + region.size,
    );

    if (edge === "before") {
      gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
      gradient.addColorStop(0.48, "rgba(0, 0, 0, 0.62)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    } else {
      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(0.52, "rgba(0, 0, 0, 0.62)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    }

    context.fillStyle = gradient;
    context.fillRect(left, top, region.rect.width, region.size);
  };

  const render = () => {
    frame = null;
    if (geometryDirty) cacheGeometry();
    clearReflection();
    if (!hasPointer) return;

    const originX = pointerX - GLOW_RADIUS;
    const originY = pointerY - GLOW_RADIUS;
    canvas.style.transform = `translate3d(${originX}px, ${originY}px, 0)`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    for (const target of renderTargets) {
      const bounds = target.bounds;
      const localRect = target.localRect;
      const transform = target.transform;
      const inverseTransform = target.inverseTransform;
      if (!bounds || !localRect || !transform || !inverseTransform) continue;
      const visibleRect = target.visibleRect;
      if (!visibleRect) continue;
      const visibleLeft = Math.max(bounds.left, visibleRect.left);
      const visibleTop = Math.max(bounds.top, visibleRect.top);
      const visibleRight = Math.min(
        bounds.right,
        visibleRect.right,
      );
      const visibleBottom = Math.min(
        bounds.bottom,
        visibleRect.bottom,
      );
      if (
        visibleRight <= visibleLeft ||
        visibleBottom <= visibleTop ||
        visibleRight < originX ||
        visibleLeft > originX + canvasSize ||
        visibleBottom < originY ||
        visibleTop > originY + canvasSize
      ) {
        continue;
      }

      context.save();
      context.beginPath();
      context.rect(
        visibleLeft - originX,
        visibleTop - originY,
        visibleRight - visibleLeft,
        visibleBottom - visibleTop,
      );
      context.clip();

      const path = new Path2D();
      path.roundRect(
        EDGE_WIDTH / 2,
        EDGE_WIDTH / 2,
        Math.max(0, localRect.width - EDGE_WIDTH),
        Math.max(0, localRect.height - EDGE_WIDTH),
        target.radii,
      );
      const canvasPath = new Path2D();
      canvasPath.addPath(
        path,
        new DOMMatrix([
          transform.a,
          transform.b,
          transform.c,
          transform.d,
          transform.e - originX,
          transform.f - originY,
        ]),
      );

      if (target.occludesReflection) {
        context.save();
        context.globalCompositeOperation = "destination-out";
        context.fillStyle = "#000";
        context.fill(canvasPath);
        context.restore();
      }

      const localPointer = transformPoint(inverseTransform, pointerX, pointerY);
      const localReflectionPoint = nearestPointOnRoundedEdge(
        localPointer.x,
        localPointer.y,
        localRect,
        target.radii,
      );
      const reflectionPoint = transformPoint(
        transform,
        localReflectionPoint.x,
        localReflectionPoint.y,
      );
      const distance = Math.hypot(
        pointerX - reflectionPoint.x,
        pointerY - reflectionPoint.y,
      );
      const proximity = Math.max(0, 1 - distance / GLOW_RADIUS);
      const strength = proximity * proximity;
      if (strength === 0) {
        context.restore();
        continue;
      }

      const reflectionX = reflectionPoint.x - originX;
      const reflectionY = reflectionPoint.y - originY;
      const [red, green, blue] = target.accent;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const interiorGradient = context.createRadialGradient(
        reflectionX,
        reflectionY,
        0,
        reflectionX,
        reflectionY,
        INTERIOR_RADIUS,
      );
      interiorGradient.addColorStop(
        0,
        `rgba(${red}, ${green}, ${blue}, ${0.06 * strength})`,
      );
      interiorGradient.addColorStop(
        0.44,
        `rgba(${red}, ${green}, ${blue}, ${0.024 * strength})`,
      );
      interiorGradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
      context.fillStyle = interiorGradient;
      context.save();
      context.clip(canvasPath);
      context.fillRect(
        reflectionX - INTERIOR_RADIUS,
        reflectionY - INTERIOR_RADIUS,
        INTERIOR_RADIUS * 2,
        INTERIOR_RADIUS * 2,
      );
      context.restore();

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const edgeGradient = context.createRadialGradient(
        GLOW_RADIUS,
        GLOW_RADIUS,
        0,
        GLOW_RADIUS,
        GLOW_RADIUS,
        GLOW_RADIUS,
      );
      edgeGradient.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0.34)`);
      edgeGradient.addColorStop(
        0.38,
        `rgba(${red}, ${green}, ${blue}, 0.17)`,
      );
      edgeGradient.addColorStop(
        0.72,
        `rgba(${red}, ${green}, ${blue}, 0.055)`,
      );
      edgeGradient.addColorStop(1, `rgba(${red}, ${green}, ${blue}, 0)`);
      context.lineWidth = EDGE_WIDTH;
      context.strokeStyle = edgeGradient;
      context.stroke(canvasPath);
      context.restore();
    }

    context.save();
    context.globalCompositeOperation = "destination-out";
    for (const region of scrollFadeRegions) {
      if (
        region.rect.right < originX ||
        region.rect.left > originX + canvasSize ||
        region.rect.bottom < originY ||
        region.rect.top > originY + canvasSize
      ) {
        continue;
      }

      if (region.before) eraseScrollFade(region, originX, originY, "before");
      if (region.after) eraseScrollFade(region, originX, originY, "after");
    }
    context.restore();

    if (movingGeometryCount > 0) {
      geometryDirty = true;
      scheduleRender();
    }
  };

  const scheduleRender = () => {
    if (frame === null) frame = requestAnimationFrame(render);
  };

  const invalidateGeometry = () => {
    geometryDirty = true;
    scheduleRender();
  };

  const intersectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const target = targets.get(entry.target as HTMLElement);
      if (!target) continue;

      if (entry.isIntersecting) {
        target.visibleRect = entry.intersectionRect;
        visibleTargets.add(target);
      } else {
        target.visibleRect = null;
        visibleTargets.delete(target);
      }
    }

    invalidateGeometry();
  });

  const resizeObserver = new ResizeObserver(invalidateGeometry);

  const refreshElements = () => {
    const currentElements = new Set(
      Array.from(document.querySelectorAll<HTMLElement>(GLASS_SELECTOR)),
    );

    for (const [element, target] of targets) {
      if (currentElements.has(element)) continue;

      visibleTargets.delete(target);
      intersectionObserver.unobserve(element);
      resizeObserver.unobserve(element);
      targets.delete(element);
    }

    for (const element of currentElements) {
      if (targets.has(element)) continue;

      element
        .querySelectorAll(`:scope > .glass_reflection`)
        .forEach((glow) => glow.remove());
      const target: GlassTarget = {
        element,
        bounds: null,
        localRect: null,
        transform: null,
        inverseTransform: null,
        visibleRect: null,
        radii: [0, 0, 0, 0],
        accent: [155, 116, 255],
        occludesReflection: element.matches(
          ".glass_menu, .glass_modal, .bottom_bar_surface",
        ),
      };
      targets.set(element, target);
      intersectionObserver.observe(element);
      resizeObserver.observe(element);
    }

    invalidateGeometry();
  };

  const handlePointerMove = (event: PointerEvent) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    hasPointer = true;
    scheduleRender();
  };

  const affectsGlassGeometry = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    Boolean(
      target.matches(GLASS_SELECTOR) || target.querySelector(GLASS_SELECTOR),
    );

  const isInsideGlassGeometry = (target: EventTarget | null) =>
    target instanceof HTMLElement &&
    Boolean(
      target.matches(GLASS_SELECTOR) ||
        target.closest(GLASS_SELECTOR) ||
        target.querySelector(GLASS_SELECTOR),
    );

  const handlePotentialTransformChange = (event: Event) => {
    if (isInsideGlassGeometry(event.target)) invalidateGeometry();
  };

  const handleGeometryMotionStart = (event: Event) => {
    const motionTarget = event.target;
    if (!motionTarget || !affectsGlassGeometry(motionTarget)) return;
    movingGeometryTargets.set(
      motionTarget,
      (movingGeometryTargets.get(motionTarget) ?? 0) + 1,
    );
    movingGeometryCount += 1;
    invalidateGeometry();
  };

  const handleGeometryMotionEnd = (event: Event) => {
    const motionTarget = event.target;
    if (!motionTarget) return;
    const activeMotionCount = movingGeometryTargets.get(motionTarget) ?? 0;
    if (activeMotionCount === 0) return;
    if (activeMotionCount === 1) {
      movingGeometryTargets.delete(motionTarget);
    } else {
      movingGeometryTargets.set(motionTarget, activeMotionCount - 1);
    }
    movingGeometryCount = Math.max(0, movingGeometryCount - 1);
    invalidateGeometry();
  };

  const handlePointerExit = (event: PointerEvent) => {
    if (event.relatedTarget !== null) return;
    hasPointer = false;
    scheduleRender();
  };

  const handleResize = () => {
    resizeCanvas();
    invalidateGeometry();
  };

  const observer = new MutationObserver((records) => {
    if (records.some((record) => record.type === "childList")) {
      refreshElements();
      return;
    }

    if (
      records.some(
        (record) =>
          record.attributeName?.startsWith("data-scroll-") ||
          affectsGlassGeometry(record.target),
      )
    ) {
      invalidateGeometry();
    }
  });
  const eventController = new AbortController();
  const eventOptions = { passive: true, signal: eventController.signal };

  resizeCanvas();
  refreshElements();
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: [
      "class",
      "style",
      "data-scroll-before",
      "data-scroll-after",
    ],
  });
  window.addEventListener("pointermove", handlePointerMove, eventOptions);
  window.addEventListener("pointerout", handlePointerExit, eventOptions);
  document.addEventListener(
    "pointerover",
    handlePotentialTransformChange,
    eventOptions,
  );
  document.addEventListener(
    "pointerout",
    handlePotentialTransformChange,
    eventOptions,
  );
  document.addEventListener(
    "focusin",
    handlePotentialTransformChange,
    eventOptions,
  );
  document.addEventListener(
    "focusout",
    handlePotentialTransformChange,
    eventOptions,
  );
  document.addEventListener(
    "transitionrun",
    handleGeometryMotionStart,
    eventOptions,
  );
  document.addEventListener(
    "transitionend",
    handleGeometryMotionEnd,
    eventOptions,
  );
  document.addEventListener(
    "transitioncancel",
    handleGeometryMotionEnd,
    eventOptions,
  );
  document.addEventListener(
    "animationstart",
    handleGeometryMotionStart,
    eventOptions,
  );
  document.addEventListener(
    "animationend",
    handleGeometryMotionEnd,
    eventOptions,
  );
  document.addEventListener(
    "animationcancel",
    handleGeometryMotionEnd,
    eventOptions,
  );
  window.addEventListener("resize", handleResize, eventOptions);
  window.addEventListener("scroll", invalidateGeometry, {
    ...eventOptions,
    capture: true,
  });

  const cleanup = () => {
    observer.disconnect();
    intersectionObserver.disconnect();
    resizeObserver.disconnect();
    if (frame !== null) cancelAnimationFrame(frame);
    eventController.abort();
    canvas.remove();
  };

  return cleanup;
}

export function initGlassEdgeGlow() {
  const glowHost = window as GlowHost;
  glowHost.__grindfesta_glass_glow_cleanup__?.();

  let teardown: (() => void) | undefined;
  const unsubscribe = glassReflectionsEnabled.subscribe((enabled) => {
    teardown?.();
    teardown = enabled ? mountGlassEdgeGlow() : undefined;
  });

  const cleanup = () => {
    unsubscribe();
    teardown?.();
    teardown = undefined;

    if (glowHost.__grindfesta_glass_glow_cleanup__ === cleanup) {
      delete glowHost.__grindfesta_glass_glow_cleanup__;
    }
  };

  glowHost.__grindfesta_glass_glow_cleanup__ = cleanup;
  return cleanup;
}
