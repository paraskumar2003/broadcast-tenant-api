import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { createBullBoardServer } from './bull-board';
import { BullmqQueueProvider } from './queue/providers/bullmq-queue.provider';
import { QUEUE_SERVICE } from './queue/queue.interface';
import { Queue } from 'bullmq';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const queueProvider = app.get(QUEUE_SERVICE);
  let queues: Queue[] = [];
  if (queueProvider instanceof BullmqQueueProvider) {
    queues = queueProvider.getQueues();
  }

  const serverAdapter = createBullBoardServer(queues);

  app.use('/admin/queues', serverAdapter.getRouter());

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({ origin: '*' });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('WhatsApp Messaging Service')
    .setDescription(
      'Dedicated NestJS service for WhatsApp message delivery via Meta Cloud API',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // Start
  const port = process.env.PORT || 3010;
  await app.listen(port);
  logger.log(`🚀 WhatsApp Service running on http://localhost:${port}`);
  logger.log(`📄 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
