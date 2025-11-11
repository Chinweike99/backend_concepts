import { Injectable, Logger } from '@nestjs/common';
import {HttpService} from '@nestjs/axios'
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface CatFactResponse {
    fact: string,
    length: number
}

export interface UserProfile {
    email: string,
    name: string,
    stack: string
}


@Injectable()
export class ProfileService {
    private readonly logger = new Logger(ProfileService.name);
    private readonly userProfile: UserProfile;

    constructor(
        private readonly httpService: HttpService,
        private readonly configservice: ConfigService
    ){
        this.userProfile = {
            email: this.configservice.get<string>('EMAIL') || 'chinweike@gmail.com',
            name: this.configservice.get<string>('NAME') || 'Akwolu Chinweike',
            stack: this.configservice.get<string>('STACK') || 'Node.js/NestJs'
        }
    }

    private getCurrentTimestamp(){
        return new Date().toISOString();
    }

    async getProfileWithFact(){
        const timestamp = this.getCurrentTimestamp();

        try {
            const catFact = await this.fetchCatFact();

            return {
                status: 'success',
                user: this.userProfile,
                timestamp,
                fact: catFact
            }

        } catch (error) {
            this.logger.error(`Failed to fetch cat fact: ${error.message}`);
            return {
                status: 'error',
                message: 'Failed to fetch cat fact',
                timestamp,
            }
        }
    }

    private async fetchCatFact(): Promise<string>{
        const timeout = this.configservice.get<number>('CAT_API_TIMEOUT') || 5000;

        const response =  await firstValueFrom(
            this.httpService.get<CatFactResponse>('https://catfact.ninja/fact', {
                timeout,
            })
        );

        if(!response.data.fact){
            throw new Error("Invalid response from Cat Facs API");
        };
        return response.data.fact
    }

}
