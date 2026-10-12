import { Injectable, BadRequestException } from '@nestjs/common';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TotpService {
    constructor(private prisma: PrismaService) { }

    async generateTotpSecret(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const secret = authenticator.generateSecret();
        const serviceName = '2FA Microservice';
        const otpauthUrl = authenticator.keyuri(user.email, serviceName, secret);

        const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

        await this.prisma.user.update({
            where: { id: userId },
            data: { twoFactorSecret: secret },
        });

        return { secret, qrCodeDataUrl };
    }

    async verifyAndEnableTotp(userId: string, code: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.twoFactorSecret) {
            throw new BadRequestException('TOTP setup has not been initiated');
        }

        // console.log('Stored TOTP secret:', user.twoFactorSecret);

        console.log('Token received:', JSON.stringify(code));
        console.log('Backend code:', authenticator.generate(user.twoFactorSecret));

        const isValid = authenticator.verify({
            token: code,
            secret: user.twoFactorSecret,
        });

        if (!isValid) {
            throw new BadRequestException('Invalid TOTP verification code');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: {
                isTwoFactorEnabled: true,
                twoFactorType: 'TOTP',
            },
        });

        return { message: '2FA enabled successfully using TOTP' };
    }
}