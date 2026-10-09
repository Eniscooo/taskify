/** Nigerian mobile number in E.164, e.g. +2348034127790 (MTN, Glo, Airtel, 9mobile). */
const NIGERIAN_MOBILE_E164 = /^\+234[789][01]\d{8}$/;

export function isNigerianMobile(phone: string): boolean {
  return NIGERIAN_MOBILE_E164.test(phone);
}
