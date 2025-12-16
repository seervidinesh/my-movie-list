import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TVShow, TVShowSchema } from './schemas/tvshow.schema';
import { TVShowsController } from './tvshows.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TVShow.name, schema: TVShowSchema }]),
  ],
  controllers: [TVShowsController],
  exports: [MongooseModule],
})
export class TVShowsModule {}
