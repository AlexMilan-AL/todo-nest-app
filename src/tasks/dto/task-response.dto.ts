import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Task unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Complete project documentation',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Write comprehensive documentation for the API endpoints',
  })
  description?: string;

  @ApiProperty({
    description: 'Task completion status',
    example: false,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'ID of the user who owns this task',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  ownerId: string;

  @ApiProperty({
    description: 'Task creation timestamp',
    example: '2025-11-05T23:41:17.000Z',
  })
  createdAt: Date;

  constructor(partial: Partial<TaskResponseDto>) {
    Object.assign(this, partial);
  }
}
