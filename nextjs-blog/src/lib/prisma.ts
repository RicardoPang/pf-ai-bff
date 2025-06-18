import { PrismaClient } from '../generated/prisma';

// 防止开发环境下创建多个 PrismaClient 实例
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 直接设置数据库连接字符串
export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://pangjianfeng@localhost:5432/blog"
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;