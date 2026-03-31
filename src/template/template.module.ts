import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { MetaApiModule } from '../meta-api/meta-api.module';
import { ProjectModule } from '../project/project.module';
import { TaggingModule } from '../tagging/tagging.module';

@Module({
  imports: [MetaApiModule, ProjectModule, TaggingModule],
  providers: [TemplateService],
  controllers: [TemplateController],
  exports: [TemplateService],
})
export class TemplateModule {}
