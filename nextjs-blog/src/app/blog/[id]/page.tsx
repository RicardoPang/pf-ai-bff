import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { articlesApi } from '@/lib/api';
import { Article, Category } from '@/types';

// 服务器端渲染
// 强制动态渲染，避免缓存问题
export const dynamic = 'force-dynamic';

// 注意：如果使用API调用，可能需要调整生成静态路径的方式
/* 
export async function generateStaticParams() {
  try {
    const response = await articlesApi.getArticles(1, 100); // 获取足够多的文章ID
    const { data: articlesData } = response;
    const articles = articlesData.items || [];
    
    return articles.map((article) => ({
      id: article.id.toString(),
    }));
  } catch (error) {
    console.error('生成静态路径失败:', error);
    return [];
  }
}
*/

// 使用共享类型定义，已经在 @/types 中定义了

export default async function BlogDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  let article: Article;
  let relatedArticles: Article[] = [];
  
  try {
    // 使用API获取文章详情
    article = await articlesApi.getArticle(id);
    
    if (!article) {
      notFound();
    }
    
    // 如果文章未发布，返回404
    if (!article.published) {
      notFound();
    }
    
    // 使用API获取相关文章（这里获取所有文章，然后过滤出最新的3篇作为相关文章）
    const articlesResponse = await articlesApi.getArticles();
    relatedArticles = (articlesResponse.items?.filter((a: Article) => a.id !== parseInt(id)) || []).slice(0, 3);
  } catch (error) {
    console.error('获取文章详情失败:', error);
    notFound();
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <header className="w-full border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={100}
              height={20}
              priority
            />
            <span className="font-bold text-xl">博客系统</span>
          </div>
          <nav className="flex gap-6">
            <Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              首页
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">
              博客列表
            </Link>
          </nav>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <Link href="/blog" className="text-blue-600 hover:underline mb-4 inline-block">
          ← 返回文章列表
        </Link>
      
        <article className="bg-white rounded-lg shadow-md overflow-hidden mb-8">        
          {/* 文章封面图 */}
          {article.coverImage && (
            <div className="relative h-64 w-full">
              <Image 
                src={article.coverImage} 
                alt={article.title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center">
                <div>
                  <div className="font-medium">{article.author?.name || '未知作者'}</div>
                  <div className="text-sm text-gray-500">
                    发布于 {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
              
              {article.categories && article.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.categories && article.categories.map((category: Category) => (
                    <Link 
                      key={category.id}
                      href={`/blog?category=${encodeURIComponent(category.name)}`}
                      className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            
            {article.summary && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6 italic text-gray-700">
                {article.summary}
              </div>
            )}
            
            <div className="prose max-w-none">
              <MarkdownRenderer content={article.content} />
            </div>
          </div>
        </article>
        
        {/* 相关文章推荐 */}
        {relatedArticles.length > 0 && (
          <div className="mt-10">
            <h2 className="text-2xl font-bold mb-4">相关文章</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((relatedArticle) => (
                <div key={relatedArticle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      <Link href={`/blog/${relatedArticle.id}`} className="text-blue-600 hover:underline">
                        {relatedArticle.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                      {relatedArticle.summary || relatedArticle.content.substring(0, 100)}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{relatedArticle.author?.name || '未知作者'}</span>
                      <span className="text-gray-500">
                        {new Date(relatedArticle.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 页脚 */}
      <footer className="w-full border-t border-gray-200 py-6 px-4 text-center text-gray-500 bg-gray-50">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} 博客系统 - 使用 Next.js 和 Prisma 构建</p>
        </div>
      </footer>
    </div>
  );
}
