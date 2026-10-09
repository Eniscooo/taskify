import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import type { Env } from '../config/env.js';

export interface Email {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Sends email through Resend, or logs it when EMAIL_PROVIDER is "console"
 * (development). Env validation refuses "console" in production.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger('Email');
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(config: ConfigService<Env, true>) {
    const useResend = config.get('EMAIL_PROVIDER', { infer: true }) === 'resend';
    this.resend = useResend ? new Resend(config.get('RESEND_API_KEY', { infer: true })) : null;
    this.from = config.get('EMAIL_FROM', { infer: true }) ?? 'Naija Market <no-reply@localhost>';
  }

  async send(email: Email): Promise<void> {
    if (!this.resend) {
      this.logger.log(`to ${email.to}: ${email.subject}\n${email.text}`);
      return;
    }
    const { error } = await this.resend.emails.send({ from: this.from, ...email });
    if (error) {
      // Log the provider's detail; callers only learn that sending failed.
      this.logger.error(`Resend failed for "${email.subject}": ${error.name}: ${error.message}`);
      throw new Error('Email could not be sent');
    }
  }
}
