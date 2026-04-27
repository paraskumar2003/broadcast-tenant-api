import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { Message, MessageSchema } from '../messaging/schemas/message.schema';
import {
  Broadcast,
  BroadcastSchema,
} from '../messaging/schemas/broadcast.schema';
import { Tag, TagSchema } from '../tagging/schemas/tag.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: Broadcast.name, schema: BroadcastSchema },
      { name: Tag.name, schema: TagSchema },
    ]),
  ],
  providers: [ReportingService],
  controllers: [ReportingController],
})
export class ReportingModule {}
