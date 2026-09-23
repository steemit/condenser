# Docker Setup for Condenser

This document describes how to build and run the Condenser application using Docker.

## Dockerfile

The main `Dockerfile` provides:
- Multi-stage build based on Alpine 3.22
- Development and production targets
- Optimized layer caching
- Minimal production image size

## Recommended Solutions

### Troubleshooting

If you encounter build issues:

1. **Check network connectivity**: Ensure internet access is available
2. **Clear Docker cache**: `docker system prune -a`
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
docker build -t condenser:test .
# Bind to loopback only; use -p 0.0.0.0:3000:3000 when the container must
# be reachable from outside the host.
docker run -p 127.0.0.1:3000:3000 condenser:test
```

## Security notes

- Both compose services publish `127.0.0.1:3000:3000` (loopback only) by
  default. Change the mapping to `0.0.0.0:3000:3000` only when external
  access is intended, and prefer a reverse proxy for public exposure.
- The dev service runs as a non-root user (`user:` in docker-compose.yml,
  defaulting to the production stage's 1001:1001). When the bind-mounted
  working copy is not writable by that uid, start compose with
  `CONDENSER_DEV_UID=$UID CONDENSER_DEV_GID=$(id -g)`. The production image
  already drops to the `nextjs` user via its Dockerfile `USER` directive.
- `JWT_SECRET` is required in every environment; compose refuses to start
  without it.