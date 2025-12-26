import {
  Controller,
  Get,
  Query,
  Res,
  HttpStatus,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import type { Response, Request } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('google')
  @Public()
  @ApiOperation({ summary: 'Initiate Google Sign-In flow' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns Google authentication URL',
    schema: {
      example: {
        google_auth_url: 'https://accounts.google.com/o/oauth2/auth?response_type=code&...'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  initiateGoogleAuth(@Res({ passthrough: true }) res: Response) {
    try {
      const authUrl = this.authService.getAuthUrl();
      
      return {
        google_auth_url: authUrl,
        message: 'Use this URL to authenticate with Google',
      };
    } catch (error) {
      throw new BadRequestException('Failed to generate authentication URL');
    }
  }

  @Get('google/callback')
  @Public()
  @ApiOperation({ summary: 'Google OAuth callback endpoint' })
  @ApiQuery({ name: 'code', description: 'Authorization code from Google', required: true })
  @ApiResponse({ 
    status: 200, 
    description: 'User authenticated successfully',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        token_type: 'Bearer',
        user: {
          user_id: 'uuid',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          picture: 'https://profile_picture_url'
        },
        message: 'Authentication successful'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Missing authorization code' })
  @ApiResponse({ status: 401, description: 'Invalid authorization code' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async googleCallback(@Query('code') code: string) {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    try {
      const { user, accessToken } = await this.authService.handleCallback(code);
      
      return {
        access_token: accessToken,
        token_type: 'Bearer',
        user: {
          user_id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          picture: user.picture,
        },
        message: 'Authentication successful',
      };
    } catch (error) {
      throw error;
    }
  }

  // @Post('refresh')
  // @Public()
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Refresh JWT token' })
  // @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  // @ApiResponse({ status: 401, description: 'Invalid token' })
  // async refreshToken(@Body() body: { token: string }) {
  //   try {
  //     const decoded = this.authService['jwtService'].verify(body.token, {
  //       ignoreExpiration: true,
  //     });
  //     const user = await this.authService.validateUser(decoded);
      
  //     const accessToken = this.authService['generateJwtToken'](user);
      
  //     return {
  //       access_token: accessToken,
  //       token_type: 'Bearer',
  //       user: {
  //         user_id: user.id,
  //         email: user.email,
  //         firstName: user.firstName,
  //         lastName: user.lastName,
  //         picture: user.picture,
  //       },
  //     };
  //   } catch (error) {
  //     throw new UnauthorizedException('Invalid token');
  //   }
  // }

  // @Post('validate')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'Validate JWT token' })
  // @ApiResponse({ status: 200, description: 'Token is valid' })
  // @ApiResponse({ status: 401, description: 'Token is invalid' })
  // async validateToken(@Req() req: Request) {
  //   const authHeader = req.headers.authorization;
  //   if (!authHeader) {
  //     throw new UnauthorizedException('No token provided');
  //   }

  //   const token = authHeader.split(' ')[1];
  //   try {
  //     const decoded = this.authService['jwtService'].verify(token);
  //     const user = await this.authService.validateUser(decoded);
  //     return { valid: true, user };
  //   } catch (error) {
  //     throw new UnauthorizedException('Invalid token');
  //   }
  // }
}