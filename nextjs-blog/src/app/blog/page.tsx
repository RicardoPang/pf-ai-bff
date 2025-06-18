import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';

// 这个函数告诉 Next.js 这个页面是服务器端渲染的
export const dynamic = 'force-dynamic';

export default async function BlogList() {
  // 从数据库获取文章列表
  const articles = await prisma.article.findMany({
    where: { published: true },
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
    take: 10
  });

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
        <h1 className="text-3xl font-bold mb-8">博客文章列表</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-48 w-full bg-gradient-to-r from-blue-100 to-indigo-100">
              {article.coverImage ? (
                <Image 
                  src={article.coverImage} 
                  alt={article.title}
                  fill
                  style={{ objectFit: 'cover' }}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2UyZThmMCI+PC9yZWN0Pjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjI2cHgiIGZpbGw9IiM5M2M1ZmQiPkJsb2c8L3RleHQ+PC9zdmc+"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-indigo-300">{article.title.substring(0, 2)}</span>
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
                  {article.author.avatar && (
                    <Image 
                      src={article.author.avatar} 
                      alt={article.author.name}
                      width={24}
                      height={24}
                      className="rounded-full mr-2"
                    />
                  )}
                  <span className="text-sm text-gray-500">{article.author.name}</span>
                </div>
                
                <span className="text-sm text-gray-500">
                  {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              
              {article.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {article.categories.map(({ category }) => (
                    <span 
                      key={category.id}
                      className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
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
