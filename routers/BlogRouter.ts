import Router from 'koa-router';
import { blogService } from '../services/BlogService';

/**
 * 博客API路由
 * 
 * 提供文章的增删改查接口
 */
const router = new Router({
  prefix: '/api/blog'
});

// 博客API根路径 - 提供API概览信息
router.get('/', async (ctx) => {
  ctx.body = {
    success: true,
    message: '博客API服务',
    version: '1.0.0',
    endpoints: {
      articles: {
        'GET /api/blog/articles': '获取文章列表',
        'GET /api/blog/articles/:id': '获取单篇文章',
        'POST /api/blog/articles': '创建文章',
        'PUT /api/blog/articles/:id': '更新文章',
        'DELETE /api/blog/articles/:id': '删除文章'
      },
      categories: {
        'GET /api/blog/categories': '获取所有分类'
      },
      authors: {
        'GET /api/blog/authors': '获取所有作者'
      }
    },
    documentation: 'https://github.com/your-repo/api-docs'
  };
});

// 获取文章列表
router.get('/articles', async (ctx) => {
  try {
    const { page = 1, pageSize = 10 } = ctx.query;
    const result = await blogService.getArticles(
      parseInt(page as string), 
      parseInt(pageSize as string)
    );
    
    // 处理文章数据，确保格式一致性
    const simplifiedArticles = result.articles.map(article => ({
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
    }));
    
    ctx.body = {
      success: true,
      data: {
        articles: simplifiedArticles,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages
      }
    };
  } catch (error: any) {
    console.error('获取文章列表失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取文章列表失败',
      error: error.message
    };
  }
});

// 获取单篇文章
router.get('/articles/:id', async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    const article = await blogService.getArticleById(id);
    
    if (!article) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: '文章不存在'
      };
      return;
    }
    
    // 处理文章数据，确保格式一致性
    const simplifiedArticle = {
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
    
    ctx.body = {
      success: true,
      data: simplifiedArticle
    };
  } catch (error: any) {
    console.error(`获取文章失败:`, error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取文章失败',
      error: error.message
    };
  }
});

// 创建文章
router.post('/articles', async (ctx) => {
  try {
    const data = (ctx.request as any).body;
    const article = await blogService.createArticle(data);
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: article
    };
  } catch (error: any) {
    console.error('创建文章失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '创建文章失败',
      error: error.message
    };
  }
});

// 更新文章
router.put('/articles/:id', async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    const data = (ctx.request as any).body;
    const article = await blogService.updateArticle(id, data);
    
    ctx.body = {
      success: true,
      data: article
    };
  } catch (error: any) {
    console.error(`更新文章失败:`, error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '更新文章失败',
      error: error.message
    };
  }
});

// 删除文章
router.delete('/articles/:id', async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    await blogService.deleteArticle(id);
    
    ctx.body = {
      success: true,
      message: '文章已删除'
    };
  } catch (error: any) {
    console.error(`删除文章失败:`, error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '删除文章失败',
      error: error.message
    };
  }
});

// 获取所有分类
router.get('/categories', async (ctx) => {
  try {
    const categories = await blogService.getCategories();
    
    ctx.body = {
      success: true,
      data: categories
    };
  } catch (error: any) {
    console.error('获取分类列表失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取分类列表失败',
      error: error.message
    };
  }
});

// 获取所有作者
router.get('/authors', async (ctx) => {
  try {
    const authors = await blogService.getAuthors();
    
    ctx.body = {
      success: true,
      data: authors
    };
  } catch (error: any) {
    console.error('获取作者列表失败:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '获取作者列表失败',
      error: error.message
    };
  }
});

// 导出路由实例 - awilix-koa 兼容格式
export default router;
