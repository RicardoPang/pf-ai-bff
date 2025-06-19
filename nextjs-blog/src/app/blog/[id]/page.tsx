import { prismaReader } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';

// 服务器端渲染
export const dynamic = 'force-dynamic';

// 生成静态路径参数
export async function generateStaticParams() {
  const articles = await prismaReader.article.findMany({
    select: { id: true },
    where: { published: true }
  });
  
  return articles.map((article) => ({
    id: article.id.toString(),
  }));
}

// 定义文章类型
type Category = {
  id: number;
  name: string;
};

type CategoryOnArticle = {
  category: Category;
};

type Author = {
  id: number;
  name: string;
  email: string;
};

type Article = {
  id: number;
  title: string;
  content: string;
  summary?: string | null;
  coverImage?: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: number;
  author: Author;
  categories: CategoryOnArticle[];
};

export default async function BlogDetail({ params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  
  // 先获取文章详情
  const articleData = await prismaReader.article.findUnique({
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
  if (!articleData || !articleData.published) {
    notFound();
  }
  
  // 将文章数据转换为类型安全的对象
  const article = articleData as unknown as Article;
  
  // 获取相关文章（同一作者或同一分类的其他文章）
  const relatedArticles = await prismaReader.article.findMany({
    where: {
      id: { not: id },
      published: true,
      OR: [
        { authorId: article.authorId }, // 同一作者的文章
      ]
    },
    include: {
      author: true,
      categories: {
        include: {
          category: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 3
  }).catch(() => []) as unknown as Article[];
  
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
                  <div className="font-medium">{article.author.name}</div>
                  <div className="text-sm text-gray-500">
                    发布于 {new Date(article.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
              
              {article.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {article.categories.map(({ category }) => (
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
                      <span className="text-gray-500">{relatedArticle.author.name}</span>
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
