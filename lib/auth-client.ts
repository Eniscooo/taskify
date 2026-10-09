import { createAuthClient } from "better-auth/react";
import { emailOTPClient, inferAdditionalFields, phoneNumberClient } from "better-auth/client/plugins";
import { API_BASE_URL } from "./constants";

/**
 * Better Auth client for the browser. Sign-up, sign-in, OTP and sessions are
 * served by the API under /v1/auth; the session lives in an httpOnly cookie.
 */
export const authClient = createAuthClient({
  baseURL: `${API_BASE_URL}/auth`,
  fetchOptions: { credentials: "include" },
  plugins: [
    phoneNumberClient(),
    emailOTPClient(),
    inferAdditionalFields({
      user: {
        username: { type: "string", required: false, input: false },
        area: { type: "string", required: false },
        bio: { type: "string", required: false },
      },
    }),
  ],
});

/** Error returned by auth calls, e.g. `{ code: "INVALID_OTP", message: "Invalid OTP" }`. */
export type AuthError = { code?: string; message?: string; status: number; phoneNumber?: string };
