/**
 * API服务 - 封装所有对后端API的请求
 * 使用CloudFront部署的Nest.js API
 */
import { 
  Article, 
  Category, 
  PaginatedResponse, 
  Author,
  GitHubRepositoriesResponse,
  GitHubRepositoryResponse
} from '@/types';

// API基址URL - 使用Nest.js部署在CloudFront的API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://d2f3o3rd6akggk.cloudfront.net';

/**
 * 通用请求函数
 * @param endpoint - API端点
 * @param options - 请求选项
 * @returns 请求结果
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`请求API: ${url}`);
    
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!res.ok) {
      // 如果响应不成功，返回错误信息
      const errorText = await res.text().catch(() => 'Unknown error');
      const error = new Error(`API请求失败: ${res.status} - ${errorText}`) as Error & { status?: number };
      error.status = res.status;
      throw error;
    }

    return res.json();
  } catch (error) {
    console.error(`API 请求错误 (${endpoint}):`, error);  
    throw error;
  }
}

/**
 * 文章相关API
 */
export const articlesApi = {
  /**
   * 获取文章列表 - 不使用分页，直接获取全部文章
   * @param category - 分类名称（可选）
   */
  getArticles: async (category?: string): Promise<PaginatedResponse<Article>> => {
    let endpoint = '/articles';
    
    if (category) {
      const queryParams = new URLSearchParams({
        category: category
      });
      endpoint = `${endpoint}?${queryParams.toString()}`;
    }
    
    return fetchAPI(endpoint);
  },

  /**
   * 获取单篇文章
   * @param id - 文章ID
   */
  getArticle: async (id: number | string): Promise<Article> => {
    return fetchAPI(`/articles/${id}`);
  },
  
  /**
   * 获取相关文章
   * @param id - 当前文章ID
   * @param limit - 返回数量
   */
  getRelatedArticles: async (id: number | string, limit = 3): Promise<Article[]> => {
    return fetchAPI(`/articles/${id}/related?limit=${limit}`);
  }
};

/**
 * 作者相关API
 */
export const authorsApi = {
  /**
   * 获取作者列表
   */
  getAuthors: async (): Promise<Author[]> => {
    return fetchAPI('/authors');
  },

  /**
   * 获取单个作者信息
   * @param id - 作者ID
   */
  getAuthor: async (id: number | string): Promise<Author> => {
    return fetchAPI(`/authors/${id}`);
  },
};

/**
 * 分类相关API
 */
export const categoriesApi = {
  /**
   * 获取分类列表
   */
  getCategories: async (): Promise<Category[]> => {
    return fetchAPI('/categories');
  },

  /**
   * 获取单个分类
   * @param id - 分类ID
   */
  getCategory: async (id: number | string): Promise<Category> => {
    return fetchAPI(`/categories/${id}`);
  },
};

/**
 * GitHub相关API
 */
export const githubApi = {
  /**
   * 获取用户仓库列表
   * @param username - GitHub用户名
   */
  getRepositories: async (username: string): Promise<GitHubRepositoriesResponse> => {
    return fetchAPI(`/github/repositories/${username}`);
  },
  
  /**
   * 获取单个仓库详情
   * @param username - GitHub用户名
   * @param repo - 仓库名称
   */
  getRepository: async (username: string, repo: string): Promise<GitHubRepositoryResponse> => {
    return fetchAPI(`/github/repositories/${username}/${repo}`);
  }
};
