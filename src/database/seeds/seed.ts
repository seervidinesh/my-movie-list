import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import appConfig from '../../config/app.config';
import { User, UserSchema } from '../../modules/users/schemas/user.schema';
import { Movie, MovieSchema } from '../../modules/movies/schemas/movie.schema';
import { TVShow, TVShowSchema } from '../../modules/tvshows/schemas/tvshow.schema';

class SeederService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Movie.name) private movieModel: Model<Movie>,
    @InjectModel(TVShow.name) private tvShowModel: Model<TVShow>,
  ) {}

  async seed() {
    await this.seedUsers();
    await this.seedMovies();
    await this.seedTVShows();
    console.log('Seeding completed!');
  }

  private async seedUsers() {
    const count = await this.userModel.countDocuments();
    if (count > 0) {
      console.log('Users already exist, skipping...');
      return;
    }

    const users = [
      {
        username: 'john_doe',
        preferences: { favoriteGenres: ['Action', 'SciFi'], dislikedGenres: ['Horror'] },
        watchHistory: [
          { contentId: 'movie1', watchedOn: new Date('2024-01-15'), rating: 8 },
        ],
      },
      {
        username: 'jane_smith',
        preferences: { favoriteGenres: ['Comedy', 'Romance'], dislikedGenres: [] },
        watchHistory: [],
      },
      {
        username: 'movie_buff',
        preferences: { favoriteGenres: ['Drama', 'Fantasy'], dislikedGenres: [] },
        watchHistory: [],
      },
    ];

    await this.userModel.insertMany(users);
    console.log(`Seeded ${users.length} users`);
  }

  private async seedMovies() {
    const count = await this.movieModel.countDocuments();
    if (count > 0) {
      console.log('Movies already exist, skipping...');
      return;
    }

    const movies = [
      {
        title: 'Inception',
        description: 'A thief who steals secrets through dreams.',
        genres: ['Action', 'SciFi'],
        releaseDate: new Date('2010-07-16'),
        director: 'Christopher Nolan',
        actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'],
      },
      {
        title: 'The Dark Knight',
        description: 'Batman faces the Joker.',
        genres: ['Action', 'Drama'],
        releaseDate: new Date('2008-07-18'),
        director: 'Christopher Nolan',
        actors: ['Christian Bale', 'Heath Ledger'],
      },
      {
        title: 'Interstellar',
        description: 'Explorers travel through a wormhole.',
        genres: ['SciFi', 'Drama'],
        releaseDate: new Date('2014-11-07'),
        director: 'Christopher Nolan',
        actors: ['Matthew McConaughey', 'Anne Hathaway'],
      },
      {
        title: 'The Hangover',
        description: 'Friends wake up after a wild night.',
        genres: ['Comedy'],
        releaseDate: new Date('2009-06-05'),
        director: 'Todd Phillips',
        actors: ['Bradley Cooper', 'Ed Helms'],
      },
      {
        title: 'The Notebook',
        description: 'A love story spanning decades.',
        genres: ['Romance', 'Drama'],
        releaseDate: new Date('2004-06-25'),
        director: 'Nick Cassavetes',
        actors: ['Ryan Gosling', 'Rachel McAdams'],
      },
    ];

    await this.movieModel.insertMany(movies);
    console.log(`Seeded ${movies.length} movies`);
  }

  private async seedTVShows() {
    const count = await this.tvShowModel.countDocuments();
    if (count > 0) {
      console.log('TV Shows already exist, skipping...');
      return;
    }

    const tvShows = [
      {
        title: 'Breaking Bad',
        description: 'A teacher turns to crime.',
        genres: ['Drama'],
        episodes: [
          { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2008-01-20'), director: 'Vince Gilligan', actors: ['Bryan Cranston'] },
          { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2008-01-27'), director: 'Adam Bernstein', actors: ['Bryan Cranston'] },
        ],
      },
      {
        title: 'Stranger Things',
        description: 'Kids encounter supernatural forces.',
        genres: ['SciFi', 'Horror'],
        episodes: [
          { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2016-07-15'), director: 'Duffer Brothers', actors: ['Millie Bobby Brown'] },
          { episodeNumber: 2, seasonNumber: 1, releaseDate: new Date('2016-07-15'), director: 'Duffer Brothers', actors: ['Millie Bobby Brown'] },
        ],
      },
      {
        title: 'Friends',
        description: 'Six friends navigate life in NYC.',
        genres: ['Comedy'],
        episodes: [
          { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('1994-09-22'), director: 'James Burrows', actors: ['Jennifer Aniston'] },
        ],
      },
      {
        title: 'Game of Thrones',
        description: 'Noble families fight for the throne.',
        genres: ['Fantasy', 'Drama'],
        episodes: [
          { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2011-04-17'), director: 'Tim Van Patten', actors: ['Emilia Clarke'] },
        ],
      },
    ];

    await this.tvShowModel.insertMany(tvShows);
    console.log(`Seeded ${tvShows.length} TV shows`);
  }
}

@Module({
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
    ]),
  ],
  providers: [SeederService],
})
class SeedModule {}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seeder = app.get(SeederService);

  try {
    await seeder.seed();
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
