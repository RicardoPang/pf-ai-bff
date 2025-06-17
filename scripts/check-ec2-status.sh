#!/bin/bash

# EC2 实例状态检查脚本
# 使用前请确保已配置 AWS CLI 凭证

echo "=== EC2 实例状态检查 ==="

# 检查所有实例状态
echo "1. 检查所有 EC2 实例："
aws ec2 describe-instances \
  --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,PublicIpAddress,Tags[?Key==`Name`].Value|[0]]' \
  --output table

echo ""
echo "2. 检查特定实例详细信息（请替换 INSTANCE_ID）："
echo "aws ec2 describe-instances --instance-ids i-1234567890abcdef0"

echo ""
echo "3. 检查实例系统状态："
echo "aws ec2 describe-instance-status --instance-ids i-1234567890abcdef0"

echo ""
echo "4. 启动实例："
echo "aws ec2 start-instances --instance-ids i-1234567890abcdef0"

echo ""
echo "5. 停止实例："
echo "aws ec2 stop-instances --instance-ids i-1234567890abcdef0"

echo ""
echo "6. 重启实例："
echo "aws ec2 reboot-instances --instance-ids i-1234567890abcdef0"
