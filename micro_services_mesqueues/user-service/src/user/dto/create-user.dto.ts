import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  push_token?: string;

  @IsObject()
  @IsOptional()
  notification_preferences?: {
    email_enabled: boolean;
    push_enabled: boolean;
    language: string;
  };
}