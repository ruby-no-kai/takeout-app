local utils = import './utils.libsonnet';
local secret = utils.makeSecretParameterStore('takeout-app');

{
  scheduler: {
    task_role_arn: utils.iamRole('TakeoutApp'),
  },
  app: {
    image: utils.ecrRepository('takeout-app'),
    //cpu: 512 - 64,
    //memory: 1024 - 128,
    cpu: 256 - 64,
    memory: 512 - 128,
    env: {
      LANG: 'C.UTF-8',
      // AWS_REGION: 'ap-northeast-1',
      RACK_ENV: 'production',
      RAILS_ENV: 'production',
      RAILS_LOG_TO_STDOUT: '1',
      RAILS_SERVE_STATIC_FILES: '1',
      WEB_CONCURRENCY: '1',
      RAILS_MAX_THREADS: '10',

      //DATABASE_URL: 'postgres://takeout:@takeout-db.cluster-cow895j0hfw7.us-west-2.rds.amazonaws.com/takeout',

      TAKEOUT_CACHE_BUSTER: 'radiance2',

      TAKEOUT_S3_BUCKET: 'rk-takeout-app-usw2',
      TAKEOUT_S3_PREFIX: 'prd/',
      TAKEOUT_S3_REGION: 'us-west-2',

      ENABLE_SHORYUKEN: '1',
      TAKEOUT_SHORYUKEN_AWS_REGION: 'us-west-2',
      TAKEOUT_SHORYUKEN_QUEUE: 'takeout-app-activejob-prd',

      TAKEOUT_USER_ROLE_ARN: 'arn:aws:iam::005216166247:role/TakeoutUser',
      TAKEOUT_CHIME_USE_OIDC: '1',

      TAKEOUT_STAFF_ONLY: '1',
      TAKEOUT_STAFF_ONLY_STREAM: '0',

      TAKEOUT_CLOUDFRONT_DISTRIBUTION_ID: 'E3G1QIEKS0IAW',
    },
    secrets: [
      secret('DATABASE_URL'),
      secret('SECRET_KEY_BASE'),
      secret('SENTRY_DSN'),
      secret('TAKEOUT_CONTROL_PASSWORD'),
      secret('TAKEOUT_KIOSK_PASSWORD'),
      secret('TITO_WEBHOOK_SECRET'),
      secret('IVS_PRIVATE_KEY'),
      secret('OIDC_SIGNING_KEY'),
    ],
    mount_points: [
    ],
    log_configuration: utils.awsLogs('app'),
  },
  volumes: {
  },
  scripts: [
    // utils.githubTag('') {
    //   checks: [''],
    // },
    utils.createLogGroups(),
  ],
}
