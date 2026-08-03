<script lang="ts">
  import ActionButton from "../parts/ActionButton.svelte";
  import { actions } from "../statics";

  const BACKDROP_ACTION_IDS = [
    "intro_0",
    "intro_1",
    "narcadia_gather_info",
    "na641_homeless_wistom",
    "na641_museum_search",
    "na641_museum_ask_prehistoric_exposition",
    "na641_city_hall_check_interior",
    "na641_city_hall_observe_others",
    "bbasin7281_intro",
    "bbasin7281_investigate_surroundings",
    "bbasin7281_remove_weird_skull",
    "bbasin7281_fend_off_lizard",
    "pantheon31349_greet_author",
    "pantheon31349_decipher_authors_answer",
    "pantheon31349_clarify_whereabouts",
    "na641_delivery_hack_terminal",
    "na641_delivery_give_yourself_promotion",
    "na641_department_store_look_around",
    "na641_camping_goods_check_products",
    "na641_junk_fix_pile",
    "na641_marcos_amplify_solar_radio",
  ];

  const CARD_ROTATIONS = [-1.8, 0.8, -0.4, 1.5, -1, 0.3];
  const CARD_OPACITIES = [0.5, 0.66, 0.56, 0.72, 0.6];

  const backdropSources = BACKDROP_ACTION_IDS.flatMap((id) => {
    const action = actions[id];
    if (
      typeof action.flavourText !== "string" ||
      !action.flavourText.trim()
    ) {
      return [];
    }

    return [{ id, action, flavourText: action.flavourText }];
  });

  const backdropCards = Array.from({ length: 32 }, (_, index) => {
    const source = backdropSources[index % backdropSources.length];
    const { id, action, flavourText } = source;

    return {
      key: `${id}-${index}`,
      icon: action.skill,
      title: typeof action.title === "string" ? action.title : "Unknown action",
      flavourText,
      accent: id.startsWith("bbasin7281")
        ? "var(--ui_accent_ashbone_basin)"
        : id.startsWith("pantheon31349")
          ? "var(--ui_accent_pantheon_age)"
        : "var(--ui_accent_new_arcadia)",
      progress: (index * 23 + 11) % 96,
      rotation: CARD_ROTATIONS[index % CARD_ROTATIONS.length],
      opacity: CARD_OPACITIES[index % CARD_OPACITIES.length],
    };
  });
</script>

<section class="icon_gen_page h-full p-2">
  <div class="action_card_canvas" aria-hidden="true">
    {#each backdropCards as card (card.key)}
      <div
        class="backdrop_card"
        style={`--card-rotation: ${card.rotation}deg; --card-opacity: ${card.opacity}`}
      >
        <ActionButton
          icon={card.icon}
          flavourText={card.flavourText}
          accent={card.accent}
          progress={card.progress}
          decorative
        >
          {card.title}
        </ActionButton>
      </div>
    {/each}
  </div>
  <div class="canvas_vignette" aria-hidden="true"></div>
  <button
    type="button"
    class="glass_control icon_gen_button"
    data-active="true"
    style="--ui_accent: var(--ui_progress_time_compression)"
  >
    <span class="icon_gen_name">Grindfesta</span>
    <span class="icon_gen_note">(temporary name)</span>
  </button>
</section>

<style>
  .icon_gen_page {
    position: relative;
    display: grid;
    min-height: 0;
    overflow: hidden;
    place-items: center;
  }

  .action_card_canvas {
    position: absolute;
    z-index: 0;
    inset: -82px -110px;
    display: grid;
    grid-template-columns: repeat(4, minmax(220px, 1fr));
    align-content: center;
    gap: 8px;
    filter: blur(0.45px);
    pointer-events: none;
    transform: rotate(-2.4deg) scale(1.04);
    transform-origin: center;
  }

  .backdrop_card {
    min-width: 0;
    opacity: var(--card-opacity);
    transform: rotate(var(--card-rotation));
  }

  .canvas_vignette {
    position: absolute;
    z-index: 1;
    inset: 0;
    pointer-events: none;
    background:
      radial-gradient(
        ellipse 300px 180px at center,
        rgb(6 7 6 / 90%) 0%,
        rgb(6 7 6 / 72%) 38%,
        rgb(6 7 6 / 20%) 72%,
        transparent 100%
      ),
      linear-gradient(
        90deg,
        rgb(6 7 6 / 42%),
        transparent 18% 82%,
        rgb(6 7 6 / 42%)
      );
  }

  .icon_gen_button {
    --glass-radius: 16px;
    --glass-rind-inset: 0px;
    --glass-edge-color: rgb(var(--ui_progress_time_compression) / 58%);
    display: inline-flex;
    width: min(320px, calc(100vw - 48px));
    min-height: 108px;
    flex-direction: column;
    gap: 7px;
    justify-content: center;
    border-radius: var(--glass-radius);
    cursor: default;
    z-index: 2;
  }

  .icon_gen_button[data-active="true"] {
    background:
      linear-gradient(135deg, rgb(255 255 255 / 7%), transparent 48%),
      radial-gradient(
        180px circle at 50% 0%,
        rgb(var(--ui_progress_time_compression) / 22%),
        transparent 78%
      ),
      linear-gradient(
        180deg,
        rgb(var(--ui_progress_time_compression) / 16%),
        rgb(var(--ui_progress_time_compression) / 7%)
      ),
      var(--ui_fill);
    box-shadow:
      inset 0 1px 0 rgb(232 221 255 / 18%),
      0 16px 40px rgb(0 0 0 / 38%),
      0 0 30px rgb(var(--ui_progress_time_compression) / 20%),
      0 0 72px rgb(var(--ui_progress_time_compression) / 10%);
  }

  .icon_gen_button::before {
    opacity: 0;
  }

  .icon_gen_button::after {
    opacity: 0.82;
  }

  .icon_gen_button:hover {
    transform: translateY(-1px);
    box-shadow:
      inset 0 1px 0 rgb(238 230 255 / 22%),
      0 18px 44px rgb(0 0 0 / 40%),
      0 0 36px rgb(var(--ui_progress_time_compression) / 26%),
      0 0 82px rgb(var(--ui_progress_time_compression) / 13%);
  }

  .icon_gen_name {
    color: var(--ui_on_accent);
    font-size: 1.65rem;
    font-weight: 800;
    letter-spacing: -0.025em;
    line-height: 1;
    text-shadow: 0 0 22px rgb(var(--ui_progress_time_compression) / 48%);
  }

  .icon_gen_note {
    color: rgb(228 218 249 / 76%);
    font-size: var(--ui_font_size_detail);
    font-weight: 600;
    line-height: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .icon_gen_button:hover {
      transform: none;
    }
  }

  @media (max-width: 640px) {
    .action_card_canvas {
      inset: -70px -270px;
      grid-template-columns: repeat(4, 220px);
    }
  }
</style>
