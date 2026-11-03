import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { TotpService } from 'src/two-factor/totp.service';
import { OtpService } from 'src/two-factor/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private totpService: TotpService,
    private otpService: OtpService,
  ) { }

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hashedPassword,
        phoneNumber: dto.phoneNumber,
      },
    });

    return {
      message: 'User registered successfully',
      userId: user.id,
    };
  }

   async login(dto: LoginDto) {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // payload structure 
      const payload = { sub: user.id, email: user.email };

      // If 2FA is enabled, issue preliminary token requiring 2FA step
      if (user.isTwoFactorEnabled) {
        const partialPayload = { ...payload, isTwoFactorAuthenticated: false };
        const accessToken = this.jwtService.sign(partialPayload);

        return {
          accessToken,
          isTwoFactorEnabled: true,
          twoFactorType: user.twoFactorType,
          message: '2FA verification required',
        };
      }

      // login token if 2FA is disabled
      const accessToken = this.jwtService.sign({ ...payload, isTwoFactorAuthenticated: true });

      return {
        accessToken,
        isTwoFactorEnabled: false,
      };
    }

  async verifyTwoFactorLogin(userId: string, code: string, type: 'TOTP' | 'EMAIL' | 'SMS') {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.isTwoFactorEnabled) {
        throw new BadRequestException('2FA is not enabled for this user');
      }

      if (type === 'TOTP') {
        await this.totpService.verifyAndEnableTotp(userId, code);
      } else {
        await this.otpService.verifyOtp(userId, code);
      }

      const payload = { sub: user.id, email: user.email, isTwoFactorAuthenticated: true };
      const accessToken = this.jwtService.sign(payload);

      return {
        message: '2FA authentication successful',
        accessToken,
      };
    }

}