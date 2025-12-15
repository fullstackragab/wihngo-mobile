/**
 * Common Bird Species
 * List of common bird species for autocomplete
 */

export interface BirdSpecies {
  species: string;
  commonName: string;
  scientificName: string;
}

export const COMMON_BIRD_SPECIES: BirdSpecies[] = [
  // Parrots & Parakeets
  {
    species: "Budgerigar",
    commonName: "Budgie",
    scientificName: "Melopsittacus undulatus",
  },
  {
    species: "Cockatiel",
    commonName: "Cockatiel",
    scientificName: "Nymphicus hollandicus",
  },
  {
    species: "African Grey Parrot",
    commonName: "African Grey",
    scientificName: "Psittacus erithacus",
  },
  {
    species: "Macaw",
    commonName: "Blue and Gold Macaw",
    scientificName: "Ara ararauna",
  },
  {
    species: "Amazon Parrot",
    commonName: "Yellow-naped Amazon",
    scientificName: "Amazona auropalliata",
  },
  {
    species: "Cockatoo",
    commonName: "Sulphur-crested Cockatoo",
    scientificName: "Cacatua galerita",
  },
  {
    species: "Lovebird",
    commonName: "Lovebird",
    scientificName: "Agapornis spp.",
  },
  {
    species: "Conure",
    commonName: "Sun Conure",
    scientificName: "Aratinga solstitialis",
  },

  // Finches & Canaries
  {
    species: "Canary",
    commonName: "Domestic Canary",
    scientificName: "Serinus canaria",
  },
  {
    species: "Zebra Finch",
    commonName: "Zebra Finch",
    scientificName: "Taeniopygia guttata",
  },
  {
    species: "Gouldian Finch",
    commonName: "Gouldian Finch",
    scientificName: "Erythrura gouldiae",
  },
  {
    species: "Society Finch",
    commonName: "Society Finch",
    scientificName: "Lonchura domestica",
  },

  // Pigeons & Doves
  {
    species: "Rock Pigeon",
    commonName: "Rock Dove",
    scientificName: "Columba livia",
  },
  {
    species: "Mourning Dove",
    commonName: "Mourning Dove",
    scientificName: "Zenaida macroura",
  },
  {
    species: "Diamond Dove",
    commonName: "Diamond Dove",
    scientificName: "Geopelia cuneata",
  },

  // Hummingbirds
  {
    species: "Ruby-throated Hummingbird",
    commonName: "Ruby-throated Hummingbird",
    scientificName: "Archilochus colubris",
  },
  {
    species: "Anna's Hummingbird",
    commonName: "Anna's Hummingbird",
    scientificName: "Calypte anna",
  },
  {
    species: "Rufous Hummingbird",
    commonName: "Rufous Hummingbird",
    scientificName: "Selasphorus rufus",
  },

  // Songbirds
  {
    species: "American Robin",
    commonName: "American Robin",
    scientificName: "Turdus migratorius",
  },
  {
    species: "Blue Jay",
    commonName: "Blue Jay",
    scientificName: "Cyanocitta cristata",
  },
  {
    species: "Northern Cardinal",
    commonName: "Northern Cardinal",
    scientificName: "Cardinalis cardinalis",
  },
  {
    species: "American Goldfinch",
    commonName: "American Goldfinch",
    scientificName: "Spinus tristis",
  },
  {
    species: "House Sparrow",
    commonName: "House Sparrow",
    scientificName: "Passer domesticus",
  },
  {
    species: "European Starling",
    commonName: "European Starling",
    scientificName: "Sturnus vulgaris",
  },
  {
    species: "House Finch",
    commonName: "House Finch",
    scientificName: "Haemorhous mexicanus",
  },

  // Chickens & Poultry
  {
    species: "Chicken",
    commonName: "Domestic Chicken",
    scientificName: "Gallus gallus domesticus",
  },
  {
    species: "Turkey",
    commonName: "Wild Turkey",
    scientificName: "Meleagris gallopavo",
  },
  {
    species: "Duck",
    commonName: "Mallard Duck",
    scientificName: "Anas platyrhynchos",
  },
  {
    species: "Goose",
    commonName: "Canada Goose",
    scientificName: "Branta canadensis",
  },

  // Birds of Prey
  {
    species: "Bald Eagle",
    commonName: "Bald Eagle",
    scientificName: "Haliaeetus leucocephalus",
  },
  {
    species: "Red-tailed Hawk",
    commonName: "Red-tailed Hawk",
    scientificName: "Buteo jamaicensis",
  },
  {
    species: "Great Horned Owl",
    commonName: "Great Horned Owl",
    scientificName: "Bubo virginianus",
  },
  { species: "Barn Owl", commonName: "Barn Owl", scientificName: "Tyto alba" },
  {
    species: "Peregrine Falcon",
    commonName: "Peregrine Falcon",
    scientificName: "Falco peregrinus",
  },

  // Waterfowl
  { species: "Swan", commonName: "Mute Swan", scientificName: "Cygnus olor" },
  {
    species: "Pelican",
    commonName: "American White Pelican",
    scientificName: "Pelecanus erythrorhynchos",
  },
  {
    species: "Heron",
    commonName: "Great Blue Heron",
    scientificName: "Ardea herodias",
  },
  { species: "Egret", commonName: "Great Egret", scientificName: "Ardea alba" },
  {
    species: "Crane",
    commonName: "Sandhill Crane",
    scientificName: "Antigone canadensis",
  },

  // Corvids
  {
    species: "American Crow",
    commonName: "American Crow",
    scientificName: "Corvus brachyrhynchos",
  },
  {
    species: "Common Raven",
    commonName: "Common Raven",
    scientificName: "Corvus corax",
  },
  {
    species: "Black-billed Magpie",
    commonName: "Black-billed Magpie",
    scientificName: "Pica hudsonia",
  },

  // Woodpeckers
  {
    species: "Downy Woodpecker",
    commonName: "Downy Woodpecker",
    scientificName: "Dryobates pubescens",
  },
  {
    species: "Northern Flicker",
    commonName: "Northern Flicker",
    scientificName: "Colaptes auratus",
  },
  {
    species: "Pileated Woodpecker",
    commonName: "Pileated Woodpecker",
    scientificName: "Dryocopus pileatus",
  },

  // Exotic Pet Birds
  {
    species: "Mynah Bird",
    commonName: "Hill Mynah",
    scientificName: "Gracula religiosa",
  },
  {
    species: "Toucan",
    commonName: "Toco Toucan",
    scientificName: "Ramphastos toco",
  },
  {
    species: "Peacock",
    commonName: "Indian Peafowl",
    scientificName: "Pavo cristatus",
  },
  {
    species: "Flamingo",
    commonName: "Greater Flamingo",
    scientificName: "Phoenicopterus roseus",
  },
  {
    species: "Ostrich",
    commonName: "Common Ostrich",
    scientificName: "Struthio camelus",
  },
  {
    species: "Emu",
    commonName: "Emu",
    scientificName: "Dromaius novaehollandiae",
  },

  // Small Pet Birds
  {
    species: "Parakeet",
    commonName: "Monk Parakeet",
    scientificName: "Myiopsitta monachus",
  },
  {
    species: "Java Sparrow",
    commonName: "Java Sparrow",
    scientificName: "Lonchura oryzivora",
  },
  {
    species: "Button Quail",
    commonName: "Button Quail",
    scientificName: "Coturnix chinensis",
  },
];

/**
 * Search bird species by name
 */
export function searchBirdSpecies(
  query: string,
  translateFn?: (key: string) => string
): BirdSpecies[] {
  if (!query.trim()) {
    return COMMON_BIRD_SPECIES;
  }

  const searchTerm = query.toLowerCase().trim();

  return COMMON_BIRD_SPECIES.filter((bird) => {
    // If translate function provided, prioritize translated name search
    if (translateFn) {
      const translationKey = `species.${bird.species
        .toLowerCase()
        .replace(/['\s-]/g, "_")}`;
      const translatedName = translateFn(translationKey);

      // Search in translated name first (if translation exists)
      if (translatedName !== translationKey) {
        if (translatedName.toLowerCase().includes(searchTerm)) {
          return true;
        }
      }
    }

    // Also search in English names (as fallback or additional matching)
    const matchesEnglish =
      bird.species.toLowerCase().includes(searchTerm) ||
      bird.commonName.toLowerCase().includes(searchTerm) ||
      bird.scientificName.toLowerCase().includes(searchTerm);

    return matchesEnglish;
  });
}
