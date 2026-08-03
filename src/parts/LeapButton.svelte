<script context="module" lang="ts">
  let nextLeapButtonId = 0;
</script>

<script lang="ts">
  export let accentColors: readonly string[];
  export let className = "";

  const GRADIENT_DURATION_SECONDS = 12;
  const GRADIENT_SAMPLE_COUNT = 96;
  const GRADIENT_SAMPLES = Array.from(
    { length: GRADIENT_SAMPLE_COUNT },
    (_, index) => index,
  );
  const GRADIENT_SEGMENT_LENGTH = (100 / GRADIENT_SAMPLE_COUNT) * 1.015;
  const bloomFilterId = `leap-edge-bloom-${nextLeapButtonId++}`;

  function formatGradientColor(color: string) {
    return color === "transparent" ? color : `rgb(${color})`;
  }

  function getGradientSampleColor(sampleIndex: number) {
    const stops = ["transparent", ...accentColors];
    const stopPosition = (sampleIndex / GRADIENT_SAMPLE_COUNT) * stops.length;
    const fromIndex = Math.floor(stopPosition) % stops.length;
    const toIndex = (fromIndex + 1) % stops.length;
    const blend = stopPosition - Math.floor(stopPosition);

    return `color-mix(in srgb, ${formatGradientColor(stops[fromIndex])} ${(1 - blend) * 100}%, ${formatGradientColor(stops[toIndex])} ${blend * 100}%)`;
  }

  $: primaryAccent = accentColors[0] ?? "var(--ui_accent)";
</script>

<button
  type="button"
  class="glass_control leap_control {className}"
  style={`--leap-color-1: ${primaryAccent}; --leap-gradient-duration: ${GRADIENT_DURATION_SECONDS}s`}
  on:click
>
  <!-- Fucking hell! Sorry for making you read this (why are you reading this?) -->
  <svg
    class="leap_edge_gradient"
    aria-hidden="true"
    style={`--leap-sample-length: ${GRADIENT_SEGMENT_LENGTH}; --leap-sample-gap: ${100 - GRADIENT_SEGMENT_LENGTH}`}
  >
    <defs>
      <filter
        id={bloomFilterId}
        x="-20%"
        y="-100%"
        width="140%"
        height="300%"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur
          in="SourceGraphic"
          stdDeviation="0.6"
          result="smooth-ribbon"
        ></feGaussianBlur>
        <feGaussianBlur
          in="smooth-ribbon"
          stdDeviation="7"
          result="ribbon-bloom"
        ></feGaussianBlur>
        <feComponentTransfer in="ribbon-bloom" result="soft-bloom">
          <feFuncA type="linear" slope="0.9"></feFuncA>
        </feComponentTransfer>
        <feMerge>
          <feMergeNode in="soft-bloom"></feMergeNode>
          <feMergeNode in="smooth-ribbon"></feMergeNode>
        </feMerge>
      </filter>
    </defs>
    <g filter={`url(#${bloomFilterId})`}>
      {#each GRADIENT_SAMPLES as sampleIndex}
        <rect
          class="leap_edge_sample"
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="12"
          pathLength="100"
          style={`--leap-sample-color: ${getGradientSampleColor(sampleIndex)}; --leap-sample-delay: ${(-sampleIndex * GRADIENT_DURATION_SECONDS) / GRADIENT_SAMPLE_COUNT}s`}
        ></rect>
      {/each}
    </g>
  </svg>
  <span class="leap_label">Leap</span>
</button>

<style>
  .leap_control {
    --ui_accent: 238 247 241;
    --glass-edge-color: var(--ui_stroke);
    --glass-surface-tint: linear-gradient(
      180deg,
      rgb(255 255 255 / 2%),
      transparent
    );
    background: linear-gradient(135deg, rgb(255 255 255 / 3%), transparent 48%),
      rgb(238 247 241 / 2%);
    color: var(--ui_text);
    box-shadow: inset 0 1px 0 rgb(255 255 255 / 8%);
  }

  .leap_control:hover,
  .leap_control:focus-visible {
    --glass-edge-color: rgb(238 247 241 / 22%);
    background: linear-gradient(135deg, rgb(255 255 255 / 5%), transparent 48%),
      rgb(238 247 241 / 3%);
  }

  .leap_control:focus-visible {
    outline-color: rgb(var(--leap-color-1) / 34%);
  }

  .leap_edge_gradient {
    position: absolute;
    z-index: 0;
    inset: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  .leap_edge_sample {
    fill: none;
    stroke: var(--leap-sample-color);
    stroke-width: 2.5px;
    stroke-linecap: butt;
    stroke-dasharray: var(--leap-sample-length) var(--leap-sample-gap);
    stroke-dashoffset: 0;
    vector-effect: non-scaling-stroke;
    opacity: 0.72;
    animation: leap_edge_gradient_flow var(--leap-gradient-duration) linear
      infinite;
    animation-delay: var(--leap-sample-delay);
  }

  .leap_label {
    z-index: 1;
  }

  @keyframes leap_edge_gradient_flow {
    from {
      stroke-dashoffset: 0;
    }
    to {
      stroke-dashoffset: -100;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .leap_edge_sample {
      animation: none;
    }
  }
</style>
