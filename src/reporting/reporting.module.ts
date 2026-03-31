import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportingService } from './reporting.service';
import { ReportingController } from './reporting.controller';
import { Message, MessageSchema } from '../messaging/schemas/message.schema';
import {
  MessageSession,
  MessageSessionSchema,
} from '../messaging/schemas/message-session.schema';
import {
  DeliveryStatus,
  DeliveryStatusSchema,
} from '../webhook/schemas/delivery-status.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: MessageSession.name, schema: MessageSessionSchema },
      { name: DeliveryStatus.name, schema: DeliveryStatusSchema },
    ]),
  ],
  providers: [ReportingService],
  controllers: [ReportingController],
})
export class ReportingModule {}
