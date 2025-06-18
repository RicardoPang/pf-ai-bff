const fs = require('fs');
const path = require('path');

// 1. 修改 schema.prisma 文件，移除对 .env 的依赖
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// 替换数据库连接配置
schemaContent = schemaContent.replace(
  'datasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}',
  'datasource db {\n  provider = "postgresql"\n  url      = "postgresql://pangjianfeng@localhost:5432/blog"\n}'
);

fs.writeFileSync(schemaPath, schemaContent);
console.log('✅ 已更新 schema.prisma 文件');

// 2. 确保 src/lib/prisma.ts 使用正确的导入路径
const prismaClientPath = path.join(__dirname, 'src', 'lib', 'prisma.ts');
let prismaClientContent = fs.readFileSync(prismaClientPath, 'utf8');

// 替换 Prisma 客户端导入和初始化
prismaClientContent = `import { PrismaClient } from '../generated/prisma';

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

export default prisma;`;

fs.writeFileSync(prismaClientPath, prismaClientContent);
console.log('✅ 已更新 prisma.ts 文件');

console.log('🚀 现在请运行以下命令：');
console.log('1. npx prisma generate');
console.log('2. npx prisma db push');
console.log('3. node prisma/seed.js');
console.log('4. npm run dev');
