# Hazard Trigger Components — Tier 1 Danbooru Taxonomy Specification

## 1. Architectural Directive & Philosophy

- **Goal**: Construct an exhaustive, schema-compliant, modular component registry for the Hazard Trigger Obsidian ecosystem based on the canonical [Danbooru Tag Groups](https://danbooru.donmai.us/wiki_pages/tag_groups) taxonomy.
- **Atomic Primacy Invariant**: Every component in this registry represents an **atomic, unbundled, orthogonal building block** (pure Danbooru tags). Pre-composed prompt clusters or complex narrative templates are *never* hardcoded into the base component files—they are synthesized dynamically by composing these atomic nodes in the Hazard Trigger Matrix engine.
- **Reference Standard**: The structure, keyword typing, exclusions, and delta arithmetic strictly mirror [Hazard_Trigger_Data/Components/_01_Subject/1_subjects.json](Hazard_Trigger_Data/Components/_01_Subject/1_subjects.json).

---

## 2. Invariant Component Schema Contract

Every JSON record adheres to [Hazard_Trigger_Data/Components/_schema.json](Hazard_Trigger_Data/Components/_schema.json):

```json
{
  "__key": {
    "display_name": "String (Title Case display label)",
    "description": "String (Context or semantic usage note)",
    "image": "",
    "thumbnail": "",
    "prompt": "canonical_danbooru_tag1, canonical_danbooru_tag2",
    "keywords": ["tag_keyword", "semantic_category"],
    "require": ["required_keyword_if_any"],
    "negate": ["conflicting_keywords"],
    "exclude": ["raw string tokens to filter from prompt"],
    "inherit": [],
    "subjects": [0, 0]
  }
}
```

---

## 3. Ten-Tier Domain Folder Architecture

```
Hazard_Trigger_Data/Components/
├── _01_Subject/                # [Active] Cardinality, Perspective (POV), Focus/Gaze
│   ├── 1_subjects.json         # 1girl_solo, 2girls_duo, 1girl_1boy_couple, harem, etc.
│   ├── 2_pov.json              # third_person, male_pov, female_pov
│   └── 3_focus.json            # viewer_contact, looking_away, solo_focus
├── _02_Appearance/             # Anatomy, Hair, Eyes, Physique & Biology
│   ├── 1_hair_style.json       # twintails, ponytail, bob_cut, ahoge, braid, bangs
│   ├── 2_hair_color.json       # silver_hair, black_hair, blonde_hair, gradient_hair
│   ├── 3_eyes_color.json       # red_eyes, blue_eyes, heterochromia
│   ├── 4_eyes_pupils.json      # heart_pupils, glowing_eyes, slit_pupils, dilated
│   ├── 5_body_physique.json    # tall, petite, slender, curvy, small/large breasts
│   └── 6_skin_biology.json     # blush, sweat, flushed, glistening_skin, goosebumps
├── _03_Apparel/                # Outfits, Garments, States & Accessories
│   ├── 1_outfit_archetype.json # school_uniform, maid, bunny_suit, bikini, casual
│   ├── 2_tops.json             # shirt, blouse, crop_top, hoodie, jacket, cardigan
│   ├── 3_bottoms.json          # pleated_skirt, miniskirt, shorts, denim_pants
│   ├── 4_legwear.json          # thighhighs, pantyhose, over-knee_socks, fishnet
│   ├── 5_footwear.json         # boots, high_heels, sneakers, loafers, barefoot
│   ├── 6_clothing_state.json   # clothed, lift_skirt, see-through, torn, nude
│   └── 7_accessories.json      # glasses, ribbons, choker, hair_ornament, gloves
├── _04_Pose_Action/            # Postures, Gestures & Interactions
│   ├── 1_posture.json          # standing, sitting, kneeling, lying_on_back, all_fours
│   ├── 2_hand_gestures.json    # peace_sign, hands_on_hips, reaching, face_touch
│   └── 3_interactions.json     # holding_hands, hugging, lap_pillow, shoulder_lean
├── _05_Expression/             # Facial Emotions & Micro-Expressions
│   ├── 1_emotions.json         # smile, happy, tsundere, smug, crying, seductive
│   └── 2_mouth_micro.json      # open_mouth, parted_lips, fang, tongue_out, pout
├── _06_Camera_Framing/         # Cinematography & Composition
│   ├── 1_shot_distance.json    # close-up, portrait, upper_body, cowboy_shot, full_body
│   ├── 2_camera_angle.json     # eye-level, low_angle, high_angle, dutch_angle
│   └── 3_lens_depth.json       # depth_of_field, blurry_background, fisheye
├── _07_Background/             # Environment, Scenery & Studios
│   ├── 1_setting.json          # bedroom, classroom, bathroom, onsen, beach, rooftop
│   ├── 2_background.json       # simple_background, white_background, scenery
│   └── 3_time_weather.json     # golden_hour, night, rain, snow, sunny
├── _08_Lighting_Atmosphere/    # Illumination & Particle VFX
│   ├── 1_lighting.json         # cinematic_lighting, volumetric_light, rim_light, neon
│   └── 2_atmosphere_vfx.json   # floating_particles, bokeh, falling_petals, sparkles
├── _09_Art_Style/              # Visual Mediums & Model Presets
│   ├── 1_medium_style.json     # anime_coloring, cel_shaded, watercolor, retro_90s
│   ├── 2_quality_tier.json     # masterpiece, best_quality, ultra-detailed
│   └── 3_model_dialects.json   # Pony score tags, NovelAI tags, SDXL triggers
└── _10_Engine_Exclusions/      # Negative Prompts & Collision Bounds
    ├── 1_global_negatives.json # bad_anatomy, extra_limbs, lowres, watermark
    └── 2_conflict_rules.json   # auto-exclusion lookup maps
```

---

## 4. Intake vs. Ignore Standards

- **In Scope (Tier 1)**: Universal visual descriptors that define subjects, anatomy, clothing, postures, facial expressions, camera perspectives, world locations, lighting, and art styles.
- **Out of Scope**:
  1. *Platform Meta*: `sample_watermark`, `translation_request`, `danbooru_logo`, `bad_id`.
  2. *Specific Copyrights / Characters*: `genshin_impact`, `fate/grand_order`, `hatsune_miku` (these live in sovereign Character/Eva cards or LoRAs).
  3. *Artist Names*: `artist:name` (handled via style LoRAs).
  4. *Low-Frequency Micro-Fringes*: Tags with insignificant diffusion weight or extreme hyper-specialization.
