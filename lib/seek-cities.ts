/** Real coordinates — the globe's pins sit where these cities actually are. */
export type City = {
  name: string;
  country: string;
  lat: number;
  lon: number;
  /** Relative activity, drives pin size and how often the city fires events. */
  weight: number;
};

export const CITIES: City[] = [
  { name: "Amsterdam", country: "NL", lat: 52.37, lon: 4.9, weight: 1 },
  { name: "London", country: "UK", lat: 51.51, lon: -0.13, weight: 1 },
  { name: "Paris", country: "FR", lat: 48.86, lon: 2.35, weight: 0.9 },
  { name: "Berlin", country: "DE", lat: 52.52, lon: 13.4, weight: 0.85 },
  { name: "Madrid", country: "ES", lat: 40.42, lon: -3.7, weight: 0.7 },
  { name: "Lisbon", country: "PT", lat: 38.72, lon: -9.14, weight: 0.6 },
  { name: "Rome", country: "IT", lat: 41.9, lon: 12.5, weight: 0.65 },
  { name: "Warsaw", country: "PL", lat: 52.23, lon: 21.01, weight: 0.55 },
  { name: "Stockholm", country: "SE", lat: 59.33, lon: 18.07, weight: 0.5 },
  { name: "Istanbul", country: "TR", lat: 41.01, lon: 28.98, weight: 0.8 },
  { name: "Dubai", country: "AE", lat: 25.2, lon: 55.27, weight: 1 },
  { name: "Riyadh", country: "SA", lat: 24.71, lon: 46.68, weight: 0.6 },
  { name: "Tel Aviv", country: "IL", lat: 32.08, lon: 34.78, weight: 0.55 },
  { name: "Cairo", country: "EG", lat: 30.04, lon: 31.24, weight: 0.6 },
  { name: "Casablanca", country: "MA", lat: 33.57, lon: -7.59, weight: 0.4 },
  { name: "Lagos", country: "NG", lat: 6.52, lon: 3.38, weight: 0.7 },
  { name: "Accra", country: "GH", lat: 5.6, lon: -0.19, weight: 0.4 },
  { name: "Nairobi", country: "KE", lat: -1.29, lon: 36.82, weight: 0.5 },
  { name: "Johannesburg", country: "ZA", lat: -26.2, lon: 28.05, weight: 0.5 },
  { name: "Karachi", country: "PK", lat: 24.86, lon: 67.01, weight: 0.55 },
  { name: "Mumbai", country: "IN", lat: 19.08, lon: 72.88, weight: 0.9 },
  { name: "Delhi", country: "IN", lat: 28.61, lon: 77.21, weight: 0.85 },
  { name: "Bangkok", country: "TH", lat: 13.76, lon: 100.5, weight: 0.8 },
  { name: "Ho Chi Minh City", country: "VN", lat: 10.82, lon: 106.63, weight: 0.7 },
  { name: "Kuala Lumpur", country: "MY", lat: 3.14, lon: 101.69, weight: 0.6 },
  { name: "Singapore", country: "SG", lat: 1.35, lon: 103.82, weight: 0.95 },
  { name: "Jakarta", country: "ID", lat: -6.21, lon: 106.85, weight: 0.8 },
  { name: "Manila", country: "PH", lat: 14.6, lon: 120.98, weight: 0.75 },
  { name: "Hong Kong", country: "HK", lat: 22.32, lon: 114.17, weight: 0.8 },
  { name: "Shanghai", country: "CN", lat: 31.23, lon: 121.47, weight: 0.7 },
  { name: "Seoul", country: "KR", lat: 37.57, lon: 126.98, weight: 0.85 },
  { name: "Tokyo", country: "JP", lat: 35.68, lon: 139.65, weight: 1 },
  { name: "Osaka", country: "JP", lat: 34.69, lon: 135.5, weight: 0.6 },
  { name: "Sydney", country: "AU", lat: -33.87, lon: 151.21, weight: 0.8 },
  { name: "Melbourne", country: "AU", lat: -37.81, lon: 144.96, weight: 0.6 },
  { name: "Auckland", country: "NZ", lat: -36.85, lon: 174.76, weight: 0.4 },
  { name: "Los Angeles", country: "US", lat: 34.05, lon: -118.24, weight: 0.95 },
  { name: "San Francisco", country: "US", lat: 37.77, lon: -122.42, weight: 0.9 },
  { name: "Chicago", country: "US", lat: 41.88, lon: -87.63, weight: 0.6 },
  { name: "New York", country: "US", lat: 40.71, lon: -74.01, weight: 1 },
  { name: "Miami", country: "US", lat: 25.76, lon: -80.19, weight: 0.75 },
  { name: "Toronto", country: "CA", lat: 43.65, lon: -79.38, weight: 0.6 },
  { name: "Mexico City", country: "MX", lat: 19.43, lon: -99.13, weight: 0.7 },
  { name: "Bogotá", country: "CO", lat: 4.71, lon: -74.07, weight: 0.5 },
  { name: "Lima", country: "PE", lat: -12.05, lon: -77.04, weight: 0.45 },
  { name: "São Paulo", country: "BR", lat: -23.55, lon: -46.63, weight: 0.85 },
  { name: "Rio de Janeiro", country: "BR", lat: -22.91, lon: -43.17, weight: 0.6 },
  { name: "Buenos Aires", country: "AR", lat: -34.6, lon: -58.38, weight: 0.6 },
  { name: "Santiago", country: "CL", lat: -33.45, lon: -70.67, weight: 0.4 },
];

/** What a seeker just picked up. Drives the live feed next to the globe. */
export const DROP_KINDS = [
  { label: "SEEK airdrop", tone: "brand" },
  { label: "NFT collectible", tone: "magenta" },
  { label: "Quest reward", tone: "aqua" },
  { label: "Partner drop", tone: "brand" },
  { label: "Event token", tone: "magenta" },
] as const;

export type DropKind = (typeof DROP_KINDS)[number];
