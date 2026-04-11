import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Conversation,
  ConversationSchema,
} from './schemas/conversation.schema';
import { Message, MessageSchema } from '../messaging/schemas/message.schema';
import { ConversationService } from './conversation.service';
import { ConversationController } from './conversation.controller';

const CONVERSATION_MODELS = MongooseModule.forFeature([
  { name: Conversation.name, schema: ConversationSchema },
  { name: Message.name, schema: MessageSchema },
]);

@Module({
  imports: [CONVERSATION_MODELS],
  providers: [ConversationService],
  controllers: [ConversationController],
  exports: [ConversationService, CONVERSATION_MODELS],
})
export class ConversationModule {}
