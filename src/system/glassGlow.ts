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

type GlassTarget = {
  element: HTMLElement;
  rect: DOMRect | null;
  radii: CornerRadii;
  accent: [number, number, number];
  occludesReflection: boolean;
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
  rect: DOMRect,
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
    desynchronized: true,
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
      target.rect = target.element.getBoundingClientRect();
      const style = getComputedStyle(target.element);
      target.accent = readAccentColor(style);
      target.radii = [
        readRadius(style.borderTopLeftRadius),
        readRadius(style.borderTopRightRadius),
        readRadius(style.borderBottomRightRadius),
        readRadius(style.borderBottomLeftRadius),
      ];
    }

    geometryDirty = false;
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
    context.lineWidth = EDGE_WIDTH;

    for (const target of visibleTargets) {
      const rect = target.rect;
      if (!rect) continue;
      if (
        rect.right < originX ||
        rect.left > originX + canvasSize ||
        rect.bottom < originY ||
        rect.top > originY + canvasSize
      ) {
        continue;
      }

      const pathX = rect.left - originX + EDGE_WIDTH / 2;
      const pathY = rect.top - originY + EDGE_WIDTH / 2;
      const pathWidth = Math.max(0, rect.width - EDGE_WIDTH);
      const pathHeight = Math.max(0, rect.height - EDGE_WIDTH);

      context.beginPath();
      context.roundRect(pathX, pathY, pathWidth, pathHeight, target.radii);

      if (target.occludesReflection) {
        context.save();
        context.globalCompositeOperation = "destination-out";
        context.fillStyle = "#000";
        context.fill();
        context.restore();
      }

      const reflectionPoint = nearestPointOnRoundedEdge(
        pointerX,
        pointerY,
        rect,
        target.radii,
      );
      const distance = Math.hypot(
        pointerX - reflectionPoint.x,
        pointerY - reflectionPoint.y,
      );
      const proximity = Math.max(0, 1 - distance / GLOW_RADIUS);
      const strength = proximity * proximity;
      if (strength === 0) continue;

      const reflectionX = reflectionPoint.x - originX;
      const reflectionY = reflectionPoint.y - originY;
      const [red, green, blue] = target.accent;

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
      context.clip();
      context.fillRect(
        reflectionX - INTERIOR_RADIUS,
        reflectionY - INTERIOR_RADIUS,
        INTERIOR_RADIUS * 2,
        INTERIOR_RADIUS * 2,
      );
      context.restore();

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
      context.strokeStyle = edgeGradient;
      context.stroke();
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

      if (entry.isIntersecting) visibleTargets.add(target);
      else visibleTargets.delete(target);
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
        rect: null,
        radii: [0, 0, 0, 0],
        accent: [155, 116, 255],
        occludesReflection: element.matches(".glass_menu, .glass_modal"),
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

  const handlePointerExit = (event: PointerEvent) => {
    if (event.relatedTarget !== null) return;
    hasPointer = false;
    scheduleRender();
  };

  const handleResize = () => {
    resizeCanvas();
    invalidateGeometry();
  };

  const observer = new MutationObserver(refreshElements);
  const eventController = new AbortController();
  const eventOptions = { passive: true, signal: eventController.signal };

  resizeCanvas();
  refreshElements();
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("pointermove", handlePointerMove, eventOptions);
  window.addEventListener("pointerout", handlePointerExit, eventOptions);
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
