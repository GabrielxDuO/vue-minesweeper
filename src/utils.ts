import packageJson from "^/package.json";

/**
 * Generate a random integer within specified range
 * @param min Minimum value (inclusive)
 * @param max Maximum value (inclusive)
 * @returns Random integer within range
 * @throws {Error} When min is greater than max
 */
export function randomInt(min: number, max: number): number {
  if (min > max) {
    throw new Error("Minimum value cannot be greater than maximum value");
  }
  return Math.floor(min + (max - min + 1) * Math.random());
}

export const version = packageJson.version;

export function toValidNumberInRange(value: string, min: number, max: number) {
  const numValue = Number(value);
  return isNaN(numValue) || numValue < min || numValue > max
    ? randomInt(min, max)
    : numValue;
}
