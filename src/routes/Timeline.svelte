<script lang="ts">
  import ScrollFade from "../components/ScrollFade.svelte";
  import { endRun, gameState } from "../state";
  import { formatTime } from "../utils";

  $: entries = (
    $endRun?.logEntries ?? $gameState.data.run.logEntries
  ).toReversed();
</script>

<aside class="col-span-3 flex h-full min-h-0 flex-col overflow-hidden">
  <ScrollFade
    frameClass="min-h-0 flex-1"
    scrollerClass="glass_scroll h-full min-h-0 overflow-y-auto pr-1"
  >
    {#each entries as { ts, text }}
      <div class="glass_card mb-1 px-3 py-2 text-sm">
        <div class="subtle_text text-right text-xs">{formatTime(ts)}</div>
        <div class="mt-1">{text}</div>
      </div>
    {/each}
  </ScrollFade>
</aside>
