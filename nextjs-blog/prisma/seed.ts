import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // 创建作者
  const author = await prisma.author.create({
    data: {
      name: '黑白灰',
      email: 'ricardo.pangj@gmail.com',
      bio: '资深技术博主，专注于前端和后端开发',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
  });

  console.log(`已创建作者: ${author.name}`);

  // 创建分类
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: '前端开发',
        description: '关于前端技术的文章',
      },
    }),
    prisma.category.create({
      data: {
        name: '后端开发',
        description: '关于后端技术的文章',
      },
    }),
    prisma.category.create({
      data: {
        name: '数据库',
        description: '关于数据库技术的文章',
      },
    }),
  ]);

  console.log(`已创建 ${categories.length} 个分类`);
  
  // 创建文章并关联分类
  await prisma.article.create({
    data: {
      title: 'React 18 新特性详解',
      content: '这是一篇关于 React 18 新特性的详细介绍，包括并发模式、自动批处理等功能...',
      summary: 'React 18 带来了许多令人兴奋的新特性，本文将详细介绍这些特性及其使用方法。',
      coverImage: 'https://example.com/images/react18.jpg',
      authorId: author.id,
      categories: {
        create: [
          { categoryId: categories[0].id },  // 前端开发
        ]
      }
    },
  });
  
  await prisma.article.create({
    data: {
      title: 'Node.js 性能优化指南',
      content: '本文将介绍 Node.js 应用的性能优化技巧，包括内存管理、异步操作优化等方面...',
      summary: '如何让你的 Node.js 应用运行得更快？本文提供了实用的性能优化建议。',
      coverImage: 'https://example.com/images/nodejs.jpg',
      authorId: author.id,
      categories: {
        create: [
          { categoryId: categories[1].id },  // 后端开发
        ]
      }
    },
  });
  
  await prisma.article.create({
    data: {
      title: 'PostgreSQL 与 MySQL 对比',
      content: '本文对比了 PostgreSQL 和 MySQL 两种流行数据库的特点、性能和适用场景...',
      summary: 'PostgreSQL 和 MySQL 各有优势，如何选择适合你项目的数据库？',
      coverImage: 'https://example.com/images/database.jpg',
      authorId: author.id,
      categories: {
        create: [
          { categoryId: categories[2].id },  // 数据库
        ]
      }
    },
  });
  
  console.log(`已创建 3 篇文章`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
