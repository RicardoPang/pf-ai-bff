/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
  try {
    // 清理现有数据（如果需要重新运行）
    console.log('🗑️ 清理现有数据...');
    await prisma.categoryOnArticle.deleteMany({});
    await prisma.article.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.author.deleteMany({});
    
    // 创建作者
    console.log('👤 创建作者...');
    const author = await prisma.author.create({
      data: {
        name: '黑白灰',
        email: 'ricardo.pangj@gmail.com',
        bio: '资深技术博主，专注于前端和后端开发',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
    });

    console.log(`✅ 已创建作者: ${author.name}`);

    // 创建分类
    console.log('📚 创建分类...');
    const frontendCategory = await prisma.category.create({
      data: {
        name: '前端开发',
        description: '关于前端技术的文章',
      },
    });

    const backendCategory = await prisma.category.create({
      data: {
        name: '后端开发',
        description: '关于后端技术的文章',
      },
    });

    const databaseCategory = await prisma.category.create({
      data: {
        name: '数据库',
        description: '关于数据库技术的文章',
      },
    });

    console.log('✅ 已创建 3 个分类');

    // 创建文章
    console.log('📝 创建文章...');
    const article1 = await prisma.article.create({
      data: {
        title: 'Next.js 13 新特性详解',
        content: `
# Next.js 13 新特性详解

Next.js 13 带来了许多令人兴奋的新特性，包括：

## App Router

全新的基于文件系统的路由器，支持布局、嵌套路由和加载状态。

## React Server Components

默认使用 React Server Components，提高性能和用户体验。

## 改进的数据获取

使用 async/await 在组件中直接获取数据，简化数据获取流程。

## Streaming

支持流式渲染，提高首次加载性能。

## Turbopack

新的 Rust 编写的打包工具，比 Webpack 快 700 倍。
        `,
        summary: 'Next.js 13 带来了许多令人兴奋的新特性，包括 App Router、React Server Components、改进的数据获取等。',
        coverImage: 'https://nextjs.org/static/blog/next-13/twitter-card.png',
        authorId: author.id,
      },
    });

    // 为文章添加分类
    await prisma.categoryOnArticle.create({
      data: {
        articleId: article1.id,
        categoryId: frontendCategory.id,
      },
    });

    const article2 = await prisma.article.create({
      data: {
        title: 'PostgreSQL 高级查询技巧',
        content: `
# PostgreSQL 高级查询技巧

PostgreSQL 是一个功能强大的开源关系型数据库，本文将介绍一些高级查询技巧。

## 窗口函数

窗口函数允许你在查询中执行计算，同时保持行的独立性。

\`\`\`sql
SELECT 
  name,
  department,
  salary,
  AVG(salary) OVER (PARTITION BY department) as avg_dept_salary
FROM employees;
\`\`\`

## JSON 操作

PostgreSQL 提供了丰富的 JSON 操作功能。

\`\`\`sql
SELECT 
  id,
  data->>'name' as name,
  (data->>'age')::int as age
FROM users;
\`\`\`

## 全文搜索

使用 PostgreSQL 的全文搜索功能可以实现高效的文本搜索。

\`\`\`sql
SELECT title, ts_rank(to_tsvector('english', content), to_tsquery('english', 'query'))
FROM articles
WHERE to_tsvector('english', content) @@ to_tsquery('english', 'query');
\`\`\`
        `,
        summary: '本文介绍 PostgreSQL 的高级查询技巧，包括窗口函数、JSON 操作和全文搜索等功能。',
        coverImage: 'https://www.postgresql.org/media/img/about/press/elephant.png',
        authorId: author.id,
      },
    });

    // 为文章添加分类
    await prisma.categoryOnArticle.create({
      data: {
        articleId: article2.id,
        categoryId: databaseCategory.id,
      },
    });

    await prisma.categoryOnArticle.create({
      data: {
        articleId: article2.id,
        categoryId: backendCategory.id,
      },
    });

    console.log(`✅ 已创建 2 篇文章`);
    console.log('🎉 数据库填充完成！');
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
