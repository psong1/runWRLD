export const getCoordinates = async (address) => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;
  const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng };
    }
    throw new Error("Location not found");
  } catch (err) {
    console.error("Geocoding error: ", err);
    return null;
  }
};

export const findNearbyStadiums = async (lat, lng) => {
  const apiKey = import.meta.env.VITE_GEOAPIFY_KEY;

  const categories = "sport.track, sport.stadium, sport.sports_centre";

  const cleanLat = parseFloat(lat).toFixed(6);
  const cleanLng = parseFloat(lng).toFixed(6);

  const url = `https://api.geoapify.com/v2/places?categories=${categories}&filter=circle:${cleanLng},${cleanLat},5000&limit=10&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return (
      data?.features?.map((feature) => {
        const { name, formatted, place_id, lat, lon } = feature.properties;

        const cleanAddress =
          name && formatted ? formatted.replace(`${name}, `, "") : formatted;

        return {
          id: place_id,
          name: name || "Unnamed Track/Stadium",
          address: cleanAddress,
          lat: lat,
          lng: lon,
          isExternal: true,
        };
      }) || []
    );
  } catch (err) {
    console.error("Geoapify Places Error: ", err);
    return [];
  }
};
