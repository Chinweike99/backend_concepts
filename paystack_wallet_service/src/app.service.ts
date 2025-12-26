import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'Wallet Service API',
      version: '1.0.0',
      status: 'active',
      documentation: '/api',
      endpoints: {
        auth: '/auth',
        wallet: '/wallet',
        apiKeys: '/keys',
      },
      message: 'Welcome to Wallet Service API. Visit /api for full documentation.',
    };
  }
}
