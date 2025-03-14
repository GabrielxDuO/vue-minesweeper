import packageJson from "^/package.json";

/**
 * Get a random integer in [l, r)
 * @param l left bound
 * @param r right bound
 * @returns random int [l, r)
 */
export function randomInt(l: number, r: number): number {
  return Math.floor(l + (r - l) * Math.random());
}

export const version = packageJson.version;
