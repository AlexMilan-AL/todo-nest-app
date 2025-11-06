# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Set default environment variable for build
ENV DATABASE_URL="file:./dev.db"

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy Prisma schema and config
COPY prisma ./prisma
COPY prisma.config.ts ./

# Generate Prisma Client
RUN pnpm prisma generate

# Copy TypeScript config and source code
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

# Build the application
RUN pnpm build

# Verify build output
RUN ls -la dist/

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Set default environment variable
ENV DATABASE_URL="file:./dev.db"
ENV NODE_ENV="production"

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy Prisma files for client installation
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install ALL dependencies (including dev) to have prisma CLI
RUN pnpm install --frozen-lockfile

# Generate Prisma Client
RUN pnpm prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Verify dist was copied
RUN ls -la dist/ && cat dist/main.js | head -n 5

# Create directory for database
RUN mkdir -p /app/prisma

# Expose port
EXPOSE 3000

# Start command - will run migrations and start app
CMD ["sh", "-c", "rm -f prisma/dev.db prisma/dev.db-journal && pnpm prisma migrate deploy && node dist/src/main.js"]
