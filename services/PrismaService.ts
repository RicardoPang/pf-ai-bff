import { PrismaClient } from '@prisma/client';

/**
 * PrismaService 类
 * 
 * 这个服务负责管理与数据库的连接，实现读写分离
 * - writer: 用于写操作（创建、更新、删除）
 * - reader: 用于读操作（查询）
 */
export class PrismaService {
  // 写入客户端 - 连接到主数据库
  private writer: PrismaClient;
  
  // 读取客户端 - 连接到只读副本
  private reader: PrismaClient;

  constructor() {
    // 初始化写入客户端
    this.writer = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // 初始化读取客户端
    this.reader = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_READER,
        },
      },
    });

    // 连接数据库
    this.connect();
  }

  /**
   * 连接到数据库
   */
  private async connect(): Promise<void> {
    try {
      await this.writer.$connect();
      await this.reader.$connect();
      console.log('数据库连接成功');
    } catch (error) {
      console.error('数据库连接失败:', error);
      throw error;
    }
  }

  /**
   * 获取写入客户端
   */
  getWriter(): PrismaClient {
    return this.writer;
  }

  /**
   * 获取读取客户端
   */
  getReader(): PrismaClient {
    return this.reader;
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    await this.writer.$disconnect();
    await this.reader.$disconnect();
  }
}

// 导出单例实例
export const prismaService = new PrismaService();
