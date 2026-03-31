import * as Joi from 'joi';

export const validationSchema = Joi.object({
  PORT: Joi.number().default(3010),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  DATABASE_URL: Joi.string().required(),
  META_BASE_URL: Joi.string().default('https://graph.facebook.com'),
  META_API_VERSION: Joi.string().default('v24.0'),
  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),
  JWT_ACCESS_EXPIRY: Joi.number().default(900),
  JWT_REFRESH_EXPIRY: Joi.number().default(604800),
  QUEUE_PROVIDER: Joi.string().valid('sqs', 'bullmq').default('sqs'),

  // AWS / SQS — required when QUEUE_PROVIDER=sqs
  AWS_REGION: Joi.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: Joi.string().when('QUEUE_PROVIDER', { is: 'sqs', then: Joi.required() }),
  AWS_SECRET_ACCESS_KEY: Joi.string().when('QUEUE_PROVIDER', { is: 'sqs', then: Joi.required() }),
  AWS_S3_BUCKET_NAME: Joi.string().optional(),
  // SQS_MESSAGE_QUEUE_URL: Joi.string().when('QUEUE_PROVIDER', { is: 'sqs', then: Joi.required() }),
  // SQS_WEBHOOK_QUEUE_URL: Joi.string().when('QUEUE_PROVIDER', { is: 'sqs', then: Joi.required() }),

  // Redis — required when QUEUE_PROVIDER=bullmq
  REDIS_HOST: Joi.string().default('127.0.0.1'),
  REDIS_PORT: Joi.number().default(6379),

  WEBHOOK_VERIFY_TOKEN: Joi.string().required(),
});
