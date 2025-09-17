import { env } from '@/env';
import { sqlDB } from '@workspace/db/sql';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import mongoose from 'mongoose';

export const auth = betterAuth({
    database: drizzleAdapter(sqlDB.client, {
        provider: 'pg',
        schema: sqlDB.schema,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    advanced: {
        database: {
            generateId: () => new mongoose.Types.ObjectId().toString(),
        },
    },
});
