import { prismaReader } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

// 服务器端渲染
export const dynamic = 'force-dynamic';

// 使用正确的 Next.js 页面参数类型
type Props = {
  params: Record<string, never>;
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function BlogList({ searchParams }: Props) {
  // 安全地提取查询参数
  const pageParam = searchParams.page;
  const categoryParam = searchParams.category;
  
  // 处理参数值
  const page = typeof pageParam === 'string' ? pageParam : undefined;
  const category = typeof categoryParam === 'string' ? categoryParam : undefined;
  
  const currentPage = Number(page) || 1;
  const pageSize = 6;
  const skip = (currentPage - 1) * pageSize;
  
  // 构建查询条件
  const where = { 
    published: true,
    ...(category ? {
      categories: {
        some: {
          category: {
            name: category
          }
        }
      }
    } : {})
  };
  
  // 使用 prismaReader 从只读副本获取文章列表
  const [articles, totalArticles, categories] = await Promise.all([
    prismaReader.article.findMany({
      where,
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
      },
      skip,
      take: pageSize
    }),
    prismaReader.article.count({ where }),
    prismaReader.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
  ]);
  
  // 计算总页数
  const totalPages = Math.ceil(totalArticles / pageSize);

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
          
          {categories.map((cat) => (
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
              <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full bg-gradient-to-r from-blue-100 to-indigo-100">
                  {/* 使用安全的图片URL或备用显示方案 */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                    <span className="text-3xl font-bold text-indigo-400">{article.title.substring(0, 2)}</span>
                  </div>
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
                      <span className="text-sm text-gray-500">{article.author.name}</span>
                    </div>
                    
                    <span className="text-sm text-gray-500">
                      {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  
                  {article.categories.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {article.categories.map(({ category }) => (
                        <Link 
                          key={category.id}
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
        
        {/* 分页导航 */}
        {totalPages > 1 && (
          <div className="mt-10 flex justify-center">
            <div className="flex items-center gap-2">
              {/* 上一页按钮 */}
              {currentPage > 1 && (
                <Link 
                  href={`/blog?page=${currentPage - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  上一页
                </Link>
              )}
              
              {/* 页码指示器 */}
              <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-md text-blue-800">
                {currentPage} / {totalPages}
              </div>
              
              {/* 下一页按钮 */}
              {currentPage < totalPages && (
                <Link 
                  href={`/blog?page=${currentPage + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  下一页
                </Link>
              )}
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
