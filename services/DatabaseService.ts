import { PrismaClient } from '@prisma/client';

/**
 * 数据库服务类
 * 实现Aurora PostgreSQL读写分离
 * 写操作使用主端点，读操作使用只读端点
 */
export class DatabaseService {
  private writeClient: PrismaClient;
  private readClient: PrismaClient;
  private static instance: DatabaseService;

  constructor() {
    // 写入客户端 - 连接到Aurora集群的写入端点
    this.writeClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: ['query', 'info', 'warn', 'error'],
    });

    // 只读客户端 - 连接到Aurora集群的只读端点
    this.readClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_READER || process.env.DATABASE_URL
        }
      },
      log: ['query', 'info', 'warn', 'error'],
    });

    // Aurora Serverless v2 预热
    if (process.env.AURORA_WARMUP === 'true') {
      this.warmupConnections();
    }
  }

  /**
   * 获取单例实例
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * 获取写入客户端（用于INSERT, UPDATE, DELETE操作）
   */
  getWriteClient(): PrismaClient {
    return this.writeClient;
  }

  /**
   * 获取只读客户端（用于SELECT操作）
   */
  getReadClient(): PrismaClient {
    return this.readClient;
  }

  /**
   * Aurora Serverless v2 预热连接
   * 减少冷启动时间
   */
  private async warmupConnections(): Promise<void> {
    try {
      console.log('🔥 开始预热Aurora连接...');
      
      // 预热写入连接
      await this.writeClient.$queryRaw`SELECT 1`;
      console.log('✅ 写入端点预热完成');
      
      // 预热只读连接
      await this.readClient.$queryRaw`SELECT 1`;
      console.log('✅ 只读端点预热完成');
      
    } catch (error) {
      console.error('❌ Aurora连接预热失败:', error);
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ write: boolean; read: boolean }> {
    const result = { write: false, read: false };
    
    try {
      await this.writeClient.$queryRaw`SELECT 1`;
      result.write = true;
    } catch (error) {
      console.error('写入端点健康检查失败:', error);
    }
    
    try {
      await this.readClient.$queryRaw`SELECT 1`;
      result.read = true;
    } catch (error) {
      console.error('只读端点健康检查失败:', error);
    }
    
    return result;
  }

  /**
   * 关闭数据库连接
   */
  async disconnect(): Promise<void> {
    await Promise.all([
      this.writeClient.$disconnect(),
      this.readClient.$disconnect()
    ]);
    console.log('🔌 数据库连接已关闭');
  }
}

// 导出单例实例
export const databaseService = DatabaseService.getInstance();
