<script lang="ts">
  import { onMount, onDestroy } from "svelte";

  export let percent: number = 0; // 0–100

  const blockSize = 3;
  const rows = 2;
  const canvasHeight = blockSize * rows;

  let canvas: HTMLCanvasElement;
  let container: HTMLDivElement;
  let canvasWidth = 0;

  let totalBlocks = 0;
  let targetBlocks = 0;
  let animationFrame: number;
  let opacityMap: number[] = [];

  let resizeObserver: ResizeObserver;

  onMount(() => {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvasWidth = entry.contentRect.width;
        updateLayout();
        draw();
      }
    });
    if (container) resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  });

  // Update layout and targets when percent changes

  function updateLayout() {
    const cols = Math.floor(canvasWidth / blockSize);
    totalBlocks = cols * rows;

    // Calculate how many blocks should be visible based on percent
    const newTarget = Math.floor((percent / 100) * totalBlocks);
    if (newTarget > targetBlocks) {
      targetBlocks = newTarget;
      animateBlocks();
    } else if (newTarget < targetBlocks) {
      // Reset and reanimate if going backwards
      targetBlocks = newTarget;
      opacityMap = opacityMap.slice(0, targetBlocks);
      draw();
    }
  }

  function animateBlocks() {
    opacityMap.length = targetBlocks; // Resize array if needed
    for (let i = 0; i < targetBlocks; i++) {
      if (opacityMap[i] === undefined) {
        opacityMap[i] = 0; // Initialize new block
      }
    }
    function step() {
      let needsRedraw = false;
      for (let i = 0; i < targetBlocks; i++) {
        if (opacityMap[i] < 1) {
          opacityMap[i] += 0.05;
          if (opacityMap[i] > 1) opacityMap[i] = 1;
          needsRedraw = true;
        }
      }
      if (needsRedraw) {
        draw();
        animationFrame = requestAnimationFrame(step);
      }
    }
    animationFrame = requestAnimationFrame(step);
  }

  $: percent && updateLayout();
  $: canvasWidth && updateLayout();

  function draw() {
    if (!canvas || !canvasWidth) return;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < targetBlocks; i++) {
      const col = Math.floor(i / rows);
      const row = i % rows;
      const x = col * blockSize;
      const y = row * blockSize;
      const alpha = opacityMap[i] ?? 0;
      ctx.fillStyle = `rgba(148, 163, 184, ${alpha.toFixed(2)})`;
      ctx.fillRect(x, y, blockSize, blockSize);
    }
  }
</script>

<div class="wrapper" bind:this={container}>
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .wrapper {
    width: 100%;
  }

  canvas {
    display: block;
  }
</style>
