import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, PipelineStage } from 'mongoose';
import { Message, MessageDocument } from '../messaging/schemas/message.schema';
import {
  Broadcast,
  BroadcastDocument,
} from '../messaging/schemas/broadcast.schema';
import { Tag, TagDocument } from '../tagging/schemas/tag.schema';

// ─── Filter interfaces ──────────────────────────────────────────────────

export interface BroadcastReportFilters {
  projectConfigId: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  templateName?: string;
  tagIds?: string[];
  search?: string;
  page?: number;
  limit?: number;
}

export interface MessageReportFilters {
  projectConfigId: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  broadcastId?: string;
  templateName?: string;
  recipientNumber?: string;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Broadcast.name)
    private readonly broadcastModel: Model<BroadcastDocument>,
    @InjectModel(Tag.name)
    private readonly tagModel: Model<TagDocument>,
  ) {}

  // ─── Helpers ───────────────────────────────────────────────────────────

  private buildDateRange(startDate?: string, endDate?: string) {
    const now = new Date();
    const end = endDate ? new Date(endDate) : now;
    end.setHours(23, 59, 59, 999);

    const start = startDate
      ? new Date(startDate)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // default: 7 days
    start.setHours(0, 0, 0, 0);

    // Enforce max 90-day range
    const maxMs = 90 * 24 * 60 * 60 * 1000;
    if (end.getTime() - start.getTime() > maxMs) {
      throw new BadRequestException('Date range cannot exceed 90 days.');
    }

    return { $gte: start, $lte: end };
  }

  private buildBroadcastMatch(filters: BroadcastReportFilters): any {
    const match: any = {
      projectConfigId: new Types.ObjectId(filters.projectConfigId),
      createdAt: this.buildDateRange(filters.startDate, filters.endDate),
    };

    if (filters.status && filters.status !== 'all') {
      match.status = filters.status;
    }

    if (filters.templateName && filters.templateName !== 'all') {
      match.templateName = filters.templateName;
    }

    if (filters.tagIds && filters.tagIds.length > 0) {
      match.tagIds = {
        $in: filters.tagIds.map((id) => new Types.ObjectId(id)),
      };
    }

    if (filters.search) {
      match.name = { $regex: filters.search, $options: 'i' };
    }

    return match;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // BROADCAST REPORTS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Aggregate summary stats across all matching broadcasts.
   * Uses pre-computed Broadcast.counters — O(broadcasts), NOT O(messages).
   */
  async getBroadcastSummary(filters: BroadcastReportFilters) {
    const match = this.buildBroadcastMatch(filters);

    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $group: {
          _id: null,
          totalBroadcasts: { $sum: 1 },
          totalRecipients: { $sum: '$totalRecipients' },
          totalSent: { $sum: '$counters.sent' },
          totalDelivered: { $sum: '$counters.delivered' },
          totalFailed: { $sum: '$counters.failed' },
          totalRead: { $sum: '$counters.read' },
        },
      },
    ];

    const [result] = await this.broadcastModel.aggregate(pipeline);

    if (!result) {
      return {
        totalBroadcasts: 0,
        totalRecipients: 0,
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        totalRead: 0,
        deliveryRate: 0,
        readRate: 0,
      };
    }

    return {
      totalBroadcasts: result.totalBroadcasts,
      totalRecipients: result.totalRecipients,
      totalSent: result.totalSent,
      totalDelivered: result.totalDelivered,
      totalFailed: result.totalFailed,
      totalRead: result.totalRead,
      deliveryRate:
        result.totalSent > 0
          ? Math.round((result.totalDelivered / result.totalSent) * 1000) / 10
          : 0,
      readRate:
        result.totalDelivered > 0
          ? Math.round((result.totalRead / result.totalDelivered) * 1000) / 10
          : 0,
    };
  }

  /**
   * Paginated broadcast list with tag names resolved.
   */
  async getBroadcastList(filters: BroadcastReportFilters) {
    const match = this.buildBroadcastMatch(filters);
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 50);
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      // Resolve tag names
      {
        $lookup: {
          from: 'tags',
          localField: 'tagIds',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1, color: 1 } }],
          as: '_tags',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          templateName: 1,
          status: 1,
          totalRecipients: 1,
          counters: 1,
          scheduledAt: 1,
          createdAt: 1,
          tags: {
            $map: {
              input: '$_tags',
              as: 't',
              in: { id: '$$t._id', name: '$$t.name', color: '$$t.color' },
            },
          },
          deliveryRate: {
            $cond: [
              { $gt: ['$counters.sent', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$counters.delivered', '$counters.sent'] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },
          readRate: {
            $cond: [
              { $gt: ['$counters.delivered', 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ['$counters.read', '$counters.delivered'] },
                      100,
                    ],
                  },
                  1,
                ],
              },
              0,
            ],
          },
        },
      },
    ];

    const [data, total] = await Promise.all([
      this.broadcastModel.aggregate(pipeline),
      this.broadcastModel.countDocuments(match),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        hasNext: skip + limit < total,
      },
    };
  }

  /**
   * Streaming cursor for broadcast export (CSV/Excel).
   */
  getBroadcastExportCursor(filters: BroadcastReportFilters) {
    const match = this.buildBroadcastMatch(filters);

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'tags',
          localField: 'tagIds',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1 } }],
          as: '_tags',
        },
      },
      {
        $project: {
          name: 1,
          templateName: 1,
          status: 1,
          totalRecipients: 1,
          sent: '$counters.sent',
          delivered: '$counters.delivered',
          failed: '$counters.failed',
          read: '$counters.read',
          tags: {
            $reduce: {
              input: '$_tags',
              initialValue: '',
              in: {
                $cond: [
                  { $eq: ['$$value', ''] },
                  '$$this.name',
                  { $concat: ['$$value', ', ', '$$this.name'] },
                ],
              },
            },
          },
          scheduledAt: 1,
          createdAt: 1,
        },
      },
    ];

    return this.broadcastModel.aggregate(pipeline).cursor({ batchSize: 500 });
  }

  /**
   * Get distinct template names for filter dropdown.
   */
  async getDistinctTemplates(projectConfigId: string) {
    return this.broadcastModel.distinct('templateName', {
      projectConfigId: new Types.ObjectId(projectConfigId),
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MESSAGE-LEVEL REPORTS
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * Paginated message list with extracted status timestamps.
   */
  async getMessageList(filters: MessageReportFilters) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const skip = (page - 1) * limit;

    const match: any = {
      projectConfigId: new Types.ObjectId(filters.projectConfigId),
      createdAt: this.buildDateRange(filters.startDate, filters.endDate),
      direction: 'outbound', // only outbound messages in reports
    };

    if (filters.status && filters.status !== 'all') {
      match.currentStatus = filters.status;
    }

    if (filters.broadcastId && filters.broadcastId !== 'all') {
      match.broadcastId = new Types.ObjectId(filters.broadcastId);
    }

    if (filters.templateName && filters.templateName !== 'all') {
      match.templateName = filters.templateName;
    }

    // Search by recipientNumber or metaMessageId
    if (filters.search && filters.search.length >= 3) {
      match.$or = [
        { recipientNumber: { $regex: filters.search, $options: 'i' } },
        { metaMessageId: filters.search },
      ];
    } else if (filters.recipientNumber) {
      match.recipientNumber = {
        $regex: filters.recipientNumber,
        $options: 'i',
      };
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      // Extract timestamps from statusHistory
      {
        $addFields: {
          sentAt: {
            $let: {
              vars: {
                entry: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$statusHistory',
                        cond: { $eq: ['$$this.status', 'sent'] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: '$$entry.timestamp',
            },
          },
          deliveredAt: {
            $let: {
              vars: {
                entry: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$statusHistory',
                        cond: { $eq: ['$$this.status', 'delivered'] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: '$$entry.timestamp',
            },
          },
          readAt: {
            $let: {
              vars: {
                entry: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$statusHistory',
                        cond: { $eq: ['$$this.status', 'read'] },
                      },
                    },
                    0,
                  ],
                },
              },
              in: '$$entry.timestamp',
            },
          },
        },
      },
      // Lookup broadcast name
      {
        $lookup: {
          from: 'broadcasts',
          localField: 'broadcastId',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1 } }],
          as: '_broadcast',
        },
      },
      {
        $project: {
          _id: 1,
          recipientNumber: 1,
          broadcastId: 1,
          broadcastName: { $arrayElemAt: ['$_broadcast.name', 0] },
          templateName: 1,
          currentStatus: 1,
          sentAt: 1,
          deliveredAt: 1,
          readAt: 1,
          errorDetails: 1,
          createdAt: 1,
        },
      },
    ];

    const [data, total] = await Promise.all([
      this.messageModel.aggregate(pipeline),
      this.messageModel.countDocuments(match),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        hasNext: skip + limit < total,
      },
    };
  }

  /**
   * Streaming cursor for message-level export.
   */
  getMessageExportCursor(filters: MessageReportFilters) {
    const match: any = {
      projectConfigId: new Types.ObjectId(filters.projectConfigId),
      createdAt: this.buildDateRange(filters.startDate, filters.endDate),
      direction: 'outbound',
    };

    if (filters.status && filters.status !== 'all') {
      match.currentStatus = filters.status;
    }
    if (filters.broadcastId && filters.broadcastId !== 'all') {
      match.broadcastId = new Types.ObjectId(filters.broadcastId);
    }
    if (filters.templateName && filters.templateName !== 'all') {
      match.templateName = filters.templateName;
    }
    if (filters.recipientNumber) {
      match.recipientNumber = {
        $regex: filters.recipientNumber,
        $options: 'i',
      };
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { createdAt: -1 } },
      { $limit: 100000 }, // safety cap
      {
        $lookup: {
          from: 'broadcasts',
          localField: 'broadcastId',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1 } }],
          as: '_broadcast',
        },
      },
      {
        $project: {
          recipientNumber: 1,
          broadcastName: { $arrayElemAt: ['$_broadcast.name', 0] },
          templateName: 1,
          currentStatus: 1,
          errorDetails: 1,
          createdAt: 1,
        },
      },
    ];

    return this.messageModel.aggregate(pipeline).cursor({ batchSize: 1000 });
  }
}
