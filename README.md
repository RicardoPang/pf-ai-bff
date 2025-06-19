## 项目概述
这是一个基于 Koa.js 和 Prisma ORM 的博客系统，使用 AWS Aurora PostgreSQL 数据库集群实现读写分离，提供高性能和高可用性的数据库解决方案。

## 技术栈
- **后端框架**: Koa.js + TypeScript
- **数据库**: AWS Aurora PostgreSQL (Serverless v2)
- **ORM**: Prisma
- **部署**: AWS EC2 + PM2
- **读写分离**: Aurora 集群端点