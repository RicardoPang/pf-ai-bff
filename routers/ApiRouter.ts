import Router from 'koa-router';
import { blogService } from '../services/BlogService';

/**
 * 通用API路由
 * 
 * 提供API概览和通用接口
 */
const router = new Router({
  prefix: '/api'
});

// API根路径
router.get('/', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'API服务正常运行',
    version: '1.0.0',
    services: {
      blog: '/api/blog',
      list: '/api/list'
    },
    timestamp: new Date().toISOString()
  };
});

// 通用列表接口 - 兼容旧的 /api/list 请求
router.get('/list', async (ctx) => {
  try {
    // 获取文章列表
    const articlesData = await blogService.getArticles(1, 10);
    
    // 处理文章数据，确保格式一致性
    const simplifiedArticles = articlesData.articles.map(article => {
      // 将复杂对象转换为简单数据
      return {
        id: article.id,
        title: article.title,
        summary: article.summary || '',
        content: article.content,
        coverImage: article.coverImage || '',
        published: article.published,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
        authorId: article.authorId,
        // 简化作者信息
        author: article.author ? article.author.name : '',
        // 简化分类信息，只返回分类名称数组
        categories: Array.isArray(article.categories) 
          ? article.categories.map(cat => cat.name) 
          : []
      };
    });
    
    // 返回前端期望的格式
    ctx.body = {
      data: {
        item: '博客文章列表',
        result: simplifiedArticles
      }
    };
  } catch (error) {
    console.error('获取文章列表失败:', error);
    ctx.status = 500;
    ctx.body = {
      data: {
        item: '错误',
        result: ['获取文章列表失败', error.message]
      }
    };
  }
});

// 健康检查接口
router.get('/health', async (ctx) => {
  ctx.body = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});

// 导出路由实例
export default router;
