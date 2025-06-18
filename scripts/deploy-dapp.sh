#!/bin/bash

# 定义目录路径
DAPP_DIR="/Users/pangjianfeng/code/pf-ai-dapp"
BFF_DIR="/Users/pangjianfeng/CascadeProjects/pf-all-project/pf-ai-bff"
TARGET_DIR="$BFF_DIR/public/dapp"

# 显示操作信息
echo "开始部署前端应用到 BFF 服务..."

# 进入前端项目目录
cd "$DAPP_DIR" || { echo "错误: 无法进入前端项目目录"; exit 1; }

# 安装依赖
echo "安装前端项目依赖..."
npm install || { echo "错误: 安装依赖失败"; exit 1; }

# 构建前端项目
echo "构建前端项目..."
npm run build || { echo "错误: 构建前端项目失败"; exit 1; }

# 确保目标目录存在
mkdir -p "$TARGET_DIR"

# 清空目标目录
echo "清空目标目录..."
rm -rf "$TARGET_DIR"/*

# 复制打包文件到目标目录
echo "复制打包文件到 BFF 项目..."
cp -r "$DAPP_DIR/dist/"* "$TARGET_DIR/" || { echo "错误: 复制文件失败"; exit 1; }

# 回到 BFF 项目目录
cd "$BFF_DIR" || { echo "错误: 无法进入 BFF 项目目录"; exit 1; }

# 重启 BFF 服务
echo "重启 BFF 服务..."
pnpm run dev &

echo "部署完成! 前端应用已部署到 BFF 服务。"
echo "您可以通过 http://localhost:8081 访问您的应用。"
