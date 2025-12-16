import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Movie } from './schemas/movie.schema';

@ApiTags('Movies')
@Controller('movies')
export class MoviesController {
  constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) {}

  @Get()
  @ApiOperation({ summary: 'Get all movies' })
  async findAll() {
    return this.movieModel.find().select('_id title genres').lean();
  }
}
