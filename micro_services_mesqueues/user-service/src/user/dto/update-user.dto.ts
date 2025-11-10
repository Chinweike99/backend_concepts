import { IsEmail, IsOptional, IsString, IsObject, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  push_token?: string;

  @IsObject()
  @IsOptional()
  notification_preferences?: {
    email_enabled?: boolean;
    push_enabled?: boolean;
    language?: string;
  };
}
