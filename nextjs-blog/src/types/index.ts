/**
 * 定义API返回数据的类型
 */

// 文章类型
export interface Article {
  id: number;
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: number;
  author?: Author;
  categories?: Category[];
}

// 作者类型
export interface Author {
  id: number;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  articlesCount?: number; // API返回的作者文章数
}

// 分类类型
export interface Category {
  id: number;
  name: string;
  description?: string;
  articlesCount?: number; // API返回的分类文章数
}

// API分页元数据
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API响应数据结构
export interface ApiResponse<T> {
  data?: T;
  success?: boolean;
  message?: string;
}

// 带分页的文章响应
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// GitHub仓库类型
export interface GitHubRepository {
  id: number;
  name: string;
  description: string;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

// GitHub仓库API响应
export interface GitHubRepositoriesResponse {
  success: boolean;
  data: GitHubRepository[];
  message: string;
}

// GitHub单个仓库响应
export interface GitHubRepositoryResponse {
  success: boolean;
  data: GitHubRepository;
  message: string;
}
