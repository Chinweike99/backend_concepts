import { createClient } from "redis";
import { Message } from "../types";

class RedisService {
    private publisher: ReturnType<typeof createClient>;
    private subscriber: ReturnType<typeof createClient>;
    private isReady: boolean;


    async initialize() {
        this.publisher = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
        this.subscriber = this.publisher.duplicate();

        await Promise.all([this.publisher.connect(), this.subscriber.connect()]);
        this.isReady = true;
        console.log("Redis connected successfully")
    }

    async storeMessage(message: Message): Promise<void> {
        if(!this.isReady) return;

        const key = `message: ${message.id}`;
        await this.publisher.set(key, JSON.stringify(message));

        // Store in users message list;
        await this.publisher.lPush(`user:${message.from}:messages`, key);
        await this.publisher.lPush(`user: ${message.to}:messages`, key);

        if(message.type === 'group'){
            await this.publisher.lPush(`room: ${message.to}:message`, key)
        }
    };


    async getMessagesFromUser(userId: string, limit = 50): Promise<Message[]> {
        if(!this.isReady) return [];

        const messageKeys = await this.publisher.lRange(`user:${userId}:messages`, 0, limit -1);
        const messages: Message[] = [];

        for(const key of messageKeys){
            const messageData = await this.publisher.get(key);
            if(messageData){
                messages.push(JSON.parse(messageData))
            }
        }
        return messages
    }

     async getMessagesForRoom(roomId: string, limit = 50): Promise<Message[]> {
    if (!this.isReady) return [];
    
    const messageKeys = await this.publisher.lRange(`room:${roomId}:messages`, 0, limit - 1);
    const messages: Message[] = [];
    
    for (const key of messageKeys) {
      const messageData = await this.publisher.get(key);
      if (messageData) {
        messages.push(JSON.parse(messageData));
      }
    }
    
    return messages;
  }

}


export const redisService = new RedisService();





