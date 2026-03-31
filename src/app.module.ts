import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { QueueModule } from './queue/queue.module';
import { MetaApiModule } from './meta-api/meta-api.module';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { TemplateModule } from './template/template.module';
import { MessagingModule } from './messaging/messaging.module';
import { WebhookModule } from './webhook/webhook.module';
import { ReportingModule } from './reporting/reporting.module';
import { UploadModule } from './upload/upload.module';
import { TaggingModule } from './tagging/tagging.module';

@Module({
  imports: [
    AppConfigModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.url'),
      }),
    }),
    QueueModule,
    MetaApiModule,
    UserModule,
    ProjectModule,
    TemplateModule,
    MessagingModule,
    WebhookModule,
    ReportingModule,
    UploadModule,
    TaggingModule,
  ],
})
export class AppModule { }
