import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNotificationDto {
  @IsUUID()
  @IsNotEmpty()
  user_id: string;

  @IsEnum(['email', 'push'])
  @IsNotEmpty()
  type: 'email' | 'push';

  @IsUUID()
  @IsNotEmpty()
  template_id: string;

  @IsObject()
  @IsNotEmpty()
  variables: Record<string, string>;

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high' = 'medium';
}