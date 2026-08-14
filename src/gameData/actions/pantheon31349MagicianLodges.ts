import { COMPLETION_EFFECTS, CONDITION_CHECKS } from "../../utils";
import { LOCATIONS, SUBLOCATIONS } from "../sublocations";
import { KNOWLEDGE, TAGS } from "../tags";
import {
  CROSSGEN,
  NO_CROSSGEN,
  NO_POSTCOMPLETE,
  NO_REPEAT,
  REPEATABLE,
  type ActionRepository,
} from "./utils";

const ETERNIA31349 = LOCATIONS.eternia31349;
const ETERNIA31349_SUBLOCATIONS = SUBLOCATIONS.eternia31349;
const TAIGA_IN_LODGES = CONDITION_CHECKS.flag(
  TAGS.PANTHEON31349.TAIGA_LOCATION,
  (location) => location === ETERNIA31349_SUBLOCATIONS.magicianLodges,
);
const TAIGA_IN_GENERAL_HALL = CONDITION_CHECKS.flag(
  TAGS.PANTHEON31349.TAIGA_LOCATION,
  (location) =>
    location === ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
);
const TAIGA_IN_DORMS = CONDITION_CHECKS.flag(
  TAGS.PANTHEON31349.TAIGA_LOCATION,
  (location) => location === ETERNIA31349_SUBLOCATIONS.magicianLodgesDorms,
);
const SAOP_IN_LODGES = CONDITION_CHECKS.flag(
  TAGS.PANTHEON31349.SAOP_LOCATION,
  (location) => location === ETERNIA31349_SUBLOCATIONS.magicianLodges,
);
const SAOP_IN_GENERAL_HALL = CONDITION_CHECKS.flag(
  TAGS.PANTHEON31349.SAOP_LOCATION,
  (location) =>
    location === ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
);
const SAOP_IS_HERE = CONDITION_CHECKS.or([
  (state) =>
    CONDITION_CHECKS.inSubLocation(
      ETERNIA31349_SUBLOCATIONS.magicianLodges,
    )(state) && SAOP_IN_LODGES(state),
  (state) =>
    CONDITION_CHECKS.inSubLocation(
      ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
    )(state) && SAOP_IN_GENERAL_HALL(state),
]);
const THEORYCRAFT_NOT_IN_PROGRESS = CONDITION_CHECKS.noFlag(
  TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
);

