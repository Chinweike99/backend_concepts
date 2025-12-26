import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { ApiKeyService } from '../api-key.service';
import { Reflector } from '@nestjs/core';
import { Permission } from '../../entities/api-key.entity';
import { Public } from 'src/auth/decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if route is public
    const isPublic = this.reflector.getAllAndOverride<boolean>(Public, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new ForbiddenException('API key is required');
    }

    const apiKeyEntity = await this.apiKeyService.validateApiKey(apiKey);
    
    // Store apiKey entity and user in request
    request.apiKey = apiKeyEntity;
    request.user = apiKeyEntity.user;

    // Update last used timestamp
    await this.apiKeyService.updateLastUsed(apiKeyEntity.id);

    // Check permissions if required
    const requiredPermissions = this.reflector.get<Permission[]>(
      'permissions',
      context.getHandler(),
    );

    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        apiKeyEntity.hasPermission(permission),
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    return true;
  }
}