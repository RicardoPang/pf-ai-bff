import _ from 'lodash';
import { join } from 'path';
import path from 'path';

// 确定项目根目录
const isProd = process.env.NODE_ENV === 'production';
const projectRoot = isProd ? join(__dirname, '../..') : join(__dirname, '..');

let config = {
  viewDir: join(projectRoot, 'views'),
  staticDir: join(projectRoot, 'assets'),
  // 添加前端打包文件目录配置
  dappDir: join(projectRoot, 'public/dapp'),
  port: 3003,
  memoryFlag: false,
};

if (process.env.NODE_ENV === 'development') {
  let localConfig = {
    port: 3003,
  };
  config = _.assignIn(config, localConfig);
}

if (process.env.NODE_ENV === 'production') {
  let prodConfig = {
    port: 8082,
    memoryFlag: 'memory',
  };
  config = _.assignIn(config, prodConfig);
}

export default config;
