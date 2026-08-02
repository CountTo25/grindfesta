<script lang="ts">
  import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
  import {
    faBolt,
    faChevronRight,
    faCircleQuestion,
    faClock,
    faComment,
    faEye,
    faGear,
    faListUl,
    faLocationDot,
    faMagnifyingGlass,
    faPause,
    faPlay,
    faRotate,
    faTrash,
    faTriangleExclamation,
  } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

  export let icon: string;

  const icons: Record<string, IconDefinition> = {
    "angle-right-solid": faChevronRight,
    bolt: faBolt,
    clock: faClock,
    cog: faGear,
    eye: faEye,
    "exclamation-triangle": faTriangleExclamation,
    exploration: faMagnifyingGlass,
    perception: faEye,
    social: faComment,
    engineering: faGear,
    survival: faLocationDot,
    "list-plus": faListUl,
    "location-pin": faLocationDot,
    message: faComment,
    pause: faPause,
    play: faPlay,
    refresh: faRotate,
    search: faMagnifyingGlass,
    trash: faTrash,
  };

  $: Icon = icons[icon] ?? faCircleQuestion;
</script>

<span class="icon_glyph" aria-hidden="true">
  <FontAwesomeIcon icon={Icon} style="width: 16px; height: 16px;" />
</span>

<style>
  .icon_glyph {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    vertical-align: -0.125em;
  }
</style>
