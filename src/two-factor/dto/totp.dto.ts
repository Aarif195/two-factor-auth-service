export class VerifyTotpDto {
  userId: string;
  code: string;
}

export class GenerateTotpDto {
  userId: string;
}