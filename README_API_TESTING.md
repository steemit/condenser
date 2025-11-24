# API 端点测试快速指南

## 快速开始

### 1. 启动开发服务器

```bash
pnpm dev
```

服务器将在 `http://localhost:3000` 启动。

### 2. 运行测试

#### 方法 A: 使用 TypeScript 测试脚本（推荐）

```bash
pnpm test:api
```

这将测试所有 API 端点并显示详细结果。

#### 方法 B: 使用简单的 bash 脚本

```bash
./scripts/test-api-simple.sh
```

#### 方法 C: 手动测试单个端点

```bash
# 测试获取账户信息
curl "http://localhost:3000/api/steem/account?username=steemit"

# 测试获取排名文章
curl "http://localhost:3000/api/steem/posts?sort=trending&limit=5"

# 测试获取账户文章
curl "http://localhost:3000/api/steem/posts?sort=blog&account=steemit&limit=5"
```

### 3. 在浏览器中测试

打开浏览器访问：
- `http://localhost:3000/api/steem/account?username=steemit`
- `http://localhost:3000/api/steem/posts?sort=trending&limit=5`

## 可用的 API 端点

### Steem API

- `GET /api/steem/account?username={username}` - 获取账户信息
- `GET /api/steem/posts?sort={sort}&tag={tag}&limit={limit}` - 获取排名文章
- `GET /api/steem/posts?sort={sort}&account={account}&limit={limit}` - 获取账户文章
- `GET /api/steem/post?author={author}&permlink={permlink}` - 获取单篇文章
- `GET /api/steem/comments?author={author}&permlink={permlink}` - 获取评论
- `GET /api/steem/notifications?account={account}&limit={limit}` - 获取通知
- `GET /api/steem/unread-notifications?account={account}` - 获取未读通知

### 认证 API

- `POST /api/auth/check-authority` - 检查账户权限
- `POST /api/auth/login` - 服务器端登录

## 详细文档

查看 [docs/API_TESTING.md](./docs/API_TESTING.md) 获取完整的测试文档。

## 故障排除

如果测试失败：

1. **确保服务器正在运行**
   ```bash
   # 检查端口 3000 是否被占用
   lsof -ti:3000
   ```

2. **检查服务器日志**
   - 查看终端输出
   - 检查是否有错误信息

3. **验证环境变量**
   - 确保 Steem RPC 节点可访问
   - 默认使用 `https://api.steemit.com`

4. **网络连接**
   - 确保可以访问 Steem RPC 节点
   - 检查防火墙设置

## 示例响应

### 成功响应（账户信息）
```json
{
  "id": 12345,
  "name": "steemit",
  "owner": {...},
  "active": {...},
  "posting": {...},
  ...
}
```

### 成功响应（文章列表）
```json
[
  {
    "author": "steemit",
    "permlink": "firstpost",
    "title": "Post Title",
    "body": "Post content...",
    ...
  },
  ...
]
```

### 错误响应
```json
{
  "error": "Account not found"
}
```

