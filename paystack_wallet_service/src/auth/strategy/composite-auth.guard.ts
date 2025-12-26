import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyGuard } from '../../api-key/guards/api-key.guards';

@Injectable()
export class CompositeAuthGuard implements CanActivate {
  constructor(
    private jwtAuthGuard: JwtAuthGuard,
    private apiKeyGuard: ApiKeyGuard,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check for API key first
    const apiKey = request.headers['x-api-key'];
    if (apiKey) {
      try {
        const result = await this.apiKeyGuard.canActivate(context);
        return result as boolean;
      } catch (error) {
        // If API key fails, try JWT
        console.log('API key authentication failed:', error.message);
      }
    }

    try {
      const result = await this.jwtAuthGuard.canActivate(context);
      return result as boolean;
    } catch (error) {
      throw new UnauthorizedException('Authentication required. Provide either JWT token or a valid API key.');
    }
  }
}