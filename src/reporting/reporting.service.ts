import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from '../messaging/schemas/message.schema';
import {
  MessageSession,
  MessageSessionDocument,
} from '../messaging/schemas/message-session.schema';
import {
  DeliveryStatus,
  DeliveryStatusDocument,
} from '../webhook/schemas/delivery-status.schema';

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    @InjectModel(MessageSession.name)
    private readonly sessionModel: Model<MessageSessionDocument>,
    @InjectModel(DeliveryStatus.name)
    private readonly deliveryStatusModel: Model<DeliveryStatusDocument>,
  ) {}

  /**
   * Paginated message list with delivery status join.
   */
  async getMessages(filters: {
    date?: string;
    number?: string;
    sessionId?: string;
    page?: number;
    limit?: number;
  }) {
    const { date, number, sessionId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const matchStage: any = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      matchStage.createdAt = { $gte: start, $lte: end };
    }

    if (number) {
      matchStage.recipientNumber = { $regex: number };
    }

    if (sessionId) {
      matchStage.sessionId = sessionId;
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'delivery_statuses',
          localField: 'metaMessageId',
          foreignField: 'metaMessageId',
          as: 'deliveryEvents',
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [data, total] = await Promise.all([
      this.messageModel.aggregate(pipeline),
      this.messageModel.countDocuments(matchStage),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Session-level summary with counters.
   */
  async getSessionSummary(filters: {
    date?: string;
    projectConfigId?: string;
    page?: number;
    limit?: number;
  }) {
    const { date, projectConfigId, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const matchStage: any = {};

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      matchStage.createdAt = { $gte: start, $lte: end };
    }

    if (projectConfigId) {
      matchStage.projectConfigId = projectConfigId;
    }

    const data = await this.sessionModel
      .find(matchStage)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await this.sessionModel.countDocuments(matchStage);

    return { data, total, page, limit };
  }

  /**
   * Aggregated analytics by template and date range.
   */
  async getAnalytics(filters: {
    startDate: string;
    endDate: string;
    wabaId?: string;
    templateName?: string;
  }) {
    const start = new Date(filters.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.endDate);
    end.setHours(23, 59, 59, 999);

    const matchStage: any = {
      createdAt: { $gte: start, $lte: end },
    };

    if (filters.templateName) {
      matchStage.templateName = filters.templateName;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            templateName: '$templateName',
            currentStatus: '$currentStatus',
          },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id.date',
          templateName: '$_id.templateName',
          status: '$_id.currentStatus',
          count: 1,
        },
      },
      { $sort: { date: 1, templateName: 1 } as any },
    ];

    return this.messageModel.aggregate(pipeline).allowDiskUse(true);
  }

  /**
   * Get message data as a cursor for Excel streaming.
   */
  getExcelCursor(filters: {
    date: string;
    wabaId?: string;
    templateName?: string;
    status?: string;
  }) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.date);
    end.setHours(23, 59, 59, 999);

    const matchStage: any = {
      createdAt: { $gte: start, $lte: end },
    };

    if (filters.templateName) {
      matchStage.templateName = filters.templateName;
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'delivery_statuses',
          localField: 'metaMessageId',
          foreignField: 'metaMessageId',
          as: 'deliveryEvents',
        },
      },
      { $unwind: { path: '$deliveryEvents', preserveNullAndEmptyArrays: true } },
    ];

    if (filters.status && filters.status !== '0') {
      pipeline.push({ $match: { 'deliveryEvents.status': filters.status } });
    }

    pipeline.push({
      $project: {
        _id: 0,
        templateName: 1,
        recipientNumber: 1,
        metaMessageId: 1,
        status: { $ifNull: ['$deliveryEvents.status', '$currentStatus'] },
        timestamp: { $ifNull: ['$deliveryEvents.timestamp', '$createdAt'] },
      },
    });

    return this.messageModel.aggregate(pipeline).cursor({ batchSize: 1000 });
  }
}
