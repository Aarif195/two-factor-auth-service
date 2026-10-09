export class RegisterDto {
  email: string;
  password: string;
  phoneNumber?: string;
}

export class LoginDto {
  email: string;
  password: string;
}