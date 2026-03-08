export interface SightingLocation {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  baseSightings: number;
  habitat: string;
}

export interface PredictionResult {
  location: SightingLocation;
  distance: number;
  totalSightings: number;
  reliabilityScore: number;
}

// Real locations known for Lazuli Bunting sightings across western North America
export const sightingLocations: SightingLocation[] = [
  {
    id: "1",
    name: "Malheur National Wildlife Refuge",
    region: "Oregon",
    latitude: 43.2658,
    longitude: -118.8447,
    baseSightings: 245,
    habitat: "Riparian shrubland",
  },
  {
    id: "2",
    name: "Bosque del Apache NWR",
    region: "New Mexico",
    latitude: 33.8067,
    longitude: -106.8914,
    baseSightings: 189,
    habitat: "Cottonwood bosque",
  },
  {
    id: "3",
    name: "Bear River Migratory Bird Refuge",
    region: "Utah",
    latitude: 41.4447,
    longitude: -112.2261,
    baseSightings: 312,
    habitat: "Marsh edges",
  },
  {
    id: "4",
    name: "Seedskadee National Wildlife Refuge",
    region: "Wyoming",
    latitude: 41.9614,
    longitude: -109.6878,
    baseSightings: 156,
    habitat: "Sagebrush steppe",
  },
  {
    id: "5",
    name: "Camas National Wildlife Refuge",
    region: "Idaho",
    latitude: 43.9319,
    longitude: -112.1661,
    baseSightings: 198,
    habitat: "Wetland margins",
  },
  {
    id: "6",
    name: "Monte Vista National Wildlife Refuge",
    region: "Colorado",
    latitude: 37.5269,
    longitude: -106.1017,
    baseSightings: 267,
    habitat: "High desert scrub",
  },
  {
    id: "7",
    name: "Toppenish National Wildlife Refuge",
    region: "Washington",
    latitude: 46.2283,
    longitude: -120.3322,
    baseSightings: 221,
    habitat: "Riparian woodland",
  },
  {
    id: "8",
    name: "Modoc National Wildlife Refuge",
    region: "California",
    latitude: 41.4528,
    longitude: -120.5542,
    baseSightings: 178,
    habitat: "Juniper savanna",
  },
  {
    id: "9",
    name: "Pahranagat National Wildlife Refuge",
    region: "Nevada",
    latitude: 37.2583,
    longitude: -115.1203,
    baseSightings: 134,
    habitat: "Desert oasis",
  },
  {
    id: "10",
    name: "Bitter Lake National Wildlife Refuge",
    region: "New Mexico",
    latitude: 33.4758,
    longitude: -104.4303,
    baseSightings: 167,
    habitat: "Chihuahuan scrub",
  },
  {
    id: "11",
    name: "Turnbull National Wildlife Refuge",
    region: "Washington",
    latitude: 47.4233,
    longitude: -117.5322,
    baseSightings: 203,
    habitat: "Ponderosa pine edge",
  },
  {
    id: "12",
    name: "Deer Flat National Wildlife Refuge",
    region: "Idaho",
    latitude: 43.5758,
    longitude: -116.7261,
    baseSightings: 189,
    habitat: "Sagebrush lowland",
  },
  {
    id: "13",
    name: "Sacramento National Wildlife Refuge",
    region: "California",
    latitude: 39.4428,
    longitude: -122.0614,
    baseSightings: 145,
    habitat: "Valley grassland",
  },
  {
    id: "14",
    name: "Arapaho National Wildlife Refuge",
    region: "Colorado",
    latitude: 40.7833,
    longitude: -106.1333,
    baseSightings: 276,
    habitat: "Montane meadow",
  },
  {
    id: "15",
    name: "Lower Klamath National Wildlife Refuge",
    region: "California/Oregon",
    latitude: 42.0033,
    longitude: -121.7522,
    baseSightings: 234,
    habitat: "Wetland edges",
  },
  {
    id: "16",
    name: "Ruby Lake National Wildlife Refuge",
    region: "Nevada",
    latitude: 40.1944,
    longitude: -115.4958,
    baseSightings: 156,
    habitat: "Great Basin marsh",
  },
  {
    id: "17",
    name: "Stillwater National Wildlife Refuge",
    region: "Nevada",
    latitude: 39.5569,
    longitude: -118.5258,
    baseSightings: 143,
    habitat: "Alkali wetland",
  },
  {
    id: "18",
    name: "Ouray National Wildlife Refuge",
    region: "Utah",
    latitude: 40.1489,
    longitude: -109.6375,
    baseSightings: 198,
    habitat: "Green River bottomland",
  },
  {
    id: "19",
    name: "Buenos Aires National Wildlife Refuge",
    region: "Arizona",
    latitude: 31.5478,
    longitude: -111.5458,
    baseSightings: 167,
    habitat: "Sonoran grassland",
  },
  {
    id: "20",
    name: "San Luis Valley Wetlands",
    region: "Colorado",
    latitude: 37.6817,
    longitude: -105.9592,
    baseSightings: 289,
    habitat: "High altitude wetland",
  },
];

// Monthly activity multipliers for Lazuli Buntings
// Peak breeding season is May-July in western North America
const monthlyMultipliers: Record<number, number> = {
  1: 0.05, // January - wintering in Mexico
  2: 0.08, // February
  3: 0.15, // March - early migration
  4: 0.45, // April - migration
  5: 0.95, // May - peak arrival
  6: 1.0, // June - breeding peak
  7: 0.92, // July - breeding
  8: 0.65, // August - post-breeding
  9: 0.35, // September - migration
  10: 0.12, // October - late migration
  11: 0.05, // November
  12: 0.03, // December
};

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate predictions based on user inputs
export function generatePredictions(
  userLat: number,
  userLon: number,
  years: number,
  month: number
): PredictionResult[] {
  const monthMultiplier = monthlyMultipliers[month] || 0.5;

  const results: PredictionResult[] = sightingLocations.map((location) => {
    const distance = calculateDistance(
      userLat,
      userLon,
      location.latitude,
      location.longitude
    );

    // Calculate total sightings based on years and seasonal patterns
    const yearFactor = Math.sqrt(years / 5); // Diminishing returns on more years
    const randomVariation = 0.8 + Math.random() * 0.4; // 80-120% variation
    const totalSightings = Math.round(
      location.baseSightings * yearFactor * monthMultiplier * randomVariation
    );

    // Calculate reliability score based on sample size and distance
    const sampleReliability = Math.min(totalSightings / 100, 1);
    const distanceReliability = Math.max(0, 1 - distance / 1000);
    const yearReliability = Math.min(years / 5, 1);
    const reliabilityScore = Math.round(
      ((sampleReliability * 0.5 + distanceReliability * 0.3 + yearReliability * 0.2) * 100)
    );

    return {
      location,
      distance: Math.round(distance),
      totalSightings,
      reliabilityScore: Math.min(reliabilityScore, 99),
    };
  });

  // Sort by a combination of sightings and proximity
  return results
    .sort((a, b) => {
      const scoreA = a.totalSightings / (1 + a.distance / 500);
      const scoreB = b.totalSightings / (1 + b.distance / 500);
      return scoreB - scoreA;
    })
    .slice(0, 10);
}
