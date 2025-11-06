import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TASK_REPOSITORY } from './interfaces/task-repository.interface';

describe('TasksService', () => {
  let service: TasksService;
  let mockTaskRepository: any;

  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test Description',
    isCompleted: false,
    ownerId: 'user-123',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    mockTaskRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByOwnerId: jest.fn(),
      findByOwnerIdPaginated: jest.fn(),
      countByOwnerId: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TASK_REPOSITORY,
          useValue: mockTaskRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a task', async () => {
      const createTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
      };

      mockTaskRepository.create.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto, 'user-123');

      expect(mockTaskRepository.create).toHaveBeenCalledWith(createTaskDto, 'user-123');
      expect(result).toEqual({
        id: mockTask.id,
        title: mockTask.title,
        description: mockTask.description,
        isCompleted: mockTask.isCompleted,
        ownerId: mockTask.ownerId,
        createdAt: mockTask.createdAt,
      });
    });
  });

  describe('findById', () => {
    it('should return a task by id', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await service.findById('task-123');

      expect(mockTaskRepository.findById).toHaveBeenCalledWith('task-123');
      expect(result).toEqual({
        id: mockTask.id,
        title: mockTask.title,
        description: mockTask.description,
        isCompleted: mockTask.isCompleted,
        ownerId: mockTask.ownerId,
        createdAt: mockTask.createdAt,
      });
    });

    it('should return null if task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await service.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByOwnerId', () => {
    it('should return all tasks for a user', async () => {
      const tasks = [mockTask, { ...mockTask, id: 'task-456', title: 'Task 2' }];
      mockTaskRepository.findByOwnerId.mockResolvedValue(tasks);

      const result = await service.findByOwnerId('user-123');

      expect(mockTaskRepository.findByOwnerId).toHaveBeenCalledWith('user-123');
      expect(result).toHaveLength(2);
    });
  });

  describe('findByOwnerIdPaginated', () => {
    it('should return paginated tasks', async () => {
      const tasks = [mockTask];
      mockTaskRepository.findByOwnerIdPaginated.mockResolvedValue(tasks);
      mockTaskRepository.countByOwnerId.mockResolvedValue(25);

      const paginationDto = { page: 1, limit: 10 };
      const result = await service.findByOwnerIdPaginated('user-123', paginationDto);

      expect(mockTaskRepository.findByOwnerIdPaginated).toHaveBeenCalledWith('user-123', 0, 10);
      expect(mockTaskRepository.countByOwnerId).toHaveBeenCalledWith('user-123');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.hasNextPage).toBe(true);
      expect(result.hasPrevPage).toBe(false);
    });

    it('should handle default pagination values', async () => {
      mockTaskRepository.findByOwnerIdPaginated.mockResolvedValue([]);
      mockTaskRepository.countByOwnerId.mockResolvedValue(0);

      const result = await service.findByOwnerIdPaginated('user-123', {});

      expect(mockTaskRepository.findByOwnerIdPaginated).toHaveBeenCalledWith('user-123', 0, 10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should calculate pagination metadata correctly for page 2', async () => {
      mockTaskRepository.findByOwnerIdPaginated.mockResolvedValue([mockTask]);
      mockTaskRepository.countByOwnerId.mockResolvedValue(25);

      const result = await service.findByOwnerIdPaginated('user-123', { page: 2, limit: 10 });

      expect(mockTaskRepository.findByOwnerIdPaginated).toHaveBeenCalledWith('user-123', 10, 10);
      expect(result.page).toBe(2);
      expect(result.hasPrevPage).toBe(true);
      expect(result.hasNextPage).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return all tasks', async () => {
      const tasks = [mockTask];
      mockTaskRepository.findAll.mockResolvedValue(tasks);

      const result = await service.findAll();

      expect(mockTaskRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto = {
        title: 'Updated Title',
        isCompleted: true,
      };

      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.update.mockResolvedValue(updatedTask);

      const result = await service.update('task-123', updateTaskDto, 'user-123');

      expect(mockTaskRepository.findById).toHaveBeenCalledWith('task-123');
      expect(mockTaskRepository.update).toHaveBeenCalledWith('task-123', updateTaskDto);
      expect(result.title).toBe('Updated Title');
      expect(result.isCompleted).toBe(true);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('non-existent', { title: 'Updated' }, 'user-123')
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.update('non-existent', { title: 'Updated' }, 'user-123')
      ).rejects.toThrow('Task with ID non-existent not found');
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);

      await expect(
        service.update('task-123', { title: 'Updated' }, 'different-user')
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update('task-123', { title: 'Updated' }, 'different-user')
      ).rejects.toThrow('You can only update your own tasks');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.delete.mockResolvedValue(undefined);

      await service.delete('task-123', 'user-123');

      expect(mockTaskRepository.findById).toHaveBeenCalledWith('task-123');
      expect(mockTaskRepository.delete).toHaveBeenCalledWith('task-123');
    });

    it('should throw NotFoundException if task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(service.delete('non-existent', 'user-123')).rejects.toThrow(NotFoundException);
      await expect(service.delete('non-existent', 'user-123')).rejects.toThrow(
        'Task with ID non-existent not found'
      );
    });

    it('should throw ForbiddenException if user is not the owner', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);

      await expect(service.delete('task-123', 'different-user')).rejects.toThrow(ForbiddenException);
      await expect(service.delete('task-123', 'different-user')).rejects.toThrow(
        'You can only delete your own tasks'
      );
    });
  });
});
