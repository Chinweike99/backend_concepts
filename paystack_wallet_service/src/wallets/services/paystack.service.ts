import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as crypto from 'crypto';

@Injectable()
export class PaystackService {
  private readonly baseURL = 'https://api.paystack.co';
  private readonly secretKey: string;
  private readonly publicKey: string;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(PaystackService.name);

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get('PAYSTACK_SECRET_KEY') as string;
    this.publicKey = this.configService.get('PAYSTACK_PUBLIC_KEY') as string;
    this.webhookSecret = this.configService.get('PAYSTACK_WEBHOOK_SECRET') as string;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializeTransaction(
    email: string,
    amount: number,
    metadata?: any,
  ): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        {
          email,
          amount: amount, 
          metadata,
          callback_url: this.configService.get('paystack.callbackUrl'),
        },
        {
          headers: this.getHeaders(),
        }
      );

      if (response.data.status && response.data.data) {
        return {
          reference: response.data.data.reference,
          authorization_url: response.data.data.authorization_url,
          access_code: response.data.data.access_code,
        };
      }

      throw new Error('Failed to initialize transaction');
    } catch (error) {
      this.logger.error('Paystack initialization error:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to initialize payment');
    }
  }

  async verifyTransaction(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: this.getHeaders(),
        }
      );

      if (response.data.status && response.data.data) {
        const data = response.data.data;
        return {
          status: data.status === 'success',
          amount: data.amount, // Keep in kobo (Paystack returns kobo)
          reference: data.reference,
          metadata: data.metadata,
          paid_at: data.paid_at,
          currency: data.currency,
          customer: data.customer,
        };
      }

      return { status: false };
    } catch (error) {
      this.logger.error('Paystack verification error:', error.response?.data || error.message);
      return { status: false };
    }
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Webhook secret not configured');
      return true;
    }

    const hash = crypto
      .createHmac('sha512', this.webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
      
    return hash === signature;
  }
}