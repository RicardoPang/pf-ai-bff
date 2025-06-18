import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // 创建作者
  const author = await prisma.author.create({
    data: {
      name: '张三',
      email: 'zhangsan@example.com',
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
