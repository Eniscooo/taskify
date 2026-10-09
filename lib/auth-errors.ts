import type { AuthError } from "./auth-client";

const WRONG_LOGIN = "That phone/email and password don't match. Try again or reset your password.";
const CODE_EXPIRED = "That code has expired. Tap “Resend code” to get a new one.";

const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: WRONG_LOGIN,
  INVALID_PHONE_NUMBER_OR_PASSWORD: WRONG_LOGIN,
  USER_ALREADY_EXISTS: "An account with this email already exists. Log in instead.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "An account with this email already exists. Log in instead.",
  PHONE_NUMBER_EXISTS: "An account with this phone number already exists. Log in instead.",
  INVALID_PHONE_NUMBER: "Enter a valid Nigerian mobile number, e.g. 0803 412 7790.",
  INVALID_OTP: "That code isn't right. Check the SMS and try again.",
  OTP_EXPIRED: CODE_EXPIRED,
  OTP_NOT_FOUND: CODE_EXPIRED,
  TOO_MANY_ATTEMPTS: "Too many wrong codes. Tap “Resend code” to get a new one.",
  PASSWORD_TOO_SHORT: "Use at least 8 characters.",
};

/** A message to show the user for a failed auth call. */
export function authErrorMessage(error: AuthError) {
  if (error.status === 429) return "Too many attempts. Wait a minute, then try again.";
  return (error.code && MESSAGES[error.code]) || error.message || "Something went wrong. Please try again.";
}
