import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[80px_1fr_80px] items-center justify-items-center min-h-screen p-8 pb-20 gap-8 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* 导航栏 */}
      <header className="w-full max-w-7xl flex items-center justify-between px-4 py-6 border-b border-gray-200">
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
      </header>

      {/* 主要内容 */}
      <main className="flex flex-col gap-[32px] row-start-2 items-center text-center max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">欢迎来到我的博客系统</h1>
        <p className="text-xl text-gray-600 mb-8">这是一个使用 Next.js 和 Prisma 构建的现代博客平台</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">最新文章</h2>
            <p className="text-gray-600 mb-4">浏览我们的最新博客文章，了解前沿技术和见解。</p>
            <Link 
              href="/blog" 
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
            >
              查看文章
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-4">关于本站</h2>
            <p className="text-gray-600 mb-4">这个博客系统使用 Next.js 13+ 构建，采用 PostgreSQL 数据库和 Prisma ORM。</p>
            <div className="flex gap-2 text-sm text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Next.js</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">Prisma</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full">PostgreSQL</span>
            </div>
          </div>
        </div>
        
        <Link 
          href="/blog" 
          className="mt-8 inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-colors"
        >
          浏览所有文章
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14"></path>
            <path d="m12 5 7 7-7 7"></path>
          </svg>
        </Link>
      </main>

      {/* 页脚 */}
      <footer className="row-start-3 w-full max-w-7xl border-t border-gray-200 py-6 px-4 text-center text-gray-500">
        <p>© {new Date().getFullYear()} 博客系统 - 使用 Next.js 和 Prisma 构建</p>
      </footer>
    </div>
  );
}
