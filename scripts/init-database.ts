import { PrismaClient } from '@prisma/client';

/**
 * 数据库初始化脚本
 * 用于创建测试数据和验证Aurora连接
 */

async function initDatabase() {
  console.log('🚀 开始初始化数据库...');
  
  // 创建写入客户端
  const writeClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  });

  // 创建只读客户端
  const readClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_READER || process.env.DATABASE_URL
      }
    }
  });

  try {
    // 1. 测试数据库连接
    console.log('📡 测试数据库连接...');
    await writeClient.$queryRaw`SELECT 1`;
    console.log('✅ 写入端点连接成功');
    
    await readClient.$queryRaw`SELECT 1`;
    console.log('✅ 只读端点连接成功');

    // 2. 创建测试作者
    console.log('👤 创建测试作者...');
    const author = await writeClient.author.upsert({
      where: { email: 'admin@blog.com' },
      update: {},
      create: {
        name: '博客管理员',
        email: 'admin@blog.com',
        bio: '这是一个测试博客的管理员账户',
        avatar: 'https://via.placeholder.com/150'
      }
    });
    console.log(`✅ 作者创建成功: ${author.name} (ID: ${author.id})`);

    // 3. 创建测试分类
    console.log('📂 创建测试分类...');
    const categories = await Promise.all([
      writeClient.category.upsert({
        where: { name: '技术分享' },
        update: {},
        create: {
          name: '技术分享',
          description: '分享各种技术心得和经验'
        }
      }),
      writeClient.category.upsert({
        where: { name: '生活随笔' },
        update: {},
        create: {
          name: '生活随笔',
          description: '记录生活中的点点滴滴'
        }
      }),
      writeClient.category.upsert({
        where: { name: 'AWS实战' },
        update: {},
        create: {
          name: 'AWS实战',
          description: 'AWS云服务实战经验分享'
        }
      })
    ]);
    console.log(`✅ 分类创建成功: ${categories.map(c => c.name).join(', ')}`);

    // 4. 创建测试文章
    console.log('📝 创建测试文章...');
    const articles = [
      {
        title: 'AWS Aurora PostgreSQL 集群部署实战',
        content: `
# AWS Aurora PostgreSQL 集群部署实战

## 前言
本文将详细介绍如何在AWS上部署Aurora PostgreSQL集群，实现高可用性和读写分离。

## 部署步骤

### 1. 创建Aurora集群
在AWS控制台中选择Aurora PostgreSQL Compatible，配置如下：
- 引擎版本：Aurora PostgreSQL
- 实例类型：Serverless v2
- 最小容量：8 ACU
- 最大容量：64 ACU

### 2. 配置网络和安全
- VPC：选择合适的VPC
- 子网组：确保跨多个可用区
- 安全组：配置数据库访问规则

### 3. 读写分离配置
Aurora自动提供读写分离端点：
- 写入端点：用于所有写操作
- 只读端点：用于查询操作，提高性能

## 性能优化
1. 合理设置ACU容量范围
2. 使用连接池管理数据库连接
3. 实施缓存策略
4. 监控数据库性能指标

## 总结
Aurora PostgreSQL为现代应用提供了强大的数据库解决方案，通过合理配置可以实现高性能和高可用性。
        `,
        summary: '详细介绍AWS Aurora PostgreSQL集群的部署过程和最佳实践',
        coverImage: 'https://via.placeholder.com/800x400?text=Aurora+PostgreSQL',
        authorId: author.id,
        categoryIds: [categories[0].id, categories[2].id]
      },
      {
        title: 'Prisma ORM 读写分离最佳实践',
        content: `
# Prisma ORM 读写分离最佳实践

## 什么是读写分离
读写分离是一种数据库架构模式，将读操作和写操作分别路由到不同的数据库实例。

## 实现方案
使用Prisma Client创建两个实例：
- writeClient：处理写操作
- readClient：处理读操作

## 代码示例
\`\`\`typescript
const writeClient = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL }
  }
});

const readClient = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL_READER }
  }
});
\`\`\`

## 注意事项
1. 读写分离可能存在数据延迟
2. 需要合理设计业务逻辑
3. 监控两个端点的性能

## 总结
通过Prisma实现读写分离，可以显著提高应用的数据库性能。
        `,
        summary: '使用Prisma ORM实现数据库读写分离的详细指南',
        coverImage: 'https://via.placeholder.com/800x400?text=Prisma+ORM',
        authorId: author.id,
        categoryIds: [categories[0].id]
      },
      {
        title: '博客系统开发日记',
        content: `
# 博客系统开发日记

## 项目背景
最近在学习AWS云服务，决定搭建一个博客系统来实践所学知识。

## 技术选型
- 后端：Koa.js + TypeScript
- 数据库：Aurora PostgreSQL
- ORM：Prisma
- 部署：EC2 + PM2

## 开发过程
### 第一阶段：环境搭建
1. 创建AWS账户
2. 配置EC2实例
3. 部署Aurora数据库

### 第二阶段：应用开发
1. 搭建Koa.js框架
2. 集成Prisma ORM
3. 实现读写分离

### 第三阶段：功能完善
1. 文章管理功能
2. 分类管理
3. 用户认证

## 遇到的问题
1. Aurora冷启动延迟
2. 网络配置复杂
3. 权限管理

## 解决方案
1. 实现预热机制
2. 优化安全组配置
3. 使用IAM角色

## 总结
通过这个项目，深入了解了AWS云服务的强大功能。
        `,
        summary: '记录博客系统开发过程中的心得体会',
        coverImage: 'https://via.placeholder.com/800x400?text=Development+Diary',
        authorId: author.id,
        categoryIds: [categories[1].id]
      }
    ];

    for (const articleData of articles) {
      const { categoryIds, ...data } = articleData;
      const article = await writeClient.article.create({
        data: {
          ...data,
          categories: {
            create: categoryIds.map(categoryId => ({
              category: { connect: { id: categoryId } }
            }))
          }
        }
      });
      console.log(`✅ 文章创建成功: ${article.title} (ID: ${article.id})`);
    }

    // 5. 验证数据
    console.log('🔍 验证数据...');
    const articleCount = await readClient.article.count();
    const authorCount = await readClient.author.count();
    const categoryCount = await readClient.category.count();
    
    console.log(`📊 数据统计:`);
    console.log(`   - 文章数量: ${articleCount}`);
    console.log(`   - 作者数量: ${authorCount}`);
    console.log(`   - 分类数量: ${categoryCount}`);

    console.log('🎉 数据库初始化完成！');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await writeClient.$disconnect();
    await readClient.$disconnect();
  }
}

// 运行初始化
initDatabase()
  .then(() => {
    console.log('✅ 初始化脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 初始化脚本执行失败:', error);
    process.exit(1);
  });

export { initDatabase };
