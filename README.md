# Todo NestJS Application

A full-featured Todo application built with NestJS, featuring authentication, authorization, and CRUD operations for tasks.

## Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **User Management** - User registration and profile management
- 🎯 **Role-Based Access Control** - Admin and User roles with different permissions
- ✅ **Task Management** - Complete CRUD operations for tasks
- 📄 **Pagination** - Efficient data pagination for users and tasks
- 🔒 **Ownership Validation** - Users can only modify their own tasks
- 📚 **API Documentation** - Swagger/OpenAPI documentation
- 🐳 **Docker Support** - Containerized deployment ready
- ✅ **Unit Tests** - Comprehensive test coverage for services

## Tech Stack

- **Framework:** NestJS 11.x
- **Language:** TypeScript 5.x
- **Database:** SQLite with Prisma ORM
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** class-validator & class-transformer
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest
- **Package Manager:** pnpm

## Prerequisites

- Node.js 18+ or 20+
- pnpm 8.x or higher
- Docker & Docker Compose (optional, for containerized deployment)

## Description

A production-ready Todo application demonstrating NestJS best practices, including modular architecture, dependency injection, and comprehensive testing.

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-nest-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   ```

4. **Run database migrations**
   ```bash
   pnpm prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   pnpm prisma generate
   ```

## Running the Application

### Development Mode

```bash
# Start in development mode with hot reload
pnpm run start:dev
```

The application will be available at `http://localhost:3000`

### Production Mode

```bash
# Build the application
pnpm run build

# Start in production mode
pnpm run start:prod
```

### Docker Deployment

For Docker deployment instructions, see [README.Docker.md](./README.Docker.md)

```bash
# Quick start with Docker Compose
docker-compose up --build
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

```
http://localhost:3000/api
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | ⚠️ Admin only (except first user) |
| POST | `/auth/login` | Login and get JWT token | No |
| GET | `/auth/profile` | Get current user profile | Yes |

**⭐ First User Admin:** The first user to register in the system automatically becomes an admin. All subsequent users require admin authorization to be created.

### Users

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/users` | Get all users | Admin only |
| GET | `/users/:id` | Get user by ID | Admin only |
| GET | `/users/paginated` | Get paginated users | Admin only |

### Tasks

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/tasks` | Create a new task | Yes |
| GET | `/tasks` | Get all tasks (admin) or user's tasks | Yes |
| GET | `/tasks/:id` | Get task by ID | Yes (owner or admin) |
| GET | `/tasks/paginated` | Get paginated tasks | Yes |
| PATCH | `/tasks/:id` | Update a task | Yes (owner only) |
| DELETE | `/tasks/:id` | Delete a task | Yes (owner only) |

## Authentication Flow

### 1. Register the First User (becomes Admin)

```bash
POST /auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### 2. Register Additional Users (Admin Required)

```bash
POST /auth/register
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json

{
  "name": "Regular User",
  "email": "user@example.com",
  "password": "password123",
  "role": "user"  // optional, defaults to "user"
}
```

### 3. Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "Regular User",
    "email": "user@example.com",
    "role": "user"
  }
}
```

### 4. Use JWT Token for Protected Endpoints

```bash
GET /tasks
Authorization: Bearer <your-jwt-token>
```

## Task Management Examples

### Create a Task

```bash
POST /tasks
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README",
  "status": "pending",
  "priority": "high"
}
```

### Update a Task

```bash
PATCH /tasks/:id
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "status": "completed"
}
```

### Get Paginated Tasks

```bash
GET /tasks/paginated?page=1&limit=10
Authorization: Bearer <your-jwt-token>
```

Response:
```json
{
  "data": [...],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

## Database Schema

### User Model
- `id`: UUID (Primary Key)
- `name`: String
- `email`: String (Unique)
- `password`: String (Hashed with bcrypt)
- `role`: Enum (user, admin)
- `createdAt`: DateTime

### Task Model
- `id`: UUID (Primary Key)
- `title`: String
- `description`: String (Optional)
- `status`: Enum (pending, in_progress, completed)
- `priority`: Enum (low, medium, high)
- `ownerId`: UUID (Foreign Key to User)
- `createdAt`: DateTime
- `updatedAt`: DateTime

## Testing

### Run Unit Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm jest --coverage
```

### Run E2E Tests

```bash
pnpm test:e2e
```

### Test Coverage

The application includes comprehensive unit tests for:
- UsersService (12 tests)
- AuthService (12 tests)
- TasksService (15 tests)

Current coverage: **~97% for service layer**

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── decorators/         # Custom decorators (Public, Roles)
│   ├── dto/                # Auth DTOs
│   ├── guards/             # JWT and Roles guards
│   ├── strategies/         # JWT strategy
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/                   # Users module
│   ├── dto/                # User DTOs
│   ├── entities/           # User entity
│   ├── interfaces/         # User repository interface
│   ├── repositories/       # User repository implementation
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── tasks/                   # Tasks module
│   ├── dto/                # Task DTOs
│   ├── interfaces/         # Task repository interface
│   ├── repositories/       # Task repository implementation
│   ├── tasks.controller.ts
│   ├── tasks.service.ts
│   └── tasks.module.ts
├── common/                  # Common utilities
│   ├── dto/                # Shared DTOs (Pagination)
│   └── filters/            # Global exception filter
├── prisma/                  # Prisma module
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.module.ts           # Root module
└── main.ts                 # Application entry point
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./dev.db` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `PORT` | Application port | `3000` |

## Security Features

- ✅ Password hashing with bcrypt (salt rounds: 10)
- ✅ JWT-based authentication
- ✅ Role-based authorization (Admin, User)
- ✅ Input validation with class-validator
- ✅ SQL injection protection via Prisma ORM
- ✅ Global exception handling
- ✅ Ownership validation for task operations

## Access Control Rules

### User Role
- Can create, read, update, and delete their own tasks
- Can view their own profile
- Cannot access other users' data
- Cannot create new users

### Admin Role
- All User permissions
- Can view all users
- Can create new users
- Can view all tasks (across all users)
- **Note:** First registered user automatically gets admin role

## Database Management

### View Database

```bash
# Open Prisma Studio (Database GUI)
pnpm prisma studio
```

### Reset Database

```bash
# Reset and reapply migrations
pnpm prisma migrate reset
```

### Create Migration

```bash
# Create a new migration after schema changes
pnpm prisma migrate dev --name your_migration_name
```

## Troubleshooting

### Issue: "JWT_SECRET is not defined"
**Solution:** Ensure `.env` file exists with `JWT_SECRET` variable set.

### Issue: "Database does not exist"
**Solution:** Run `pnpm prisma migrate dev` to create the database and apply migrations.

### Issue: "Port 3000 already in use"
**Solution:** Change the `PORT` variable in `.env` or kill the process using port 3000.

### Issue: "Cannot create new users"
**Solution:** Ensure you're authenticated as an admin user. Remember that the first user automatically becomes admin.

## Performance Considerations

- Database indexes on `email` (User) and `ownerId` (Task)
- Efficient pagination implementation
- JWT token expiration: 1 day
- Password hashing optimized with bcrypt

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is [MIT licensed](LICENSE).

## Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ using NestJS**
