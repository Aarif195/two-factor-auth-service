import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendOtpSms(phoneNumber: string, otpCode: string): Promise<boolean> {
    this.logger.log(`[SMS PLACEHOLDER] Sending OTP ${otpCode} to ${phoneNumber}`);
    return true;
  }
}