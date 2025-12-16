import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MyListService } from './my-list.service';
import { MyList } from './schemas/my-list.schema';
import { User } from '../users/schemas/user.schema';
import { Movie } from '../movies/schemas/movie.schema';
import { TVShow } from '../tvshows/schemas/tvshow.schema';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';

describe('MyListService', () => {
  let service: MyListService;

  const mockMyListModel = {
    find: jest.fn(),
    countDocuments: jest.fn(),
    deleteOne: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
  };

  const mockMovieModel = {
    findById: jest.fn(),
  };

  const mockTVShowModel = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyListService,
        { provide: getModelToken(MyList.name), useValue: mockMyListModel },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Movie.name), useValue: mockMovieModel },
        { provide: getModelToken(TVShow.name), useValue: mockTVShowModel },
      ],
    }).compile();

    service = module.get<MyListService>(MyListService);
    jest.clearAllMocks();
  });

  describe('addToList', () => {
    it('should throw BadRequestException for invalid user ID', async () => {
      await expect(service.addToList('invalid-id', { contentId: new Types.ObjectId().toString(), contentType: 'movie' }))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findById.mockReturnValue({ lean: () => null });

      await expect(service.addToList(new Types.ObjectId().toString(), { contentId: new Types.ObjectId().toString(), contentType: 'movie' }))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFromList', () => {
    it('should throw BadRequestException for invalid IDs', async () => {
      await expect(service.removeFromList('invalid', 'invalid'))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when item not in list', async () => {
      mockMyListModel.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(service.removeFromList(new Types.ObjectId().toString(), new Types.ObjectId().toString()))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('listItems', () => {
    it('should throw BadRequestException for invalid user ID', async () => {
      await expect(service.listItems('invalid-id', { page: 1, limit: 10 }))
        .rejects.toThrow(BadRequestException);
    });

    it('should return paginated items', async () => {
      const userId = new Types.ObjectId().toString();
      const mockItems = [{ _id: new Types.ObjectId(), contentType: 'movie' }];

      mockMyListModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockItems),
            }),
          }),
        }),
      });
      mockMyListModel.countDocuments.mockResolvedValue(1);

      const result = await service.listItems(userId, { page: 1, limit: 10 });

      expect(result.items).toEqual(mockItems);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });
});
