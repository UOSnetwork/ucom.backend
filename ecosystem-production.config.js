/* eslint-disable unicorn/prevent-abbreviations,no-multi-spaces */
const NODE_ENV              = 'production';

const HTTP_SERVER_PORT      = 3000;
const GRAPHQL_SERVER_PORT   = 4000;
const WEBSOCKET_SERVER_PORT = 5000;
const UPLOADER_SERVER_PORT  = 5010;
const REDIRECT_SERVER_PORT  = 5020;

const CRON_PATTERN_EVERY_MINUTE       = '* * * * *';
const CRON_PATTERN_EVERY_TWO_MINUTES  = '*/2 * * * *';
const CRON_PATTERN_EVERY_FIVE_MINUTES = '*/5 * * * *';

const clusterConfig = {
  instances: 'max',
  exec_mode: 'cluster',
};

const defaultConfig = {
  instance_var: 'INSTANCE_ID',
  watch: false,
  autorestart: true,
};

module.exports = {
  apps: [
    // ================ Apps (interaction with user) =============
    {
      name: `${NODE_ENV}-app-backend`,
      script: 'lib/api/bin/api-bin.js',

      ...defaultConfig,
      ...clusterConfig,

      env: {
        PORT: HTTP_SERVER_PORT,
        NODE_ENV,
      },
    },
    {
      name: `${NODE_ENV}-app-graphql`,
      script: 'lib/graphql/bin/graphql-bin.js',

      ...defaultConfig,
      ...clusterConfig,
      env: {
        PORT: GRAPHQL_SERVER_PORT,
        NODE_ENV,
      },
    },
    {
      name: `${NODE_ENV}-app-websocket`,
      script: 'lib/websockets/bin/websockets-bin.js',

      // no cluster due to condition existence (connected users list)
      ...defaultConfig,
      env: {
        PORT: WEBSOCKET_SERVER_PORT,
        NODE_ENV,
      },
    },
    {
      name: `${NODE_ENV}-app-uploader`,
      script: 'lib/uploader/bin/uploader-bin.js',

      ...defaultConfig,
      ...clusterConfig,

      env: {
        PORT: UPLOADER_SERVER_PORT,
        NODE_ENV,
      },
    },
    {
      name: `${NODE_ENV}-app-redirect`,
      script: 'lib/affiliates/bin/redirect-bin.js',

      ...defaultConfig,
      ...clusterConfig,

      env: {
        PORT: REDIRECT_SERVER_PORT,
        NODE_ENV,
      },
    },
    // ================ Consumers ======================
    {
      name: `${NODE_ENV}-consumer-tags-parser`,
      script: 'lib/tags/consumers/tags-parser-consumer.js',

      ...defaultConfig,

      env: {
        NODE_ENV,
      },
    },
    {
      name: `${NODE_ENV}-consumer-transaction-sender`,
      script: 'lib/eos/consumers/transaction-sender-consumer.js',

      ...defaultConfig,

      env: {
        NODE_ENV,
      },
    },
    {
      name: `${NODE_ENV}-consumer-notifications-sender`,
      script: 'lib/entities/consumers/notifications-sender-consumer.js',

      ...defaultConfig,

      env: {
        NODE_ENV,
      },
    },
    // ================ Workers (CRON) ======================
    {
      name: `${NODE_ENV}-worker-conversion-processor`,
      script: 'lib/affiliates/workers/conversion-processor-worker.js',

      watch: false,
      cron_restart: CRON_PATTERN_EVERY_MINUTE,
      env: {
        NODE_ENV,
      },
    },
    {
      name: `${NODE_ENV}-worker-streams-creation`,
      script: 'lib/affiliates/workers/streams-creation-worker.js',

      watch: false,
      cron_restart: CRON_PATTERN_EVERY_MINUTE,
      env: {
        NODE_ENV,
      },
    },
    // {
    //   name: `${NODE_ENV}-worker-balances-monitoring`,
    //   script: 'lib/airdrops/workers/monitoring/balances-monitoring.js',
    //
    //   watch: false,
    //   cron_restart: CRON_PATTERN_EVERY_MINUTE,
    //   env: {
    //     NODE_ENV,
    //   },
    // },
    // {
    //   name: `${NODE_ENV}-worker-airdrops-users-to-pending`,
    //   script: 'lib/airdrops/workers/airdrops-users-to-pending.js',
    //
    //   watch: false,
    //   cron_restart: CRON_PATTERN_EVERY_FIVE_MINUTES,
    //   env: {
    //     NODE_ENV,
    //   },
    // },
    // {
    //   name: `${NODE_ENV}-worker-airdrops-users-to-waiting`,
    //   script: 'lib/airdrops/workers/airdrops-users-to-waiting.js',
    //
    //   watch: false,
    //   cron_restart: CRON_PATTERN_EVERY_FIVE_MINUTES,
    //   env: {
    //     NODE_ENV,
    //   },
    // },
    // {
    //   name: `${NODE_ENV}-worker-airdrops-users-to-received`,
    //   script: 'lib/airdrops/workers/airdrops-users-to-received.js',
    //
    //   watch: false,
    //   cron_restart: CRON_PATTERN_EVERY_FIVE_MINUTES,
    //   env: {
    //     NODE_ENV,
    //   },
    // },
    {
      name: `${NODE_ENV}-uos-accounts-properties-update-worker`,
      script: 'lib/uos-accounts-properties/worker/uos-accounts-properties-update-worker.js',

      watch: false,
      cron_restart: CRON_PATTERN_EVERY_FIVE_MINUTES,
      env: {
        NODE_ENV,
      },
    },
    {
      name: `${NODE_ENV}-worker-update-importance`,
      script: 'lib/eos/workers/update-importance-worker.js',

      watch: false,
      cron_restart: CRON_PATTERN_EVERY_FIVE_MINUTES,
      env: {
        NODE_ENV,
      },
    },
    {
      name: `${NODE_ENV}-worker-update-tags-importance`,
      script: 'lib/tags/workers/update-tag-importance-worker.js',

      watch: false,
      cron_restart: CRON_PATTERN_EVERY_FIVE_MINUTES,
      env: {
        NODE_ENV,
      },
    },
    {
      name: `${NODE_ENV}-worker-update-blockchain-nodes`,
      script: 'lib/blockchain-nodes/worker/update-blockchain-nodes-worker.js',

      watch: false,
      cron_restart: CRON_PATTERN_EVERY_FIVE_MINUTES,
      env: {
        NODE_ENV,
      },
    },
    // {
    //   name: `${NODE_ENV}-worker-save-current-params`,
    //   script: 'lib/stats/workers/save-current-params-worker.js',
    //
    //   watch: false,
    //   cron_restart: '0 */3 * * *',
    //   env: {
    //     NODE_ENV,
    //   },
    // },
    // {
    //   name: `${NODE_ENV}-worker-stats-calculate-event-params`,
    //   script: 'lib/stats/workers/stats-calculate-event-params-worker.js',
    //
    //   watch: false,
    //   cron_restart: '30 */3 * * *',
    //   env: {
    //     NODE_ENV,
    //   },
    // },
    {
      name: `${NODE_ENV}-sync-irreversible-traces-worker`,
      script: 'lib/blockchain-traces/workers/sync-irreversible-traces-worker.js',

      watch: false,
      cron_restart: CRON_PATTERN_EVERY_FIVE_MINUTES,
      env: {
        NODE_ENV,
      },
    },
  ],
};
