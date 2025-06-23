import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Article, Category } from '@/types';
import { articlesApi, categoriesApi } from '@/lib/api';

// 强制动态渲染以避免缓存问题
export const dynamic = 'force-dynamic';

// 使用正确的 Next.js 页面参数类型
type Props = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: '博客列表',
  description: '博客文章列表',
};

export default async function BlogList({ searchParams }: Props) {
  // 安全地提取查询参数 - 需要await
  const params = await searchParams;
  const categoryParam = params.category;
  
  // 处理参数值
  const category = typeof categoryParam === 'string' ? categoryParam : undefined;
  
  // 默认值（如果API调用失败时使用）
  let articles: Article[] = [];
  let totalArticles = 0;
  let categories: Category[] = [];
  
  try {
    // 使用 API 获取数据，不使用分页参数
    const [articlesResponse, categoriesResponse] = await Promise.all([
      articlesApi.getArticles(category),
      categoriesApi.getCategories()
    ]);
    
    // 从API响应中提取数据 - 直接使用响应中的items和meta
    articles = articlesResponse.items || [];
    totalArticles = articlesResponse.meta?.total || 0;
    
    // 从API响应中提取分类数据
    categories = categoriesResponse || [];
  } catch (error) {
    console.error('获取博客列表数据失败:', error);
    // 使用默认的空数据（已在外部声明）
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
            <Link href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              博客列表
            </Link>
          </nav>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold">博客文章列表</h1>
          
          {/* 文章统计 */}
          <div className="text-gray-600 mt-2 md:mt-0">
            共 <span className="font-semibold">{totalArticles}</span> 篇文章
          </div>
        </div>
        
        {/* 分类筛选器 */}
        <div className="mb-8 flex flex-wrap gap-2">
          <Link 
            href="/blog"
            className={`px-3 py-1 rounded-full text-sm ${!category ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            全部
          </Link>
          
          {categories.map((cat: Category) => (
            <Link 
              key={cat.id}
              href={`/blog?category=${encodeURIComponent(cat.name)}`}
              className={`px-3 py-1 rounded-full text-sm ${category === cat.name ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      
        {/* 文章列表 */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-gray-200">
                  {article.coverImage ? (
                    <Image 
                      src={article.coverImage}
                      alt={article.title}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    /* 使用安全的图片URL或备用显示方案 */
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                      <span className="text-3xl font-bold text-indigo-400">{article.title.substring(0, 2)}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">
                    <Link href={`/blog/${article.id}`} className="text-blue-600 hover:underline">
                      {article.title}
                    </Link>
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {article.summary || article.content.substring(0, 150)}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500">{article.author?.name || '未知作者'}</span>
                    </div>
                    
                    <span className="text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  
                  {article.categories && article.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {article.categories.map((category: Category) => (
                        <Link 
                          key={category.id || category.name}
                          href={`/blog?category=${encodeURIComponent(category.name)}`}
                          className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600 hover:bg-gray-200"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">没有找到符合条件的文章</p>
            <Link href="/blog" className="mt-4 inline-block text-blue-600 hover:underline">查看所有文章</Link>
          </div>
        )}
      </div>
      
      {/* 页脚 */}
      <footer className="w-full border-t border-gray-200 py-6 px-4 text-center text-gray-500 bg-gray-50">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} 博客系统 - 使用 Next.js 构建</p>
        </div>
      </footer>
    </div>
  );
}
