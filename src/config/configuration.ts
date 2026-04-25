export default () => ({
  port: parseInt(process.env.PORT ?? '3010', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  meta: {
    baseUrl: process.env.META_BASE_URL || 'https://graph.facebook.com',
    apiVersion: process.env.META_API_VERSION || 'v24.0',
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: parseInt(process.env.JWT_ACCESS_EXPIRY ?? '900', 10), // seconds (default 15m)
    refreshExpiry: parseInt(process.env.JWT_REFRESH_EXPIRY ?? '604800', 10), // seconds (default 7d)
  },

  queue: {
    provider: process.env.QUEUE_PROVIDER || 'sqs',
  },

  aws: {
    region: process.env.AWS_REGION || 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucketName: process.env.AWS_S3_BUCKET_NAME,
    },
    sqs: {
      messageQueueUrl: process.env.SQS_MESSAGE_QUEUE_URL,
      webhookQueueUrl: process.env.SQS_WEBHOOK_QUEUE_URL,
    },
  },

  redis: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  },

  webhook: {
    verifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
  },
});
