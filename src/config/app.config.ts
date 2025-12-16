import { registerAs } from '@nestjs/config';
export default registerAs(
    'app',
    (): Record<string, any> => ({
        http: {
            host: process.env.APP_HOST || '0.0.0.0',
            port: parseInt(process.env.APP_PORT ?? '3000', 10),
        },
        mongodb: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/mylist',
        }
    }),
);
