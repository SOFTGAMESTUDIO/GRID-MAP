/**
 * NearKart Hyperlocal Smart Shop Recommendation Engine
 * Calculates actual road-distance approximations, travel times across modes (Bike, Car, Walk),
 * and dynamic multi-criteria composite rankings.
 */

// Haversine straight-line distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Actual road distance approximation using urban detour factor (1.32x - 1.40x)
export function calculateRoadDistance(lat1, lon1, lat2, lon2) {
  const straightLine = haversineDistance(lat1, lon1, lat2, lon2);
  // In urban Indian cities (like Ludhiana), road networks have a detour factor of ~1.35
  const roadDistance = straightLine * 1.35;
  return Number(roadDistance.toFixed(2));
}

// Calculate realistic travel times by vehicle mode in minutes
export function calculateTravelTimes(roadDistanceKm) {
  // Average urban speeds with traffic:
  // Two-wheeler (Bike / Scooter): 25 km/h
  // Four-wheeler (Car): 18 km/h (due to narrow street traffic)
  // Walking: 4.5 km/h
  const bikeMinutes = Math.max(3, Math.round((roadDistanceKm / 25) * 60));
  const carMinutes = Math.max(5, Math.round((roadDistanceKm / 18) * 60));
  const walkingMinutes = Math.max(5, Math.round((roadDistanceKm / 4.5) * 60));

  return {
    bike: bikeMinutes,
    car: carMinutes,
    walking: walkingMinutes,
  };
}

// Estimated delivery time = Store prep time + Partner road transit
export function calculateDeliveryTimeMinutes(roadDistanceKm, basePrepMinutes = 5) {
  const travelTime = (roadDistanceKm / 25) * 60;
  return Math.max(10, Math.round(basePrepMinutes + travelTime));
}

// Multi-criteria ranking engine
export function rankShops(shops, customerLat, customerLng, category = '') {
  let list = shops.map((shop) => {
    const roadDist = calculateRoadDistance(customerLat, customerLng, shop.lat, shop.lng);
    const travelTimes = calculateTravelTimes(roadDist);
    const deliveryEta = calculateDeliveryTimeMinutes(roadDist);

    // Multi-factor composite score calculation
    // Factors: verified status (30%), rating (25%), proximity (25%), low delivery fee (10%), open status (10%)
    let score = 0;
    if (shop.isVerified) score += 30;
    if (shop.isOpen) score += 10;
    score += (shop.rating / 5) * 25;
    score += Math.max(0, 25 - roadDist * 4); // higher for closer shops
    score += Math.max(0, 10 - shop.deliveryCharge * 0.2); // higher for lower fee

    return {
      ...shop,
      distanceKm: roadDist,
      travelTimes,
      deliveryTimeMin: deliveryEta,
      compositeScore: Number(score.toFixed(1)),
    };
  });

  if (category) {
    list = list.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }

  // Segmented Recommendations
  const nearest = [...list].sort((a, b) => a.distanceKm - b.distanceKm)[0] || null;
  const fastest = [...list].sort((a, b) => a.deliveryTimeMin - b.deliveryTimeMin)[0] || null;
  const bestRated = [...list].sort((a, b) => b.rating - a.rating)[0] || null;
  const lowestDelivery = [...list].sort((a, b) => a.deliveryCharge - b.deliveryCharge)[0] || null;
  const bestOverall = [...list].sort((a, b) => b.compositeScore - a.compositeScore)[0] || null;

  return {
    rankedShops: list,
    recommendations: {
      nearest,
      fastest,
      bestRated,
      lowestDelivery,
      bestOverall,
    },
  };
}

