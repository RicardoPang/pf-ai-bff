# 博客系统 - AWS Aurora PostgreSQL 集群实战

## 项目概述
这是一个基于 Koa.js 和 Prisma ORM 的博客系统，使用 AWS Aurora PostgreSQL 数据库集群实现读写分离，提供高性能和高可用性的数据库解决方案。

## 技术栈
- **后端框架**: Koa.js + TypeScript
- **数据库**: AWS Aurora PostgreSQL (Serverless v2)
- **ORM**: Prisma
- **部署**: AWS EC2 + PM2
- **读写分离**: Aurora 集群端点

## 数据库架构

### Aurora PostgreSQL 集群配置
- **集群标识符**: pf-database-1
- **引擎**: Aurora PostgreSQL Compatible
- **版本**: Aurora 标准版 Serverless v2
- **最小容量**: 0 (节省成本，支持冷启动)
- **可用性**: 多可用区部署，支持自动故障转移

### 读写分离端点
- **写入端点**: `pf-database-1.cluster-cfsuogce0qm2.ap-southeast-2.rds.amazonaws.com:5432`
- **只读端点**: `pf-database-1.cluster-ro-cfsuogce0qm2.ap-southeast-2.rds.amazonaws.com:5432`

## 项目结构
```
pf-ai-bff/
├── app.ts                 # 应用入口文件
├── package.json           # 项目依赖配置
├── prisma/
│   └── schema.prisma      # 数据库模型定义
├── services/              # 业务逻辑服务层
├── routers/               # 路由控制器
├── views/                 # 前端页面模板
├── config/                # 配置文件
└── .env                   # 环境变量配置
```

## 数据库模型

### Article (文章表)
- `id`: 主键，自增
- `title`: 文章标题
- `content`: 文章内容
- `summary`: 文章摘要
- `coverImage`: 封面图片
- `published`: 发布状态
- `createdAt`: 创建时间
- `updatedAt`: 更新时间
- `authorId`: 作者ID (外键)

### Author (作者表)
- `id`: 主键，自增
- `name`: 作者姓名
- `email`: 邮箱 (唯一)
- `bio`: 个人简介
- `avatar`: 头像

### Category (分类表)
- `id`: 主键，自增
- `name`: 分类名称 (唯一)
- `description`: 分类描述

### CategoryOnArticle (文章分类关联表)
- `articleId`: 文章ID
- `categoryId`: 分类ID
- 复合主键: [articleId, categoryId]

## 环境配置

### 开发环境 (.env)
```bash
# 本地开发数据库
DATABASE_URL="postgresql://username@localhost:5432/blog"
DATABASE_URL_READER="postgresql://username@localhost:5432/blog"
```

### 生产环境 (.env.production)
```bash
# Aurora PostgreSQL 读写分离配置
DATABASE_URL="postgresql://wallfacerpang:PangFeng123456@pf-database-1.cluster-cfsuogce0qm2.ap-southeast-2.rds.amazonaws.com:5432/blog"
DATABASE_URL_READER="postgresql://wallfacerpang:PangFeng123456@pf-database-1.cluster-ro-cfsuogce0qm2.ap-southeast-2.rds.amazonaws.com:5432/blog"
```

## 安装与运行

### 1. 安装依赖
```bash
npm install
# 或
pnpm install
```

### 2. 数据库初始化
```bash
# 生成 Prisma 客户端
npx prisma generate

# 推送数据库模式到 Aurora
npx prisma db push

# 查看数据库状态
npx prisma studio
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 生产环境部署
```bash
# 构建项目
npm run build

# 启动生产服务器
npm run start

# 查看服务状态
npm run status
```

## API 接口

### 文章相关接口
- `GET /api/articles` - 获取文章列表 (支持分页)
- `GET /api/articles/:id` - 获取文章详情
- `POST /api/articles` - 创建文章
- `PUT /api/articles/:id` - 更新文章
- `DELETE /api/articles/:id` - 删除文章

### 作者相关接口
- `GET /api/authors` - 获取作者列表
- `GET /api/authors/:id` - 获取作者详情
- `POST /api/authors` - 创建作者

### 分类相关接口
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 创建分类

## 页面路由

### 前端页面
- `/` - 文章列表页
- `/article/:id` - 文章详情页
- `/admin` - 管理后台 (待开发)

## 性能优化

### 数据库优化
1. **读写分离**: 查询操作使用只读端点，写入操作使用写入端点
2. **连接池**: Prisma 自动管理数据库连接池
3. **索引优化**: 在常用查询字段上建立索引
4. **缓存策略**: 使用 Redis 缓存热点数据 (待实现)

### Aurora Serverless v2 优势
1. **自动扩缩容**: 根据负载自动调整计算容量
2. **成本优化**: 最小容量设为 0，空闲时不产生计算费用
3. **冷启动优化**: 可通过预热请求减少冷启动时间
4. **高可用性**: 多可用区自动故障转移

## 监控与日志

### 应用监控
- PM2 进程监控
- 应用日志记录在 `logs/` 目录

### 数据库监控
- AWS CloudWatch 监控数据库性能
- Aurora 性能洞察功能

## 安全配置

### 数据库安全
1. **VPC 隔离**: 数据库部署在私有子网
2. **安全组**: 限制数据库访问端口和来源
3. **SSL 连接**: 强制使用 SSL 连接数据库
4. **IAM 认证**: 支持 IAM 数据库认证 (可选)

### 应用安全
1. **环境变量**: 敏感信息存储在环境变量中
2. **输入验证**: 使用 Prisma 防止 SQL 注入
3. **CORS 配置**: 限制跨域请求来源

## 故障排除

### 常见问题
1. **冷启动延迟**: Aurora Serverless v2 冷启动可能需要几秒钟
   - 解决方案: 实现预热机制，定期发送心跳请求

2. **连接超时**: 网络延迟或安全组配置问题
   - 检查 EC2 与 Aurora 的网络连通性
   - 确认安全组规则正确配置

3. **权限错误**: 数据库用户权限不足
   - 确认数据库用户具有必要的读写权限

## 扩展计划

### 短期目标
- [ ] 实现文章搜索功能
- [ ] 添加文章评论系统
- [ ] 集成 Redis 缓存
- [ ] 实现用户认证系统

### 长期目标
- [ ] 微服务架构改造
- [ ] 容器化部署 (Docker + ECS)
- [ ] CDN 集成
- [ ] 全文搜索 (Elasticsearch)

## 联系方式
如有问题或建议，请联系项目维护者。

---
最后更新时间: 2025-06-17
