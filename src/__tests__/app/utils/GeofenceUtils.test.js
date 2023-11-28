import { isWithinOneMile } from '../../../app/utils/GeofenceUtils';

describe('isWithinOneMile', () => {
  it('should return true if the distance is within 1 mile', () => {
    // Test case 1: distance is exactly 1 mile
    expect(isWithinOneMile(0, 0, 0, 0.006)).toBe(true);

    // Test case 2: distance is less than 1 mile
    expect(isWithinOneMile(0, 0, 0, 0.009)).toBe(true);
  });

  it('should return false if the distance is greater than 1 mile', () => {
    // Test case 1: distance is greater than 1 mile
    expect(isWithinOneMile(0, 0, 0, 1)).toBe(false);

    // Test case 2: distance is much greater than 1 mile
    expect(isWithinOneMile(0, 0, 0, -122)).toBe(false);
  });
});