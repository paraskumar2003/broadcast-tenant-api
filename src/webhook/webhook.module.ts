import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { WebhookConsumer } from './webhook.consumer';
import {
  DeliveryStatus,
  DeliveryStatusSchema,
} from './schemas/delivery-status.schema';
import { Message, MessageSchema } from '../messaging/schemas/message.schema';
import {
  MessageSession,
  MessageSessionSchema,
} from '../messaging/schemas/message-session.schema';
import { Contact, ContactSchema } from '../contact/schemas/contact.schema';
import { ConversationModule } from '../conversation/conversation.module';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryStatus.name, schema: DeliveryStatusSchema },
      { name: Message.name, schema: MessageSchema },
      { name: MessageSession.name, schema: MessageSessionSchema },
      { name: Contact.name, schema: ContactSchema },
    ]),
    ConversationModule,
    ProjectModule,
  ],
  controllers: [WebhookController],
  providers: [WebhookService, WebhookConsumer],
  exports: [WebhookService],
})
export class WebhookModule { }

