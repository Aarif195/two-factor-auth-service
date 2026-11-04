import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BackupCodesService {
  constructor(private prisma: PrismaService) {}

  async generateBackupCodes(userId: string) {
    const rawCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < 5; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      rawCodes.push(code);
      const hashed = await bcrypt.hash(code, 10);
      hashedCodes.push(hashed);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { backupCodes: hashedCodes },
    });

    return {
      message: 'Backup recovery codes generated successfully. Store them safely.',
      backupCodes: rawCodes,
    };
  }

  async verifyAndConsumeBackupCode(userId: string, plainCode: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    
    // Explicitly cast backupCodes to string array
    const backupCodes = (user?.backupCodes as string[]) || [];

    if (!user || backupCodes.length === 0) {
      throw new BadRequestException('No backup codes found for user');
    }

    let matchedIndex = -1;
    for (let i = 0; i < backupCodes.length; i++) {
      const isMatch = await bcrypt.compare(plainCode, backupCodes[i]);
      if (isMatch) {
        matchedIndex = i;
        break;
      }
    }

    if (matchedIndex === -1) {
      throw new BadRequestException('Invalid backup recovery code');
    }

    // To remove consumed backup code so it cannot be reused
    const updatedCodes = [...backupCodes];
    updatedCodes.splice(matchedIndex, 1);

    await this.prisma.user.update({
      where: { id: userId },
      data: { backupCodes: updatedCodes },
    });

    return true;
  }
}