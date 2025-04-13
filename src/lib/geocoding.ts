interface MapTilerFeature {
  center: [number, number];
  place_name: string;
  place_type: string[];
  relevance: number;
}

export async function getCoordinates(location: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    console.log('Geocoding location:', location);
    const response = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(location)}.json?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}&language=es&country=ar`
    );
    
    if (!response.ok) {
      console.error('Error in geocoding response:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('Geocoding response:', JSON.stringify(data, null, 2));
    
    if (data.features && data.features.length > 0) {
      // Buscamos primero una coincidencia exacta o muy cercana
      const bestMatch = data.features.find((feature: MapTilerFeature) => 
        feature.relevance > 0.8 && 
        (feature.place_type.includes('address') || 
         feature.place_type.includes('poi'))
      ) || data.features[0];

      const [longitude, latitude] = bestMatch.center;
      console.log('Selected coordinates:', { latitude, longitude }, 'for feature:', bestMatch.place_name);
      return { latitude, longitude };
    }
    
    console.log('No coordinates found for location:', location);
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
} 