import { Injectable, BadRequestException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Wallet } from '../entities/wallet.entity';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

interface AuthResponse {
  user: User;
  accessToken: string;
}

@Injectable()
export class AuthService {
  private oauthClient: OAuth2Client;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.oauthClient = new OAuth2Client({
      clientId: this.configService.get<string>('google.clientId'),
      clientSecret: this.configService.get<string>('google.clientSecret'),
      redirectUri: this.configService.get<string>('google.callbackUrl'),
    });
  }

  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const redirectUri = this.configService.get<string>('google.callbackUrl');

    console.log('Google redirect URI:', this.configService.get<string>('google.callbackUrl'));

    return this.oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      redirect_uri: redirectUri,
    });
  }

  async handleCallback(code: string): Promise<AuthResponse> {
    if (!code) {
      throw new BadRequestException('Authorization code is required');
    }

    try {
      // Exchange code for tokens
      const { tokens } = await this.oauthClient.getToken(code);
      
      if (!tokens.access_token) {
        throw new UnauthorizedException('Failed to get access token from Google');
      }

      this.oauthClient.setCredentials(tokens);
      const userInfoResponse = await this.oauthClient.request({
        url: 'https://www.googleapis.com/oauth2/v3/userinfo',
      });

      const userInfo = userInfoResponse.data as any;

      // Create or update user in database
      let user = await this.userRepository.findOne({
        where: { email: userInfo.email },
      });

      if (user) {
        // Update existing user
        user.firstName = userInfo.given_name || userInfo.name || 'User';
        user.lastName = userInfo.family_name || '';
        user.picture = userInfo.picture;
        
        user = await this.userRepository.save(user);
      } else {
        // Create new user
        user = this.userRepository.create({
          email: userInfo.email,
          firstName: userInfo.given_name || userInfo.name || 'User',
          lastName: userInfo.family_name || '',
          picture: userInfo.picture,
        });

        user = await this.userRepository.save(user);

        // Create wallet for new user
        const wallet = this.walletRepository.create({
          user,
          userId: user.id,
        });
        await this.walletRepository.save(wallet);
      }

      const accessToken = this.generateJwtToken(user);

      return { user, accessToken };
    } catch (error) {
      console.error('Google authentication error:', error.message);
      
      if (error.response?.status === 400) {
        throw new BadRequestException('Invalid authorization code');
      }
      
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid Google credentials');
      }
      
      throw new InternalServerErrorException('Authentication failed');
    }
  }

  private generateJwtToken(user: User): string {
    const payload = { 
      sub: user.id, 
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    
    return this.jwtService.sign(payload);
  }

  async validateUser(payload: any): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
    });
    
    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }
    
    return user;
  }
}