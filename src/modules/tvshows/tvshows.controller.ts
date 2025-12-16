import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TVShow } from './schemas/tvshow.schema';

@ApiTags('TV Shows')
@Controller('tvshows')
export class TVShowsController {
  constructor(@InjectModel(TVShow.name) private tvShowModel: Model<TVShow>) {}

  @Get()
  @ApiOperation({ summary: 'Get all TV shows' })
  async findAll() {
    return this.tvShowModel.find().select('_id title genres').lean();
  }
}
