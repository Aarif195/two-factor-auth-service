import { Controller, Post, Body } from '@nestjs/common';
import { TotpService } from './totp.service';
import { GenerateTotpDto, VerifyTotpDto } from './dto/totp.dto';

@Controller('2fa')
export class TwoFactorController {
  constructor(private readonly totpService: TotpService) {}

  @Post('totp/generate')
  async generateTotp(@Body() dto: GenerateTotpDto) {
    return this.totpService.generateTotpSecret(dto.userId);
  }

  @Post('totp/enable')
  async enableTotp(@Body() dto: VerifyTotpDto) {
    return this.totpService.verifyAndEnableTotp(dto.userId, dto.code);
  }
}