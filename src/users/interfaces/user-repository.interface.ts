import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

export interface IUserRepository {
  create(createUserDto: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY';
