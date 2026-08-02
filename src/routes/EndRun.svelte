<script lang="ts">
  import ScrollFade from "../components/ScrollFade.svelte";
  import ActionButton from "../parts/ActionButton.svelte";
  import { beginNextLoopTransition, endRun, gameState } from "../state";
</script>

<div class="grid h-full grid-cols-12 overflow-hidden">
  <section class="col-span-9 h-full overflow-hidden px-2">
    <div class="grid h-full grid-cols-12 gap-2">
      <ScrollFade
        frameClass="col-span-8 h-full min-h-0"
        scrollerClass="glass_scroll h-full overflow-y-auto"
      >
        <div class="grid grid-cols-12 gap-2">
          {#if $gameState.data.global.loop >= 2}
            <div class="col-span-12">
              <ActionButton
                icon="refresh"
                testId="setup-retracing"
                on:click={() => $endRun && ($endRun.mainViewRoute = "retracing")}
              >Set up retracing</ActionButton>
            </div>
          {/if}

          <div class="col-span-12">
            <ActionButton
              icon="play"
              testId="start-next-loop"
              flavourText={$gameState.data.global.loop < 10
                ? "Wait, is that me?"
                : "The loop continues"}
              on:click={beginNextLoopTransition}
            >Observe yourself starting a new loop</ActionButton>
          </div>
        </div>
      </ScrollFade>
    </div>
  </section>
</div>
