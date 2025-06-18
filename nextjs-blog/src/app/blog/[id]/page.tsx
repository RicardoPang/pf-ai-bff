import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';

// 这个函数告诉 Next.js 这个页面是服务器端渲染的
export const dynamic = 'force-dynamic';

// 这个函数用于生成静态路径参数
export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    select: { id: true },
    where: { published: true }
  });
  
  return articles.map((article) => ({
    id: article.id.toString(),
  }));
}

export default async function BlogDetail({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  
  // 从数据库获取文章详情
  const article = await prisma.article.findUnique({
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
  
  // 如果文章不存在，返回 404 页面
  if (!article || !article.published) {
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
      
      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {article.coverImage && (
          <div className="relative h-64 w-full">
            <Image 
              src={article.coverImage} 
              alt={article.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>
        )}
        
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              {article.author.avatar && (
                <Image 
                  src={article.author.avatar} 
                  alt={article.author.name}
                  width={32}
                  height={32}
                  className="rounded-full mr-2"
                />
              )}
              <div>
                <div className="font-medium">{article.author.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            </div>
            
            {article.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.categories.map(({ category }) => (
                  <span 
                    key={category.id}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {article.summary && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 italic text-gray-700">
              {article.summary}
            </div>
          )}
          
          <MarkdownRenderer content={article.content} />
        </div>
      </article>
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
