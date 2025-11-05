import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;

  @Exclude()
  password: string;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
