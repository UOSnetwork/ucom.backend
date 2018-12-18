const NODE_ENV              = 'staging';
const HTTP_SERVER_PORT      = 3001;
const WEBSOCKET_SERVER_PORT = 5001;
const STATIC_RENDERER_PORT  = 3010;

module.exports = {
  apps : [
    // ================ Apps (interaction with user) =============
    {
      name:           `${NODE_ENV}_app_backend`,
      instance_var:   'INSTANCE_ID',
      script:         'bin/www',
      instances:      'max',
      exec_mode:      'cluster',
      watch:          false,
      autorestart:    true,
      env: {
        PORT:         HTTP_SERVER_PORT,
        NODE_ENV:     NODE_ENV,
      },
    },
    {
      name:           `${NODE_ENV}_app_websocket`,
      instance_var:   'INSTANCE_ID',
      script:         'bin/app-websocket.js',
      env: {
        PORT:         WEBSOCKET_SERVER_PORT,
        NODE_ENV:     NODE_ENV,
        watch:        false,
        autorestart:  true,
      },
    },
    {
      name:           `${NODE_ENV}_app_static_renderer`,
      instance_var:   'INSTANCE_ID',
      script:         'bin/app-static-renderer.js',
      instances:      'max',
      exec_mode:      'cluster',
      env: {
        PORT:         STATIC_RENDERER_PORT,
        NODE_ENV:     NODE_ENV,
        watch:        false,
        autorestart:  true,
      },
    },
    // ================ Consumers ======================
    {
      name:           `${NODE_ENV}_consumer_transaction_sender`,
      script:         'bin/consumer-transaction-sender.js',
      watch:          false,
      autorestart:    true,
      env: {
        NODE_ENV:     NODE_ENV,
      },
    },
    {
      name:           `${NODE_ENV}_consumer_notifications_sender`,
      instance_var:   'INSTANCE_ID',
      script:         'bin/consumer-notifications-sender.js',
      watch:          false,
      autorestart:    true,
      env: {
        NODE_ENV:     NODE_ENV,
      },
    },
    // ================ Workers (CRON) ======================
    {
      name: `${NODE_ENV}_worker_update_importance`,
      script: 'bin/worker-update-importance.js',
      watch: false,
      cron_restart: '*/5 * * * *',
      env: {
        NODE_ENV: NODE_ENV
      },
    },
    {
      name: `${NODE_ENV}_worker_update_blockchain_nodes`,
      script: 'bin/worker-update-blockchain-nodes.js',
      watch: false,
      cron_restart: '* * * * *',
      env: {
        NODE_ENV: NODE_ENV
      },
    },
    {
      name: `${NODE_ENV}_worker_update_stats`,
      script: 'bin/worker-update-stats.js',
      watch: false,
      cron_restart: '0 */1 * * *',
      env: {
        NODE_ENV: NODE_ENV
      },
    },
    {
      name: `${NODE_ENV}_worker_sync_tr_traces`,
      script: 'bin/worker-sync-tr-traces.js',
      watch: false,
      cron_restart: '*/2 * * * *',
      env: {
        NODE_ENV: NODE_ENV
      },
    },
  ],
};
