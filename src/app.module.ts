import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import appConfig from './config/app.config';
import { UsersModule } from './modules/users';
import { MoviesModule } from './modules/movies';
import { TVShowsModule } from './modules/tvshows';
import { MyListModule } from './modules/my-list';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('app.mongodb.uri'),
      }),
    }),
    UsersModule,
    MoviesModule,
    TVShowsModule,
    MyListModule,
  ],
})
export class AppModule {}
