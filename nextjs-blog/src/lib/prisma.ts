/**
 * 注意: 此文件是过渡用的空实现
 * 
 * 在迁移到API调用后，前端不再直接连接数据库
 * 此文件仅为了保持项目结构兼容性而保留
 * 所有数据访问应通过 src/lib/api.ts 中的API服务获取
 */

// 创建一个空对象，用于替代原来的Prisma客户端
// 这样导入此模块的文件不会直接崩溃，但实际上不会访问数据库

// 空的Prisma客户端实现
const emptyPrismaClient = {
  // 添加一些基本方法，避免使用时报错
  $connect: async () => console.warn('Prisma客户端已被禁用，请使用API服务获取数据'),
  $disconnect: async () => {},
  // 可以根据需要添加更多空方法
};

// 导出空客户端，以保持结构一致性
export const prismaWriter = emptyPrismaClient;
export const prismaReader = emptyPrismaClient;
export const prisma = emptyPrismaClient;

// 添加警告日志
console.warn('警告: 前端应用不应直接使用Prisma访问数据库，请使用API服务获取数据');

export default prisma;