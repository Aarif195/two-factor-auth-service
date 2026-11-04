import { Module } from '@nestjs/common';
import { TwoFactorController } from './two-factor.controller';
import { TotpService } from './totp.service';
import { OtpService } from './otp.service';
import { SmsService } from './sms.service';
import { MailService } from './mail.service';
import { BackupCodesService } from './backup-codes.service';


@Module({
  controllers: [TwoFactorController],
  providers: [TotpService, MailService, SmsService, OtpService, BackupCodesService],
  exports: [TotpService, OtpService, BackupCodesService],
})
export class TwoFactorModule {}
