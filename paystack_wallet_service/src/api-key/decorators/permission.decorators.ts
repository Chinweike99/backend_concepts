import { SetMetadata } from '@nestjs/common';
import { Permission } from '../../entities/api-key.entity';

export const Permissions = (...permissions: Permission[]) =>
  SetMetadata('permissions', permissions);