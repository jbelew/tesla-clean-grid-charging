// GeofenceUtils.js

/**
 * Converts degrees to radians.
 * @param {number} degrees - The value in degrees.
 * @returns {number} The value in radians.
 */
export function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the distance between two coordinates on Earth.
 * @param {number} lat1 - The latitude of the first coordinate.
 * @param {number} lon1 - The longitude of the first coordinate.
 * @param {number} lat2 - The latitude of the second coordinate.
 * @param {number} lon2 - The longitude of the second coordinate.
 * @returns {number} The distance between the two coordinates in miles.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c * 0.621371; // Convert distance to miles

  return distance;
}

/**
 * Checks if two coordinates are within one mile of each other.
 * @param {number} lat1 - The latitude of the first coordinate.
 * @param {number} lon1 - The longitude of the first coordinate.
 * @param {number} lat2 - The latitude of the second coordinate.
 * @param {number} lon2 - The longitude of the second coordinate.
 * @returns {boolean} True if the coordinates are within one mile of each other, false otherwise.
 */
export function isWithinOneMile(lat1, lon1, lat2, lon2) {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= 1; // Check if the distance is within 1 mile
}
  