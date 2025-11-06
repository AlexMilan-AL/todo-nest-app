import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ITaskRepository } from '../interfaces/task-repository.interface';
import { Task } from '../entities/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, ownerId: string): Promise<Task> {
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        ownerId,
      },
    }) as Promise<Task>;
  }

  async findById(id: string): Promise<Task | null> {
    return this.prisma.task.findUnique({
      where: { id },
    }) as Promise<Task | null>;
  }

  async findByOwnerId(ownerId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    }) as Promise<Task[]>;
  }

  async findByOwnerIdPaginated(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: { ownerId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }) as Promise<Task[]>;
  }

  async countByOwnerId(ownerId: string): Promise<number> {
    return this.prisma.task.count({
      where: { ownerId },
    });
  }

  async findAll(): Promise<Task[]> {
    return this.prisma.task.findMany() as Promise<Task[]>;
  }

  async update(id: string, data: Partial<Task>): Promise<Task> {
    return this.prisma.task.update({
      where: { id },
      data,
    }) as Promise<Task>;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    });
  }
}
