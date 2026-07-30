<script lang="ts">
  import type { Skill } from "../types";
  export let skill: Skill;
  const icon = {
    exploration: "search",
    perception: "eye",
    social: "message",
    engineering: "cog",
    survival: "location-pin",
  }[skill];
</script>

<div class="">
  <i class="hn hn-{icon}"></i>
</div>
