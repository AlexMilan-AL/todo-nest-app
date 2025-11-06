import { Task } from '../entities/task.entity';
import { CreateTaskDto } from '../dto/create-task.dto';

export interface ITaskRepository {
  create(createTaskDto: CreateTaskDto, ownerId: string): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByOwnerId(ownerId: string): Promise<Task[]>;
  findByOwnerIdPaginated(
    ownerId: string,
    skip: number,
    take: number,
  ): Promise<Task[]>;
  countByOwnerId(ownerId: string): Promise<number>;
  findAll(): Promise<Task[]>;
  update(id: string, data: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
}

export const TASK_REPOSITORY = 'TASK_REPOSITORY';
