import { Controller, Get, Post, Delete, Body, Param, Query, Headers, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { MyListService } from './my-list.service';
import { AddToListDto, ListQueryDto } from './dto';

@ApiTags('My List')
@Controller('my-list')
export class MyListController {
  constructor(private readonly myListService: MyListService) {}

  @Post()
  @ApiOperation({ summary: 'Add to my list' })
  @ApiHeader({ name: 'x-user-id', required: true })
  async add(@Headers('x-user-id') userId: string, @Body() dto: AddToListDto) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.myListService.addToList(userId, dto);
  }

  @Delete(':contentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove from my list' })
  @ApiHeader({ name: 'x-user-id', required: true })
  async remove(@Headers('x-user-id') userId: string, @Param('contentId') contentId: string) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.myListService.removeFromList(userId, contentId);
  }

  @Get()
  @ApiOperation({ summary: 'Get my list (paginated)' })
  @ApiHeader({ name: 'x-user-id', required: true })
  async list(@Headers('x-user-id') userId: string, @Query() query: ListQueryDto) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.myListService.listItems(userId, query);
  }
}
