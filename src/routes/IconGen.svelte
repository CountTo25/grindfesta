<script lang="ts">
  import ActionButton from "../parts/ActionButton.svelte";
  import { getLocationAccentByKey } from "../gameData/locationAccents";
  import { actions } from "../statics";

  type BackdropActionGroup = {
    accent: string;
    actionIds: readonly string[];
  };

  type BackdropActionReference = {
    accent: string;
    groupIndex: number;
    id: string;
  };

  const BACKDROP_ACTION_GROUPS = [
    {
      accent: getLocationAccentByKey("na641"),
      actionIds: [
        "na641_museum_backrooms_jam_display_sensor",
        "na641_museum_curator_open_sealed_book",
        "na641_delivery_hack_terminal",
        "na641_erika_produce_fake_id",
        "na641_master_librarian_pick_green_metal_tome",
        "na641_marco_present_aurexite",
        "na641_city_hall_witness_heights",
        "na641_junk_buy_clanky_mini_printer",
      ],
    },
    {
      accent: getLocationAccentByKey("bbasin7281"),
      actionIds: [
        "bbasin7281_inspect_remains",
        "bbasin7281_remove_weird_skull",
        "bbasin7281_blast_lizard_noise",
        "bbasin7281_canyon_caves_cast_simple_glow",
        "bbasin7281_canyon_caves_bats",
        "bbasin7281_canyon_caves_read_message_in_eternian",
        "bbasin7281_mine_surface_aurexite",
        "bbasin7281_primal_village_scare_them_off_with_magic",
      ],
    },
    {
      accent: getLocationAccentByKey("eternia31349"),
      actionIds: [
        "eternia31349_bank_try_test_transaction",
        "eternia31349_divining_chambers_creation_magic",
        "eternia31349_divining_chambers_reshape_beads",
        "eternia31349_dome_gardens_water_plants_magically",
        "eternia31349_library_put_book_away",
        "eternia31349_magical_corps_demonstrate_fire_magic",
        "eternia31349_maintenance_heating_chambers_practice_heating",
        "eternia31349_overlook_tower_expeditions",
      ],
    },
    {
      accent: getLocationAccentByKey("eterniaSilent29624"),
      actionIds: [
        "eternia_silent29624_vault_warm_yourself",
        "eternia_silent29624_vault_start_fire",
        "eternia_silent29624_vault_survey",
        "eternia_silent29624_maintenance_sector_assess_emptiness",
        "eternia_silent29624_scholars_district_fend_off_cold",
        "eternia_silent29624_scholars_district_steel_yourself",
        "eternia_silent29624_divining_chambers_check_out_monolith",
        "eternia_silent29624_divining_chambers_gaze_onto_mirror_surface",
      ],
    },
  ] as const;

  const BACKDROP_COLUMN_COUNT = 4;
  const CARD_ROTATIONS = [-1.8, 0.8, -0.4, 1.5, -1, 0.3];
  const CARD_OPACITIES = [0.5, 0.66, 0.56, 0.72, 0.6];

  function backdropMixScore(groupIndex: number, position: number) {
    let score =
      Math.imul(groupIndex + 1, 0x9e3779b1) ^
      Math.imul(position + 1, 0x85ebca6b);
    score ^= score >>> 16;
    return score >>> 0;
  }

  function mixBackdropActionGroups(
    groups: readonly BackdropActionGroup[],
    columnCount: number,
  ): BackdropActionReference[] {
    const groupStates = groups.map((group, groupIndex) => ({
      group,
      groupIndex,
      nextActionIndex: 0,
    }));
    const cardCount = groups.reduce(
      (total, { actionIds }) => total + actionIds.length,
      0,
    );
    const mixed: BackdropActionReference[] = [];

    for (let position = 0; position < cardCount; position += 1) {
      const leftGroup =
        position % columnCount === 0
          ? null
          : mixed[position - 1]?.groupIndex;
      const aboveGroup = mixed[position - columnCount]?.groupIndex;
      const candidates = groupStates
        .filter(
          ({ group, nextActionIndex }) =>
            nextActionIndex < group.actionIds.length,
        )
        .sort((left, right) => {
          const leftAdjacency =
            Number(left.groupIndex === leftGroup) +
            Number(left.groupIndex === aboveGroup);
          const rightAdjacency =
            Number(right.groupIndex === leftGroup) +
            Number(right.groupIndex === aboveGroup);
          if (leftAdjacency !== rightAdjacency) {
            return leftAdjacency - rightAdjacency;
          }

          const leftRemaining =
            left.group.actionIds.length - left.nextActionIndex;
          const rightRemaining =
            right.group.actionIds.length - right.nextActionIndex;
          if (leftRemaining !== rightRemaining) {
            return rightRemaining - leftRemaining;
          }

          return (
            backdropMixScore(left.groupIndex, position) -
            backdropMixScore(right.groupIndex, position)
          );
        });
      const selected = candidates[0];
      if (!selected) break;

      const id = selected.group.actionIds[selected.nextActionIndex];
      selected.nextActionIndex += 1;
      mixed.push({
        accent: selected.group.accent,
        groupIndex: selected.groupIndex,
        id,
      });
    }

    return mixed;
  }

  const backdropSources = mixBackdropActionGroups(
    BACKDROP_ACTION_GROUPS,
    BACKDROP_COLUMN_COUNT,
  ).flatMap(({ accent, id }) => {
    const action = actions[id];
    if (
      !action ||
      typeof action.flavourText !== "string" ||
      !action.flavourText.trim()
    ) {
      return [];
    }

    return [{ id, action, flavourText: action.flavourText, accent }];
  });

  const backdropCards = backdropSources.map((source, index) => {
    const { id, action, flavourText, accent } = source;

    return {
      key: `${id}-${index}`,
      icon: action.skill,
      title: typeof action.title === "string" ? action.title : "Unknown action",
      flavourText,
      accent,
      progress: (index * 23 + 11) % 96,
      rotation: CARD_ROTATIONS[index % CARD_ROTATIONS.length],
      opacity: CARD_OPACITIES[index % CARD_OPACITIES.length],
    };
  });
</script>

<section class="icon_gen_page h-full p-2">
  <div
    class="action_card_canvas"
    style={`--backdrop-column-count: ${BACKDROP_COLUMN_COUNT}`}
    aria-hidden="true"
  >
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
    grid-template-columns: repeat(
      var(--backdrop-column-count),
      minmax(220px, 1fr)
    );
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
