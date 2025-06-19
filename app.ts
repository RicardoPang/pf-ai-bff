import { addAliases } from 'module-alias';
addAliases({
  '@root': __dirname,
  '@interfaces': `${__dirname}/interface`,
  '@config': `${__dirname}/config`,
  '@middlewares': `${__dirname}/middlewares`,
});
import Koa from 'koa';
import { createContainer, Lifetime } from 'awilix';
import co from 'co';
import render from 'koa-swig';
import config from '@config/index';
import serve from 'koa-static';
import { loadControllers, scopePerRequest } from 'awilix-koa';
import { prismaService } from './services/PrismaService';
//koa中没有实现的路由重定向到index.html
import { historyApiFallback } from 'koa2-connect-history-api-fallback';

const app = new Koa();
const { port, viewDir, memoryFlag, staticDir, dappDir } = config;

//静态资源生效节点
app.use(serve(staticDir));
// 前端打包文件静态服务
app.use(serve(dappDir));
const container = createContainer();

//所有的可以被注入的代码都在container中
container.loadModules([`${__dirname}/services/*.ts`], {
  formatName: 'camelCase',
  resolverOptions: {
    lifetime: Lifetime.SCOPED,
  },
});

//每一次用户请求router中 都会从容器中取到注入的服务
app.use(scopePerRequest(container));
app.context.render = co.wrap(
  render({
    root: viewDir,
    autoescape: true,
    cache: <'memory' | false>memoryFlag,
    writeBody: false,
    ext: 'html',
  })
);

app.use(historyApiFallback({ index: '/', whiteList: ['/api'] }));

//让所有的路由全部生效
app.use(loadControllers(`${__dirname}/routers/*.ts`));

const server = app.listen(port, () => {
  console.log(`Server BFF启动成功，监听端口: ${port}`);
});

// 关闭
process.on('SIGINT', async () => {
  console.log('接收到 SIGINT 信号，正在关闭服务...');
  
  // 先关闭 HTTP 服务器，停止接收新请求
  server.close(() => {
    console.log('HTTP 服务器已关闭');
  });
  
  try {
    // 断开数据库连接
    await prismaService.disconnect();
    console.log('数据库连接已断开');
    
    // 给应用一些时间完成剩余操作
    setTimeout(() => {
      console.log('应用正常关闭');
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('关闭过程中发生错误:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('接收到 SIGTERM 信号，正在关闭服务...');
  
  // 先关闭 HTTP 服务器，停止接收新请求
  server.close(() => {
    console.log('HTTP 服务器已关闭');
  });
  
  try {
    // 断开数据库连接
    await prismaService.disconnect();
    console.log('数据库连接已断开');
    
    // 给应用一些时间完成剩余操作
    setTimeout(() => {
      console.log('应用正常关闭');
      process.exit(0);
    }, 1000);
  } catch (error) {
    console.error('关闭过程中发生错误:', error);
    process.exit(1);
  }
});
