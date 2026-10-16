import { CompositeHairstyleDeconstruction } from '../types/facetOntology';

export const COMPOSITE_DECONSTRUCTIONS: CompositeHairstyleDeconstruction[] = [
  {
    "tag": "center-flap bangs",
    "slug": "centerflap_bangs",
    "category": "Front Architecture",
    "subcategory": "Bangs",
    "description": "Bangs parted on both sides leaving a distinct rectangular center flap over the forehead.",
    "atomicConditions": [
      {
        "dimension": "parting",
        "dimensionLabel": "Parting Topology",
        "value": "Double-parted (left & right temples)",
        "impliedTag": "double-parted bangs"
      },
      {
        "dimension": "fringe_cut",
        "dimensionLabel": "Fringe Edge",
        "value": "Blunt straight-across cut",
        "impliedTag": "blunt bangs"
      },
      {
        "dimension": "framing",
        "dimensionLabel": "Strand Placement",
        "value": "Centered forehead drop flap",
        "impliedTag": "center-flap bangs"
      }
    ],
    "synthesizedPrompt": "center-flap bangs, double-parted bangs, blunt bangs",
    "imageUrl": "https://cdn.donmai.us/720x720/d7/37/d7373a9f5abfa67e6cccf38cf4016958.webp",
    "wikiUrl": "https://danbooru.donmai.us/wiki_pages/centerflap_bangs"
  },
  {
    "tag": "hime cut",
    "slug": "hime_cut",
    "category": "Front Architecture",
    "subcategory": "Bangs & Framing",
    "description": "Noble traditional Japanese hairstyle with straight blunt bangs, cheek-length blunt sidelocks, and long straight hair.",
    "atomicConditions": [
      {
        "dimension": "fringe_cut",
        "dimensionLabel": "Fringe Edge",
        "value": "Straight blunt fringe across forehead",
        "impliedTag": "blunt bangs"
      },
      {
        "dimension": "framing",
        "dimensionLabel": "Temple Framing",
        "value": "Cheek-length square blunt sidelocks",
        "impliedTag": "sidelocks"
      },
      {
        "dimension": "length",
        "dimensionLabel": "Foundation Length",
        "value": "Long hair down to waist",
        "impliedTag": "long hair"
      },
      {
        "dimension": "texture",
        "dimensionLabel": "Fiber Texture",
        "value": "Smooth silk straight strands",
        "impliedTag": "straight hair"
      }
    ],
    "synthesizedPrompt": "hime cut, blunt bangs, sidelocks, long straight hair",
    "imageUrl": "https://cdn.donmai.us/720x720/1a/85/1a85759a2af41fb9f030bbb80495cc43.webp",
    "wikiUrl": "https://danbooru.donmai.us/wiki_pages/hime_cut"
  },
  {
    "tag": "braided ponytail",
    "slug": "braided_ponytail",
    "category": "Coiffure & Updos",
    "subcategory": "Ponytails",
    "description": "A single gathering of hair tied back into a ponytail that is woven into a plait.",
    "atomicConditions": [
      {
        "dimension": "coiffure",
        "dimensionLabel": "Updo Base",
        "value": "Gathered back ponytail",
        "impliedTag": "ponytail"
      },
      {
        "dimension": "texture",
        "dimensionLabel": "Strand Weave",
        "value": "Interlaced plait braid",
        "impliedTag": "braid"
      }
    ],
    "synthesizedPrompt": "braided ponytail, ponytail, braid",
    "imageUrl": "https://cdn.donmai.us/720x720/59/e0/59e02c6ba3df31d5da243696c88c589b.webp",
    "wikiUrl": "https://danbooru.donmai.us/wiki_pages/braided_ponytail"
  },
  {
    "tag": "drill sidelocks",
    "slug": "drill_sidelocks",
    "category": "Front Architecture",
    "subcategory": "Sidelocks",
    "description": "Framing temple locks sculpted into tight corkscrew helical spirals.",
    "atomicConditions": [
      {
        "dimension": "framing",
        "dimensionLabel": "Temple Framing",
        "value": "Strands framing the cheeks",
        "impliedTag": "sidelocks"
      },
      {
        "dimension": "texture",
        "dimensionLabel": "Sculpting Form",
        "value": "Corkscrew spiral drill geometry",
        "impliedTag": "drill hair"
      }
    ],
    "synthesizedPrompt": "drill sidelocks, sidelocks, drill hair",
    "imageUrl": "https://cdn.donmai.us/720x720/28/1c/281caa5b45210c11b529dc8ad6ec9e8b.webp",
    "wikiUrl": "https://danbooru.donmai.us/wiki_pages/drill_sidelocks"
  },
  {
    "tag": "twin drills",
    "slug": "twin_drills",
    "category": "Coiffure & Updos",
    "subcategory": "Twintails",
    "description": "Dual side bunches sculpted into large tight conical spiral drills.",
    "atomicConditions": [
      {
        "dimension": "coiffure",
        "dimensionLabel": "Updo Base",
        "value": "Bilateral dual pigtails",
        "impliedTag": "twintails"
      },
      {
        "dimension": "texture",
        "dimensionLabel": "Sculpting Form",
        "value": "Helical cone drills",
        "impliedTag": "drill hair"
      }
    ],
    "synthesizedPrompt": "twin drills, twintails, drill hair",
    "imageUrl": "https://cdn.donmai.us/720x720/d5/37/d537d9aba9af983f3d2fe5fea705bb97.webp",
    "wikiUrl": "https://danbooru.donmai.us/wiki_pages/twin_drills"
  },
  {
    "tag": "inverted bob",
    "slug": "inverted_bob",
    "category": "Foundation & Silhouette",
    "subcategory": "Short Hair",
    "description": "A bob cut cut shorter at the back of the neck and angled longer towards the front jaw.",
    "atomicConditions": [
      {
        "dimension": "length",
        "dimensionLabel": "Length Tier",
        "value": "Above shoulder jaw-length",
        "impliedTag": "short hair"
      },
      {
        "dimension": "fringe_cut",
        "dimensionLabel": "Silhouette Cut",
        "value": "Rounded bob silhouette with forward angle",
        "impliedTag": "bob cut"
      }
    ],
    "synthesizedPrompt": "inverted bob, bob cut, short hair",
    "imageUrl": "https://cdn.donmai.us/720x720/fb/80/fb806e7acc770e1fc97f439bcb7e10ea.webp",
    "wikiUrl": "https://danbooru.donmai.us/wiki_pages/inverted_bob"
  },
  {
    "tag": "jellyfish cut",
    "slug": "jellyfish_cut",
    "category": "Foundation & Silhouette",
    "subcategory": "Long Hair",
    "description": "Outer layer shaped as a short round bob resembling a jellyfish bell with long trailing tentacles beneath.",
    "atomicConditions": [
      {
        "dimension": "fringe_cut",
        "dimensionLabel": "Outer Shell",
        "value": "Short outer bob perimeter",
        "impliedTag": "bob cut"
      },
      {
        "dimension": "length",
        "dimensionLabel": "Underlayer",
        "value": "Long straight trailing strands",
        "impliedTag": "long hair"
      }
    ],
    "synthesizedPrompt": "jellyfish cut, bob cut, long hair",
    "imageUrl": "https://cdn.donmai.us/720x720/48/ba/48baeb5b147cb4a8116d3be0b3003ea1.webp",
    "wikiUrl": "https://danbooru.donmai.us/wiki_pages/jellyfish_cut"
  },
  {
    "tag": "curtained hair",
    "slug": "curtained_hair",
    "category": "Front Architecture",
    "subcategory": "Parted Bangs",
    "description": "Long bangs parted sharply down the middle, framing both sides of the face like theater curtains.",
    "atomicConditions": [
      {
        "dimension": "parting",
        "dimensionLabel": "Parting Line",
        "value": "Symmetrical central part",
        "impliedTag": "middle part"
      },
      {
        "dimension": "fringe_cut",
        "dimensionLabel": "Fringe Style",
        "value": "Long sweeping fringe",
        "impliedTag": "parted bangs"
      }
    ],
    "synthesizedPrompt": "curtained hair, middle part, parted bangs",
    "imageUrl": "https://cdn.donmai.us/720x720/49/5e/495eb3183df046dd50d134799c9f46b3.webp",
    "wikiUrl": "https://danbooru.donmai.us/wiki_pages/curtained_hair"
  },
  {
    "tag": "antenna hair",
    "slug": "antenna_hair",
    "category": "Crown & Accents",
    "subcategory": "Ahoge",
    "description": "A pair of prominent hair strands standing upright from the top of the head like insect antennae.",
    "atomicConditions": [
      {
        "dimension": "crown",
        "dimensionLabel": "Strand Morphology",
        "value": "Upright cowlick hair strand",
        "impliedTag": "ahoge"
      },
      {
        "dimension": "framing",
        "dimensionLabel": "Strand Multiplicity",
        "value": "Dual symmetrical antennae",
        "impliedTag": "antenna hair"
      }
    ],
    "synthesizedPrompt": "antenna hair, ahoge",
    "imageUrl": "https://cdn.donmai.us/720x720/8c/7a/8c7a8fed949da3bc8030b94b42e98f52.webp",
    "wikiUrl": "https://danbooru.donmai.us/wiki_pages/antenna_hair"
  }
];
