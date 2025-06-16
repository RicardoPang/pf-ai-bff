declare module 'koa-swig' {
  import { Context } from 'koa';

  interface SwigOptions {
    root: string;
    autoescape?: boolean;
    cache?: 'memory' | false;
    ext?: string;
    writeBody?: boolean;
    [key: string]: any;
  }

  // 修改返回类型，使其与 co.wrap 兼容
  function renderer(options: SwigOptions): (this: Context, view: string, locals?: any) => any;
  
  export default renderer;
}
