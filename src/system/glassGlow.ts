const GLASS_SELECTOR = ".glass_surface, .glass_menu, .glass_card, .glass_control";
const MAX_EDGE_DISTANCE = 220;
const INTERIOR_GLOW_RATE = 1 / 8;
const INTERIOR_GLOW_CUTOFF = 0.008;

type GlowHost = Window & {
  __grindfesta_glass_glow_cleanup__?: () => void;
};

type GlassTarget = {
  element: HTMLElement;
  rect: DOMRect | null;
  radius: number;
  active: boolean;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.max(minimum, Math.min(maximum, value));
}

function nearestPointOnRoundedEdge(
  x: number,
  y: number,
  rect: DOMRect,
  radius: number,
): { x: number; y: number } {
  const cornerRadius = clamp(radius, 0, Math.min(rect.width, rect.height) / 2);
  const centerX = (rect.left + rect.right) / 2;
  const centerY = (rect.top + rect.bottom) / 2;
  const halfWidth = rect.width / 2;
  const halfHeight = rect.height / 2;
  const innerWidth = halfWidth - cornerRadius;
  const innerHeight = halfHeight - cornerRadius;
  const relativeX = x - centerX;
  const relativeY = y - centerY;
  const innerX = clamp(relativeX, -innerWidth, innerWidth);
  const innerY = clamp(relativeY, -innerHeight, innerHeight);
  const deltaX = relativeX - innerX;
  const deltaY = relativeY - innerY;
  const cornerDistance = Math.hypot(deltaX, deltaY);

  if (cornerDistance > 0) {
    return {
      x: centerX + innerX + (deltaX / cornerDistance) * cornerRadius,
      y: centerY + innerY + (deltaY / cornerDistance) * cornerRadius,
    };
  }

  if (halfWidth - Math.abs(relativeX) < halfHeight - Math.abs(relativeY)) {
    return { x: relativeX < 0 ? rect.left : rect.right, y };
  }
  return { x, y: relativeY <= 0 ? rect.top : rect.bottom };
}

function clearGlow(target: GlassTarget) {
  if (!target.active) return;

  target.element.style.setProperty("--glass-glow-alpha", "0");
  target.element.style.setProperty("--glass-glow-interior-alpha", "0");
  target.active = false;
}

export function initGlassEdgeGlow() {
  const glowHost = window as GlowHost;
  glowHost.__grindfesta_glass_glow_cleanup__?.();

  if (!window.matchMedia("(pointer: fine)").matches) return;

  const targets = new Map<HTMLElement, GlassTarget>();
  const visibleTargets = new Set<GlassTarget>();
  let pointerX = -MAX_EDGE_DISTANCE;
  let pointerY = -MAX_EDGE_DISTANCE;
  let frame: number | null = null;
  let rectsDirty = true;
  let radiiDirty = true;

  const render = () => {
    frame = null;

    for (const target of visibleTargets) {
      if (rectsDirty) target.rect = target.element.getBoundingClientRect();
      if (radiiDirty) {
        const radius = getComputedStyle(target.element).borderTopLeftRadius;
        target.radius = Number.parseFloat(radius) || 0;
      }
      const rect = target.rect;
      if (!rect) continue;

      if (
        pointerX < rect.left - MAX_EDGE_DISTANCE ||
        pointerX > rect.right + MAX_EDGE_DISTANCE ||
        pointerY < rect.top - MAX_EDGE_DISTANCE ||
        pointerY > rect.bottom + MAX_EDGE_DISTANCE
      ) {
        clearGlow(target);
        continue;
      }

      const refractionPoint = nearestPointOnRoundedEdge(
        pointerX,
        pointerY,
        rect,
        target.radius,
      );
      const distance = Math.hypot(
        pointerX - refractionPoint.x,
        pointerY - refractionPoint.y,
      );
      const proximity = Math.max(0, 1 - distance / MAX_EDGE_DISTANCE);
      const strength = proximity * proximity * 0.58;
      const interiorStrength = strength * INTERIOR_GLOW_RATE;
      const visibleInteriorStrength =
        interiorStrength >= INTERIOR_GLOW_CUTOFF ? interiorStrength : 0;

      if (strength === 0) {
        clearGlow(target);
        continue;
      }

      const style = target.element.style;
      style.setProperty("--glass-glow-x", `${pointerX - rect.left}px`);
      style.setProperty("--glass-glow-y", `${pointerY - rect.top}px`);
      style.setProperty("--glass-glow-alpha", strength.toFixed(3));
      style.setProperty(
        "--glass-glow-interior-x",
        `${refractionPoint.x - rect.left}px`,
      );
      style.setProperty(
        "--glass-glow-interior-y",
        `${refractionPoint.y - rect.top}px`,
      );
      style.setProperty(
        "--glass-glow-interior-alpha",
        visibleInteriorStrength.toFixed(3),
      );
      target.active = true;
    }

    rectsDirty = false;
    radiiDirty = false;
  };

  const scheduleRender = () => {
    if (frame === null) frame = requestAnimationFrame(render);
  };

  const invalidateGeometry = (includeRadii = false) => {
    rectsDirty = true;
    if (includeRadii) radiiDirty = true;
    scheduleRender();
  };

  const intersectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const target = targets.get(entry.target as HTMLElement);
      if (!target) continue;

      if (entry.isIntersecting) {
        rectsDirty = true;
        radiiDirty = true;
        visibleTargets.add(target);
      } else {
        visibleTargets.delete(target);
        clearGlow(target);
      }
    }

    scheduleRender();
  });

  const resizeObserver = new ResizeObserver(() => invalidateGeometry(true));
  const targetObservers = [intersectionObserver, resizeObserver];

  const refreshElements = () => {
    const currentElements = new Set(
      document.querySelectorAll<HTMLElement>(GLASS_SELECTOR),
    );

    for (const [element, target] of targets) {
      if (currentElements.has(element)) continue;

      clearGlow(target);
      visibleTargets.delete(target);
      for (const observer of targetObservers) observer.unobserve(element);
      targets.delete(element);
    }

    for (const element of currentElements) {
      if (targets.has(element)) continue;

      const target: GlassTarget = {
        element,
        rect: null,
        radius: 0,
        active: false,
      };
      targets.set(element, target);
      for (const observer of targetObservers) observer.observe(element);
    }

    invalidateGeometry();
  };

  const handlePointerMove = (event: PointerEvent) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    scheduleRender();
  };

  const handlePointerExit = (event: PointerEvent) => {
    if (event.relatedTarget !== null) return;
    visibleTargets.forEach(clearGlow);
  };

  const handleResize = () => invalidateGeometry(true);
  const handleScroll = () => invalidateGeometry();

  const observer = new MutationObserver(refreshElements);
  const eventController = new AbortController();
  const eventOptions = { passive: true, signal: eventController.signal };

  refreshElements();
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("pointermove", handlePointerMove, eventOptions);
  window.addEventListener("pointerout", handlePointerExit, eventOptions);
  window.addEventListener("resize", handleResize, eventOptions);
  window.addEventListener("scroll", handleScroll, {
    ...eventOptions,
    capture: true,
  });

  const cleanup = () => {
    observer.disconnect();
    for (const targetObserver of targetObservers) targetObserver.disconnect();
    for (const target of targets.values()) clearGlow(target);
    if (frame !== null) cancelAnimationFrame(frame);
    eventController.abort();
  };

  glowHost.__grindfesta_glass_glow_cleanup__ = cleanup;
  return cleanup;
}
