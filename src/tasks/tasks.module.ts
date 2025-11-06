import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskRepository } from './repositories/task.repository';
import { TASK_REPOSITORY } from './interfaces/task-repository.interface';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TasksController],
  providers: [
    TasksService,
    {
      provide: TASK_REPOSITORY,
      useClass: TaskRepository,
    },
  ],
  exports: [TasksService],
})
export class TasksModule {}
