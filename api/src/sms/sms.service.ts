import { Injectable, Logger } from '@nestjs/common';

/**
 * Sends text messages. Only the "console" provider exists so far: it logs
 * the message instead of sending it, for local development. The env
 * validation refuses to boot production with it, so a real provider
 * (e.g. Termii) must be added here before launch.
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger('SMS');

  async send(to: string, message: string): Promise<void> {
    this.logger.log(`to ${to}: ${message}`);
  }
}
