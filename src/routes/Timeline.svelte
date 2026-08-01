<script lang="ts">
  import { endRun, gameState } from "../state";
  import { formatTime } from "../utils";

  $: entries = (
    $endRun?.logEntries ?? $gameState.data.run.logEntries
  ).toReversed();
</script>

<aside class="col-span-3 flex h-full flex-col overflow-hidden px-2">
  <div class="flex-1 overflow-y-auto">
    {#each entries as { ts, text }}
      <div class="mb-2 pixel-corners bg-slate-900 px-3 text-sm">
        <div class="text-right text-slate-500">{formatTime(ts)}</div>
        <div>{text}</div>
      </div>
    {/each}
  </div>
</aside>
