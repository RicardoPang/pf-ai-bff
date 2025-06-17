#!/bin/bash

# API接口测试脚本
# 用于快速验证所有API接口是否正常工作

BASE_URL="http://localhost:8081"

echo "=== 博客系统API接口测试 ==="
echo "基础URL: $BASE_URL"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_api() {
    local url=$1
    local description=$2
    local method=${3:-GET}
    
    echo -n "测试 $description: "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" "$BASE_URL$url")
        http_code="${response: -3}"
        body="${response%???}"
    else
        # 对于POST等其他方法，这里可以扩展
        response=$(curl -s -w "%{http_code}" -X "$method" "$BASE_URL$url")
        http_code="${response: -3}"
        body="${response%???}"
    fi
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✓ 成功 ($http_code)${NC}"
        # 如果响应是JSON，尝试格式化输出
        if echo "$body" | jq . >/dev/null 2>&1; then
            echo "$body" | jq -r '.message // .data.message // "API响应正常"' | sed 's/^/  /'
        fi
    else
        echo -e "${RED}✗ 失败 ($http_code)${NC}"
        echo "  $body" | head -1
    fi
    echo ""
}

# 1. 通用API接口测试
echo -e "${YELLOW}1. 通用API接口测试${NC}"
test_api "/api/" "API服务概览"
test_api "/api/list" "通用列表接口"
test_api "/api/health" "健康检查接口"

# 2. 博客API接口测试
echo -e "${YELLOW}2. 博客API接口测试${NC}"
test_api "/api/blog/" "博客API概览"
test_api "/api/blog/articles" "获取文章列表"
test_api "/api/blog/articles/1" "获取单篇文章"
test_api "/api/blog/categories" "获取分类列表"
test_api "/api/blog/authors" "获取作者列表"

# 3. 前端页面测试
echo -e "${YELLOW}3. 前端页面测试${NC}"
test_api "/blog/" "博客列表页面"
test_api "/blog/articles/1" "文章详情页面"

# 4. 静态资源测试
echo -e "${YELLOW}4. 静态资源测试${NC}"
test_api "/assets/styles/main.css" "CSS样式文件"

echo "=== 测试完成 ==="
echo ""
echo "如果所有测试都通过，说明博客系统运行正常！"
echo "如果有失败的测试，请检查对应的路由配置和服务状态。"
