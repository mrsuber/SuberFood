module.exports = {
  apps: [
    {
      name: 'suberfood-landing',
      cwd: '/root/suberfood/apps/landing-page',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 0.0.0.0',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3030,
        HOSTNAME: '0.0.0.0'
      }
    }
  ]
};
