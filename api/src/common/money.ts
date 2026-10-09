/**
 * Money is stored in kobo (BigInt) like Paystack. The public API uses whole
 * naira numbers, which is what buyers see and type.
 */
export function koboToNaira(kobo: bigint): number {
  return Number(kobo / 100n);
}

export function nairaToKobo(naira: number): bigint {
  return BigInt(Math.round(naira)) * 100n;
}
