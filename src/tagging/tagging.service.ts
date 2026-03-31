import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import {
  UploadTagging,
  UploadTaggingDocument,
} from './schemas/upload-tagging.schema';
import {
  TemplateTagging,
  TemplateTaggingDocument,
} from './schemas/template-tagging.schema';
import {
  ContactTagging,
  ContactTaggingDocument,
} from './schemas/contact-tagging.schema';
import {
  CreateTagDto,
  UpdateTagDto,
  AttachDetachTagDto,
  EntityType,
} from './dto/tagging.dto';

@Injectable()
export class TaggingService {
  constructor(
    @InjectModel(Tag.name) private tagModel: Model<TagDocument>,
    @InjectModel(UploadTagging.name)
    private uploadTaggingModel: Model<UploadTaggingDocument>,
    @InjectModel(TemplateTagging.name)
    private templateTaggingModel: Model<TemplateTaggingDocument>,
    @InjectModel(ContactTagging.name)
    private contactTaggingModel: Model<ContactTaggingDocument>,
  ) {}

  // ─── Tag Management ──────────────────────────────────────────────────

  async createTag(dto: CreateTagDto) {
    try {
      return await this.tagModel.create({
        projectId: new Types.ObjectId(dto.projectId),
        name: dto.name,
        color: dto.color || '#3B82F6',
      });
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException(
          `Tag with name "${dto.name}" already exists for this project.`,
        );
      }
      throw error;
    }
  }

  async listTagsByProject(projectId: string) {
    return this.tagModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .sort({ name: 1 });
  }

  async updateTag(tagId: string, dto: UpdateTagDto) {
    const updated = await this.tagModel.findByIdAndUpdate(
      tagId,
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!updated) throw new NotFoundException('Tag not found');
    return updated;
  }

  async deleteTag(tagId: string) {
    const deleted = await this.tagModel.findByIdAndDelete(tagId);
    if (!deleted) throw new NotFoundException('Tag not found');

    // Cascade delete mappings
    const tagObjectId = new Types.ObjectId(tagId);
    await Promise.all([
      this.uploadTaggingModel.deleteMany({ tagId: tagObjectId }),
      this.templateTaggingModel.deleteMany({ tagId: tagObjectId }),
      this.contactTaggingModel.deleteMany({ tagId: tagObjectId }),
    ]);

    return { message: 'Tag and associated mappings deleted successfully' };
  }

  // ─── Attach / Detach ─────────────────────────────────────────────────

  async attachTag(dto: AttachDetachTagDto) {
    const tagObjectId = new Types.ObjectId(dto.tagId);
    const projectId = new Types.ObjectId(dto.projectId);

    // Ensure tag exists
    const tag = await this.tagModel.findById(tagObjectId);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    try {
      switch (dto.entityType) {
        case EntityType.UPLOAD:
          await this.uploadTaggingModel.create({
            projectId,
            tagId: tagObjectId,
            uploadId: new Types.ObjectId(dto.entityId),
          });
          break;
        case EntityType.TEMPLATE:
          await this.templateTaggingModel.create({
            projectId,
            tagId: tagObjectId,
            templateName: dto.entityId, // Templates use name as ID often in Meta
          });
          break;
        case EntityType.CONTACT:
          await this.contactTaggingModel.create({
            projectId,
            tagId: tagObjectId,
            contactId: new Types.ObjectId(dto.entityId),
          });
          break;
      }
      return { status: true, message: 'Tag attached successfully' };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Tag is already attached to this entity');
      }
      throw error;
    }
  }

  async detachTag(dto: AttachDetachTagDto) {
    const tagObjectId = new Types.ObjectId(dto.tagId);

    let result;
    switch (dto.entityType) {
      case EntityType.UPLOAD:
        result = await this.uploadTaggingModel.deleteOne({
          tagId: tagObjectId,
          uploadId: new Types.ObjectId(dto.entityId),
        });
        break;
      case EntityType.TEMPLATE:
        result = await this.templateTaggingModel.deleteOne({
          tagId: tagObjectId,
          templateName: dto.entityId,
        });
        break;
      case EntityType.CONTACT:
        result = await this.contactTaggingModel.deleteOne({
          tagId: tagObjectId,
          contactId: new Types.ObjectId(dto.entityId),
        });
        break;
    }

    if (result.deletedCount === 0) {
      throw new NotFoundException('Tag mapping not found');
    }

    return { status: true, message: 'Tag detached successfully' };
  }

  // ─── Fetch Tags for a specific entity ────────────────────────────────

  async getTagsForEntity(
    projectId: string,
    entityType: EntityType,
    entityId: string,
  ) {
    const projId = new Types.ObjectId(projectId);

    let tagIds: Types.ObjectId[] = [];

    switch (entityType) {
      case EntityType.UPLOAD:
        tagIds = (
          await this.uploadTaggingModel.find({
            projectId: projId,
            uploadId: new Types.ObjectId(entityId),
          })
        ).map((m) => m.tagId);
        break;
      case EntityType.TEMPLATE:
        tagIds = (
          await this.templateTaggingModel.find({
            projectId: projId,
            templateName: entityId,
          })
        ).map((m) => m.tagId);
        break;
      case EntityType.CONTACT:
        tagIds = (
          await this.contactTaggingModel.find({
            projectId: projId,
            contactId: new Types.ObjectId(entityId),
          })
        ).map((m) => m.tagId);
        break;
    }

    if (tagIds.length === 0) return [];

    return this.tagModel.find({ _id: { $in: tagIds } }).sort({ name: 1 });
  }

  // ─── Fetch Entities for a specific tag ───────────────────────────────

  async getEntitiesForTag(tagId: string, entityType: EntityType) {
    const tId = new Types.ObjectId(tagId);

    switch (entityType) {
      case EntityType.UPLOAD:
        return this.uploadTaggingModel.find({ tagId: tId });
      case EntityType.TEMPLATE:
        return this.templateTaggingModel.find({ tagId: tId });
      case EntityType.CONTACT:
        return this.contactTaggingModel.find({ tagId: tId });
    }
  }

  // ─── Bulk Fetch Tags for multiple entities ───────────────────────────

  async getTagsForProjectEntities(
    projectId: string,
    entityType: EntityType,
  ): Promise<Record<string, any[]>> {
    const projId = new Types.ObjectId(projectId);
    let mappings: any[] = [];

    switch (entityType) {
      case EntityType.UPLOAD:
        mappings = await this.uploadTaggingModel
          .find({ projectId: projId })
          .populate('tagId');
        break;
      case EntityType.TEMPLATE:
        mappings = await this.templateTaggingModel
          .find({ projectId: projId })
          .populate('tagId');
        break;
      case EntityType.CONTACT:
        mappings = await this.contactTaggingModel
          .find({ projectId: projId })
          .populate('tagId');
        break;
    }

    const resultMap: Record<string, any[]> = {};

    for (const mapping of mappings) {
      let entityId = '';
      if (entityType === EntityType.UPLOAD && mapping.uploadId) {
        entityId = mapping.uploadId.toString();
      } else if (entityType === EntityType.TEMPLATE && mapping.templateName) {
        entityId = mapping.templateName;
      } else if (entityType === EntityType.CONTACT && mapping.contactId) {
        entityId = mapping.contactId.toString();
      }

      if (!entityId) continue;

      if (!resultMap[entityId]) {
        resultMap[entityId] = [];
      }

      if (mapping.tagId) {
        resultMap[entityId].push(mapping.tagId);
      }
    }

    return resultMap;
  }
}
