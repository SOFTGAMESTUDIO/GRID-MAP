/**
 * Google Places API (New) Service with Fallback Simulator
 */

export async function searchNearbyPlaces(lat, lng, query = 'grocery retail store', apiKey = '') {
  // If user provided a real Google Maps Platform API key, query Google Places API (New)
  if (apiKey && apiKey.startsWith('AIza')) {
    try {
      const url = `https://places.googleapis.com/v1/places:searchText`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.primaryType',
        },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: { latitude: lat, longitude: lng },
              radius: 5000.0,
            },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return (data.places || []).map((p) => ({
          placeId: p.id,
          name: p.displayName?.text || 'Local Store',
          category: 'grocery',
          categoryLabel: 'Retail Store',
          address: p.formattedAddress || 'Ludhiana, Punjab',
          lat: p.location?.latitude || lat,
          lng: p.location?.longitude || lng,
          rating: p.rating || 4.5,
          userRatingsTotal: p.userRatingCount || 50,
          openNow: p.currentOpeningHours?.openNow ?? true,
          imported: false,
        }));
      }
    } catch (err) {
      console.warn('Google Places API request failed, switching to fallback queue:', err.message);
    }
  }

  // Fallback high-fidelity discovery queue for zero-config testing
  return [
    {
      placeId: 'ChIJ_ldh_places_101',
      name: 'Singla Departmental Store',
      category: 'grocery',
      categoryLabel: 'Grocery Store',
      address: 'Main Market, Sarabha Nagar, Ludhiana',
      lat: 30.8985,
      lng: 75.8320,
      rating: 4.6,
      userRatingsTotal: 340,
      openNow: true,
      imported: false,
    },
    {
      placeId: 'ChIJ_ldh_places_102',
      name: 'Apollo Pharmacy & Wellness',
      category: 'pharmacy',
      categoryLabel: 'Pharmacy',
      address: 'Model Town Extn, Near Gol Market, Ludhiana',
      lat: 30.8870,
      lng: 75.8450,
      rating: 4.7,
      userRatingsTotal: 512,
      openNow: true,
      imported: false,
    },
    {
      placeId: 'ChIJ_ldh_places_103',
      name: 'Bake Fresh Confectionery & Bakes',
      category: 'bakery',
      categoryLabel: 'Bakery',
      address: 'College Road, Civil Lines, Ludhiana',
      lat: 30.9120,
      lng: 75.8480,
      rating: 4.8,
      userRatingsTotal: 620,
      openNow: true,
      imported: false,
    },
    {
      placeId: 'ChIJ_ldh_places_104',
      name: 'Reliance Smart Bazaar',
      category: 'supermarket',
      categoryLabel: 'Supermarket',
      address: 'Ferozepur Road, Near Westend Mall, Ludhiana',
      lat: 30.8920,
      lng: 75.8150,
      rating: 4.4,
      userRatingsTotal: 1250,
      openNow: true,
      imported: false,
    },
    {
      placeId: 'ChIJ_ldh_places_105',
      name: 'Puri Hardware & Sanitary Store',
      category: 'hardware',
      categoryLabel: 'Hardware Store',
      address: 'Gill Road, Industrial Area-B, Ludhiana',
      lat: 30.8810,
      lng: 75.8650,
      rating: 4.5,
      userRatingsTotal: 180,
      openNow: true,
      imported: false,
    },
  ];
}

