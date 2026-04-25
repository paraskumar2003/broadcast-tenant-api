import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { MessagingConsumer } from './messaging.consumer';
import { TemplateBuilderService } from './template-builder.service';
import { Message, MessageSchema } from './schemas/message.schema';
import {
  MessageSession,
  MessageSessionSchema,
} from './schemas/message-session.schema';
import { Contact, ContactSchema } from '../contact/schemas/contact.schema';
import { MetaApiModule } from '../meta-api/meta-api.module';
import { ProjectModule } from '../project/project.module';
import { TaggingModule } from '../tagging/tagging.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: MessageSession.name, schema: MessageSessionSchema },
      { name: Contact.name, schema: ContactSchema },
    ]),
    MetaApiModule,
    ProjectModule,
    TaggingModule,
  ],
  providers: [MessagingService, MessagingConsumer, TemplateBuilderService],
  controllers: [MessagingController],
  exports: [MessagingService],
})
export class MessagingModule {}

