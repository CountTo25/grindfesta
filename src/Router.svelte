<script lang="ts">
  import type { Component } from "svelte";

  export let routingSettings: { [key: string]: Component } = {};
  export let currentRoute: string | null = null;
</script>

{#if currentRoute}
  <svelte:component this={routingSettings[currentRoute]} />
{/if}
