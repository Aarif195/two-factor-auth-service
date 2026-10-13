import { Module } from '@nestjs/common';
import { TwoFactorController } from './two-factor.controller';
import { TotpService } from './totp.service';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';
import { MailService } from './mail.service';


@Module({
  controllers: [TwoFactorController],
  providers: [TotpService, MailService, SmsService, OtpService],
  exports: [TotpService, OtpService],
})
export class TwoFactorModule {}
