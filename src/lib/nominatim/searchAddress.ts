export type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

export async function searchAddress(query: string): Promise<NominatimResult[]> {
  if (!query) {
    throw new Error("Query is required");
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=pl`;

  const response = await fetch(url, {
    headers: {
      "Accept-Language": "pl",
      "User-Agent": "optymalizacja-trasy",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Nominatim API request failed with status ${response.status}`,
    );
  }

  return response.json();
}
