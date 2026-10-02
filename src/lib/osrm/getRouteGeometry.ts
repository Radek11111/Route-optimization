type Coordinate = [number, number];

export async function getRouteGeometry(
  coordinates: Coordinate[],
  baseUrl: string = "https://router.project-osrm.org",
): Promise<Coordinate[]> {
  if (coordinates.length < 2) return coordinates;

  const coords = coordinates.map(([lon, lat]) => `${lon},${lat}`).join(";");

  const url = `${baseUrl}/route/v1/driving/${coords}?overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OSRM API request failed with status ${response.status}`);
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes?.[0]) {
    throw new Error(`OSRM error: ${data.code}`);
  }

  return data.routes[0].geometry.coordinates;
}
