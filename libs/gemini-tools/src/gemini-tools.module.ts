import { Module } from '@nestjs/common';
import { GeminiFunctionService } from './core/gemini-function.service';
import { RoastingGithub } from './tools/roasting-github.service';
import { GetCurrentTime } from './tools/get-current-time';

@Module({
  providers: [GeminiFunctionService, RoastingGithub, GetCurrentTime],
  exports: [GeminiFunctionService],
})
export class GeminiToolsModule {}
