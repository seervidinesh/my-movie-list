import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MyListController } from './my-list.controller';
import { MyListService } from './my-list.service';
import { MyList, MyListSchema } from './schemas/my-list.schema';
import { UsersModule } from '../users';
import { MoviesModule } from '../movies';
import { TVShowsModule } from '../tvshows';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MyList.name, schema: MyListSchema }]),
    UsersModule,
    MoviesModule,
    TVShowsModule,
  ],
  controllers: [MyListController],
  providers: [MyListService],
  exports: [MyListService],
})
export class MyListModule {}
