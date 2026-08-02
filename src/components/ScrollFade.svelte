<script lang="ts">
  import { scrollFade } from "../system/scrollFade";

  export let frameClass = "";
  export let scrollerClass = "";
</script>

<div class={`scroll_fade_frame ${frameClass}`}>
  <div class={scrollerClass} use:scrollFade>
    <slot />
  </div>
</div>
