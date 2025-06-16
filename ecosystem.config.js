// pm2.config.js
module.exports = {
  apps: [
    {
      name: 'pf-ai-bff',
      script: './dist/app.js', // 使用编译后的 JavaScript 文件
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false, // 生产环境不需要监视文件变化
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
      error_file: './logs/pf-ai-bff-error.log',
      out_file: './logs/pf-ai-bff-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
