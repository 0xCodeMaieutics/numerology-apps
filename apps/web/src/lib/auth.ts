import { env } from '@/env';
import { nosqlDB } from '@workspace/db/nosql';
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
    databaseHooks: {
        user: {
            create: {
                after: async (user, context) => {

                    try {
                        await nosqlDB.models.User.create({
                            _id: user.id,
                        });
                    } catch (error) {
                        console.error('Error creating NoSQL user:', error);
                    }
                },
            },
        },
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
