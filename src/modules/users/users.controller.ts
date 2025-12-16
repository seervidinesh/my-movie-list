import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { User } from './schemas/user.schema';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  async findAll() {
    return this.userModel.find().select('_id username').lean();
  }
}
