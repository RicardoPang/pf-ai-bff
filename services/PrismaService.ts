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
  
  // 连接状态
  private writerConnected: boolean = false;
  private readerConnected: boolean = false;
  
  // 最大重试次数
  private maxRetries: number = 5;
  
  constructor() {
    console.log('初始化 PrismaService...');
    console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '已设置' : '未设置'}`);
    console.log(`DATABASE_URL_READER: ${process.env.DATABASE_URL_READER ? '已设置' : '未设置'}`);
    
    // 初始化写入客户端，添加日志
    this.writer = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ],
    });

    // 初始化读取客户端，添加日志
    this.reader = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_READER,
        },
      },
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
      ],
    });

    // 注释掉事件监听，避免类型错误
    /*
    this.writer.$on('query', (e: any) => {
      console.log('Writer Query: ' + e.query);
    });
    
    this.reader.$on('query', (e: any) => {
      console.log('Reader Query: ' + e.query);
    });
    */

    // 连接数据库
    this.connectWithRetry();
  }

  /**
   * 带重试机制的数据库连接
   */
  private async connectWithRetry(retryCount: number = 0): Promise<void> {
    try {
      console.log(`尝试连接数据库... (尝试 ${retryCount + 1}/${this.maxRetries})`);
      
      // 尝试连接写入数据库
      if (!this.writerConnected) {
        try {
          await this.writer.$connect();
          this.writerConnected = true;
          console.log('写入数据库连接成功');
        } catch (writerError) {
          console.error('写入数据库连接失败:', writerError);
        }
      }
      
      // 尝试连接读取数据库
      if (!this.readerConnected) {
        try {
          await this.reader.$connect();
          this.readerConnected = true;
          console.log('读取数据库连接成功');
        } catch (readerError) {
          console.error('读取数据库连接失败:', readerError);
        }
      }
      
      // 如果两个连接都成功，则返回
      if (this.writerConnected && this.readerConnected) {
        console.log('数据库连接完全成功');
        return;
      }
      
      // 如果达到最大重试次数，则抛出错误
      if (retryCount >= this.maxRetries - 1) {
        throw new Error(`达到最大重试次数 (${this.maxRetries})，无法连接数据库`);
      }
      
      // 否则，等待后重试
      const delay = Math.pow(2, retryCount) * 1000; // 指数退避策略
      console.log(`将在 ${delay}ms 后重试连接...`);
      
      setTimeout(() => {
        this.connectWithRetry(retryCount + 1);
      }, delay);
      
    } catch (error) {
      console.error('数据库连接过程中发生错误:', error);
      throw error;
    }
  }
  
  /**
   * 检查连接状态并尝试重新连接
   */
  private async ensureConnection(client: 'writer' | 'reader'): Promise<PrismaClient> {
    if (client === 'writer' && !this.writerConnected) {
      try {
        await this.writer.$connect();
        this.writerConnected = true;
        console.log('写入数据库重新连接成功');
      } catch (error) {
        console.error('写入数据库重新连接失败:', error);
        throw error;
      }
    } else if (client === 'reader' && !this.readerConnected) {
      try {
        await this.reader.$connect();
        this.readerConnected = true;
        console.log('读取数据库重新连接成功');
      } catch (error) {
        console.error('读取数据库重新连接失败:', error);
        throw error;
      }
    }
    
    return client === 'writer' ? this.writer : this.reader;
  }

  /**
   * 获取写入客户端
   */
  async getWriter(): Promise<PrismaClient> {
    return this.ensureConnection('writer');
  }

  /**
   * 获取读取客户端
   */
  async getReader(): Promise<PrismaClient> {
    return this.ensureConnection('reader');
  }

  /**
   * 断开数据库连接
   */
  async disconnect(): Promise<void> {
    try {
      if (this.writerConnected) {
        await this.writer.$disconnect();
        this.writerConnected = false;
        console.log('写入数据库断开连接');
      }
      
      if (this.readerConnected) {
        await this.reader.$disconnect();
        this.readerConnected = false;
        console.log('读取数据库断开连接');
      }
    } catch (error) {
      console.error('断开数据库连接时发生错误:', error);
      throw error;
    }
  }
  
  /**
   * 执行健康检查
   */
  async healthCheck(): Promise<{
    writer: boolean;
    reader: boolean;
  }> {
    let writerHealthy = false;
    let readerHealthy = false;
    
    try {
      if (this.writerConnected) {
        await this.writer.$queryRaw`SELECT 1`;
        writerHealthy = true;
      }
    } catch (error) {
      console.error('写入数据库健康检查失败:', error);
      this.writerConnected = false;
    }
    
    try {
      if (this.readerConnected) {
        await this.reader.$queryRaw`SELECT 1`;
        readerHealthy = true;
      }
    } catch (error) {
      console.error('读取数据库健康检查失败:', error);
      this.readerConnected = false;
    }
    
    return {
      writer: writerHealthy,
      reader: readerHealthy
    };
  }
}

// 导出单例实例
export const prismaService = new PrismaService();
