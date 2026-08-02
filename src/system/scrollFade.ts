const EDGE_THRESHOLD = 1;

export function scrollFade(node: HTMLElement) {
  const fadeFrame = node.parentElement;
  if (!fadeFrame) return;

  let frame: number | null = null;

  const update = () => {
    frame = null;
    const maxScroll = Math.max(0, node.scrollHeight - node.clientHeight);
    const canScroll = maxScroll > EDGE_THRESHOLD;

    fadeFrame.toggleAttribute(
      "data-scroll-before",
      canScroll && node.scrollTop > EDGE_THRESHOLD,
    );
    fadeFrame.toggleAttribute(
      "data-scroll-after",
      canScroll && node.scrollTop < maxScroll - EDGE_THRESHOLD,
    );
  };

  const scheduleUpdate = () => {
    if (frame === null) frame = requestAnimationFrame(update);
  };

  const resizeObserver = new ResizeObserver(scheduleUpdate);
  const mutationObserver = new MutationObserver(scheduleUpdate);

  fadeFrame.classList.add("glass_scroll_fade");
  node.addEventListener("scroll", scheduleUpdate, { passive: true });
  resizeObserver.observe(node);
  mutationObserver.observe(node, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  scheduleUpdate();

  return {
    destroy() {
      node.removeEventListener("scroll", scheduleUpdate);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
      fadeFrame.classList.remove("glass_scroll_fade");
      fadeFrame.removeAttribute("data-scroll-before");
      fadeFrame.removeAttribute("data-scroll-after");
    },
  };
}
