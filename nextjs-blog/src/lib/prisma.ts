import { PrismaClient } from '../generated/prisma';

// 防止开发环境下创建多个 PrismaClient 实例
const globalForPrisma = global as unknown as { 
  prismaWriter: PrismaClient;
  prismaReader: PrismaClient;
  writerConnected: boolean;
  readerConnected: boolean;
};

// 初始化连接状态
if (!globalForPrisma.writerConnected) globalForPrisma.writerConnected = false;
if (!globalForPrisma.readerConnected) globalForPrisma.readerConnected = false;

/**
 * 创建 Prisma 写入客户端 - 连接到 Aurora 主实例
 * 用于所有的写操作（创建、更新、删除）
 */
export const prismaWriter = globalForPrisma.prismaWriter || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:PangFeng123456@pf-ai-bff.cluster-cfsuogce0qm2.ap-southeast-2.rds.amazonaws.com:5432/blog?sslmode=require&connection_limit=5&pool_timeout=10&connect_timeout=5"
    }
  },
  log: ['query', 'error', 'warn']
});

/**
 * 创建 Prisma 读取客户端 - 连接到 Aurora 只读副本
 * 用于所有的读操作（查询）
 */
export const prismaReader = globalForPrisma.prismaReader || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_READER || "postgresql://postgres:PangFeng123456@pf-ai-bff.cluster-ro-cfsuogce0qm2.ap-southeast-2.rds.amazonaws.com:5432/blog?sslmode=require&connection_limit=10&pool_timeout=10&connect_timeout=5"
    }
  },
  log: ['query', 'error', 'warn']
});

// 在开发环境中保存实例
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaWriter = prismaWriter;
  globalForPrisma.prismaReader = prismaReader;
}

/**
 * 连接到数据库，带有重试机制
 * @param retryCount 当前重试次数
 */
async function connectWithRetry(retryCount = 0) {
  const maxRetries = 5;
  
  // 尝试连接写入数据库
  if (!globalForPrisma.writerConnected) {
    try {
      await prismaWriter.$connect();
      globalForPrisma.writerConnected = true;
      console.log('写入数据库连接成功');
    } catch (writerError) {
      console.error('写入数据库连接失败:', writerError);
    }
  }
  
  // 尝试连接读取数据库
  if (!globalForPrisma.readerConnected) {
    try {
      await prismaReader.$connect();
      globalForPrisma.readerConnected = true;
      console.log('读取数据库连接成功');
    } catch (readerError) {
      console.error('读取数据库连接失败:', readerError);
    }
  }
  
  // 如果两个连接都成功，则返回
  if (globalForPrisma.writerConnected && globalForPrisma.readerConnected) {
    console.log('数据库连接完全成功');
    return;
  }
  
  // 如果达到最大重试次数，则使用本地数据库作为备份
  if (retryCount >= maxRetries - 1) {
    console.warn(`达到最大重试次数 (${maxRetries})，将使用本地数据库作为备份`);
    
    // 重新配置为本地数据库
    if (!globalForPrisma.writerConnected) {
      prismaWriter.$disconnect();
      prismaWriter.$connect();
    }
    
    if (!globalForPrisma.readerConnected) {
      prismaReader.$disconnect();
      prismaReader.$connect();
    }
    
    return;
  }
  
  // 否则，等待后重试
  const delay = Math.pow(2, retryCount) * 1000; // 指数退避策略
  console.log(`将在 ${delay}ms 后重试连接...`);
  
  setTimeout(() => {
    connectWithRetry(retryCount + 1);
  }, delay);
}

// 初始化连接
connectWithRetry().catch(e => {
  console.error('数据库连接初始化失败:', e);
});

/**
 * 默认导出的 prisma 客户端
 * 为了兼容现有代码，默认使用读取客户端
 */
export const prisma = prismaReader;

export default prisma;