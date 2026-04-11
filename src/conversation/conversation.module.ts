import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { Message, MessageSchema } from '../messaging/schemas/message.schema';
import { Contact, ContactSchema } from '../contact/schemas/contact.schema';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';
import { ProjectModule } from '../project/project.module';

const CONVERSATION_MODELS = MongooseModule.forFeature([
  { name: Conversation.name, schema: ConversationSchema },
  { name: Message.name, schema: MessageSchema },
  { name: Contact.name, schema: ContactSchema },
]);

@Module({
  imports: [CONVERSATION_MODELS, ProjectModule],
  providers: [ConversationService],
  controllers: [ConversationController],
  exports: [ConversationService, CONVERSATION_MODELS],
})
export class ConversationModule {}

