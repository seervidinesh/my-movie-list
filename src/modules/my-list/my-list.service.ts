import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MyList } from './schemas/my-list.schema';
import { User } from '../users/schemas/user.schema';
import { Movie } from '../movies/schemas/movie.schema';
import { TVShow } from '../tvshows/schemas/tvshow.schema';
import { AddToListDto, ListQueryDto } from './dto';

@Injectable()
export class MyListService {
  constructor(
    @InjectModel(MyList.name) private myListModel: Model<MyList>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(TVShow.name) private tvShowModel: Model<TVShow>,
  ) {}

  async addToList(userId: string, dto: AddToListDto) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if content exists
    if (dto.contentType === 'movie') {
      const movie = await this.movieModel.findById(dto.contentId).lean();
      if (!movie) throw new NotFoundException('Movie not found');
    } else {
      const tvshow = await this.tvShowModel.findById(dto.contentId).lean();
      if (!tvshow) throw new NotFoundException('TV Show not found');
    }

    try {
      const item = new this.myListModel({
        userId: new Types.ObjectId(userId),
        contentId: new Types.ObjectId(dto.contentId),
        contentType: dto.contentType,
      });
      return await item.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new ConflictException('Item already in your list');
      }
      throw error;
    }
  }

  async removeFromList(userId: string, contentId: string) {
    if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(contentId)) {
      throw new BadRequestException('Invalid ID format');
    }

    const result = await this.myListModel.deleteOne({
      userId: new Types.ObjectId(userId),
      contentId: new Types.ObjectId(contentId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Item not found in your list');
    }
  }

  async listItems(userId: string, query: ListQueryDto) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const userObjectId = new Types.ObjectId(userId);

    const [items, total] = await Promise.all([
      this.myListModel
        .find({ userId: userObjectId })
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      this.myListModel.countDocuments({ userId: userObjectId }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
