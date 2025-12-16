import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Model, Types } from 'mongoose';
import appConfig from '../src/config/app.config';
import { MyListModule } from '../src/modules/my-list';
import { User, UserSchema } from '../src/modules/users/schemas/user.schema';
import { Movie, MovieSchema } from '../src/modules/movies/schemas/movie.schema';
import { TVShow, TVShowSchema } from '../src/modules/tvshows/schemas/tvshow.schema';
import { MyList, MyListSchema } from '../src/modules/my-list/schemas/my-list.schema';

describe('MyList API (e2e)', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let movieModel: Model<Movie>;
  let tvShowModel: Model<TVShow>;
  let myListModel: Model<MyList>;
  let testUser: User;
  let testMovie: Movie;
  let testTVShow: TVShow;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ load: [appConfig], isGlobal: true }),
        MongooseModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            uri: configService.get<string>('app.mongodb.uri'),
          }),
        }),
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
          { name: Movie.name, schema: MovieSchema },
          { name: TVShow.name, schema: TVShowSchema },
          { name: MyList.name, schema: MyListSchema },
        ]),
        MyListModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.setGlobalPrefix('api/v1');
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    movieModel = moduleFixture.get<Model<Movie>>(getModelToken(Movie.name));
    tvShowModel = moduleFixture.get<Model<TVShow>>(getModelToken(TVShow.name));
    myListModel = moduleFixture.get<Model<MyList>>(getModelToken(MyList.name));
  });

  beforeEach(async () => {
    await myListModel.deleteMany({});
    await userModel.deleteMany({});
    await movieModel.deleteMany({});
    await tvShowModel.deleteMany({});

    testUser = await userModel.create({
      username: 'test_user',
      preferences: { favoriteGenres: ['Action'], dislikedGenres: [] },
      watchHistory: [],
    });

    testMovie = await movieModel.create({
      title: 'Test Movie',
      description: 'A test movie',
      genres: ['Action'],
      releaseDate: new Date(),
      director: 'Test Director',
      actors: ['Actor 1'],
    });

    testTVShow = await tvShowModel.create({
      title: 'Test Show',
      description: 'A test show',
      genres: ['Drama'],
      episodes: [{ episodeNumber: 1, seasonNumber: 1, releaseDate: new Date(), director: 'Director', actors: ['Actor'] }],
    });
  });

  afterAll(async () => {
    await myListModel.deleteMany({});
    await userModel.deleteMany({});
    await movieModel.deleteMany({});
    await tvShowModel.deleteMany({});
    await app.close();
  });

  describe('POST /api/v1/my-list', () => {
    it('should add a movie to list', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/my-list')
        .set('x-user-id', testUser._id.toString())
        .send({ contentId: testMovie._id.toString(), contentType: 'movie' })
        .expect(201);

      expect(res.body.contentType).toBe('movie');
    });

    it('should return 409 for duplicate', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/my-list')
        .set('x-user-id', testUser._id.toString())
        .send({ contentId: testMovie._id.toString(), contentType: 'movie' });

      await request(app.getHttpServer())
        .post('/api/v1/my-list')
        .set('x-user-id', testUser._id.toString())
        .send({ contentId: testMovie._id.toString(), contentType: 'movie' })
        .expect(409);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/my-list')
        .set('x-user-id', new Types.ObjectId().toString())
        .send({ contentId: testMovie._id.toString(), contentType: 'movie' })
        .expect(404);
    });

    it('should return 404 for non-existent content', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/my-list')
        .set('x-user-id', testUser._id.toString())
        .send({ contentId: new Types.ObjectId().toString(), contentType: 'movie' })
        .expect(404);
    });

    it('should return 400 for missing header', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/my-list')
        .send({ contentId: testMovie._id.toString(), contentType: 'movie' })
        .expect(400);
    });
  });

  describe('DELETE /api/v1/my-list/:contentId', () => {
    it('should remove item from list', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/my-list')
        .set('x-user-id', testUser._id.toString())
        .send({ contentId: testMovie._id.toString(), contentType: 'movie' });

      await request(app.getHttpServer())
        .delete(`/api/v1/my-list/${testMovie._id.toString()}`)
        .set('x-user-id', testUser._id.toString())
        .expect(204);
    });

    it('should return 404 if item not in list', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/my-list/${testMovie._id.toString()}`)
        .set('x-user-id', testUser._id.toString())
        .expect(404);
    });
  });

  describe('GET /api/v1/my-list', () => {
    it('should return empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/my-list')
        .set('x-user-id', testUser._id.toString())
        .expect(200);

      expect(res.body.items).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('should return paginated items', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/my-list')
        .set('x-user-id', testUser._id.toString())
        .send({ contentId: testMovie._id.toString(), contentType: 'movie' });

      await request(app.getHttpServer())
        .post('/api/v1/my-list')
        .set('x-user-id', testUser._id.toString())
        .send({ contentId: testTVShow._id.toString(), contentType: 'tvshow' });

      const res = await request(app.getHttpServer())
        .get('/api/v1/my-list?page=1&limit=1')
        .set('x-user-id', testUser._id.toString())
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.total).toBe(2);
      expect(res.body.totalPages).toBe(2);
    });
  });
});