export const pantheon31349MagicianLodgesActions: ActionRepository = {
  eternia31349_magician_lodges_talk_to_receptionist: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Talk to receptionist",
    flavourText: "You have no idea what you are doing here — but let's ask anyway",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
    ],
  },
  eternia31349_magician_lodges_accept_keys: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Accept keys",
    flavourText: "Apparently, H'sak took care of that. Thanks!",
    skill: "social",
    weight: 1100,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_talk_to_receptionist",
      ),
    ],
  },
  eternia31349_magician_lodges_meet_residents: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Meet other residents",
    flavourText:
      "Everyone is gossiping. You're an anomaly, made from magic! They're wrong",
    skill: "social",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_accept_keys",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.TAIGA_LOCATION,
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.SAOP_LOCATION,
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      COMPLETION_EFFECTS.reachMilestone("eternia31349_magical_being"),
    ],
  },
  eternia31349_magician_lodges_introduce_to_taiga: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Introduce yourself to Taiga",
    flavourText: "One of the magicians is clearly interested in talking with you",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_meet_residents",
      ),
      TAIGA_IN_LODGES,
    ],
  },
  eternia31349_magician_lodges_walk_with_taiga: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Go on a walk with Taiga",
    flavourText:
      "Younger of the two is super eager to show you around — let's follow!",
    skill: "social",
    weight: 800,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_introduce_to_taiga",
      ),
      TAIGA_IN_LODGES,
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.TAIGA_LOCATION,
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
    ],
  },
  eternia31349_magician_lodges_enter_general_hall: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Enter General Hall",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_walk_with_taiga",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
    ],
  },
  eternia31349_magician_lodges_taiga_explain_general_hall: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "«In the General Hall we're just doing whatever!»",
    flavourText:
      "A compelling explanation. You see tables, lined-up shelves and various magical tools",
    skill: "social",
    weight: 850,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_walk_with_taiga",
      ),
      TAIGA_IN_GENERAL_HALL,
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesDorms,
      ),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.TAIGA_LOCATION,
        ETERNIA31349_SUBLOCATIONS.magicianLodgesDorms,
      ),
    ],
  },
  eternia31349_magician_lodges_enter_dorms: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Enter Dorms",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_taiga_explain_general_hall",
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesDorms,
      ),
    ],
  },
  eternia31349_magician_lodges_taiga_explain_dorms: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "«This is where we sleep or whatever»",
    flavourText: "Apparently your expenses are paid by H'Shak",
    skill: "social",
    weight: 900,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesDorms,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_taiga_explain_general_hall",
      ),
      TAIGA_IN_DORMS,
    ],
  },
  eternia31349_magician_lodges_check_out_your_room: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Check out your room",
    flavourText: "I mean, it's free. Let's ignore how small it is",
    skill: "exploration",
    weight: 1100,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesDorms,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_taiga_explain_dorms",
      ),
    ],
  },
  eternia31349_magician_lodges_conclude_taiga_tour: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Conclude the tour",
    flavourText: "What a nice overview! You agreed to meet later in the hall",
    skill: "social",
    weight: 950,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesDorms,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_check_out_your_room",
      ),
      TAIGA_IN_DORMS,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.TAIGA_LOCATION,
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.SAOP_LOCATION,
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
    ],
  },
  eternia31349_magician_lodges_leave_dorms: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to General Hall",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesDorms,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
    ],
  },
  eternia31349_magician_lodges_leave_general_hall: {
    ...NO_CROSSGEN,
    ...REPEATABLE,
    title: "Return to Magician Lodges",
    skill: "exploration",
    weight: 300,
    stopOnRepeat: true,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
    ],
    postComplete: [
      COMPLETION_EFFECTS.moveSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodges,
      ),
    ],
  },
  eternia31349_magician_lodges_get_acquainted_with_saop: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Introduce yourself to Saop",
    flavourText: "Another magician is trying very hard not to stare at you",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_meet_residents",
      ),
      SAOP_IS_HERE,
    ],
  },
  eternia31349_magician_lodges_discuss_basics_with_saop: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Discuss basics with Saop",
    flavourText:
      "He is insistent that fundamentals are important. Let's discuss them",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_get_acquainted_with_saop",
      ),
      THEORYCRAFT_NOT_IN_PROGRESS,
      SAOP_IN_GENERAL_HALL,
    ],
  },
  eternia31349_magician_lodges_taiga_urges_magic_initiation: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "«What do you mean you can't use magic?»",
    flavourText:
      "Taiga is really confused why you're still here. Go to the devouts right away!",
    skill: "social",
    weight: 1000,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_conclude_taiga_tour",
      ),
      THEORYCRAFT_NOT_IN_PROGRESS,
      TAIGA_IN_GENERAL_HALL,
      CONDITION_CHECKS.noFlag(TAGS.PANTHEON31349.MAGIC_IMBUED),
    ],
  },
  eternia31349_magician_lodges_saop_recommends_library: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "«You don't even know the basics?»",
    flavourText: "Saop urges you to hit the library ASAP",
    skill: "social",
    weight: 1100,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_discuss_basics_with_saop",
      ),
      THEORYCRAFT_NOT_IN_PROGRESS,
      SAOP_IN_GENERAL_HALL,
      CONDITION_CHECKS.or([
        CONDITION_CHECKS.not(
          CONDITION_CHECKS.hasKnowledge(
            KNOWLEDGE.PANTHEON31349.control_basics,
          ),
        ),
        CONDITION_CHECKS.not(
          CONDITION_CHECKS.hasKnowledge(
            KNOWLEDGE.PANTHEON31349.manipulation_basics,
          ),
        ),
      ]),
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.magic_archives_location,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.introduction_to_control_location,
      ),
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.basic_manipulation_location,
      ),
    ],
  },
  eternia31349_magician_lodges_dig_deeper_on_basics: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    ...NO_POSTCOMPLETE,
    title: "Dig deeper on basics",
    flavourText: "Saop is happy to see you doing homework",
    skill: "social",
    weight: 1100,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_discuss_basics_with_saop",
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.control_basics,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.manipulation_basics,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.PANTHEON31349.control_medium,
        ),
      ),
      THEORYCRAFT_NOT_IN_PROGRESS,
      TAIGA_IN_GENERAL_HALL,
      SAOP_IN_GENERAL_HALL,
    ],
  },
  eternia31349_magician_lodges_discuss_potential_improvements: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Discuss potential improvements",
    flavourText: "There's a lot to learn from those two",
    skill: "perception",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_dig_deeper_on_basics",
      ),
      THEORYCRAFT_NOT_IN_PROGRESS,
      TAIGA_IN_GENERAL_HALL,
      SAOP_IN_GENERAL_HALL,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
        "1",
      ),
    ],
  },
  eternia31349_magician_lodges_practice_improved_control: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Practice improved control",
    flavourText: "Let's follow Taiga's example",
    skill: "magic",
    weight: 200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_discuss_potential_improvements",
      ),
      TAIGA_IN_GENERAL_HALL,
      SAOP_IN_GENERAL_HALL,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.control_medium,
      ),
    ],
  },
  eternia31349_magician_lodges_advanced_magic_theorycraft: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Advanced magic theorycraft",
    flavourText: "Control is fundamental — let's explore magic further!",
    skill: "magic",
    weight: 100,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_conclude_taiga_tour",
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_get_acquainted_with_saop",
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.control_medium,
      ),
      CONDITION_CHECKS.ifActionCompleteAny(
        "eternia31349_magician_lodges_practice_improved_control",
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_discuss_basics_with_saop",
      ),
      TAIGA_IN_GENERAL_HALL,
      SAOP_IN_GENERAL_HALL,
    ],
    postComplete: [
      COMPLETION_EFFECTS.removeFlag(
        TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
      ),
    ],
  },
  eternia31349_magician_lodges_work_on_elemental_magic: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Work on elemental magic",
    flavourText: "Light and energy are pretty close to fire, aren't they?",
    skill: "magic",
    weight: 150,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_conclude_taiga_tour",
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_get_acquainted_with_saop",
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.light_magic_beginner,
      ),
      CONDITION_CHECKS.hasKnowledge(
        KNOWLEDGE.PANTHEON31349.energy_manipulation,
      ),
      CONDITION_CHECKS.not(
        CONDITION_CHECKS.hasKnowledge(
          KNOWLEDGE.PANTHEON31349.fire_magic_basics,
        ),
      ),
      THEORYCRAFT_NOT_IN_PROGRESS,
      TAIGA_IN_GENERAL_HALL,
      SAOP_IN_GENERAL_HALL,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
        "1",
      ),
    ],
  },
  eternia31349_magician_lodges_find_somewhere_to_observe: {
    ...NO_CROSSGEN,
    ...NO_REPEAT,
    title: "Find somewhere to observe",
    flavourText:
      "Taiga wants you to go outside. Meet her at Scholar's District",
    skill: "social",
    weight: 1200,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_magician_lodges_work_on_elemental_magic",
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
      ),
      TAIGA_IN_GENERAL_HALL,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addFlag(
        TAGS.PANTHEON31349.TAIGA_LOCATION,
        ETERNIA31349_SUBLOCATIONS.scholarsDistrict,
      ),
    ],
  },
  eternia31349_magician_lodges_comprehend_fire_magic_basics: {
    ...CROSSGEN,
    ...NO_REPEAT,
    title: "Comprehend basics of fire magic",
    flavourText: "Should be simple now",
    skill: "magic",
    weight: 240,
    conditions: [
      CONDITION_CHECKS.inLocation(ETERNIA31349),
      CONDITION_CHECKS.inSubLocation(
        ETERNIA31349_SUBLOCATIONS.magicianLodgesGeneralHall,
      ),
      CONDITION_CHECKS.ifActionCompleteRun(
        "eternia31349_maintenance_heating_chambers_wrap_up_with_taiga",
      ),
      CONDITION_CHECKS.flag(
        TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
      ),
      TAIGA_IN_GENERAL_HALL,
      SAOP_IN_GENERAL_HALL,
    ],
    postComplete: [
      COMPLETION_EFFECTS.addKnowledge(
        KNOWLEDGE.PANTHEON31349.fire_magic_basics,
      ),
      COMPLETION_EFFECTS.removeFlag(
        TAGS.PANTHEON31349.THEORYCRAFT_IN_PROGRESS,
      ),
    ],
  },
};
