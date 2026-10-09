import type { Email } from './email.service.js';

const PURPOSE = {
  'email-verification': {
    subject: 'Verify your email for Naija Market',
    intro: 'Use this code to verify your email address:',
  },
  'forget-password': {
    subject: 'Your Naija Market password reset code',
    intro: 'Use this code to reset your password:',
  },
} as const;

export type CodeEmailPurpose = keyof typeof PURPOSE;

/** A one-time code email. Codes are digits only, so nothing needs escaping. */
export function codeEmail(to: string, purpose: CodeEmailPurpose, code: string, minutes: number): Email {
  const { subject, intro } = PURPOSE[purpose];
  const outro = `It expires in ${minutes} minutes. Naija Market staff will never ask for this code. If you didn't ask for it, you can ignore this email.`;
  return {
    to,
    subject,
    text: `${intro}\n\n${code}\n\n${outro}`,
    html: `<!doctype html>
<html>
  <body style="margin:0;background:#f6f7f5;font-family:Arial,Helvetica,sans-serif;color:#14201a">
    <div style="max-width:480px;margin:0 auto;padding:32px 24px">
      <p style="font-size:20px;font-weight:800;margin:0 0 24px">Naija <span style="color:#0a7c4a">Market</span></p>
      <div style="background:#ffffff;border-radius:16px;padding:28px 24px">
        <p style="margin:0 0 16px;font-size:16px">${intro}</p>
        <p style="margin:0 0 16px;font-size:32px;font-weight:800;letter-spacing:8px">${code}</p>
        <p style="margin:0;font-size:14px;color:#5f6b64">${outro}</p>
      </div>
    </div>
  </body>
</html>`,
  };
}
