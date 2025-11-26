# Docker Setup for Condenser

This document describes how to build and run the Condenser application using Docker.

## Network Issues and Solutions

### Current Network Problem

The build is failing due to network connectivity issues. The proxy server `http://192.168.199.2:8001` appears to be unreachable, causing timeouts when trying to:

1. Update Alpine package repositories
2. Install Node.js packages via npm/pnpm

### Troubleshooting Steps

#### 1. Test Proxy Connectivity

```bash
# Test if proxy is reachable
curl -x http://192.168.199.2:8001 http://www.google.com

# Test direct connectivity
curl http://www.google.com
```

#### 2. Alternative Proxy Configuration

If the proxy address is incorrect, try:

```bash
# Check network configuration
ip route
netstat -rn

# Try different proxy addresses
docker build --build-arg HTTPS_PROXY=http://192.168.199.11:8001 ...
```

#### 3. Build Without Proxy

If network allows direct access:

```bash
# Build without proxy
docker build -f Dockerfile.minimal -t condenser:dev .
```

#### 4. Use Different Base Images

Try using a pre-built image with better network support:

```dockerfile
# Use Ubuntu instead of Alpine
FROM node:20-ubuntu

# Or use a different Node.js version
FROM node:18-alpine
```

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

### Option 1: Fix Network/Proxy Issues

1. Verify proxy server is running and accessible
2. Check firewall rules
3. Test connectivity from Docker host

### Option 2: Use Local Registry

Set up a local npm registry mirror:

```bash
# Run local npm registry
docker run -d --name npm-registry -p 4873:4873 verdaccio/verdaccio

# Configure npm to use local registry
npm config set registry http://localhost:4873
```

### Option 3: Pre-built Images

Use pre-built images from a registry that works:

```bash
# Pull from different registry
docker pull registry.cn-hangzhou.aliyuncs.com/node:20-alpine
```

### Option 4: Build on Different Network

Build the Docker image on a machine with better network connectivity, then transfer:

```bash
# Build on machine with good network
docker build -t condenser:latest .
docker save condenser:latest > condenser.tar

# Transfer and load on target machine
docker load < condenser.tar
```

## Environment Variables for Network Configuration

```bash
# Proxy settings
HTTPS_PROXY=http://proxy-server:port
HTTP_PROXY=http://proxy-server:port
NO_PROXY=localhost,127.0.0.1,.local

# Registry settings
NPM_REGISTRY=https://registry.npmjs.org/
ALPINE_MIRROR=http://mirrors.aliyun.com/alpine/
```

## Current Status

❌ **Build failing due to network connectivity issues**

**Error**: Cannot connect to proxy server `http://192.168.199.2:8001`

**Next Steps**:
1. Verify proxy server status
2. Test alternative proxy addresses
3. Consider building without proxy if direct access works
4. Use alternative base images or registries

## Testing Commands

```bash
# Test network connectivity
ping 8.8.8.8
nslookup registry.npmjs.org

# Test proxy
curl -x http://192.168.199.2:8001 http://httpbin.org/ip

# Build without network dependencies (if possible)
docker build --network=none -t condenser:offline .
```