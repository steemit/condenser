# Multi-stage build for Next.js application
FROM alpine:3.22 AS base

# Set proxy environment variables for network issues (can be overridden)
ARG HTTPS_PROXY
ARG HTTP_PROXY
ARG NO_PROXY
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV HTTP_PROXY=${HTTP_PROXY}
ENV NO_PROXY=${NO_PROXY}
ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}

# Use mirror repositories for better connectivity in China
RUN if [ -n "$HTTPS_PROXY" ]; then \
        echo "http://mirrors.aliyun.com/alpine/v3.22/main" > /etc/apk/repositories && \
        echo "http://mirrors.aliyun.com/alpine/v3.22/community" >> /etc/apk/repositories; \
    fi

# Update package index and install Node.js, pnpm, and other dependencies
RUN apk update && apk add --no-cache \
    nodejs \
    npm \
    python3 \
    make \
    g++ \
    git \
    && if [ -n "$HTTPS_PROXY" ]; then \
        npm config set registry https://registry.npmmirror.com/; \
    else \
        npm config set registry https://registry.npmjs.org/; \
    fi \
    && if [ -n "$HTTPS_PROXY" ]; then npm config set proxy $HTTPS_PROXY; fi \
    && if [ -n "$HTTPS_PROXY" ]; then npm config set https-proxy $HTTPS_PROXY; fi \
    && npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Development stage
FROM base AS development

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["pnpm", "dev"]

# Build stage
FROM base AS builder

# Copy source code
COPY . .

# Build the application
RUN pnpm build

# Production stage
FROM alpine:3.22 AS production

# Set proxy environment variables for runtime (if needed)
ARG HTTPS_PROXY
ARG HTTP_PROXY
ARG NO_PROXY
ENV HTTPS_PROXY=${HTTPS_PROXY}
ENV HTTP_PROXY=${HTTP_PROXY}
ENV NO_PROXY=${NO_PROXY}
ENV http_proxy=${HTTP_PROXY}
ENV https_proxy=${HTTPS_PROXY}

# Use mirror repositories for better connectivity in China
RUN if [ -n "$HTTPS_PROXY" ]; then \
        echo "http://mirrors.aliyun.com/alpine/v3.22/main" > /etc/apk/repositories && \
        echo "http://mirrors.aliyun.com/alpine/v3.22/community" >> /etc/apk/repositories; \
    fi

# Install Node.js for production
RUN apk update && apk add --no-cache nodejs

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Start the application
CMD ["node", "server.js"]
