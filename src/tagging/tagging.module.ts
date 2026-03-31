import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaggingService } from './tagging.service';
import { TaggingController } from './tagging.controller';
import { Tag, TagSchema } from './schemas/tag.schema';
import { UploadTagging, UploadTaggingSchema } from './schemas/upload-tagging.schema';
import { TemplateTagging, TemplateTaggingSchema } from './schemas/template-tagging.schema';
import { ContactTagging, ContactTaggingSchema } from './schemas/contact-tagging.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tag.name, schema: TagSchema },
      { name: UploadTagging.name, schema: UploadTaggingSchema },
      { name: TemplateTagging.name, schema: TemplateTaggingSchema },
      { name: ContactTagging.name, schema: ContactTaggingSchema },
    ]),
  ],
  providers: [TaggingService],
  controllers: [TaggingController],
  exports: [TaggingService],
})
export class TaggingModule { }
