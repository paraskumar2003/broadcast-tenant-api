declare const _default: () => {
    port: number;
    nodeEnv: string;
    database: {
        url: string | undefined;
    };
    meta: {
        baseUrl: string;
        apiVersion: string;
    };
    jwt: {
        secret: string | undefined;
        refreshSecret: string | undefined;
        accessExpiry: number;
        refreshExpiry: number;
    };
    queue: {
        provider: string;
    };
    aws: {
        region: string;
        accessKeyId: string | undefined;
        secretAccessKey: string | undefined;
        s3: {
            bucketName: string | undefined;
        };
        sqs: {
            messageQueueUrl: string | undefined;
            webhookQueueUrl: string | undefined;
        };
    };
    redis: {
        host: string;
        port: number;
    };
    webhook: {
        verifyToken: string | undefined;
    };
};
export default _default;
