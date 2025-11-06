import { Injectable, Inject } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { TASK_REPOSITORY } from './interfaces/task-repository.interface';
import type { ITaskRepository } from './interfaces/task-repository.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../common/dto/paginated-response.dto';

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepository: ITaskRepository,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    ownerId: string,
  ): Promise<TaskResponseDto> {
    const task = await this.taskRepository.create(createTaskDto, ownerId);
    return new TaskResponseDto(task);
  }

  async findById(id: string): Promise<TaskResponseDto | null> {
    const task = await this.taskRepository.findById(id);
    if (!task) return null;
    return new TaskResponseDto(task);
  }

  async findByOwnerId(ownerId: string): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.findByOwnerId(ownerId);
    return tasks.map((task) => new TaskResponseDto(task));
  }

  async findByOwnerIdPaginated(
    ownerId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<TaskResponseDto>> {
    const page = paginationDto.page || 1;
    const limit = paginationDto.limit || 10;
    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      this.taskRepository.findByOwnerIdPaginated(ownerId, skip, limit),
      this.taskRepository.countByOwnerId(ownerId),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tasks.map((task) => new TaskResponseDto(task)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findAll(): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.findAll();
    return tasks.map((task) => new TaskResponseDto(task));
  }
}
