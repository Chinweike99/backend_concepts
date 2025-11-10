import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
// import { AppModule } from 'src/app.module.js';
import { AppModule } from '../src/app.module';

describe('NotificationController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/notifications (POST) - should accept notification request', () => {
    return request(app.getHttpServer())
      .post('/notifications')
      .send({
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'email',
        template_id: '123e4567-e89b-12d3-a456-426614174001',
        variables: {
          name: 'John Doe',
          code: '123456'
        },
        priority: 'high'
      })
      .expect(202)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.data.notification_id).toBeDefined();
      });
  });

  it('/health (GET) - should return health status', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('ok');
      });
  });
});