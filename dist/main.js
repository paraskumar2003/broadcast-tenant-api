"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const bull_board_1 = require("./bull-board");
const bullmq_queue_provider_1 = require("./queue/providers/bullmq-queue.provider");
const queue_interface_1 = require("./queue/queue.interface");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const logger = new common_1.Logger('Bootstrap');
    const queueProvider = app.get(queue_interface_1.QUEUE_SERVICE);
    let queues = [];
    if (queueProvider instanceof bullmq_queue_provider_1.BullmqQueueProvider) {
        queues = queueProvider.getQueues();
    }
    const serverAdapter = (0, bull_board_1.createBullBoardServer)(queues);
    app.use('/admin/queues', serverAdapter.getRouter());
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin: '*' });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor());
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('WhatsApp Messaging Service')
        .setDescription('Dedicated NestJS service for WhatsApp message delivery via Meta Cloud API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api/docs', app, document);
    const port = process.env.PORT || 3010;
    await app.listen(port);
    logger.log(`🚀 WhatsApp Service running on http://localhost:${port}`);
    logger.log(`📄 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map