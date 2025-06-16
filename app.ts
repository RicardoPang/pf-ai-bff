import { addAliases } from "module-alias";
addAliases({
  '@root': __dirname,
  '@interfaces': `${__dirname}/interface`,
  '@config': `${__dirname}/config`,
  '@middlewares': `${__dirname}/middlewares`,
})
import Koa from "koa";
import { createContainer, Lifetime } from "awilix";
import co from "co";
import render from 'koa-swig';
import config from "@config/index";
import serve from "koa-static";
import { loadControllers, scopePerRequest } from "awilix-koa";
// koa中没有实现路由重定向到index.html
import { historyApiFallback } from "koa2-connect-history-api-fallback";

const app = new Koa();
const { port, viewDir, memoryFlag, staticDir } = config;

// 静态资源生效节点
console.log(`静态资源目录: ${staticDir}`);
app.use(serve(staticDir));
const container = createContainer();

// 所有的可以被注入的代码都在container中
// 根据环境加载不同扩展名的文件
const fileExtension = process.env.NODE_ENV === 'production' ? 'js' : 'ts';
container.loadModules([`${__dirname}/services/*.${fileExtension}`], {
  formatName: 'camelCase',
  resolverOptions: {
    lifetime: Lifetime.SCOPED
  }
})

// 每一次用户请求router中，都会从容器中渠道注入的服务
app.use(scopePerRequest(container));
console.log(`视图目录: ${viewDir}`);
app.context.render = co.wrap(
  render({
    root: viewDir,
    autoescape: true,
    cache: <'memory' | false>memoryFlag,
    writeBody: false,
    ext: 'html',
  })
)

// 除了 /api 放行，其他的都回到根去 /
app.use(historyApiFallback({ index: '/', whiteList: ['/api'] }));
// 让所有的路由全部生效
console.log(`加载路由文件: ${__dirname}/routers/*.${fileExtension}`);
app.use(loadControllers(`${__dirname}/routers/*.${fileExtension}`));

// 添加错误处理中间件
app.use(async (ctx, next) => {
  try {
    await next();
    // 如果没有找到路由，返回404
    if (ctx.status === 404) {
      console.log(`404 Not Found: ${ctx.path}`);
      ctx.body = { error: 'Not Found', path: ctx.path };
    }
  } catch (err) {
    console.error('服务器错误:', err);
    ctx.status = err.status || 500;
    ctx.body = { error: '服务器内部错误' };
  }
});
app.listen(port, () => {
  console.log(`Server BFF启动成功！请访问 http://${process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'}:${port}`)
})
