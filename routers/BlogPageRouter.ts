import Router from 'koa-router';
import { blogService } from '../services/BlogService';

/**
 * 博客页面路由
 * 
 * 负责渲染博客前端页面
 */
const router = new Router({
  prefix: '/blog'
});

// 博客列表页
router.get('/', async (ctx) => {
  try {
    const articles = await blogService.getArticles(1, 10);
    ctx.body = await (ctx as any).render('blog/list', { articles: articles.articles });
  } catch (error: any) {
    console.error('渲染博客列表页失败:', error);
    ctx.status = 500;
    ctx.body = '服务器错误';
  }
});

// 博客文章详情页
router.get('/articles/:id', async (ctx) => {
  try {
    const id = parseInt(ctx.params.id);
    const article = await blogService.getArticleById(id);
    
    if (!article) {
      ctx.status = 404;
      ctx.body = '文章不存在';
      return;
    }
    
    ctx.body = await (ctx as any).render('blog/detail', { article });
  } catch (error: any) {
    console.error('渲染博客详情页失败:', error);
    ctx.status = 500;
    ctx.body = '服务器错误';
  }
});

// 导出路由实例 - awilix-koa 兼容格式
export default router;
