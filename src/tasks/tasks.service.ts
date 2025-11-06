import { Injectable, Inject } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';
import { TASK_REPOSITORY } from './interfaces/task-repository.interface';
import type { ITaskRepository } from './interfaces/task-repository.interface';

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

  async findAll(): Promise<TaskResponseDto[]> {
    const tasks = await this.taskRepository.findAll();
    return tasks.map((task) => new TaskResponseDto(task));
  }
}
