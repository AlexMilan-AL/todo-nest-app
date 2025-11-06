import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../users/entities/user.entity';
import { ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
    createdAt: new Date(),
  };

  const mockUserWithPassword = {
    ...mockUser,
    password: 'hashedPassword123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register the first user as admin', async () => {
      const registerDto = {
        name: 'First User',
        email: 'first@example.com',
        password: 'password123',
      };

      jest.spyOn(usersService, 'findAll').mockResolvedValue([]);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.register(registerDto, undefined);

      expect(usersService.findAll).toHaveBeenCalled();
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        role: UserRole.ADMIN,
      });
      expect(result.accessToken).toBe('jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should register subsequent users as regular users', async () => {
      const registerDto = {
        name: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
      };

      const adminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      jest.spyOn(usersService, 'findAll').mockResolvedValue([mockUser] as any);
      jest.spyOn(usersService, 'create').mockResolvedValue({
        ...mockUser,
        ...registerDto,
        id: 'new-user-123',
      } as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.register(registerDto, adminUser);

      expect(usersService.findAll).toHaveBeenCalled();
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        role: UserRole.USER,
      });
      expect(result.accessToken).toBe('jwt-token');
    });

    it('should allow admin to register users with admin role', async () => {
      const registerDto = {
        name: 'New Admin',
        email: 'admin@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
      };

      const adminUser = {
        id: 'admin-123',
        email: 'admin@example.com',
        role: UserRole.ADMIN,
      };

      jest.spyOn(usersService, 'findAll').mockResolvedValue([mockUser] as any);
      jest.spyOn(usersService, 'create').mockResolvedValue({
        ...mockUser,
        role: UserRole.ADMIN,
      } as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.register(registerDto, adminUser);

      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        role: UserRole.ADMIN,
      });
      expect(result.user.role).toBe(UserRole.ADMIN);
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      jest.spyOn(usersService, 'findAll').mockResolvedValue([]);
      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new ConflictException('Email already exists'));

      await expect(service.register(registerDto, undefined)).rejects.toThrow(ConflictException);
    });

    it('should throw ForbiddenException if non-admin tries to register admin', async () => {
      const registerDto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        role: UserRole.ADMIN,
      };

      jest.spyOn(usersService, 'findAll').mockResolvedValue([mockUser] as any);

      await expect(service.register(registerDto, mockUser as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('login', () => {
    it('should return token and user on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUserWithPassword as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.validatePassword).toHaveBeenCalledWith('password123', 'hashedPassword123');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result.accessToken).toBe('jwt-token');
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUserWithPassword as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('should return user without password if validation succeeds', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUserWithPassword as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUserWithPassword as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongPassword');

      expect(result).toBeNull();
    });
  });
});
