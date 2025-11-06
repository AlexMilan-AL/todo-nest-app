import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: TaskResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @Request() req,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(createTaskDto, req.user.id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get paginated list of user tasks' })
  @ApiResponse({
    status: 200,
    description: 'List of tasks retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findUserTasks(
    @Query() paginationDto: PaginationDto,
    @Request() req,
  ): Promise<PaginatedResponseDto<TaskResponseDto>> {
    return this.tasksService.findByOwnerIdPaginated(req.user.id, paginationDto);
  }
}
