import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from './mail.service';
import { SmsService } from './sms.service';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private smsService: SmsService,
  ) {}

  private generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOtp(userId: string, type: 'EMAIL' | 'SMS') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes to expirate

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        otpCode: code,
        otpExpiresAt: expiresAt,
      },
    });

    if (type === 'EMAIL') {
      const emailBody = `<p>Your verification code is <strong style="font-size: 20px;">${code}</strong>.</p><p>This code will expire in 5 minutes.</p>`;
      await this.mailService.sendMail(user.email, '2FA Verification Code', emailBody);
    } else if (type === 'SMS') {
      if (!user.phoneNumber) {
        throw new BadRequestException('User does not have a registered phone number');
      }
      await this.smsService.sendOtpSms(user.phoneNumber, code);
    }

    return { message: `OTP sent via ${type}` };
  }

  async verifyOtp(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.otpCode || !user.otpExpiresAt) {
      throw new BadRequestException('No active OTP request found');
    }

    if (new Date() > user.otpExpiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    if (user.otpCode !== code) {
      throw new BadRequestException('Invalid OTP code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        otpCode: null,
        otpExpiresAt: null,
        isTwoFactorEnabled: true,
      },
    });

    return { message: 'OTP verified successfully' };
  }
}