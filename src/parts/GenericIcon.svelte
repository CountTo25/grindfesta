<script lang="ts">
  import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
  import {
    faArrowRightFromBracket,
    faBolt,
    faBookBookmark,
    faChevronRight,
    faCircleQuestion,
    faClock,
    faComment,
    faEye,
    faGear,
    faHandSparkles,
    faListUl,
    faLocationDot,
    faMagnifyingGlass,
    faPause,
    faPen,
    faPlay,
    faPlus,
    faRepeat,
    faRotate,
    faFloppyDisk,
    faTrash,
    faTriangleExclamation,
  } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

  export let icon: string;
  export let size: number = 16;

  const icons: Record<string, IconDefinition> = {
    "angle-right-solid": faChevronRight,
    "arrow-right-from-bracket": faArrowRightFromBracket,
    bolt: faBolt,
    "book-bookmark": faBookBookmark,
    clock: faClock,
    cog: faGear,
    eye: faEye,
    "exclamation-triangle": faTriangleExclamation,
    exploration: faMagnifyingGlass,
    perception: faEye,
    social: faComment,
    engineering: faGear,
    edit: faPen,
    survival: faLocationDot,
    magic: faHandSparkles,
    "list-plus": faListUl,
    "location-pin": faLocationDot,
    message: faComment,
    pause: faPause,
    play: faPlay,
    plus: faPlus,
    repeat: faRepeat,
    refresh: faRotate,
    save: faFloppyDisk,
    search: faMagnifyingGlass,
    trash: faTrash,
  };

  $: Icon = icons[icon] ?? faCircleQuestion;
</script>

<span class="icon_glyph" aria-hidden="true">
  {#key Icon}
    <FontAwesomeIcon icon={Icon} style={`width: ${size}px; height: ${size}px;`} />
  {/key}
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
