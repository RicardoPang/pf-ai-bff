import { prismaService } from './PrismaService';

/**
 * 博客服务类
 * 
 * 负责处理博客文章的增删改查，以及相关的作者和分类操作
 * 使用读写分离：
 * - 读操作使用 reader 客户端
 * - 写操作使用 writer 客户端
 */
export class BlogService {
  /**
   * 获取所有文章列表
   * @param page 页码，默认为1
   * @param pageSize 每页条数，默认为10
   * @returns 文章列表和总数
   */
  async getArticles(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;
    
    // 使用 reader 客户端进行查询操作
    const reader = prismaService.getReader();
    
    try {
      // 获取文章总数
      const total = await reader.article.count();
      
      // 获取文章列表，包含作者和分类信息
      const articles = await reader.article.findMany({
        skip,
        take: pageSize,
        include: {
          author: true,
          categories: {
            include: {
              category: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // 格式化返回数据，简化分类信息
      const formattedArticles = articles.map(article => ({
        ...article,
        categories: article.categories.map(ca => ca.category)
      }));
      
      return {
        articles: formattedArticles,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    } catch (error) {
      console.error('获取文章列表失败:', error);
      throw error;
    }
  }
  
  /**
   * 根据ID获取单篇文章详情
   * @param id 文章ID
   * @returns 文章详情，包含作者和分类信息
   */
  async getArticleById(id: number) {
    // 使用 reader 客户端进行查询操作
    const reader = prismaService.getReader();
    
    try {
      const article = await reader.article.findUnique({
        where: { id },
        include: {
          author: true,
          categories: {
            include: {
              category: true
            }
          }
        }
      });
      
      if (!article) {
        return null;
      }
      
      // 格式化返回数据，简化分类信息
      return {
        ...article,
        categories: article.categories.map(ca => ca.category)
      };
    } catch (error) {
      console.error(`获取文章(ID: ${id})失败:`, error);
      throw error;
    }
  }
  
  /**
   * 创建新文章
   * @param data 文章数据
   * @returns 创建的文章
   */
  async createArticle(data: {
    title: string;
    content: string;
    summary?: string;
    coverImage?: string;
    published?: boolean;
    authorId: number;
    categoryIds?: number[];
  }) {
    // 使用 writer 客户端进行写入操作
    const writer = prismaService.getWriter();
    
    try {
      const { categoryIds, ...articleData } = data;
      
      // 创建文章
      const article = await writer.article.create({
        data: {
          ...articleData,
          // 如果提供了分类ID，则创建文章与分类的关联
          ...(categoryIds && categoryIds.length > 0
            ? {
                categories: {
                  create: categoryIds.map(categoryId => ({
                    category: { connect: { id: categoryId } }
                  }))
                }
              }
            : {})
        },
        include: {
          author: true,
          categories: {
            include: {
              category: true
            }
          }
        }
      });
      
      // 格式化返回数据
      return {
        ...article,
        categories: article.categories.map(ca => ca.category)
      };
    } catch (error) {
      console.error('创建文章失败:', error);
      throw error;
    }
  }
  
  /**
   * 更新文章
   * @param id 文章ID
   * @param data 更新的数据
   * @returns 更新后的文章
   */
  async updateArticle(
    id: number,
    data: {
      title?: string;
      content?: string;
      summary?: string;
      coverImage?: string;
      published?: boolean;
      categoryIds?: number[];
    }
  ) {
    // 使用 writer 客户端进行写入操作
    const writer = prismaService.getWriter();
    
    try {
      const { categoryIds, ...articleData } = data;
      
      // 如果提供了分类ID，则先删除现有关联，再创建新关联
      if (categoryIds) {
        // 删除现有的文章-分类关联
        await writer.categoryOnArticle.deleteMany({
          where: { articleId: id }
        });
      }
      
      // 更新文章
      const article = await writer.article.update({
        where: { id },
        data: {
          ...articleData,
          // 如果提供了分类ID，则创建文章与分类的关联
          ...(categoryIds && categoryIds.length > 0
            ? {
                categories: {
                  create: categoryIds.map(categoryId => ({
                    category: { connect: { id: categoryId } }
                  }))
                }
              }
            : {})
        },
        include: {
          author: true,
          categories: {
            include: {
              category: true
            }
          }
        }
      });
      
      // 格式化返回数据
      return {
        ...article,
        categories: article.categories.map(ca => ca.category)
      };
    } catch (error) {
      console.error(`更新文章(ID: ${id})失败:`, error);
      throw error;
    }
  }
  
  /**
   * 删除文章
   * @param id 文章ID
   * @returns 删除的文章
   */
  async deleteArticle(id: number) {
    // 使用 writer 客户端进行写入操作
    const writer = prismaService.getWriter();
    
    try {
      // 先删除文章与分类的关联
      await writer.categoryOnArticle.deleteMany({
        where: { articleId: id }
      });
      
      // 删除文章
      const article = await writer.article.delete({
        where: { id }
      });
      
      return article;
    } catch (error) {
      console.error(`删除文章(ID: ${id})失败:`, error);
      throw error;
    }
  }
  
  /**
   * 获取所有分类
   * @returns 分类列表
   */
  async getCategories() {
    // 使用 reader 客户端进行查询操作
    const reader = prismaService.getReader();
    
    try {
      return await reader.category.findMany();
    } catch (error) {
      console.error('获取分类列表失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取所有作者
   * @returns 作者列表
   */
  async getAuthors() {
    // 使用 reader 客户端进行查询操作
    const reader = prismaService.getReader();
    
    try {
      return await reader.author.findMany();
    } catch (error) {
      console.error('获取作者列表失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export const blogService = new BlogService();
