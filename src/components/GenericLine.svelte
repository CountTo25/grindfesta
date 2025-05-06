<script lang="ts">
  export let config: { classes?: string[] } = {};
</script>

<span class={(config.classes ?? []).join(" ")}><slot></slot></span>
