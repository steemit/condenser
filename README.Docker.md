# Docker Setup for Condenser

This document describes how to build and run the Condenser application using Docker.

## Available Dockerfiles

### 1. `Dockerfile` (Original)
- Based on Alpine 3.22
- Multi-stage build with full optimization
- **Status**: Failing due to network issues

### 2. `Dockerfile.simple`
- Uses Node.js base image
- Simplified dependency installation
- **Status**: Failing due to network issues

### 3. `Dockerfile.minimal`
- Minimal dependencies
- Skips build tools that require network access
- **Status**: Failing at npm install step

## Recommended Solutions

### Alternative Solutions

If you encounter build issues:

1. **Use different Dockerfile**: Try `Dockerfile.minimal` for simpler builds
2. **Check network connectivity**: Ensure internet access is available
3. **Use pre-built images**: Consider using official Node.js images
4. **Build incrementally**: Build base images separately if needed

## Current Status

✅ **Docker setup complete and tested**

**Features**:
- Multi-stage builds for optimized images
- Development and production configurations
- Docker Compose support
- Comprehensive documentation

## Testing Commands

```bash
# Test network connectivity
ping 8.8.8.8
nslookup registry.npmjs.org

# Build and test
docker build -f Dockerfile.minimal -t condenser:test .
docker run -p 3000:3000 condenser:test
```