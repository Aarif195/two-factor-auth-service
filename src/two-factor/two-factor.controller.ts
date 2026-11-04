import { Controller, Post, Body } from '@nestjs/common';
import { TotpService } from './totp.service';
import { OtpService } from './otp.service';
import { GenerateTotpDto, VerifyTotpDto } from './dto/totp.dto';
import { BackupCodesService } from './backup-codes.service';

@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly totpService: TotpService, private readonly otpService: OtpService,
    private readonly backupCodesService: BackupCodesService,
  ) { }

  @Post('totp/generate')
  async generateTotp(@Body() dto: GenerateTotpDto) {
    return this.totpService.generateTotpSecret(dto.userId);
  }

  @Post('totp/enable')
  async enableTotp(@Body() dto: VerifyTotpDto) {
    return this.totpService.verifyAndEnableTotp(dto.userId, dto.code);
  }

  @Post('otp/send')
  async sendOtp(@Body('userId') userId: string, @Body('type') type: 'EMAIL' | 'SMS') {
    return this.otpService.sendOtp(userId, type);
  }

  @Post('otp/verify')
  async verifyOtp(@Body('userId') userId: string, @Body('code') code: string) {
    return this.otpService.verifyOtp(userId, code);
  }

  @Post('backup-codes/generate')
  async generateBackupCodes(@Body('userId') userId: string) {
    return this.backupCodesService.generateBackupCodes(userId);
  }

 @Post('backup-codes/verify')
  async verifyBackupCode(@Body('userId') userId: string, @Body('code') code: string) {
    await this.backupCodesService.verifyAndConsumeBackupCode(userId, code);
    return { message: 'Backup recovery code verified and consumed successfully' };
  }

}